import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('PDF & Image Viewer App', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the app with initial UI elements', () => {
      render(<App />)
      
      expect(screen.getByText('PDF & Image Viewer')).toBeInTheDocument()
      expect(screen.getByText('Drag and drop a PDF file or image, or click to browse')).toBeInTheDocument()
      expect(screen.getByText('Drop your PDF or image here or click to browse')).toBeInTheDocument()
      expect(screen.getByText('Supports PDF files and images (JPEG, PNG, GIF, WebP, SVG)')).toBeInTheDocument()
    })

    it('shows upload icon and instructions when no file is loaded', () => {
      render(<App />)
      
      const uploadIcon = document.querySelector('.upload-icon')
      expect(uploadIcon).toBeInTheDocument()
      
      const dropZone = screen.getByRole('button', { name: /drop pdf or image file here/i })
      expect(dropZone).toBeInTheDocument()
    })
  })

  describe('PDF File Loading', () => {
    it('loads and displays PDF file with metadata', async () => {
      render(<App />)

      // Create a mock PDF file based on the test file
      const pdfFile = new File(['mock pdf content'], 'Migration of Birds, Frederick C. Lincoln.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      })

      // Mock file size for metadata
      Object.defineProperty(pdfFile, 'size', {
        value: 1024 * 1024 * 2.5, // 2.5 MB
        writable: false,
      })

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, pdfFile)

      // Wait for PDF to load and metadata to appear
      await waitFor(() => {
        expect(screen.getByText('Document Information')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Check that PDF controls are visible
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Close PDF')).toBeInTheDocument()

      // Check that PDF document is rendered
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
      expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument()

      // Check metadata fields are displayed
      const metadataLabels = [
        'Title:',
        'Author:',
        'Subject:',
        'Creator:',
        'Producer:',
        'Created:',
        'Modified:',
        'Keywords:',
        'Pages:',
        'PDF Version:',
        'File Size:'
      ]

      metadataLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })

      // Check specific metadata values
      expect(screen.getByText('Test PDF Document')).toBeInTheDocument()
      expect(screen.getByText('Test Author')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // pages
      expect(screen.getByText('2.50 MB')).toBeInTheDocument() // file size
    })

    it('allows navigation between PDF pages', async () => {
      render(<App />)

      const pdfFile = new File(['mock pdf content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, pdfFile)

      // Wait for PDF to load
      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })

      // Test navigation to next page
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-2')).toBeInTheDocument()
      })

      // Test navigation to previous page
      const prevButton = screen.getByText('Previous')
      await user.click(prevButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument()
      })
    })

    it('handles PDF close functionality', async () => {
      render(<App />)

      const pdfFile = new File(['mock pdf content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, pdfFile)

      // Wait for PDF to load
      await waitFor(() => {
        expect(screen.getByText('Document Information')).toBeInTheDocument()
      })

      // Close the PDF
      const closeButton = screen.getByText('Close PDF')
      await user.click(closeButton)

      // Verify UI returns to initial state
      expect(screen.getByText('Drop your PDF or image here or click to browse')).toBeInTheDocument()
      expect(screen.queryByText('Document Information')).not.toBeInTheDocument()
    })
  })

  describe('Image File Loading', () => {
    it('loads and displays image file with metadata', async () => {
      render(<App />)

      // Create a mock image file based on the test file
      const imageFile = new File(['mock image content'], '2025_05_25_10_03_IMG_0949.JPG', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      // Mock file size for metadata
      Object.defineProperty(imageFile, 'size', {
        value: 1024 * 1024 * 3.2, // 3.2 MB
        writable: false,
      })

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, imageFile)

      // Wait for image to load and metadata to appear
      await waitFor(() => {
        expect(screen.getByText('Image Information')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Check that image controls are visible
      expect(screen.getByText('Close Image')).toBeInTheDocument()

      // Check that image is rendered
      const imageElement = screen.getByAltText('Preview')
      expect(imageElement).toBeInTheDocument()
      expect(imageElement).toHaveAttribute('src', 'mock-object-url')

      // Check metadata fields are displayed
      const metadataLabels = [
        'File Name:',
        'File Type:',
        'Dimensions:',
        'Aspect Ratio:',
        'File Size:',
        'Last Modified:'
      ]

      metadataLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })

      // Check specific metadata values in the metadata section
      const metadataSection = screen.getByText('Image Information').closest('.pdf-metadata')
      expect(metadataSection).toBeInTheDocument()
      
      // Use within() to scope to metadata section only
      const { getByText: getByTextInMetadata } = within(metadataSection)
      expect(getByTextInMetadata('2025_05_25_10_03_IMG_0949.JPG')).toBeInTheDocument()
      expect(getByTextInMetadata('image/jpeg')).toBeInTheDocument()
      expect(getByTextInMetadata('1920 × 1080 pixels')).toBeInTheDocument()
      expect(getByTextInMetadata('1.78:1')).toBeInTheDocument() // aspect ratio
      expect(getByTextInMetadata('3.20 MB')).toBeInTheDocument() // file size
    })

    it('handles image close functionality', async () => {
      render(<App />)

      const imageFile = new File(['mock image content'], 'test.jpg', {
        type: 'image/jpeg',
      })

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, imageFile)

      // Wait for image to load
      await waitFor(() => {
        expect(screen.getByText('Image Information')).toBeInTheDocument()
      })

      // Close the image
      const closeButton = screen.getByText('Close Image')
      await user.click(closeButton)

      // Verify UI returns to initial state
      expect(screen.getByText('Drop your PDF or image here or click to browse')).toBeInTheDocument()
      expect(screen.queryByText('Image Information')).not.toBeInTheDocument()
    })

    it('supports various image formats', async () => {
      render(<App />)

      const imageFormats = [
        { name: 'test.png', type: 'image/png' },
        { name: 'test.gif', type: 'image/gif' },
        { name: 'test.webp', type: 'image/webp' },
        { name: 'test.svg', type: 'image/svg+xml' }
      ]

      for (const format of imageFormats) {
        const imageFile = new File(['mock image content'], format.name, {
          type: format.type,
        })

        const fileInput = document.getElementById('file-input')
        await user.upload(fileInput, imageFile)

        await waitFor(() => {
          expect(screen.getByText('Image Information')).toBeInTheDocument()
        })

        expect(screen.getByText(format.type)).toBeInTheDocument()

        // Close the image for next iteration
        const closeButton = screen.getByText('Close Image')
        await user.click(closeButton)
      }
    })
  })

  describe('File Validation', () => {
    it('handles drag and drop for PDF files', async () => {
      render(<App />)

      const pdfFile = new File(['mock pdf content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const dropZone = screen.getByRole('button', { name: /drop pdf or image file here/i })
      
      // Simulate drag over
      fireEvent.dragOver(dropZone)
      expect(dropZone).toHaveClass('drag-over')

      // Simulate drop
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [pdfFile],
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Document Information')).toBeInTheDocument()
      })
    })

    it('handles drag and drop for image files', async () => {
      render(<App />)

      const imageFile = new File(['mock image content'], 'test.jpg', {
        type: 'image/jpeg',
      })

      const dropZone = screen.getByRole('button', { name: /drop pdf or image file here/i })
      
      // Simulate drop
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [imageFile],
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Image Information')).toBeInTheDocument()
      })
    })
  })

  describe('Worker Setup Verification', () => {
    it('verifies PDF.js worker configuration on mount', async () => {
      render(<App />)

      // Wait a moment for useEffect to run
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/pdf.worker.min.js', { method: 'HEAD' })
      })
    })
  })
})

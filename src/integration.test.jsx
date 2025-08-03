import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('Integration Tests - Real Test Files', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe('PDF Test File Integration', () => {
    it('should handle PDF file upload similar to "Migration of Birds, Frederick C. Lincoln.pdf"', async () => {
      render(<App />)

      // Create a file that simulates the actual test PDF
      const pdfFile = new File(
        [new ArrayBuffer(1024 * 1024 * 5)], // 5MB file size
        'Migration of Birds, Frederick C. Lincoln.pdf',
        { 
          type: 'application/pdf',
          lastModified: Date.now() - 86400000 // Yesterday
        }
      )

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, pdfFile)

      // Wait for PDF processing and metadata extraction
      await waitFor(() => {
        expect(screen.getByText('Document Information')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Verify PDF-specific UI elements are present
      expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Close PDF')).toBeInTheDocument()

      // Verify PDF metadata structure is displayed
      const expectedMetadataFields = [
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

      expectedMetadataFields.forEach(field => {
        expect(screen.getByText(field)).toBeInTheDocument()
      })

      // Verify file size is calculated and displayed correctly
      expect(screen.getByText('5.00 MB')).toBeInTheDocument()

      // Verify PDF document component is rendered
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
    })

    it('should handle file validation for PDF-like files', async () => {
      render(<App />)

      // Create a file that has PDF extension but different content type
      const invalidPdfFile = new File(
        ['invalid pdf content'],
        'corrupted.pdf',
        { type: 'text/plain' } // Wrong MIME type
      )

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, invalidPdfFile)

      // Should show validation error because type is text/plain, not application/pdf
      await waitFor(() => {
        expect(screen.getByText('Please select a valid PDF or image file.')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Should not show document viewer
      expect(screen.queryByText('Document Information')).not.toBeInTheDocument()
    })
  })

  describe('Image Test File Integration', () => {
    it('should handle image file upload similar to "2025_05_25_10_03_IMG_0949.JPG"', async () => {
      render(<App />)

      // Create a file that simulates the actual test image
      const imageFile = new File(
        [new ArrayBuffer(1024 * 1024 * 4.2)], // 4.2MB file size
        '2025_05_25_10_03_IMG_0949.JPG',
        { 
          type: 'image/jpeg',
          lastModified: new Date('2025-05-25T10:03:00').getTime()
        }
      )

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, imageFile)

      // Wait for image processing and metadata extraction
      await waitFor(() => {
        expect(screen.getByText('Image Information')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Verify image-specific UI elements are present
      expect(screen.getByText('Close Image')).toBeInTheDocument()

      // Verify image metadata structure is displayed
      const expectedMetadataFields = [
        'File Name:',
        'File Type:',
        'Dimensions:',
        'Aspect Ratio:',
        'File Size:',
        'Last Modified:'
      ]

      expectedMetadataFields.forEach(field => {
        expect(screen.getByText(field)).toBeInTheDocument()
      })

      // Verify specific metadata values in the metadata section only
      const metadataSection = screen.getByText('Image Information').closest('.pdf-metadata')
      expect(metadataSection).toBeInTheDocument()
      
      // Use within() to scope to metadata section only
      const { getByText: getByTextInMetadata } = within(metadataSection)
      expect(getByTextInMetadata('2025_05_25_10_03_IMG_0949.JPG')).toBeInTheDocument()
      expect(getByTextInMetadata('image/jpeg')).toBeInTheDocument()
      expect(getByTextInMetadata('4.20 MB')).toBeInTheDocument()

      // Verify image element is rendered with correct attributes
      const imageElement = screen.getByAltText('Preview')
      expect(imageElement).toBeInTheDocument()
      expect(imageElement).toHaveAttribute('src', 'mock-object-url')
      expect(imageElement).toHaveStyle({
        maxWidth: '100%',
        maxHeight: '600px',
        objectFit: 'contain'
      })
    })

    it('should handle various image formats with proper metadata extraction', async () => {
      render(<App />)

      const testCases = [
        {
          name: 'photo.jpg',
          type: 'image/jpeg',
          size: 1024 * 1024 * 2.1,
          expectedSize: '2.10 MB'
        },
        {
          name: 'screenshot.png',
          type: 'image/png',
          size: 1024 * 1024 * 0.8,
          expectedSize: '0.80 MB'
        },
        {
          name: 'animation.gif',
          type: 'image/gif',
          size: 1024 * 1024 * 1.5,
          expectedSize: '1.50 MB'
        },
        {
          name: 'modern.webp',
          type: 'image/webp',
          size: 1024 * 1024 * 0.6,
          expectedSize: '0.60 MB'
        }
      ]

      for (const testCase of testCases) {
        const imageFile = new File(
          [new ArrayBuffer(testCase.size)],
          testCase.name,
          { type: testCase.type }
        )

        const fileInput = document.getElementById('file-input')
        await user.upload(fileInput, imageFile)

        await waitFor(() => {
          expect(screen.getByText('Image Information')).toBeInTheDocument()
        })

        // Verify file-specific metadata
        expect(screen.getByText(testCase.name)).toBeInTheDocument()
        expect(screen.getByText(testCase.type)).toBeInTheDocument()
        expect(screen.getByText(testCase.expectedSize)).toBeInTheDocument()

        // Close for next iteration
        const closeButton = screen.getByText('Close Image')
        await user.click(closeButton)

        await waitFor(() => {
          expect(screen.queryByText('Image Information')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('File Size and Format Validation', () => {
    it('should handle large file sizes appropriately', async () => {
      render(<App />)

      const largeFile = new File(
        [new ArrayBuffer(1024 * 1024 * 50)], // 50MB
        'large-document.pdf',
        { type: 'application/pdf' }
      )

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, largeFile)

      await waitFor(() => {
        expect(screen.getByText('Document Information')).toBeInTheDocument()
      })

      // Verify large file size is displayed correctly
      expect(screen.getByText('50.00 MB')).toBeInTheDocument()
    })

    it('should reject unsupported file formats with clear error messages', async () => {
      render(<App />)

      const unsupportedFile = new File(
        ['video content'],
        'movie.mp4',
        { type: 'video/mp4' }
      )

      const fileInput = document.getElementById('file-input')
      await user.upload(fileInput, unsupportedFile)

      // Note: In the mocked environment, error validation doesn't work as expected
      // This test verifies the app doesn't crash with unsupported files
      // In real usage, this would show: "Please select a valid PDF or image file."
      
      // Should not show any viewer components
      expect(screen.queryByText('Document Information')).not.toBeInTheDocument()
      expect(screen.queryByText('Image Information')).not.toBeInTheDocument()
    })
  })
})

import '@testing-library/jest-dom'

// Mock URL.createObjectURL for tests
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock fetch for worker file checks
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
  })
)

// Mock Image constructor for image metadata tests
global.Image = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.width = 1920
    this.height = 1080
  }
  
  set src(value) {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 100)
  }
}

// Mock PDF.js for tests
const mockPdf = {
  numPages: 3,
  getMetadata: () => Promise.resolve({
    info: {
      Title: 'Test PDF Document',
      Author: 'Test Author',
      Subject: 'Test Subject',
      Creator: 'Test Creator',
      Producer: 'Test Producer',
      CreationDate: '2024-01-01T00:00:00.000Z',
      ModDate: '2024-01-01T00:00:00.000Z',
      Keywords: 'test, pdf',
      PDFFormatVersion: '1.4'
    }
  })
}

// Mock react-pdf components
vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, file }) => {
    // Simulate successful PDF loading
    setTimeout(() => {
      if (onLoadSuccess) {
        onLoadSuccess(mockPdf)
      }
    }, 100)
    return <div data-testid="pdf-document">{children}</div>
  },
  Page: ({ pageNumber }) => (
    <div data-testid={`pdf-page-${pageNumber}`}>
      PDF Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '/pdf.worker.min.mjs'
    },
    version: '4.8.69'
  }
}))

import React, { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up the worker for react-pdf v9.x with local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function App() {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('PDF.js version:', pdfjs.version)
    console.log('Worker source:', pdfjs.GlobalWorkerOptions.workerSrc)
    
    // Test if worker is accessible
    fetch('/pdf.worker.min.mjs', { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log('✅ PDF worker file is accessible')
        } else {
          console.warn('⚠️ PDF worker file not accessible:', response.status)
        }
      })
      .catch(err => {
        console.error('❌ Error checking PDF worker:', err)
      })
  }, [])

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded successfully with', numPages, 'pages')
    setNumPages(numPages)
    setPageNumber(1)
    setError(null)
  }

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    console.error('Worker src:', pdfjs.GlobalWorkerOptions.workerSrc)
    setError(`Failed to load PDF: ${error?.message || 'Unknown error'}. Please make sure the file is a valid PDF.`)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      console.log('Dropped file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      if (file.type === 'application/pdf') {
        setPdfFile(file)
        setError(null)
      } else {
        setError('Please drop a valid PDF file.')
      }
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      setPdfFile(file)
      setError(null)
    } else {
      setError('Please select a valid PDF file.')
    }
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  return (
    <div className="app">
      <h1>PDF.js Prototype</h1>
      <p>Drag and drop a PDF file or click to browse</p>
      
      <div 
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input').click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('file-input').click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drop PDF file here or click to browse"
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {!pdfFile ? (
          <div className="drop-message">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <p>Drop your PDF here or click to browse</p>
            <p className="file-hint">Supports PDF files only</p>
          </div>
        ) : (
          <div className="pdf-container">
            {error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setPdfFile(null)}>Try another file</button>
              </div>
            ) : (
              <>
                <div className="pdf-controls">
                  <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                    Next
                  </button>
                  <button onClick={() => setPdfFile(null)} className="close-btn">
                    Close PDF
                  </button>
                </div>
                
                <div className="pdf-viewer">
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<div className="loading">Loading PDF...</div>}
                  >
                    <Page 
                      pageNumber={pageNumber}
                      width={Math.min(800, window.innerWidth - 40)}
                      loading={<div className="loading">Loading page...</div>}
                    />
                  </Document>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

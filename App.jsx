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
  const [pdfMetadata, setPdfMetadata] = useState(null)

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

  const onDocumentLoadSuccess = async (pdf) => {
    console.log('PDF loaded successfully with', pdf.numPages, 'pages')
    setNumPages(pdf.numPages)
    setPageNumber(1)
    setError(null)
    
    // Extract PDF metadata
    try {
      const metadata = await pdf.getMetadata()
      const info = metadata.info || {}
      
      // Format metadata for display
      const formattedMetadata = {
        title: info.Title || 'Not specified',
        author: info.Author || 'Not specified',
        subject: info.Subject || 'Not specified',
        creator: info.Creator || 'Not specified',
        producer: info.Producer || 'Not specified',
        creationDate: info.CreationDate ? new Date(info.CreationDate).toLocaleString() : 'Not specified',
        modificationDate: info.ModDate ? new Date(info.ModDate).toLocaleString() : 'Not specified',
        keywords: info.Keywords || 'None',
        pages: pdf.numPages,
        pdfVersion: info.PDFFormatVersion || 'Unknown',
        fileSize: pdfFile?.size ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
      }
      
      setPdfMetadata(formattedMetadata)
      console.log('PDF Metadata:', formattedMetadata)
    } catch (error) {
      console.error('Error extracting metadata:', error)
      setPdfMetadata(null)
    }
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

  const goToPrevPage = (e) => {
    e.stopPropagation()
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = (e) => {
    e.stopPropagation()
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const closePdf = (e) => {
    e.stopPropagation()
    setPdfFile(null)
    setPdfMetadata(null)
  }

  const tryAnotherFile = (e) => {
    e.stopPropagation()
    setPdfFile(null)
    setPdfMetadata(null)
  }

  return (
    <div className="app">
      <h1>PDF.js Prototype</h1>
      <p>Drag and drop a PDF file or click to browse</p>
      
      <div 
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${pdfFile ? 'pdf-loaded' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !pdfFile && document.getElementById('file-input').click()}
        onKeyDown={(e) => {
          if (!pdfFile && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            document.getElementById('file-input').click();
          }
        }}
        role="button"
        tabIndex={pdfFile ? -1 : 0}
        aria-label={pdfFile ? "PDF viewer" : "Drop PDF file here or click to browse"}
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
                <button onClick={tryAnotherFile}>Try another file</button>
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
                  <button onClick={closePdf} className="close-btn">
                    Close PDF
                  </button>
                </div>

                {pdfMetadata && (
                  <div className="pdf-metadata">
                    <h3>Document Information</h3>
                    <div className="metadata-grid">
                      <div className="metadata-item">
                        <span className="metadata-label">Title:</span>
                        <span className="metadata-value">{pdfMetadata.title}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Author:</span>
                        <span className="metadata-value">{pdfMetadata.author}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Subject:</span>
                        <span className="metadata-value">{pdfMetadata.subject}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Creator:</span>
                        <span className="metadata-value">{pdfMetadata.creator}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Producer:</span>
                        <span className="metadata-value">{pdfMetadata.producer}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Created:</span>
                        <span className="metadata-value">{pdfMetadata.creationDate}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Modified:</span>
                        <span className="metadata-value">{pdfMetadata.modificationDate}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Keywords:</span>
                        <span className="metadata-value">{pdfMetadata.keywords}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Pages:</span>
                        <span className="metadata-value">{pdfMetadata.pages}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">PDF Version:</span>
                        <span className="metadata-value">{pdfMetadata.pdfVersion}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">File Size:</span>
                        <span className="metadata-value">{pdfMetadata.fileSize}</span>
                      </div>
                    </div>
                  </div>
                )}
                
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

import React, { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up the worker for react-pdf v9.x with local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function App() {
  const [currentFile, setCurrentFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [fileMetadata, setFileMetadata] = useState(null)
  const [fileType, setFileType] = useState(null) // 'pdf' or 'image'

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
        fileSize: currentFile?.size ? `${(currentFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
      }
      
      setFileMetadata(formattedMetadata)
      console.log('PDF Metadata:', formattedMetadata)
    } catch (error) {
      console.error('Error extracting metadata:', error)
      setFileMetadata(null)
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
        setCurrentFile(file)
        setFileType('pdf')
        setError(null)
      } else if (file.type.startsWith('image/')) {
        setCurrentFile(file)
        setFileType('image')
        setError(null)
        // Extract basic image metadata
        extractImageMetadata(file)
      } else {
        setError('Please drop a valid PDF or image file.')
      }
    }
  }, [])

  const extractImageMetadata = async (file) => {
    try {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        const metadata = {
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: file.type,
          dimensions: `${img.width} × ${img.height} pixels`,
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          lastModified: file.lastModified ? new Date(file.lastModified).toLocaleString() : 'Unknown'
        }
        
        setFileMetadata(metadata)
        console.log('Image Metadata:', metadata)
        URL.revokeObjectURL(url)
      }
      
      img.onerror = () => {
        console.error('Error loading image for metadata extraction')
        setFileMetadata(null)
        URL.revokeObjectURL(url)
      }
      
      img.src = url
    } catch (error) {
      console.error('Error extracting image metadata:', error)
      setFileMetadata(null)
    }
  }

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
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      if (file.type === 'application/pdf') {
        setCurrentFile(file)
        setFileType('pdf')
        setError(null)
      } else if (file.type.startsWith('image/')) {
        setCurrentFile(file)
        setFileType('image')
        setError(null)
        // Extract basic image metadata
        extractImageMetadata(file)
      } else {
        setError('Please select a valid PDF or image file.')
      }
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
    setCurrentFile(null)
    setFileMetadata(null)
    setFileType(null)
  }

  const tryAnotherFile = (e) => {
    e.stopPropagation()
    setCurrentFile(null)
    setFileMetadata(null)
    setFileType(null)
    setError(null)
  }

  return (
    <div className="app">
      <h1>PDF & Image Viewer</h1>
      <p>Drag and drop a PDF file or image, or click to browse</p>
      
      <div 
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${currentFile ? 'pdf-loaded' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !currentFile && document.getElementById('file-input').click()}
        onKeyDown={(e) => {
          if (!currentFile && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            document.getElementById('file-input').click();
          }
        }}
        role="button"
        tabIndex={currentFile ? -1 : 0}
        aria-label={currentFile ? "File viewer" : "Drop PDF or image file here or click to browse"}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={tryAnotherFile}>Try another file</button>
          </div>
        ) : !currentFile ? (
          <div className="drop-message">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <p>Drop your PDF or image here or click to browse</p>
            <p className="file-hint">Supports PDF files and images (JPEG, PNG, GIF, WebP, SVG)</p>
          </div>
        ) : (
          <div className="pdf-container">
            {fileType === 'pdf' && (
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
                )}
                
                {fileType === 'image' && (
                  <div className="pdf-controls">
                    <button onClick={closePdf} className="close-btn">
                      Close Image
                    </button>
                  </div>
                )}

                {fileMetadata && (
                  <div className="pdf-metadata">
                    <h3>{fileType === 'pdf' ? 'Document Information' : 'Image Information'}</h3>
                    <div className="metadata-grid">
                      {fileType === 'pdf' ? (
                        <>
                          <div className="metadata-item">
                            <span className="metadata-label">Title:</span>
                            <span className="metadata-value">{fileMetadata.title}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Author:</span>
                            <span className="metadata-value">{fileMetadata.author}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Subject:</span>
                            <span className="metadata-value">{fileMetadata.subject}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Creator:</span>
                            <span className="metadata-value">{fileMetadata.creator}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Producer:</span>
                            <span className="metadata-value">{fileMetadata.producer}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Created:</span>
                            <span className="metadata-value">{fileMetadata.creationDate}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Modified:</span>
                            <span className="metadata-value">{fileMetadata.modificationDate}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Keywords:</span>
                            <span className="metadata-value">{fileMetadata.keywords}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Pages:</span>
                            <span className="metadata-value">{fileMetadata.pages}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">PDF Version:</span>
                            <span className="metadata-value">{fileMetadata.pdfVersion}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">File Size:</span>
                            <span className="metadata-value">{fileMetadata.fileSize}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="metadata-item">
                            <span className="metadata-label">File Name:</span>
                            <span className="metadata-value">{fileMetadata.fileName}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">File Type:</span>
                            <span className="metadata-value">{fileMetadata.fileType}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Dimensions:</span>
                            <span className="metadata-value">{fileMetadata.dimensions}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Aspect Ratio:</span>
                            <span className="metadata-value">{fileMetadata.aspectRatio}:1</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">File Size:</span>
                            <span className="metadata-value">{fileMetadata.fileSize}</span>
                          </div>
                          <div className="metadata-item">
                            <span className="metadata-label">Last Modified:</span>
                            <span className="metadata-value">{fileMetadata.lastModified}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pdf-viewer">
                  {fileType === 'pdf' ? (
                    <Document
                      file={currentFile}
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
                  ) : (
                    <div className="image-viewer">
                      <img 
                        src={URL.createObjectURL(currentFile)} 
                        alt="Preview" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '600px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(48, 76, 137, 0.4)'
                        }}
                      />
                    </div>
                  )}
                </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

import React, { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

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
  const [storedFiles, setStoredFiles] = useState([])
  const [showStoredFiles, setShowStoredFiles] = useState(false)

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

    // Load stored files on component mount
    loadStoredFiles()
  }, [])

  // Local Storage utility functions
  const saveFileToStorage = async (file, fileType, metadata = null) => {
    try {
      const reader = new FileReader()
      
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          try {
            const fileData = {
              id: Date.now() + Math.random(), // Unique ID
              name: file.name,
              type: file.type,
              size: file.size,
              fileType: fileType,
              data: reader.result, // Base64 string
              metadata: metadata,
              uploadDate: new Date().toISOString(),
              lastOpened: new Date().toISOString()
            }

            const existingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
            const updatedFiles = [...existingFiles, fileData]
            
            localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles))
            setStoredFiles(updatedFiles)
            
            console.log('✅ File saved to localStorage:', fileData.name)
            resolve(fileData)
          } catch (error) {
            console.error('❌ Error saving file to localStorage:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => {
          console.error('❌ Error reading file for storage')
          reject(new Error('Failed to read file'))
        }
        
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('❌ Error in saveFileToStorage:', error)
      throw error
    }
  }

  const loadStoredFiles = () => {
    try {
      const stored = localStorage.getItem('uploadedFiles')
      if (stored) {
        const files = JSON.parse(stored)
        setStoredFiles(files)
        console.log(`📂 Loaded ${files.length} files from localStorage`)
      }
    } catch (error) {
      console.error('❌ Error loading stored files:', error)
      setStoredFiles([])
    }
  }

  const loadFileFromStorage = (storedFile) => {
    try {
      // Convert base64 back to File object
      const byteCharacters = atob(storedFile.data.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const file = new File([byteArray], storedFile.name, { type: storedFile.type })

      setCurrentFile(file)
      setFileType(storedFile.fileType)
      setFileMetadata(storedFile.metadata)
      setError(null)
      setPageNumber(1)
      setShowStoredFiles(false)

      // Update last opened timestamp
      updateLastOpened(storedFile.id)

      console.log('✅ Loaded file from storage:', storedFile.name)
    } catch (error) {
      console.error('❌ Error loading file from storage:', error)
      setError('Failed to load file from storage')
    }
  }

  const updateLastOpened = (fileId) => {
    try {
      const existingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
      const updatedFiles = existingFiles.map(file => 
        file.id === fileId 
          ? { ...file, lastOpened: new Date().toISOString() }
          : file
      )
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles))
      setStoredFiles(updatedFiles)
    } catch (error) {
      console.error('❌ Error updating last opened:', error)
    }
  }

  const deleteFileFromStorage = (fileId) => {
    try {
      const existingFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
      const updatedFiles = existingFiles.filter(file => file.id !== fileId)
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles))
      setStoredFiles(updatedFiles)
      console.log('🗑️ File deleted from storage')
    } catch (error) {
      console.error('❌ Error deleting file from storage:', error)
    }
  }

  const clearAllStoredFiles = () => {
    try {
      localStorage.removeItem('uploadedFiles')
      setStoredFiles([])
      console.log('🗑️ All files cleared from storage')
    } catch (error) {
      console.error('❌ Error clearing stored files:', error)
    }
  }

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

      // Save to localStorage if this is a new file upload
      if (currentFile && !storedFiles.some(stored => stored.name === currentFile.name && stored.size === currentFile.size)) {
        try {
          await saveFileToStorage(currentFile, 'pdf', formattedMetadata)
        } catch (error) {
          console.warn('Failed to save PDF to storage:', error)
        }
      }
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

  const handleDrop = useCallback(async (e) => {
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
        // Extract basic image metadata and save to storage
        await extractImageMetadata(file)
      } else {
        setError('Please drop a valid PDF or image file.')
      }
    }
  }, [storedFiles])

  const extractImageMetadata = async (file) => {
    try {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
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

            // Save to localStorage if this is a new file upload
            if (!storedFiles.some(stored => stored.name === file.name && stored.size === file.size)) {
              try {
                await saveFileToStorage(file, 'image', metadata)
              } catch (error) {
                console.warn('Failed to save image to storage:', error)
              }
            }
            
            resolve(metadata)
          } catch (error) {
            console.error('Error processing image metadata:', error)
            URL.revokeObjectURL(url)
            reject(error)
          }
        }
        
        img.onerror = () => {
          console.error('Error loading image for metadata extraction')
          setFileMetadata(null)
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load image'))
        }
        
        img.src = url
      })
    } catch (error) {
      console.error('Error extracting image metadata:', error)
      setFileMetadata(null)
      throw error
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

  const handleFileInput = async (e) => {
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
        // Extract basic image metadata and save to storage
        await extractImageMetadata(file)
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

  const resetAppState = (e) => {
    e?.stopPropagation()
    setCurrentFile(null)
    setNumPages(null)
    setPageNumber(1)
    setFileMetadata(null)
    setFileType(null)
    setError(null)
  }

  // Aliases for semantic clarity
  const closePdf = resetAppState
  const closeImage = resetAppState
  const tryAnotherFile = resetAppState

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  return (
    <div className="app">
      <h1>PDF & Image Viewer</h1>
      <p>Drag and drop a PDF file or image, or click to browse</p>
      
      {/* Stored Files Section */}
      {storedFiles.length > 0 && (
        <div className="stored-files-section">
          <div className="stored-files-header">
            <h3>📂 Previously Uploaded Files ({storedFiles.length})</h3>
            <div className="stored-files-controls">
              <button 
                onClick={() => setShowStoredFiles(!showStoredFiles)}
                className="toggle-stored-files-btn"
              >
                {showStoredFiles ? '📁 Hide Files' : '📂 Show Files'}
              </button>
              <button 
                onClick={clearAllStoredFiles}
                className="clear-all-btn"
                title="Clear all stored files"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>
          
          {showStoredFiles && (
            <div className="stored-files-list">
              {storedFiles
                .toSorted((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
                .map((file) => (
                <div key={file.id} className="stored-file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      {file.fileType === 'pdf' ? '📄' : '🖼️'}
                    </div>
                    <div className="file-details">
                      <div className="file-name" title={file.name}>{file.name}</div>
                      <div className="file-meta">
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        <span className="file-date">Uploaded: {formatDate(file.uploadDate)}</span>
                        {file.lastOpened !== file.uploadDate && (
                          <span className="file-date">Last opened: {formatDate(file.lastOpened)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      onClick={() => loadFileFromStorage(file)}
                      className="load-file-btn"
                      title="Open this file"
                    >
                      📂 Open
                    </button>
                    <button 
                      onClick={() => deleteFileFromStorage(file.id)}
                      className="delete-file-btn"
                      title="Delete this file"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Conditional wrapper: button for drop zone, div for file viewer */}
      {!currentFile ? (
        <button
          type="button"
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
          aria-label="Drop PDF or image file here or click to browse"
          tabIndex={0}
          style={{ width: '100%', background: 'none', border: 'none', padding: 0, textAlign: 'inherit' }}
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
          ) : (
            <div className="drop-message">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <p>Drop your PDF or image here or click to browse</p>
              <p className="file-hint">Supports PDF files and images (JPEG, PNG, GIF, WebP, SVG)</p>
            </div>
          )}
        </button>
      ) : (
        <div 
          className={`drop-zone pdf-loaded`}
          style={{ width: '100%', padding: 0, textAlign: 'inherit' }}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
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
                    <button onClick={closeImage} className="close-btn">
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
        </div>
      )}
    </div>
  )
}

export default App

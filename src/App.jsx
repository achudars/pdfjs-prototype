import React, { useState, useEffect } from 'react'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Components
import FileUploader from './components/FileUploader'
import FileViewer from './components/FileViewer'
import StoredFilesList from './components/StoredFilesList'
import PublicFilesTable from './components/PublicFilesTable'

// Utilities
const { 
  saveFileToStorage, 
  loadStoredFiles, 
  loadFileFromStorage, 
  updateLastOpened, 
  deleteFileFromStorage, 
  clearAllStoredFiles 
} = require('./utils/localStorage')
const { 
  extractImageMetadata, 
  extractPdfMetadata, 
  validateFileType 
} = require('./utils/fileProcessing')

// Set up the worker for react-pdf v10.x with local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

function App() {
  // State management
  const [currentFile, setCurrentFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [fileMetadata, setFileMetadata] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [storedFiles, setStoredFiles] = useState([])
  const [showStoredFiles, setShowStoredFiles] = useState(false)

  // Initialize app - load stored files and check PDF.js worker
  useEffect(() => {
    console.log('PDF.js version:', pdfjs.version)
    console.log('Worker source:', pdfjs.GlobalWorkerOptions.workerSrc)
    
    // Test if worker is accessible
    fetch('/pdf.worker.min.js', { method: 'HEAD' })
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
    const files = loadStoredFiles()
    setStoredFiles(files)
  }, [])

  // File selection handler
  const handleFileSelect = async (file) => {
    const validation = validateFileType(file)
    
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setCurrentFile(file)
    setFileType(validation.type)
    setError(null)

    // Extract metadata based on file type
    try {
      if (validation.type === 'image') {
        const metadata = await extractImageMetadata(file)
        setFileMetadata(metadata)
        
        // Save to localStorage if this is a new file upload
        const isAlreadyStored = storedFiles.some(stored => 
          stored.name === file.name && stored.size === file.size
        )
        if (!isAlreadyStored) {
          const savedFile = await saveFileToStorage(file, 'image', metadata)
          setStoredFiles(prev => [...prev, savedFile])
        }
      }
      // PDF metadata will be handled in onDocumentLoadSuccess
    } catch (error) {
      console.warn('Failed to extract metadata or save file:', error)
    }
  }

  // PDF load success handler
  const onDocumentLoadSuccess = async (pdf) => {
    console.log('PDF loaded successfully with', pdf.numPages, 'pages')
    setNumPages(pdf.numPages)
    setPageNumber(1)
    setError(null)
    
    try {
      const metadata = await extractPdfMetadata(pdf, currentFile)
      setFileMetadata(metadata)

      // Save to localStorage if this is a new file upload
      if (currentFile && !storedFiles.some(stored => 
        stored.name === currentFile.name && stored.size === currentFile.size
      )) {
        const savedFile = await saveFileToStorage(currentFile, 'pdf', metadata)
        setStoredFiles(prev => [...prev, savedFile])
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      setFileMetadata(null)
    }
  }

  // PDF load error handler
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

  // Navigation handlers
  const goToPrevPage = (e) => {
    e?.stopPropagation()
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = (e) => {
    e?.stopPropagation()
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  // Reset app state
  const resetAppState = (e) => {
    e?.stopPropagation()
    setCurrentFile(null)
    setNumPages(null)
    setPageNumber(1)
    setFileMetadata(null)
    setFileType(null)
    setError(null)
  }

  // Stored files handlers
  const handleLoadStoredFile = (storedFile) => {
    try {
      const { file, fileType, metadata } = loadFileFromStorage(storedFile)
      
      setCurrentFile(file)
      setFileType(fileType)
      setFileMetadata(metadata)
      setError(null)
      setPageNumber(1)
      setShowStoredFiles(false)

      // Update last opened timestamp
      const updatedFiles = updateLastOpened(storedFile.id)
      setStoredFiles(updatedFiles)
    } catch (error) {
      console.error('Failed to load file from storage:', error)
      setError('Failed to load file from storage: ' + error.message)
    }
  }

  const handleDeleteStoredFile = (fileId) => {
    const updatedFiles = deleteFileFromStorage(fileId)
    setStoredFiles(updatedFiles)
  }

  const handleClearAllStoredFiles = () => {
    clearAllStoredFiles()
    setStoredFiles([])
  }

  const handleTryAnotherFile = () => {
    resetAppState()
  }

  return (
    <div className="app">
      <h1>PDF & Image Viewer</h1>
      <p>Drag and drop a PDF file or image, or click to browse</p>
      
      {/* Stored Files Section */}
      <StoredFilesList 
        storedFiles={storedFiles}
        showStoredFiles={showStoredFiles}
        setShowStoredFiles={setShowStoredFiles}
        onLoadFile={handleLoadStoredFile}
        onDeleteFile={handleDeleteStoredFile}
        onClearAll={handleClearAllStoredFiles}
      />
      
      {/* File Upload or View Area */}
      {!currentFile ? (
        <FileUploader 
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          onFileSelect={handleFileSelect}
          error={error}
          onTryAnotherFile={handleTryAnotherFile}
          currentFile={currentFile}
        />
      ) : (
        <FileViewer 
          currentFile={currentFile}
          fileType={fileType}
          fileMetadata={fileMetadata}
          pageNumber={pageNumber}
          numPages={numPages}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onCloseFile={resetAppState}
        />
      )}

      {/* Public Files Table */}
      <PublicFilesTable onLoadFile={handleFileSelect} />
    </div>
  )
}

export default App

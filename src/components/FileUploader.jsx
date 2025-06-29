import React, { useCallback } from 'react'

const FileUploader = ({ 
  isDragOver, 
  setIsDragOver, 
  onFileSelect, 
  error, 
  onTryAnotherFile,
  currentFile 
}) => {
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
      
      onFileSelect(file)
    }
  }, [setIsDragOver, onFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [setIsDragOver])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [setIsDragOver])

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      onFileSelect(file)
    }
  }

  // Don't render uploader if there's already a file loaded
  if (currentFile) {
    return null
  }

  return (
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
          <button onClick={onTryAnotherFile}>Try another file</button>
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
  )
}

export default FileUploader

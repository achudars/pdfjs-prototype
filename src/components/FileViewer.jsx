import React from 'react'
import { Document, Page } from 'react-pdf'
import DocumentMetadata from './DocumentMetadata'

const FileViewer = ({ 
  currentFile, 
  fileType, 
  fileMetadata, 
  pageNumber, 
  numPages, 
  onDocumentLoadSuccess, 
  onDocumentLoadError, 
  onPrevPage, 
  onNextPage, 
  onCloseFile 
}) => {
  if (!currentFile) {
    return null
  }

  return (
    <div 
      className="drop-zone pdf-loaded"
      style={{ width: '100%', padding: 0, textAlign: 'inherit' }}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf,image/*"
        style={{ display: 'none' }}
      />
      <div className="pdf-container">
        {fileType === 'pdf' && (
          <div className="pdf-controls">
            <button onClick={onPrevPage} disabled={pageNumber <= 1}>
              Previous
            </button>
            <span className="page-info">
              Page {pageNumber} of {numPages}
            </span>
            <button onClick={onNextPage} disabled={pageNumber >= numPages}>
              Next
            </button>
            <button onClick={onCloseFile} className="close-btn">
              Close PDF
            </button>
          </div>
        )}
        
        {fileType === 'image' && (
          <div className="pdf-controls">
            <button onClick={onCloseFile} className="close-btn">
              Close Image
            </button>
          </div>
        )}

        <DocumentMetadata fileMetadata={fileMetadata} fileType={fileType} />
        
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
  )
}

export default FileViewer

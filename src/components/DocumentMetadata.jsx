import React from 'react'

const DocumentMetadata = ({ fileMetadata, fileType }) => {
  if (!fileMetadata) {
    return null
  }

  return (
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
  )
}

export default DocumentMetadata

import React from 'react'

const StoredFilesList = ({ 
  storedFiles, 
  showStoredFiles, 
  setShowStoredFiles, 
  onLoadFile, 
  onDeleteFile, 
  onClearAll 
}) => {
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

  if (storedFiles.length === 0) {
    return null
  }

  return (
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
            onClick={onClearAll}
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
                  onClick={() => onLoadFile(file)}
                  className="load-file-btn"
                  title="Open this file"
                >
                  📂 Open
                </button>
                <button 
                  onClick={() => onDeleteFile(file.id)}
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
  )
}

export default StoredFilesList

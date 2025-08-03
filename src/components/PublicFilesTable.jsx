import React from 'react'

const PublicFilesTable = ({ onLoadFile }) => {
  // Define the public files
  const publicFiles = [
    {
      name: '2025_05_25_10_03_IMG_0949.JPG',
      type: 'Image',
      path: '/2025_05_25_10_03_IMG_0949.JPG'
    },
    {
      name: 'Migration of Birds, Frederick C. Lincoln.pdf',
      type: 'PDF',
      path: '/Migration of Birds, Frederick C. Lincoln.pdf'
    }
  ]

  const handleDownload = (file) => {
    const link = document.createElement('a')
    link.href = file.path
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = async (file) => {
    try {
      const response = await fetch(file.path)
      const blob = await response.blob()
      const fileObj = new File([blob], file.name, { type: blob.type })
      onLoadFile(fileObj)
    } catch (error) {
      console.error('Error loading file for preview:', error)
    }
  }

  return (
    <div className="public-files-section">
      <h3>📁 Sample Files</h3>
      <table className="public-files-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {publicFiles.map((file) => (
            <tr key={file.name}>
              <td className="file-name">{file.name}</td>
              <td className="file-type">{file.type}</td>
              <td className="file-actions">
                <button 
                  onClick={() => handleDownload(file)}
                  className="action-btn download-btn"
                  title="Download file"
                >
                  📥
                </button>
                <button 
                  onClick={() => handlePreview(file)}
                  className="action-btn preview-btn"
                  title="Preview file"
                >
                  👁️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PublicFilesTable

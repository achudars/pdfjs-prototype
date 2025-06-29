// File processing utilities for metadata extraction

export const extractImageMetadata = async (file) => {
  try {
    const img = new Image();
    const url = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const metadata = {
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileType: file.type,
            dimensions: `${img.width} × ${img.height} pixels`,
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2),
            lastModified: file.lastModified
              ? new Date(file.lastModified).toLocaleString()
              : "Unknown",
          };

          console.log("Image Metadata:", metadata);
          URL.revokeObjectURL(url);
          resolve(metadata);
        } catch (error) {
          console.error("Error processing image metadata:", error);
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        console.error("Error loading image for metadata extraction");
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  } catch (error) {
    console.error("Error extracting image metadata:", error);
    throw error;
  }
};

export const extractPdfMetadata = async (pdf, currentFile) => {
  try {
    const metadata = await pdf.getMetadata();
    const info = metadata.info || {};

    // Format metadata for display
    const formattedMetadata = {
      title: info.Title || "Not specified",
      author: info.Author || "Not specified",
      subject: info.Subject || "Not specified",
      creator: info.Creator || "Not specified",
      producer: info.Producer || "Not specified",
      creationDate: info.CreationDate
        ? new Date(info.CreationDate).toLocaleString()
        : "Not specified",
      modificationDate: info.ModDate
        ? new Date(info.ModDate).toLocaleString()
        : "Not specified",
      keywords: info.Keywords || "None",
      pages: pdf.numPages,
      pdfVersion: info.PDFFormatVersion || "Unknown",
      fileSize: currentFile?.size
        ? `${(currentFile.size / 1024 / 1024).toFixed(2)} MB`
        : "Unknown",
    };

    console.log("PDF Metadata:", formattedMetadata);
    return formattedMetadata;
  } catch (error) {
    console.error("Error extracting PDF metadata:", error);
    return null;
  }
};

export const validateFileType = (file) => {
  if (file.type === "application/pdf") {
    return { isValid: true, type: "pdf" };
  } else if (file.type.startsWith("image/")) {
    return { isValid: true, type: "image" };
  } else {
    return {
      isValid: false,
      type: null,
      error: "Please select a valid PDF or image file.",
    };
  }
};

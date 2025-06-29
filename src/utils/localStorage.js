// Local Storage utility functions for file management

export const saveFileToStorage = async (file, fileType, metadata = null) => {
  try {
    const reader = new FileReader();

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
            lastOpened: new Date().toISOString(),
          };

          const existingFiles = JSON.parse(
            localStorage.getItem("uploadedFiles") || "[]"
          );
          const updatedFiles = [...existingFiles, fileData];

          localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));

          console.log("✅ File saved to localStorage:", fileData.name);
          resolve(fileData);
        } catch (error) {
          console.error("❌ Error saving file to localStorage:", error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error("❌ Error reading file for storage");
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("❌ Error in saveFileToStorage:", error);
    throw error;
  }
};

export const loadStoredFiles = () => {
  try {
    const stored = localStorage.getItem("uploadedFiles");
    if (stored) {
      const files = JSON.parse(stored);
      console.log(`📂 Loaded ${files.length} files from localStorage`);
      return files;
    }
    return [];
  } catch (error) {
    console.error("❌ Error loading stored files:", error);
    return [];
  }
};

export const loadFileFromStorage = (storedFile) => {
  try {
    // Convert base64 back to File object
    const byteCharacters = atob(storedFile.data.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], storedFile.name, {
      type: storedFile.type,
    });

    console.log("✅ Loaded file from storage:", storedFile.name);
    return {
      file,
      fileType: storedFile.fileType,
      metadata: storedFile.metadata,
    };
  } catch (error) {
    console.error("❌ Error loading file from storage:", error);
    throw new Error("Failed to load file from storage");
  }
};

export const updateLastOpened = (fileId) => {
  try {
    const existingFiles = JSON.parse(
      localStorage.getItem("uploadedFiles") || "[]"
    );
    const updatedFiles = existingFiles.map((file) =>
      file.id === fileId
        ? { ...file, lastOpened: new Date().toISOString() }
        : file
    );
    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
    return updatedFiles;
  } catch (error) {
    console.error("❌ Error updating last opened:", error);
    return [];
  }
};

export const deleteFileFromStorage = (fileId) => {
  try {
    const existingFiles = JSON.parse(
      localStorage.getItem("uploadedFiles") || "[]"
    );
    const updatedFiles = existingFiles.filter((file) => file.id !== fileId);
    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
    console.log("🗑️ File deleted from storage");
    return updatedFiles;
  } catch (error) {
    console.error("❌ Error deleting file from storage:", error);
    return [];
  }
};

export const clearAllStoredFiles = () => {
  try {
    localStorage.removeItem("uploadedFiles");
    console.log("🗑️ All files cleared from storage");
    return [];
  } catch (error) {
    console.error("❌ Error clearing stored files:", error);
    return [];
  }
};

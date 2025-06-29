// Test script to verify localStorage functionality
console.log("🧪 Testing localStorage functionality...");

// Test 1: Check if localStorage is available
if (typeof Storage !== "undefined") {
  console.log("✅ localStorage is available");
} else {
  console.log("❌ localStorage is not available");
}

// Test 2: Test saving and retrieving data
try {
  const testData = { test: "value", timestamp: new Date().toISOString() };
  localStorage.setItem("test-item", JSON.stringify(testData));

  const retrieved = JSON.parse(localStorage.getItem("test-item"));
  if (retrieved && retrieved.test === "value") {
    console.log("✅ localStorage save/retrieve works");
  } else {
    console.log("❌ localStorage save/retrieve failed");
  }

  // Clean up
  localStorage.removeItem("test-item");
} catch (error) {
  console.log("❌ localStorage error:", error);
}

// Test 3: Check current storage usage
let totalSize = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    totalSize += localStorage[key].length;
  }
}
console.log(
  `📊 Current localStorage usage: ${(totalSize / 1024).toFixed(2)} KB`
);

// Test 4: Check for existing uploaded files
const existingFiles = localStorage.getItem("uploadedFiles");
if (existingFiles) {
  try {
    const files = JSON.parse(existingFiles);
    console.log(`📂 Found ${files.length} existing files in storage`);
    files.forEach((file, index) => {
      console.log(
        `  ${index + 1}. ${file.name} (${file.fileType}) - ${(
          file.size / 1024
        ).toFixed(2)} KB`
      );
    });
  } catch (error) {
    console.log("❌ Error parsing existing files:", error);
  }
} else {
  console.log("📂 No existing files found in storage");
}

console.log("🏁 localStorage test completed");

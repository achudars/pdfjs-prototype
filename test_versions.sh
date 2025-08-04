#!/bin/bash

# Quick test script to verify PDF functionality
echo "Testing PDF.js version compatibility..."

# Check installed versions
echo "Checking installed versions:"
cd "c:\Users\aleks\github\javascript\pdfjs-prototype"
npm list react-pdf pdfjs-dist

echo ""
echo "Checking if worker file is in sync:"
ls -la public/pdf.worker.min.js
ls -la public/pdf.worker.min.mjs
ls -la node_modules/pdfjs-dist/build/pdf.worker.min.mjs

echo ""
echo "Testing if server is running:"
curl -I http://localhost:5176/ 2>/dev/null | head -1 || echo "Server not accessible"

echo ""
echo "Testing if worker file is accessible:"
curl -I http://localhost:5176/pdf.worker.min.js 2>/dev/null | head -1 || echo "Worker not accessible"

echo ""
echo "Test completed!"

# PDF & Image Viewer

A modern React-based PDF and image viewer built with Vite, react-pdf, and PDF.js. Features drag-and-drop upload for both PDFs and images, PDF navigation, metadata display, and a sleek dark theme.

## Screenshots

### File Upload Interface

![File Upload Interface](p1.jpg)

### PDF Viewer with Navigation

![PDF Viewer with Navigation](p2.jpg)

## Features

- 🎯 **Drag & Drop Upload** - Simply drag PDF files or images onto the interface
- 📄 **PDF Preview** - View PDF documents with high-quality rendering
- 🖼️ **Image Preview** - View images (JPEG, PNG, GIF, WebP, SVG) with responsive scaling
- 🔄 **Page Navigation** - Previous/Next buttons for multi-page PDF documents
- 📊 **Metadata Display** - Shows comprehensive file information for both PDFs and images
- 🎨 **Dark Theme** - Modern dark color scheme with custom CSS variables
- ⚡ **Fast Loading** - Vite-powered development with HMR
- 🔧 **Local Worker** - PDF.js worker served locally (no CDN dependency)
- ♿ **Accessible** - Keyboard navigation and screen reader support

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **react-pdf 9** - PDF rendering component
- **PDF.js 4.8.69** - PDF processing library
- **CSS Variables** - Custom dark theme

## Getting Started

### Prerequisites

- Node.js 16+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pdfjs-prototype

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

> **⚠️ Note**: Avoid upgrading major dependencies (React, Vite, react-pdf) without testing PDF functionality. See the "Important: Dependency Upgrades" section below for details.

### Building for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## Usage

1. **Upload a File**:

   - Drag and drop a PDF file or image onto the upload area
   - Or click the upload area to browse for files
   - Supported formats: PDF, JPEG, PNG, GIF, WebP, SVG

2. **View PDFs**:
   - Use Previous/Next buttons to navigate pages
   - View page count in the controls
   - See comprehensive PDF metadata (title, author, creation date, etc.)
   - Click "Close PDF" to return to upload interface

3. **View Images**:
   - Images are displayed with responsive scaling
   - View image metadata (dimensions, file size, aspect ratio, etc.)
   - Click "Close Image" to return to upload interface

## Project Structure

```
├── public/
│   ├── favicon.svg           # Blue square favicon (main)
│   ├── favicon-16x16.svg     # 16x16 favicon variant
│   ├── favicon-32x32.svg     # 32x32 favicon variant
│   └── pdf.worker.min.mjs    # PDF.js worker (local copy)
├── src/
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React entry point
│   └── style.css             # Custom dark theme styles
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

## Configuration

### PDF.js Worker Setup

This project uses a local copy of the PDF.js worker to avoid CORS issues:

- Worker file: `public/pdf.worker.min.mjs`
- Auto-copied via `postinstall` script
- Version-matched with pdfjs-dist dependency

See [WORKER_SETUP.md](WORKER_SETUP.md) for detailed worker configuration.

### Dark Theme

Custom CSS variables in `style.css`:

```css
:root {
  --primary: #2563eb;
  --secondary: #64748b;
  --accent: #3b82f6;
  --background: #0f172a;
  --surface: #1e293b;
  /* ... more variables */
}
```

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## ⚠️ Important: Dependency Upgrades

**Warning**: Upgrading major dependencies can break the PDF.js worker functionality.

### What Can Break

- **React version upgrades** (e.g., React 18 → 19)
- **Vite version upgrades** (e.g., Vite 5 → 6+)
- **pdfjs-dist upgrades** (automatic or manual)
- **react-pdf upgrades** (may pull different pdfjs-dist versions)

### Why It Breaks

1. **Version mismatches**: react-pdf and pdfjs-dist must use compatible versions
2. **Worker API changes**: PDF.js worker API can change between versions
3. **Build tool changes**: Vite updates may affect how worker files are processed
4. **Import path changes**: Worker file locations may change between versions

### Before Upgrading

1. **Check compatibility**: Verify react-pdf supports your target React/Vite version
2. **Review changelogs**: Check for breaking changes in PDF.js or react-pdf
3. **Test thoroughly**: Always test PDF upload/viewing after upgrades
4. **Backup working state**: Commit or backup before major upgrades

### If PDF Worker Breaks After Upgrade

1. Check console for worker-related errors
2. Verify worker file exists: `public/pdf.worker.min.mjs`
3. Ensure versions match: `npm list react-pdf pdfjs-dist`
4. Reinstall with correct versions: `npm install`
5. Consider reverting the upgrade if issues persist

See [WORKER_SETUP.md](WORKER_SETUP.md) for detailed worker configuration.

## Troubleshooting

### PDF Won't Load

1. Check browser console for errors
2. Verify worker file is accessible: `/pdf.worker.min.mjs`
3. Ensure PDF file is valid and not corrupted
4. Check that API and Worker versions match

### Version Mismatch Error

If you see "API version does not match Worker version":

```bash
rm -rf node_modules package-lock.json
npm install
```

### Worker File Missing

Manually copy the worker file:

```bash
npx copyfiles -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla's PDF rendering library
- [react-pdf](https://github.com/wojtekmaj/react-pdf) - React wrapper for PDF.js
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

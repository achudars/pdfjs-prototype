# PDF.js Worker Setup

This project uses a local copy of the PDF.js worker instead of a CDN to avoid CORS issues and ensure reliable PDF loading.

## ⚠️ Critical Warning: Dependency Upgrades

**DO NOT upgrade major dependencies without careful testing!**

Upgrading React, Vite, react-pdf, or pdfjs-dist can break PDF functionality because:

- Version compatibility between react-pdf and pdfjs-dist is strict
- Worker API changes between PDF.js versions
- Build tool changes can affect worker file processing

Always test PDF upload/viewing after any dependency changes.

## How it works

1. The PDF.js worker file is copied from `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/pdf.worker.min.mjs`
2. The worker is referenced locally in App.jsx: `pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'`
3. The `postinstall` script automatically copies the worker file when dependencies are installed
4. **Version matching**: `pdfjs-dist` is pinned to exact version `4.8.69` to match `react-pdf@9.x` dependency

## Version Compatibility

- **react-pdf@9.x** expects **pdfjs-dist@4.8.69**
- Both API and Worker must use the same version to avoid version mismatch errors
- The package.json pins `pdfjs-dist: "4.8.69"` (no caret) to ensure exact version match

## Manual setup

If you need to manually copy the worker file:

```bash
npm install copyfiles
npx copyfiles -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

## Verification

The app includes a check to verify the worker file is accessible:

- Check browser console for "✅ PDF worker file is accessible" message
- Check console for matching PDF.js version (should be 4.8.69)
- Or manually visit: http://localhost:5175/pdf.worker.min.mjs

## Troubleshooting

If you see "API version does not match Worker version":

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` (postinstall will copy correct worker)
3. Verify both versions match in console

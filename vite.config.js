const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react-pdf", "pdfjs-dist"],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.jsx"],
    reporters: [
      [
        "default",
        {
          summary: false,
        },
      ],
    ],
  },
});

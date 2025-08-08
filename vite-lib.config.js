import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/Skin-Editor/",        // Ensure correct public path for GitHub Pages
  root: __dirname,              // Root of your project
  build: {
    outDir: "dist",             // Output directory for built files
    rollupOptions: {
      input: resolve(__dirname, "index.html"),  // Your entry HTML
    }
  }
});

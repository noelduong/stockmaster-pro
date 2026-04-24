import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change `base` to match your GitHub repo name when deploying to GitHub Pages.
// Example: if repo = "stockmaster-pro", base = "/stockmaster-pro/"
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/stockmaster-pro/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});

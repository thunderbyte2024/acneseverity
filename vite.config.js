import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // Fixes asset loading for production
  plugins: [react()],
  build: {
    outDir: "dist", // Ensures the build goes to the correct folder
    chunkSizeWarningLimit: 1600, // Prevents large chunk warnings
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@tensorflow")) {
              return "tensorflow"; // Separate TensorFlow.js for better loading
            }
            return "vendor"; // Other dependencies
          }
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "./src/assets/styles.css";` 
      }
    }
  },
  server: {
    host: "0.0.0.0", // Allows external access in Render
    port: process.env.PORT || 5173 // Uses Render's assigned $PORT or 5173 locally
  },
  preview: {
    port: process.env.PORT || 4173, // Ensures correct port during `vite preview`
    host: "0.0.0.0"
  }
});

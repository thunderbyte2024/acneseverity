import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    cors: true, // Enables CORS (alternative to manually setting headers)
    proxy: {
      "/api": {
        target: "https://acne-ai-backend.onrender.com", // Change this to your backend URL
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets", // Keeps assets in a subdirectory
    rollupOptions: {
      input: {
        main: "index.html",
      },
      output: {
        chunkSizeWarningLimit: 1500, // Increased to allow larger TensorFlow models
      },
    },
  },
  publicDir: "public", // Ensures public folder is included in the build
  assetsInclude: ["**/*.bin", "**/*.json", "**/*.pb"], // Includes TensorFlow model files
});

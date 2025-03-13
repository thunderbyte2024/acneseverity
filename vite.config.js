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
        manualChunks: {
          tensorflow: ["@tensorflow/tfjs", "@tensorflow/tfjs-backend-webgl"],
          vendor: ["react", "react-dom", "axios"]
        }
      }
    }
  },
  server: {
    host: "0.0.0.0", // Allows external access in Render
    port: 5173 // This will be overridden by Render's $PORT
  }
});

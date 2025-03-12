import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, // Increase limit to avoid warnings
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
  }
});

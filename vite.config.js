import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*", // Allows cross-origin access
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "", // Ensures assets are properly referenced
    rollupOptions: {
      input: {
        main: "index.html",
      },
      output: {
        chunkSizeWarningLimit: 1000, // Increases chunk size limit
      },
    },
  },
  publicDir: "public", // Ensures public folder is included in the build
  assetsInclude: ["**/*.bin"], // Includes .bin files for TensorFlow model
});

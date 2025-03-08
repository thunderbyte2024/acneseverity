import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*", // Allows all origins to access your model
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "", // Ensures assets are properly referenced
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  publicDir: "public", // Ensures public folder is included in the build
});

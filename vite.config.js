import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change the port if needed
    open: true, // Automatically opens the browser
  },
  build: {
    outDir: 'dist',
  },
  base: '/', // Ensure correct asset paths for deployment
});

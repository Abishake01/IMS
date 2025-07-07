import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({

  base:"/",
  build:{
    outDir:"dist"
  },
  server: {
    // No historyApiFallback in Vite; use middleware or configure your framework/router for SPA fallback if needed
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 3000 on purpose: your FileController only allows CORS requests from
// http://localhost:3000 (@CrossOrigin). strictPort makes Vite stop with a clear
// error if 3000 is busy, instead of silently picking another port that the
// backend would then reject.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
});

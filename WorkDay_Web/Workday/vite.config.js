import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'
// import obfuscator from 'vite-plugin-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../../certs/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../../certs/server.crt')),
    },
    port: 5173,
  },
  build: {
    minify: 'esbuild',
    sourcemap: false, // Security: Don't ship sourcemaps to production
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})

// Vite configuration file

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    headers: {
      // Allow Google OAuth popup to postMessage back to the opener.
      // Default 'same-origin' (set by @vitejs/plugin-react for Fast Refresh)
      // blocks cross-origin popup communication.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})

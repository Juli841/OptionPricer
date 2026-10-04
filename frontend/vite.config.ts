import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // forward /api calls to FastAPI so the browser sees one origin (no CORS)
  server: { proxy: { '/api': 'http://127.0.0.1:8000' } },
})

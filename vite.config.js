import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // listen on every address so localhost (IPv4 or IPv6) and 127.0.0.1 all work
  server: { host: true, port: 5173, strictPort: true },
})

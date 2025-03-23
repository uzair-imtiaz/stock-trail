import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "d78d-182-177-103-62.ngrok-free.app"
    ],
  },
});
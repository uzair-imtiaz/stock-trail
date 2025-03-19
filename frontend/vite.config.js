import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://static.112.170.75.5.clients.your-server.de:3003",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
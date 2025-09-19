import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // S3 정적 호스팅용
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

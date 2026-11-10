import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`       -> dist/index.html        (trang tra cứu, 1 file duy nhất)
// `npm run build:admin` -> dist-admin/admin.html  (trang quản trị, 1 file duy nhất)
export default defineConfig(({ mode }) => {
  const admin = mode === 'admin'
  return {
    plugins: [viteSingleFile()],
    server: { port: 5173, host: true },
    build: admin ? { outDir: 'dist-admin', rollupOptions: { input: 'admin.html' } } : undefined,
  }
})

import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` gom toàn bộ (HTML + CSS + JS + hình ảnh + dữ liệu) thành 1 file dist/index.html
export default defineConfig({
  plugins: [viteSingleFile()],
  server: { port: 5173, host: true },
})

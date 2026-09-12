import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// AAAA.MM do build, injetado como literal pelo `define` para eu não ter
// que lembrar de atualizar na mão.
const BUILD = new Date().toISOString().slice(0, 7).replace('-', '.')

export default defineConfig({
  plugins: [react()],
  define: { __BUILD__: JSON.stringify(BUILD) },
})

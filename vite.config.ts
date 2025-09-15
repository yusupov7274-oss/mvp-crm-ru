import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// замените base на точное имя вашего репозитория
export default defineConfig({
  plugins: [react()],
  base: '/mvp-crm-ru/',
})

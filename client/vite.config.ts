import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  define:{
    'process.env':{
      CUSTOM_ENV_VAR:JSON.stringify(process.env.CUSTOM_END_VAR),
      NODE_ENV:JSON.stringify(process.env.NODE_ENV),
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
    theme: {
    extend: {
      colors: {
        brand: {
          dark: "#1E293B",      // sidebar / footer background
          darkHover: "#334155", // active/hover link bg
          primary: "#6366F1",   // indigo highlight
          secondary: "#3B82F6", // blue accent
          accent: "#14B8A6",    // teal/green
          light: "#F1F5F9",     // dashboard background
          text: "#CBD5E1",      // gray text
        },
      },
    },
  },
})

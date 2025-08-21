import { defineConfig } from "vite"
import basicSsl from "@vitejs/plugin-basic-ssl"


export default defineConfig({
  base: '/portfolio/',
  plugins: [basicSsl()],
  server: {
    https: true, // same as "--https" flag
    host: true, // same as "--host" flag
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Check if the import path starts with the folder you want to exclude
        return id.startsWith('./assets/images/');
      }
    }
  },

  assetsInclude: ['**/*.webp'],
})
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],  // Agrega el plugin de React
  server: {
    proxy: {
      '/api': 'http://localhost:5000',  // Redirige las solicitudes a tu backend
    },
  },
});

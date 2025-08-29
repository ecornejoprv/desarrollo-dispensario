import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig({
  plugins: [react()],  // Agrega el plugin de React
  server: {
    host: '172.20.4.65', // Establecer la IP para que escuche en esta dirección
    port: 5173,  // Puedes mantener el mismo puerto o cambiarlo si es necesario
    proxy: {
      '/api': 'http://172.20.4.65:5000',  // Redirige las solicitudes a tu backend
    },
  },
  optimizeDeps: {
    include: [
      'jspdf',
      'jspdf-autotable',
    ],
  },
});
 
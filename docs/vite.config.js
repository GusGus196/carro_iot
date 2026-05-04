import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss() // Activa Tailwind CSS en Vite (compilación y optimización de estilos)
  ],

  server: {
    port: 3000,
    host: true, // Acceso desde cualquier dispositivo en la red LAN
    strictPort: true
    
    /*
      Nota: estas opciones solo configuran el servidor de desarrollo (npm run dev).
      No afectan al comportamiento del proyecto en producción (npm run build)
    */
    }
})

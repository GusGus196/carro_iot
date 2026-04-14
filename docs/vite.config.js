import {defineConfig} from "vite";

export default defineConfig ({
  server: {
    port: 3000, // Puerto del servidor de desarrollo
    host: true, // Permite el acceso desde dispositivos en la red local automáticamente al correr "npm run dev"
    strictPort: true // Evita el cambio automático de puerto si el 3000 está en uso
    
    // Nota: Esta configuración es solo para desarrollo local; no afecta al build de producción
  }
})
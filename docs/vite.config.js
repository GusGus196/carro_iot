import {defineConfig} from "vite";

export default defineConfig ({
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
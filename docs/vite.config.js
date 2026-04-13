import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      // Utilizamos la versión web compilada de MQTT
      mqtt: "mqtt/dist/mqtt.min.js"
    },
  },

  build: {
    // Dirección dist/ para producción
    outDir: "dist", 
    
    // Vaciar el directorio en cada compilación
    emptyOutDir: true
  },

  // Correr servidor de desarrollo en desarrollo automáticamente al encender
  server: {
    open: true,
    port: 5173
  }
});
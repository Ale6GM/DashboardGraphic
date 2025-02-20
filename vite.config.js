import { defineConfig } from 'vite';

export default defineConfig({
    // Aquí van tus configuraciones personalizadas
    optimizeDeps: {
        include: ['html2pdf.js', 'jspdf', 'html2canvas'], // Ejemplo: incluir dependencias
    },
});
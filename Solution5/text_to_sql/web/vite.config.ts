import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Automatically opens the app in your browser
  },
  resolve: {
    alias: {
      '@': '/src', // Allows you to import like '@/components/Sidebar'
    },
  },
});

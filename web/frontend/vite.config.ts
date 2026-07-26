import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Vercel деплоит в корень домена (https://<project>.vercel.app/),
// поэтому base не нужен — дефолт '/' корректен. Для GitHub Pages
// (если вернёмся к нему в публичном репо) base пришлось бы ставить
// в '/The_Diet_app/' — Vite подставляет префикс ко всем ассетам.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Базовый путь для GitHub Pages: сайт публикуется не в корне домена,
// а в /The_Diet_app/. Vite подставит этот префикс ко всем ассетам в index.html.
// Для приватного репо Pages требует платный план — репозиторий должен быть публичным.
const repoName = 'The_Diet_app';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import vitePluginRequire from 'vite-plugin-require';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginRequire.default()],
  resolve: {
    alias: {
      // This allows you to do things like `import Component from '@/components/Component'`
      // where `@` points to `src`
      '@': '/src',
    },
  },
  server: {
    watch: {
      // Activer le polling pour WSL (nécessaire quand les fichiers sont sur /mnt/c/)
      usePolling: true,
      interval: 1000, // Vérifier les changements toutes les 3 secondes (moins agressif)
    },
    hmr: true,
    proxy: {
      // Proxy pour l'API Omeka S - contourne CORS en dev
      '/omk/api': {
        target: 'https://edisem.arcanes.ca',
        changeOrigin: true,
        secure: true,
      },
      // Proxy pour l'API Omeka S tests - contourne CORS en dev
      '/tests-api': {
        target: 'https://tests.arcanes.ca',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tests-api/, '/omk/api'),
      },
    },
  },
});

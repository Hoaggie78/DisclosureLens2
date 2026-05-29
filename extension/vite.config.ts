import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        serviceWorker: resolve(__dirname, 'src/background/serviceWorker.ts'),
        youtubeExtractor: resolve(__dirname, 'src/content/youtubeExtractor.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'serviceWorker') return 'background/serviceWorker.js';
          if (chunk.name === 'youtubeExtractor') return 'content/youtubeExtractor.js';
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});

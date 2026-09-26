import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        server: resolve(__dirname, 'server.html'),
        giveaways: resolve(__dirname, 'giveaways.html'),
        promos: resolve(__dirname, 'promos.html'),
      },
    },
  },
});
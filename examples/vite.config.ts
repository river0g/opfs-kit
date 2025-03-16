import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 6153,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      // 必要に応じてエイリアスを追加できます
    }
  }
});

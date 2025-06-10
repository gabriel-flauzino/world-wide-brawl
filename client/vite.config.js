import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@bokuweb/zstd-wasm'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..', '/home/user/world-wide-brawl/node_modules/@bokuweb/zstd-wasm/dist/web/zstd.wasm'],
    },
  },
});
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: './frontend/public',
  plugins: [tailwindcss()],
  build: {
    outDir: '../../dist',
  },
});
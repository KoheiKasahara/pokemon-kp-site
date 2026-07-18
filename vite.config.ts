import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 相対パスで出力するため、GitHub Pagesのリポジトリ名に依存せず公開できる。
export default defineConfig({
  base: './',
  plugins: [react()],
});

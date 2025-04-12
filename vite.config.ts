import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, './src/styles'),
      '@components': path.resolve(__dirname, './src/components'),
      '@fonts': path.resolve(__dirname, './src/fonts'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
    watch: {
      usePolling: false, // Disable polling for file changes
      ignored: ['**/node_modules/**', '**/dist/**'], // Ignore watching these directories
    },
  },
  optimizeDeps: {
    include: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/form',
      'react',
      'react-dom'
    ], // Pre-bundle frequently used dependencies
    exclude: [], // Add dependencies that cause issues when pre-bundled
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // Better handling of mixed module formats
    },
    target: 'esnext', // Use modern JS features for smaller bundles
    minify: 'esbuild', // Faster minification
    cssCodeSplit: true, // Split CSS into chunks
    reportCompressedSize: false, // Skip calculating compressed size for faster builds
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }, // Suppress common warnings
  },
  css: {
    devSourcemap: false, // Disable CSS sourcemaps in dev for better performance
  },
  cacheDir: './.vite_cache', // Custom cache location
})
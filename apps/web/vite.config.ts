import { defineConfig, lazyPlugins } from 'vite-plus';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'node:path';
import babel from '@rolldown/plugin-babel';

export default defineConfig({
  root: __dirname,
  plugins: lazyPlugins(() => [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ]),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      ...Object.fromEntries(
        ['shared', 'domain', 'data', 'infra', 'main', 'presentation', 'modules'].map((layer) => [
          `@${layer}`,
          path.resolve(__dirname, 'src', layer === 'shared' ? '@shared' : layer),
        ]),
      ),
      // O pacote shared é CJS (consumido pelo Nest); no Vite usamos o fonte TS.
      '@beverage/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  test: {
    environment: 'node',
  },
});

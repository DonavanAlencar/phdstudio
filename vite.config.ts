import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy para backend Node/Express em dev
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/crm': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        // Variáveis VITE_ são automaticamente expostas pelo Vite
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        minify: isProduction ? 'esbuild' : false,
        // Esbuild remove console automaticamente em produção quando minify está ativo
        // Mas vamos garantir com uma configuração explícita
        esbuild: {
          drop: isProduction ? ['console', 'debugger'] : [],
        },
      },
    };
});

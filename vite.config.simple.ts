import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: true,
    target: 'node18',
    outDir: 'dist/server',
    rollupOptions: {
      input: 'server/simple-start.ts',
      output: {
        entryFileNames: 'simple.mjs',
        format: 'es'
      },
      external: ['express', 'cors', 'mysql2', 'jsonwebtoken', 'bcryptjs', 'uuid', 'zod', 'dotenv']
    }
  }
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory state shared between admin (mobile) and dashboard (projector)
let syncData = '';

const syncPlugin = {
  name: 'tournament-sync',
  configureServer(server: any) {
    server.middlewares.use('/_sync', (req: any, res: any) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          syncData = body;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('ok');
        });
      } else {
        // GET
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(syncData || 'null');
      }
    });
  }
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), syncPlugin],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

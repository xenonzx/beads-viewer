import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'

// Serve the JSONL fallback from BEADS_DIR when set, so the frontend reads the
// same project the server does (not the viewer's own .beads/).
function beadsDirJsonl(dir: string): Plugin {
  return {
    name: 'beads-dir-jsonl',
    configureServer(server) {
      server.middlewares.use('/.beads/issues.jsonl', (_req, res) => {
        try {
          res.setHeader('Content-Type', 'application/x-ndjson')
          res.end(readFileSync(path.join(dir, '.beads', 'issues.jsonl')))
        } catch {
          res.statusCode = 404
          res.end()
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to the client; BEADS_DIR lives in
  // .env for both the server and this dev middleware.
  const env = loadEnv(mode, process.cwd(), 'BEADS_DIR')
  const beadsDir = env.BEADS_DIR || process.env.BEADS_DIR || process.cwd()

  return {
    plugins: [react(), beadsDirJsonl(beadsDir)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      fs: {
        // Allow serving files from the .beads directory
        allow: ['..']
      }
    }
  }
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { pathToFileURL } from 'node:url'

async function readBody(req: import('node:http').IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// Mock KV for local development
const mockKVStore: Record<string, string> = {}
const mockKV = {
  get: async (key: string) => mockKVStore[key] || null,
  put: async (key: string, value: string) => { mockKVStore[key] = value },
  delete: async (key: string) => { delete mockKVStore[key] },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      {
        name: 'local-pages-functions',
        configureServer(server) {
          server.middlewares.use('/api', async (req, res) => {
            try {
              const functionModule = await import(pathToFileURL(path.resolve(__dirname, 'functions/api/[[path]].js')).href)
              const onRequest = functionModule.onRequest
              const headers = new Headers()
              for (const [key, value] of Object.entries(req.headers)) {
                if (Array.isArray(value)) headers.set(key, value.join(', '))
                else if (value !== undefined) headers.set(key, value)
              }
              const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req)
              const request = new Request(`http://localhost${req.originalUrl || req.url}`, {
                method: req.method,
                headers,
                body,
              })
              const response = await onRequest({
                request,
                env: {
                  KV: mockKV,
                  JWT_SECRET: env.JWT_SECRET || 'local-dev-secret',
                  KIS_API_URL: env.KIS_API_URL || 'https://openapi.koreainvestment.com:9443',
                  KIS_APP_KEY: env.KIS_APP_KEY,
                  KIS_APP_SECRET: env.KIS_APP_SECRET,
                  KIS_CANO: env.KIS_CANO,
                },
                params: {},
                waitUntil: () => undefined,
                passThroughOnException: () => undefined,
                next: () => Promise.resolve(new Response(null, { status: 404 })),
                data: {},
                functionPath: '/api/[[path]]',
              } as never)

              res.statusCode = response.status
              response.headers.forEach((value: string, key: string) => res.setHeader(key, value))
              res.end(Buffer.from(await response.arrayBuffer()))
            } catch (error) {
              console.error(error)
              res.statusCode = 500
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ error: 'Local API middleware failed' }))
            }
          })
        },
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})

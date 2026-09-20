import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { GoogleGenAI } from '@google/genai'

function geminiChatApiPlugin() {
  return {
    name: 'gemini-chat-api',
    configureServer(server: any) {
      server.middlewares.use('/api/chat', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const message = data.message || '';

            const apiKey = process.env.GEMINI_API_KEY?.trim();
            if (apiKey && !apiKey.startsWith('AQ.')) {
              try {
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: message,
                  config: {
                    systemInstruction: `You are the SR Insurance Enterprise AI Assistant. You assist users with policy applications, checking claim status, comparing motor, health, and property plans, IRDAI compliance guidelines, and NCB calculations. Give concise, accurate, and professional advice.`,
                  }
                });

                if (response?.text) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ response: response.text }));
                  return;
                }
              } catch (aiErr: any) {
                console.warn('Gemini chat API notice: Falling back to local intelligence engine.', aiErr?.status || aiErr?.message || 'unavailable');
              }
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              fallback: true,
              message: 'Using built-in insurance intelligence engine'
            }));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              fallback: true
            }));
          }
        });
      });
    }
  };
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  root: path.resolve(__dirname, './src/frontend'),
  plugins: [
    figmaAssetResolver(),
    geminiChatApiPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
})

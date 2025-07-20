// ACEX Capital Markets - Cloudflare Worker
// Serve apenas as rotas da API - arquivos estáticos são servidos pelo site bucket

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Apenas responder a rotas de API
    if (path.startsWith('/api/')) {
      if (path === '/api/status') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString() 
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      if (path === '/api/data') {
        return new Response(JSON.stringify({ 
          message: 'API em desenvolvimento. Use localStorage para persistência de dados.',
          precos: {
            BGIJ25: 290.00,
            BGIK25: 292.50,
            BGIM25: 295.00,
            BGIN25: 297.50,
            BGIQ25: 300.00,
            BGIU25: 302.50,
            BGIV25: 305.00,
            BGIX25: 307.50,
            BGIZ25: 310.00
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
    }

    // Deixar site bucket servir arquivos estáticos
    return new Response('Not Found', { status: 404 });
  }
};



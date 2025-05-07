// Arquivo principal para Cloudflare Workers
// src/index.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Servir arquivos estáticos
  if (path === '/' || path === '') {
    return new Response(await fetch('public/index.html'), {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  if (path.startsWith('/public/')) {
    return fetch(path.substring(1))
  }

  // Rotas da API
  if (path.startsWith('/api/')) {
    return handleApiRequest(request, path)
  }

  // Fallback para index.html (SPA)
  return new Response(await fetch('public/index.html'), {
    headers: { 'Content-Type': 'text/html' }
  })
}

async function handleApiRequest(request, path) {
  const method = request.method

  // API de transações
  if (path === '/api/transacoes') {
    if (method === 'GET') {
      return handleGetTransacoes()
    } else if (method === 'POST') {
      return handlePostTransacao(request)
    }
  }

  // API de posições
  if (path === '/api/posicoes/abertas') {
    return handleGetPosicoesAbertas()
  }

  if (path === '/api/posicoes/liquidadas') {
    return handleGetPosicoesLiquidadas()
  }

  if (path === '/api/posicoes/liquidar' && method === 'POST') {
    return handleLiquidarPosicao(request)
  }

  // API de preços
  if (path === '/api/precos') {
    if (method === 'GET') {
      return handleGetPrecos()
    } else if (method === 'POST') {
      return handleUpdatePreco(request)
    }
  }

  return new Response('Endpoint não encontrado', { status: 404 })
}

// Implementações das funções de manipulação da API
async function handleGetTransacoes() {
  try {
    const { results } = await DB.prepare(
      'SELECT * FROM transacoes ORDER BY data DESC'
    ).all()
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handlePostTransacao(request) {
  try {
    const data = await request.json()
    const { data: transacaoData, referencia, tipo, contratos, preco } = data
    
    const valor = contratos * preco
    
    const { success } = await DB.prepare(
      'INSERT INTO transacoes (data, referencia, tipo, contratos, preco, valor) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(transacaoData, referencia, tipo, contratos, preco, valor).run()
    
    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Falha ao inserir transação' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Implementações das demais funções de API...

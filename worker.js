// Cloudflare Worker code (worker.js)

// Definir rotas para a API
const routes = {
  getData: new URL("/data", self.location).pathname,
  getStatus: new URL("/api/status", self.location).pathname,
};

// Função para gerar respostas JSON
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Permitir CORS de qualquer origem (ajuste em produção)
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Manipulador principal de requisições
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Lidar com requisições OPTIONS (CORS preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Rota de status
  if (path === routes.getStatus && request.method === "GET") {
    return jsonResponse({ status: "ok" });
  }

  // Rota para obter transações
  if (path === routes.getData && request.method === "GET") {
    // Obter ID do usuário da query string ou usar um ID padrão
    const userId = url.searchParams.get("userId") || "default-user";

    try {
      // Buscar dados do KV usando o binding "TRANSACOES_STORE"
      // Certifique-se de que o binding está configurado no painel do Cloudflare
      const storedData = await TRANSACOES_STORE.get(userId);

      if (storedData) {
        return jsonResponse(JSON.parse(storedData));
      } else {
        // Retornar dados padrão se não houver nada no KV
        return jsonResponse({ precos: {}, transacoes: [], posicoesAbertas: [], posicoesLiquidadas: [] });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do KV:", error);
      return jsonResponse({ success: false, error: "Erro interno ao buscar dados." }, 500);
    }
  }

  // Rota para salvar transações
  if (path === routes.getData && request.method === "POST") {
    try {
      // Obter dados do corpo da requisição
      const data = await request.json();

      // Obter ID do usuário da query string ou usar um ID padrão
      const userId = url.searchParams.get("userId") || "default-user";

      // Validar dados (opcional, mas recomendado)
      if (!data || typeof data !== "object") {
        return jsonResponse({ success: false, error: "Dados inválidos." }, 400);
      }

      // Salvar dados no KV usando o binding "TRANSACOES_STORE"
      await TRANSACOES_STORE.put(userId, JSON.stringify(data));

      return jsonResponse({ success: true, message: "Dados salvos com sucesso" });
    } catch (error) {
      console.error("Erro ao salvar dados no KV:", error);
      return jsonResponse({ success: false, error: "Erro interno ao salvar dados." }, 500);
    }
  }

  // Rota não encontrada
  return jsonResponse({ error: "Rota não encontrada" }, 404);
}

// Registrar manipulador de eventos fetch
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});


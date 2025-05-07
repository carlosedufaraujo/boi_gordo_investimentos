/**
 * data_api.js - Gerenciamento de dados da aplicação Boi Gordo Investimentos com Cloudflare Workers
 * 
 * Este arquivo contém as funções para gerenciar os dados da aplicação,
 * incluindo preços, transações, posições abertas e liquidadas, usando Cloudflare Workers KV para armazenamento.
 */

// Configuração da API
const API_URL = 'https://boi-gordo-api.carlosedufaraujo.workers.dev'; // URL correta do Worker
const USER_ID = 'default-user'; // Você pode implementar autenticação mais robusta depois

// Dados da aplicação
let precos = {
  BGIJ25: 350.00, // Abril
  BGIK25: 340.00, // Maio
  BGIM25: 330.00, // Junho
  BGIN25: 320.00, // Julho
  BGIQ25: 310.00, // Agosto
  BGIU25: 300.00, // Setembro
  BGIV25: 290.00, // Outubro
  BGIX25: 280.00, // Novembro
  BGIZ25: 270.00  // Dezembro
};

// Mapeamento de códigos para nomes de meses
const mesesReferencia = {
  BGIJ25: "Abril/2025",
  BGIK25: "Maio/2025",
  BGIM25: "Junho/2025",
  BGIN25: "Julho/2025",
  BGIQ25: "Agosto/2025",
  BGIU25: "Setembro/2025",
  BGIV25: "Outubro/2025",
  BGIX25: "Novembro/2025",
  BGIZ25: "Dezembro/2025"
};

// Arrays para armazenar dados
let transacoes = [];
let posicoesAbertas = [];
let posicoesLiquidadas = [];

/**
 * Salva todos os dados na API do Cloudflare Worker
 * @returns {Promise<boolean>} - Sucesso da operação
 */
async function salvarDados() {
  try {
    const dados = {
      precos,
      transacoes,
      posicoesAbertas,
      posicoesLiquidadas,
      ultimaAtualizacao: new Date().toISOString()
    };
    
    // Salvar na API
    const response = await fetch(`${API_URL}/data`, { // Corrigido endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });
    
    const result = await response.json();
    
    // Também salvar no localStorage como backup
    localStorage.setItem('boiGordoData', JSON.stringify(dados));
    
    console.log('Dados salvos com sucesso:', result);
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados na API:', error);
    
    // Salvar apenas no localStorage se a API falhar
    const dados = {
      precos,
      transacoes,
      posicoesAbertas,
      posicoesLiquidadas,
      ultimaAtualizacao: new Date().toISOString()
    };
    localStorage.setItem('boiGordoData', JSON.stringify(dados));
    
    // Mostrar notificação de erro se a função existir
    if (typeof mostrarNotificacao === 'function') {
      mostrarNotificacao('Erro ao salvar dados na nuvem. Dados salvos localmente.', 'warning');
    }
    
    return false;
  }
}

/**
 * Carrega todos os dados da API do Cloudflare Worker
 * @returns {Promise<boolean>} - Sucesso da operação
 */
async function carregarDados() {
  try {
    // Tentar carregar da API primeiro
    const response = await fetch(`${API_URL}/data`); // Corrigido endpoint
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data) {
      precos = data.precos || precos;
      transacoes = data.transacoes || [];
      posicoesAbertas = data.posicoesAbertas || [];
      posicoesLiquidadas = data.posicoesLiquidadas || [];
      
      // Também atualizar o localStorage como backup
      localStorage.setItem('boiGordoData', JSON.stringify(data));
      
      console.log('Dados carregados com sucesso da API');
      return true;
    }
  } catch (error) {
    console.error('Erro ao carregar dados da API:', error);
    
    // Tentar carregar do localStorage como fallback
    try {
      const dadosLocalStorage = localStorage.getItem('boiGordoData');
      if (dadosLocalStorage) {
        const data = JSON.parse(dadosLocalStorage);
        precos = data.precos || precos;
        transacoes = data.transacoes || [];
        posicoesAbertas = data.posicoesAbertas || [];
        posicoesLiquidadas = data.posicoesLiquidadas || [];
        
        // Mostrar notificação de aviso se a função existir
        if (typeof mostrarNotificacao === 'function') {
          mostrarNotificacao('Usando dados salvos localmente. Conexão com a nuvem indisponível.', 'warning');
        }
        
        console.log('Dados carregados do localStorage');
        return true;
      }
    } catch (localError) {
      console.error('Erro ao carregar dados do localStorage:', localError);
    }
  }
  
  // Se chegou aqui, não conseguiu carregar dados nem da API nem do localStorage
  calcularPosicoes(); // Calcular posições com os dados padrão
  return false;
}

/**
 * Reseta todos os dados da aplicação
 * @returns {Promise<boolean>} - Sucesso da operação
 */
async function resetarDados() {
  transacoes = [];
  posicoesAbertas = [];
  posicoesLiquidadas = [];
  return await salvarDados();
}

/**
 * Adiciona uma nova transação e recalcula posições
 * @param {string} data - Data da transação
 * @param {string} referencia - Código da referência
 * @param {string} tipo - Tipo da transação (Compra/Venda)
 * @param {number} contratos - Quantidade de contratos
 * @param {number} preco - Preço unitário
 * @returns {Promise<boolean>} - Sucesso da operação
 */
async function adicionarTransacao(data, referencia, tipo, contratos, preco) {
  const novaTransacao = {
    id: Date.now(),
    data: data,
    referencia: referencia,
    tipo: tipo,
    contratos: parseInt(contratos),
    preco: parseFloat(preco),
    valorTotal: parseInt(contratos) * parseFloat(preco)
  };
  
  // Adicionar a transação em ordem cronológica
  let indiceInsercao = 0;
  while (indiceInsercao < transacoes.length && new Date(transacoes[indiceInsercao].data) <= new Date(data)) {
    indiceInsercao++;
  }
  
  transacoes.splice(indiceInsercao, 0, novaTransacao);
  
  // Recalcular todas as posições a partir do zero
  calcularPosicoes();
  
  return await salvarDados();
}

/**
 * Calcula posições abertas e liquidadas com base nas transações
 */
function calcularPosicoes() {
  // Resetar posições
  posicoesAbertas = [];
  posicoesLiquidadas = [];
  
  // Ordenar transações por data
  transacoes.sort((a, b) => new Date(a.data) - new Date(b.data));
  
  // Mapear posições por referência
  const mapaReferencias = {};
  
  // Processar cada transação em ordem cronológica
  transacoes.forEach(transacao => {
    const { referencia, tipo, contratos, preco, data } = transacao;
    
    // Inicializar referência se não existir
    if (!mapaReferencias[referencia]) {
      mapaReferencias[referencia] = {
        saldo: 0,
        precoMedio: 0,
        valorTotal: 0,
        transacoes: [],
        dataEntrada: null
      };
    }
    
    const posicao = mapaReferencias[referencia];
    
    // Adicionar transação ao histórico da referência
    posicao.transacoes.push(transacao);
    
    // Se é a primeira transação, registrar data de entrada
    if (posicao.dataEntrada === null) {
      posicao.dataEntrada = data;
    }
    
    if (tipo === 'Compra') {
      // Se já temos posição vendida (short)
      if (posicao.saldo < 0) {
        // Estamos reduzindo ou invertendo uma posição vendida
        const contratosLiquidacao = Math.min(contratos, Math.abs(posicao.saldo));
        
        if (contratosLiquidacao > 0) {
          // Calcular resultado da liquidação parcial
          const resultado = (posicao.precoMedio - preco) * contratosLiquidacao * 330; // Multiplicar por 330 arrobas
          const diasInvestidos = Math.max(0, Math.floor((new Date(data) - new Date(posicao.dataEntrada)) / (1000 * 60 * 60 * 24)));
          
          // Registrar posição liquidada
          posicoesLiquidadas.push({
            referencia: referencia,
            tipo: 'Venda', // Liquidando posição vendida
            contratos: contratosLiquidacao,
            precoEntrada: posicao.precoMedio,
            precoSaida: preco,
            resultado: resultado,
            diasInvestidos: diasInvestidos,
            dataLiquidacao: data
          });
          
          // Atualizar saldo
          posicao.saldo += contratosLiquidacao;
          
          // Se invertemos a posição (compramos mais do que vendemos)
          if (contratos > contratosLiquidacao) {
            // Restante dos contratos inicia nova posição comprada
            const contratosRestantes = contratos - contratosLiquidacao;
            posicao.saldo += contratosRestantes;
            posicao.precoMedio = preco;
            posicao.valorTotal = posicao.saldo * posicao.precoMedio;
            posicao.dataEntrada = data; // Nova data de entrada para a posição invertida
          } else if (posicao.saldo === 0) {
            // Se saldo zerou, resetar preço médio
            posicao.precoMedio = 0;
            posicao.valorTotal = 0;
            posicao.dataEntrada = null;
          }
        }
      } else {
        // Atualizar preço médio ponderado para posição comprada
        const valorAnterior = posicao.saldo * posicao.precoMedio;
        const valorNovo = contratos * preco;
        const novoSaldo = posicao.saldo + contratos;
        
        if (novoSaldo > 0) {
          posicao.precoMedio = (valorAnterior + valorNovo) / novoSaldo;
        }
        
        posicao.saldo += contratos;
        posicao.valorTotal = posicao.saldo * posicao.precoMedio;
      }
    } else if (tipo === 'Venda') {
      // Se já temos posição comprada (long)
      if (posicao.saldo > 0) {
        // Estamos reduzindo ou invertendo uma posição comprada
        const contratosLiquidacao = Math.min(contratos, posicao.saldo);
        
        if (contratosLiquidacao > 0) {
          // Calcular resultado da liquidação parcial
          const resultado = (preco - posicao.precoMedio) * contratosLiquidacao * 330; // Multiplicar por 330 arrobas
          const diasInvestidos = Math.max(0, Math.floor((new Date(data) - new Date(posicao.dataEntrada)) / (1000 * 60 * 60 * 24)));
          
          // Registrar posição liquidada
          posicoesLiquidadas.push({
            referencia: referencia,
            tipo: 'Compra', // Liquidando posição comprada
            contratos: contratosLiquidacao,
            precoEntrada: posicao.precoMedio,
            precoSaida: preco,
            resultado: resultado,
            diasInvestidos: diasInvestidos,
            dataLiquidacao: data
          });
          
          // Atualizar saldo
          posicao.saldo -= contratosLiquidacao;
          
          // Se invertemos a posição (vendemos mais do que compramos)
          if (contratos > contratosLiquidacao) {
            // Restante dos contratos inicia nova posição vendida
            const contratosRestantes = contratos - contratosLiquidacao;
            posicao.saldo -= contratosRestantes;
            posicao.precoMedio = preco;
            posicao.valorTotal = Math.abs(posicao.saldo) * posicao.precoMedio;
            posicao.dataEntrada = data; // Nova data de entrada para a posição invertida
          } else if (posicao.saldo === 0) {
            // Se saldo zerou, resetar preço médio
            posicao.precoMedio = 0;
            posicao.valorTotal = 0;
            posicao.dataEntrada = null;
          }
        }
      } else {
        // Iniciar ou aumentar posição vendida (short)
        if (posicao.saldo === 0) {
          // Nova posição vendida
          posicao.precoMedio = preco;
          posicao.dataEntrada = data;
        } else {
          // Atualizar preço médio ponderado para posição vendida
          const valorAnterior = Math.abs(posicao.saldo) * posicao.precoMedio;
          const valorNovo = contratos * preco;
          const novoSaldo = Math.abs(posicao.saldo) + contratos;
          
          if (novoSaldo > 0) {
            posicao.precoMedio = (valorAnterior + valorNovo) / novoSaldo;
          }
        }
        
        posicao.saldo -= contratos;
        posicao.valorTotal = Math.abs(posicao.saldo) * posicao.precoMedio;
      }
    }
  });
  
  // Converter mapa de referências em array de posições abertas
  for (const [referencia, dados] of Object.entries(mapaReferencias)) {
    if (dados.saldo > 0) {
      // Posição comprada (long)
      const diasEmAberto = dados.dataEntrada ? 
        Math.max(0, Math.floor((new Date() - new Date(dados.dataEntrada)) / (1000 * 60 * 60 * 24))) : 0;
      
      // Garantir que o preço atual seja um número válido
      const precoAtual = precos[referencia] || 0;
      
      posicoesAbertas.push({
        referencia: referencia,
        tipo: 'Compra',
        contratos: dados.saldo,
        precoMedio: dados.precoMedio,
        precoAtual: precoAtual,
        resultadoPotencial: precoAtual > 0 ? (precoAtual - dados.precoMedio) * dados.saldo * 330 : 0, // Evitar NaN quando preço é zero
        diasEmAberto: diasEmAberto
      });
    } else if (dados.saldo < 0) {
      // Posição vendida (short)
      const diasEmAberto = dados.dataEntrada ? 
        Math.max(0, Math.floor((new Date() - new Date(dados.dataEntrada)) / (1000 * 60 * 60 * 24))) : 0;
      
      // Garantir que o preço atual seja um número válido
      const precoAtual = precos[referencia] || 0;
      
      posicoesAbertas.push({
        referencia: referencia,
        tipo: 'Venda',
        contratos: Math.abs(dados.saldo),
        precoMedio: dados.precoMedio,
        precoAtual: precoAtual,
        resultadoPotencial: precoAtual > 0 ? (dados.precoMedio - precoAtual) * Math.abs(dados.saldo) * 330 : 0, // Evitar NaN quando preço é zero
        diasEmAberto: diasEmAberto
      });
    }
  }
}

/**
 * Liquida uma posição aberta
 * @param {string} referencia - Código da referência
 * @param {number} contratos - Quantidade de contratos a liquidar
 * @param {number} preco - Preço de liquidação
 * @returns {Promise<boolean>} - Sucesso da operação
 */
async function liquidarPosicao(referencia, contratos, preco) {
  const posicao = posicoesAbertas.find(p => p.referencia === referencia);
  
  if (posicao) {
    const hoje = new Date().toISOString().split('T')[0];
    const tipoLiquidacao = posicao.tipo === 'Compra' ? 'Venda' : 'Compra';
    
    return await adicionarTransacao(hoje, referencia, tipoLiquidacao, contratos, preco);
  }
  
  return false;
}

/**
 * Atualiza os preços atuais dos contratos
 * @param {Object} novosPrecos - Objeto com novos preços
 * @returns {Promise<boolean>} - Sucesso da operação
 */
async function atualizarPrecos(novosPrecos) {
  for (const [referencia, preco] of Object.entries(novosPrecos)) {
    if (precos[referencia] !== undefined) {
      precos[referencia] = parseFloat(preco);
    }
  }
  
  // Recalcular resultados potenciais
  posicoesAbertas.forEach(posicao => {
    const precoAtual = precos[posicao.referencia] || 0;
    if (posicao.tipo === 'Compra') {
      posicao.resultadoPotencial = precoAtual > 0 ? (precoAtual - posicao.precoMedio) * posicao.contratos * 330 : 0; // Evitar NaN
    } else {
      posicao.resultadoPotencial = precoAtual > 0 ? (posicao.precoMedio - precoAtual) * posicao.contratos * 330 : 0; // Evitar NaN
    }
    posicao.precoAtual = precoAtual;
  });
  
  return await salvarDados();
}

/**
 * Simula o resultado com um preço específico
 * @param {string} referencia - Código da referência ou "Todos os Contratos"
 * @param {number} preco - Preço simulado
 * @returns {number} - Resultado simulado
 */
function simularPreco(referencia, preco) {
  const precoSimulado = parseFloat(preco);
  let resultadoSimulado = 0;
  
  if (referencia === 'Todos os Contratos') {
    // Simular para todas as posições abertas
    posicoesAbertas.forEach(posicao => {
      if (posicao.tipo === 'Compra') {
        resultadoSimulado += (precoSimulado - posicao.precoMedio) * posicao.contratos * 330; // Multiplicar por 330 arrobas
      } else {
        resultadoSimulado += (posicao.precoMedio - precoSimulado) * posicao.contratos * 330; // Multiplicar por 330 arrobas
      }
    });
  } else {
    // Simular para uma referência específica
    const posicoesReferencia = posicoesAbertas.filter(p => p.referencia === referencia);
    posicoesReferencia.forEach(posicao => {
      if (posicao.tipo === 'Compra') {
        resultadoSimulado += (precoSimulado - posicao.precoMedio) * posicao.contratos * 330; // Multiplicar por 330 arrobas
      } else {
        resultadoSimulado += (posicao.precoMedio - precoSimulado) * posicao.contratos * 330; // Multiplicar por 330 arrobas
      }
    });
  }
  
  return resultadoSimulado;
}

/**
 * Calcula métricas de desempenho
 * @returns {Object} - Objeto com todas as métricas calculadas
 */
function calcularMetricas() {
  // Resultado acumulado
  const resultadoAcumulado = posicoesLiquidadas.reduce((total, posicao) => total + posicao.resultado, 0);
  
  // Contratos liquidados
  const contratosLiquidados = posicoesLiquidadas.reduce((total, posicao) => total + posicao.contratos, 0);
  
  // Taxa de acerto
  const operacoesPositivas = posicoesLiquidadas.filter(p => p.resultado > 0).length;
  const taxaAcerto = posicoesLiquidadas.length > 0 ? (operacoesPositivas / posicoesLiquidadas.length) * 100 : 0;
  
  // Fator de lucro
  const ganhoTotal = posicoesLiquidadas.filter(p => p.resultado > 0).reduce((total, p) => total + p.resultado, 0);
  const perdaTotal = Math.abs(posicoesLiquidadas.filter(p => p.resultado < 0).reduce((total, p) => total + p.resultado, 0));
  const fatorLucro = perdaTotal > 0 ? ganhoTotal / perdaTotal : 0;
  
  // Resultado por contrato
  const resultadoPorContrato = contratosLiquidados > 0 ? resultadoAcumulado / contratosLiquidados : 0;
  
  // Spread médio
  const spreadMedio = posicoesLiquidadas.length > 0 ? 
    posicoesLiquidadas.reduce((total, p) => total + Math.abs(p.precoSaida - p.precoEntrada), 0) / posicoesLiquidadas.length : 0;
  
  // Resultado por dia
  const diasTotais = posicoesLiquidadas.reduce((total, p) => total + p.diasInvestidos, 0);
  const resultadoPorDia = diasTotais > 0 ? resultadoAcumulado / diasTotais : 0;
  
  // Tempo médio investido
  const tempoMedioInvestido = posicoesLiquidadas.length > 0 ? diasTotais / posicoesLiquidadas.length : 0;
  
  // Maior ganho e maior perda
  const maiorGanho = posicoesLiquidadas.length > 0 ? 
    Math.max(...posicoesLiquidadas.map(p => p.resultado), 0) : 0;
  const maiorPerda = posicoesLiquidadas.length > 0 ? 
    Math.min(...posicoesLiquidadas.map(p => p.resultado), 0) : 0;
  
  // ROI
  const investimentoTotal = posicoesLiquidadas.reduce((total, p) => total + (p.precoEntrada * p.contratos), 0);
  const roi = investimentoTotal > 0 ? (resultadoAcumulado / investimentoTotal) * 100 : 0;
  
  // Índice de Sharpe (simplificado)
  const retornos = posicoesLiquidadas.map(p => p.resultado / (p.precoEntrada * p.contratos));
  const mediaRetornos = retornos.length > 0 ? retornos.reduce((a, b) => a + b, 0) / retornos.length : 0;
  const desvioPadrao = retornos.length > 0 ? 
    Math.sqrt(retornos.map(r => Math.pow(r - mediaRetornos, 2)).reduce((a, b) => a + b, 0) / retornos.length) : 1;
  const indiceSharpe = desvioPadrao > 0 ? mediaRetornos / desvioPadrao : 0;
  
  // Drawdown máximo (simplificado)
  const drawdownMaximo = Math.abs(maiorPerda);
  
  // Volatilidade (simplificado)
  const volatilidade = desvioPadrao;
  
  return {
    resultadoAcumulado,
    contratosLiquidados,
    taxaAcerto,
    fatorLucro,
    resultadoPorContrato,
    spreadMedio,
    resultadoPorDia,
    tempoMedioInvestido,
    maiorGanho,
    maiorPerda,
    roi,
    indiceSharpe,
    drawdownMaximo,
    volatilidade
  };
}

/**
 * Exporta os dados da aplicação como JSON
 * @returns {string} - String JSON com todos os dados
 */
function exportarDados() {
  const dados = {
    precos,
    transacoes,
    posicoesAbertas,
    posicoesLiquidadas,
    dataExportacao: new Date().toISOString()
  };
  
  return JSON.stringify(dados, null, 2);
}

/**
 * Importa dados de uma string JSON
 * @param {string} jsonString - String JSON com dados a importar
 * @returns {Promise<boolean>} - Sucesso da importação
 */
async function importarDados(jsonString) {
  try {
    const dados = JSON.parse(jsonString);
    
    if (dados.precos && dados.transacoes) {
      precos = dados.precos;
      transacoes = dados.transacoes;
      
      // Recalcular posições a partir das transações
      calcularPosicoes();
      return await salvarDados();
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return false;
  }
}

/**
 * Verifica a conexão com a API
 * @returns {Promise<boolean>} - Status da conexão
 */
async function verificarConexaoAPI() {
  try {
    const response = await fetch(`${API_URL}/data`);
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar conexão com API:', error);
    return false;
  }
}

/**
 * Migra dados do localStorage para a API
 * @returns {Promise<boolean>} - Sucesso da migração
 */
async function migrarDadosLocalParaAPI() {
  try {
    const dadosLocalStorage = localStorage.getItem('boiGordoData');
    if (!dadosLocalStorage) {
      return false;
    }
    
    const dados = JSON.parse(dadosLocalStorage);
    
    precos = dados.precos || precos;
    transacoes = dados.transacoes || [];
    posicoesAbertas = dados.posicoesAbertas || [];
    posicoesLiquidadas = dados.posicoesLiquidadas || [];
    
    // Recalcular posições a partir das transações
    calcularPosicoes();
    return await salvarDados();
  } catch (error) {
    console.error('Erro ao migrar dados para API:', error);
    return false;
  }
}

// Inicialização
// Não chamar carregarDados() automaticamente, pois é assíncrono
// Deve ser chamado explicitamente no início da aplicação

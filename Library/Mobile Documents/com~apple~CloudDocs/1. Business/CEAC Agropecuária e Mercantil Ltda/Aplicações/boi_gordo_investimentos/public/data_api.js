// ACEX Capital Markets - API de Dados
// data_api.js

// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost:8787/api',
    useLocalStorage: true // Fallback para localStorage
};

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
  } catch (error) {
        console.warn(`Erro na API ${endpoint}:`, error);
        return null;
    }
}

// Verificar status da API
async function verificarStatusAPI() {
    const result = await makeRequest('/status');
    return result !== null;
}

// Obter dados da API ou localStorage
async function obterDados() {
    // Tentar API primeiro
    const apiData = await makeRequest('/data');
    
    if (apiData && !API_CONFIG.useLocalStorage) {
        return apiData;
    }
    
    // Fallback para localStorage
    try {
        const localData = localStorage.getItem('boiGordoInvestimentos');
        if (localData) {
            return JSON.parse(localData);
        }
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
    }
    
    // Dados padrão se nada for encontrado
    return {
        transacoes: [],
        posicoesAbertas: [],
        posicoesLiquidadas: [],
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
    };
}

// Salvar dados na API ou localStorage
async function salvarDados(dados) {
    // Tentar API primeiro
    if (!API_CONFIG.useLocalStorage) {
        const result = await makeRequest('/data', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        if (result) {
            return true;
        }
    }
    
    // Fallback para localStorage
    try {
        localStorage.setItem('boiGordoInvestimentos', JSON.stringify(dados));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

// Exportar dados para download
function exportarDados(dados) {
    return JSON.stringify(dados, null, 2);
}

// Importar dados de JSON
function importarDados(jsonString) {
    try {
        const dados = JSON.parse(jsonString);
        
        // Validar estrutura básica
        if (dados && typeof dados === 'object' && 
            Array.isArray(dados.transacoes) && 
            dados.precos && typeof dados.precos === 'object') {
            return dados;
        }
        
        throw new Error('Estrutura de dados inválida');
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        return null;
    }
}

// Utilitários para formatação
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarDataISO(data) {
    return new Date(data).toISOString().split('T')[0];
}

// Cálculos específicos do negócio
const ARROBA_VALOR = 330; // Valor em reais de cada arroba

function calcularValorTotal(contratos, preco) {
    return contratos * preco * ARROBA_VALOR;
}

function calcularResultadoOperacao(entrada, saida, contratos, tipo) {
    let spread = 0;
    
    if (tipo === 'Compra' || tipo === 'Long') {
        spread = saida - entrada;
    } else {
        spread = entrada - saida;
    }
    
    return spread * contratos * ARROBA_VALOR;
}

function calcularDiasOperacao(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return Math.floor((fim - inicio) / (1000 * 60 * 60 * 24));
}

// Validação de dados
function validarTransacao(transacao) {
    const erros = [];
    
    if (!transacao.data) erros.push('Data é obrigatória');
    if (!transacao.referencia) erros.push('Referência é obrigatória');
    if (!transacao.tipo || !['Compra', 'Venda'].includes(transacao.tipo)) {
        erros.push('Tipo deve ser "Compra" ou "Venda"');
    }
    if (!transacao.contratos || transacao.contratos <= 0) {
        erros.push('Contratos deve ser um número positivo');
    }
    if (!transacao.preco || transacao.preco <= 0) {
        erros.push('Preço deve ser um número positivo');
    }
    
    return {
        valida: erros.length === 0,
        erros: erros
    };
}

function validarPrecos(precos) {
    const referencias = ['BGIJ25', 'BGIK25', 'BGIM25', 'BGIN25', 'BGIQ25', 'BGIU25', 'BGIV25', 'BGIX25', 'BGIZ25'];
    const erros = [];
    
    referencias.forEach(ref => {
        if (!precos[ref] || precos[ref] <= 0) {
            erros.push(`Preço para ${ref} deve ser um número positivo`);
        }
    });
    
    return {
        valida: erros.length === 0,
        erros: erros
    };
}

// Análise de dados
function calcularMetricasGerais(posicoesLiquidadas) {
    if (!posicoesLiquidadas || posicoesLiquidadas.length === 0) {
        return {
            resultadoTotal: 0,
            taxaAcerto: 0,
            fatorLucro: 0,
            numeroOperacoes: 0,
            operacoesPositivas: 0,
            operacoesNegativas: 0,
            maiorGanho: 0,
            maiorPerda: 0,
            spreadMedio: 0,
            tempoMedioOperacao: 0
        };
    }
    
    const resultadoTotal = posicoesLiquidadas.reduce((sum, pos) => sum + (pos.resultado || 0), 0);
    const operacoesPositivas = posicoesLiquidadas.filter(pos => (pos.resultado || 0) > 0).length;
    const operacoesNegativas = posicoesLiquidadas.filter(pos => (pos.resultado || 0) <= 0).length;
    
  const taxaAcerto = posicoesLiquidadas.length > 0 ? (operacoesPositivas / posicoesLiquidadas.length) * 100 : 0;
  
    const totalLucros = posicoesLiquidadas
        .filter(pos => (pos.resultado || 0) > 0)
        .reduce((sum, pos) => sum + pos.resultado, 0);
    
    const totalPrejuizos = Math.abs(posicoesLiquidadas
        .filter(pos => (pos.resultado || 0) <= 0)
        .reduce((sum, pos) => sum + pos.resultado, 0));
    
    const fatorLucro = totalPrejuizos > 0 ? totalLucros / totalPrejuizos : 0;
    
    const resultados = posicoesLiquidadas.map(pos => pos.resultado || 0);
    const maiorGanho = Math.max(...resultados, 0);
    const maiorPerda = Math.min(...resultados, 0);
    
    const spreads = posicoesLiquidadas.map(pos => 
        Math.abs((pos.precoSaida || 0) - (pos.precoEntrada || 0))
    );
    const spreadMedio = spreads.length > 0 ? spreads.reduce((a, b) => a + b, 0) / spreads.length : 0;
    
    const dias = posicoesLiquidadas.map(pos => pos.dias || 0);
    const tempoMedioOperacao = dias.length > 0 ? dias.reduce((a, b) => a + b, 0) / dias.length : 0;
  
  return {
        resultadoTotal,
    taxaAcerto,
    fatorLucro,
        numeroOperacoes: posicoesLiquidadas.length,
        operacoesPositivas,
        operacoesNegativas,
    maiorGanho,
    maiorPerda,
        spreadMedio,
        tempoMedioOperacao
    };
}

// Funções de agrupamento e análise
function agruparPorReferencia(dados) {
    const grupos = {};
    
    dados.forEach(item => {
        const ref = item.referencia;
        if (!grupos[ref]) {
            grupos[ref] = [];
        }
        grupos[ref].push(item);
    });
    
    return grupos;
}

function agruparPorMes(dados) {
    const grupos = {};
    
    dados.forEach(item => {
        const data = new Date(item.data || item.dataLiquidacao);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        
        if (!grupos[chave]) {
            grupos[chave] = [];
        }
        grupos[chave].push(item);
    });
    
    return grupos;
}

// Sistema de notificações simples
let notificationCount = 0;

function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    const id = `notification-${++notificationCount}`;
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification notification-${tipo}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : tipo === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = mensagem;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após duração
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duracao);
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar para uso global
window.DataAPI = {
    // Funções principais
    verificarStatusAPI,
    obterDados,
    salvarDados,
    exportarDados,
    importarDados,
    
    // Utilitários
    formatarMoeda,
    formatarData,
    formatarDataISO,
    
    // Cálculos
    calcularValorTotal,
    calcularResultadoOperacao,
    calcularDiasOperacao,
    calcularMetricasGerais,
    
    // Validação
    validarTransacao,
    validarPrecos,
    
    // Análise
    agruparPorReferencia,
    agruparPorMes,
    
    // UI
    mostrarNotificacao,
    debounce,
    
    // Constantes
    ARROBA_VALOR
};

// Verificar conectividade na inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[DataAPI] Inicializando...');
    const apiOnline = await verificarStatusAPI();
    console.log(`[DataAPI] Status: ${apiOnline ? 'Online' : 'Offline'} - Usando ${API_CONFIG.useLocalStorage ? 'localStorage' : 'API'}`);
    
    // Notificar que DataAPI está pronto
    document.dispatchEvent(new CustomEvent('dataApiReady'));
});

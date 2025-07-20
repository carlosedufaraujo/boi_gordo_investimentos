/**
 * Aplicação Principal - Sistema +/-
 * Verde (+): Compra/Long | Vermelho (-): Venda/Short  
 * Versão: 4.0 - Nova Lógica Matemática
 */

// Estado global da aplicação
window.AppState = {
    currentTab: 'resumo',
    data: {
        transacoes: [],
        posicoes: [],
        precos: {}
    },
    tipoOperacao: 'compra' // 'compra' ou 'venda'
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BGI Investimentos v4.0 - Sistema +/-');
    
    // Inicializar componentes
    initTheme();
    initEventListeners();
    initOperationButtons();
    loadData();
    
    // Navegar para aba inicial
    navigateToTab('resumo');
});

/**
 * Event Listeners principais
 */
function initEventListeners() {
    // Navegação entre abas (sidebar)
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            navigateToTab(tab);
        });
    });

    // Formulário de nova transação
    const formTransacao = document.getElementById('form-nova-transacao');
    if (formTransacao) {
        formTransacao.addEventListener('submit', handleNovaTransacao);
    }

    // Input de quantidade - atualizar preview
    const inputQuantidade = document.getElementById('transacao-contratos');
    if (inputQuantidade) {
        inputQuantidade.addEventListener('input', atualizarPreviewQuantidade);
    }

    // Escutar atualizações do storage
    window.addEventListener('storageUpdate', loadData);
    
    // Popular select de referências
    popularReferencias();
}

/**
 * Popular select de referências
 */
function popularReferencias() {
    const select = document.getElementById('transacao-referencia');
    if (!select) return;
    
    const referencias = [
        'BGIK25', 'BGIM25', 'BGIQ25', 'BGIN25', 'BGIX25', 'BGIZ25',
        'CCMH25', 'CCMK25', 'CCMN25', 'CCMU25', 'CCMX25', 'CCMZ25'
    ];
    
    // Limpar select
    select.innerHTML = '<option value="">Selecionar referência...</option>';
    
    // Adicionar opções
    referencias.forEach(ref => {
        const option = document.createElement('option');
        option.value = ref;
        option.textContent = ref;
        select.appendChild(option);
  });
}

/**
 * Inicializar botões de operação (Compra/Venda)
 */
function initOperationButtons() {
    const btnCompra = document.getElementById('btn-compra');
    const btnVenda = document.getElementById('btn-venda');
    const hiddenInput = document.getElementById('transacao-tipo');

    if (btnCompra && btnVenda && hiddenInput) {
        btnCompra.addEventListener('click', () => {
            // Ativar compra
            btnCompra.classList.add('active');
            btnVenda.classList.remove('active');
            hiddenInput.value = 'compra';
            window.AppState.tipoOperacao = 'compra';
            atualizarPreviewQuantidade();
        });

        btnVenda.addEventListener('click', () => {
            // Ativar venda
            btnVenda.classList.add('active');
            btnCompra.classList.remove('active');
            hiddenInput.value = 'venda';
            window.AppState.tipoOperacao = 'venda';
            atualizarPreviewQuantidade();
        });
    }
}

/**
 * Atualizar preview da quantidade com sinal +/-
 */
function atualizarPreviewQuantidade() {
    const inputQuantidade = document.getElementById('transacao-contratos');
    const previewQuantidade = document.getElementById('preview-quantidade');
    
    if (!inputQuantidade || !previewQuantidade) return;
    
    const quantidade = parseInt(inputQuantidade.value) || 0;
    const isCompra = window.AppState.tipoOperacao === 'compra';
    
    if (isCompra) {
        previewQuantidade.textContent = `+${quantidade}`;
        previewQuantidade.className = 'positivo';
    } else {
        previewQuantidade.textContent = `-${quantidade}`;
        previewQuantidade.className = 'negativo';
    }
}

/**
 * Processar nova transação
 */
function handleNovaTransacao(e) {
    e.preventDefault();
    
    try {
        // Coletar dados do formulário
        const data = document.getElementById('transacao-data').value;
        const referencia = document.getElementById('transacao-referencia').value;
        const quantidade = parseInt(document.getElementById('transacao-contratos').value);
        const preco = parseFloat(document.getElementById('transacao-preco').value);
        const tipo = document.getElementById('transacao-tipo').value;
        
        // Validações básicas
        if (!data || !referencia || !quantidade || !preco) {
            throw new Error('Todos os campos são obrigatórios');
        }
        
        // Criar transação com lógica +/-
        const transacao = {
            data: data,
            referencia: referencia,
            quantidade: tipo === 'compra' ? quantidade : -quantidade, // Aplicar sinal
            preco: preco,
            timestamp: Date.now()
        };
        
        // Adicionar via StorageManager
        window.StorageManager.adicionarTransacao(transacao);
        
        // Limpar formulário
        e.target.reset();
        atualizarPreviewQuantidade();
        
        // Mostrar sucesso
        mostrarNotificacao(`Transação adicionada: ${transacao.quantidade > 0 ? '+' : ''}${transacao.quantidade} ${referencia}`, 'success');
        
        // Recarregar dados
        loadData();
        
        } catch (error) {
        console.error('Erro ao adicionar transação:', error);
        mostrarNotificacao(error.message, 'error');
    }
}

/**
 * Carregar dados do storage e atualizar interface
 */
function loadData() {
    try {
        // Obter dados
        const transacoes = window.StorageManager.getTransacoes();
        const posicoes = window.StorageManager.calcularPosicoes();
        const precos = window.StorageManager.getData().precos;
        
        // Atualizar estado
        window.AppState.data = {
            transacoes: transacoes,
            posicoes: posicoes,
            precos: precos
        };
        
        // Atualizar interface
        atualizarResumo();
        atualizarTabelaTransacoes();
        atualizarTabelaPosicoes();
        
        // Atualizar gráficos se disponível
        if (window.ChartsManager) {
            // Aguardar um pouco para garantir que os dados estejam atualizados
            setTimeout(() => {
                window.ChartsManager.atualizarDados && window.ChartsManager.atualizarDados(posicoes);
            }, 100);
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarNotificacao('Erro ao carregar dados', 'error');
    }
}

/**
 * Atualizar resumo principal
 */
function atualizarResumo() {
    const posicoes = window.AppState.data.posicoes;
    const transacoes = window.AppState.data.transacoes;
    
    // Calcular métricas
    let patrimonio = 0;
    let pnlNaoRealizado = 0;
    let totalLong = 0;
    let totalShort = 0;
    let contratosAtivos = 0;
    
    posicoes.forEach(posicao => {
        const precoAtual = window.AppState.data.precos[posicao.referencia] || 0;
        const valorArroba = window.StorageManager.getValorArroba(posicao.referencia);
        
        // Patrimônio (valor das posições)
        const valorPosicao = Math.abs(posicao.quantidadeNet) * precoAtual * valorArroba;
        patrimonio += valorPosicao;
        
        // P&L não realizado
        const pnlPosicao = (precoAtual - posicao.precoMedio) * posicao.quantidadeNet * valorArroba;
        pnlNaoRealizado += pnlPosicao;
        
        // Contar Long/Short
        if (posicao.quantidadeNet > 0) {
            totalLong += posicao.quantidadeNet;
        } else {
            totalShort += Math.abs(posicao.quantidadeNet);
        }
        
        contratosAtivos += Math.abs(posicao.quantidadeNet);
    });
    
    // Atualizar DOM
    atualizarElemento('contratos-aberto', contratosAtivos.toString());
    atualizarElemento('total-long', totalLong.toString());
    atualizarElemento('total-short', totalShort.toString());
    
    // Atualizar posições por referência
    atualizarPosicoesPorReferencia(posicoes);
    
    // P&L do dia e aberto
    atualizarElementoMonetario('pnl-dia', 0); // Será calculado quando houver dados
    atualizarElementoMonetario('pnl-aberto', pnlNaoRealizado);
    
    // Margem utilizada
    const margemUtilizada = patrimonio * 0.15;
    atualizarElementoMonetario('margem-utilizada', margemUtilizada);
    
    // Última atualização
    atualizarElemento('ultima-atualizacao', new Date().toLocaleString('pt-BR'));
    
    // Atualizar últimas movimentações
    atualizarUltimasMovimentacoes();
}

/**
 * Atualizar tabela de transações
 */
function atualizarTabelaTransacoes() {
    const tabela = document.getElementById('transacoes-tabela');
    if (!tabela) return;
    
    const transacoes = window.AppState.data.transacoes;
    
    if (transacoes.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma transação registrada</td></tr>';
          return;
        }
        
    const html = transacoes
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .map(transacao => {
            const isPositiva = transacao.quantidade > 0;
            const tipoLabel = isPositiva ? 'Long' : 'Short';
            const badgeClass = isPositiva ? 'badge-success' : 'badge-danger';
            const quantidadeFormatada = isPositiva ? `+${transacao.quantidade}` : transacao.quantidade.toString();
            
            return `
                <tr>
                    <td>${formatarData(transacao.data)}</td>
                    <td><span class="badge badge-info">${transacao.referencia}</span></td>
                    <td><span class="badge ${badgeClass}">${tipoLabel}</span></td>
                    <td class="text-center ${isPositiva ? 'text-success' : 'text-danger'}">
                        ${quantidadeFormatada}
                    </td>
                    <td class="text-right">${formatarMoeda(transacao.preco)}</td>
                    <td class="text-right">
                        ${formatarMoeda(Math.abs(transacao.quantidade * transacao.preco * window.StorageManager.getValorArroba(transacao.referencia)))}
                    </td>
                </tr>
            `;
        }).join('');
    
    tabela.innerHTML = html;
}

/**
 * Atualizar tabela de posições
 */
function atualizarTabelaPosicoes() {
    const tabela = document.getElementById('posicoes-tabela');
    if (!tabela) return;
    
    const posicoes = window.AppState.data.posicoes;
    
    if (posicoes.length === 0) {
        tabela.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma posição aberta</td></tr>';
        return;
    }
    
    const html = posicoes.map(posicao => {
        const precoAtual = window.AppState.data.precos[posicao.referencia] || 0;
        const valorArroba = window.StorageManager.getValorArroba(posicao.referencia);
        const pnlPosicao = (precoAtual - posicao.precoMedio) * posicao.quantidadeNet * valorArroba;
        
        const isLong = posicao.quantidadeNet > 0;
        const badgeClass = isLong ? 'badge-success' : 'badge-danger';
        const quantidadeFormatada = isLong ? `+${posicao.quantidadeNet}` : posicao.quantidadeNet.toString();
        
        return `
            <tr>
                <td><span class="badge badge-info">${posicao.referencia}</span></td>
                <td><span class="badge ${badgeClass}">${posicao.tipo}</span></td>
                <td class="text-center ${isLong ? 'text-success' : 'text-danger'}">
                    ${quantidadeFormatada}
                </td>
                <td class="text-right">${formatarMoeda(posicao.precoMedio)}</td>
                <td class="text-right">${formatarMoeda(precoAtual)}</td>
                <td class="text-right ${pnlPosicao >= 0 ? 'text-success' : 'text-danger'}">
                    ${formatarMoeda(pnlPosicao)}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarPosicao('${posicao.referencia}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tabela.innerHTML = html;
}

/**
 * Atualizar posições por referência no resumo
 */
function atualizarPosicoesPorReferencia(posicoes) {
    const container = document.getElementById('posicoes-por-referencia-container');
    if (!container) return;
    
    if (posicoes.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-chart-pie fa-2x mb-2"></i><br>
                <small>Nenhuma posição aberta</small><br>
                <small>Adicione transações para ver o resumo</small>
            </div>
        `;
        return;
      }

    // Agrupar por tipo de referência
    const posicoesAgrupadas = {};
    posicoes.forEach(posicao => {
        const prefixo = posicao.referencia.substring(0, 3);
        const nomePrefixo = prefixo === 'BGI' ? 'BGI - Boi Gordo' : 'CCM - Milho';
        
        if (!posicoesAgrupadas[prefixo]) {
            posicoesAgrupadas[prefixo] = {
                nome: nomePrefixo,
                totalContratos: 0,
                totalLong: 0,
                totalShort: 0
            };
        }
        
        const quantidade = Math.abs(posicao.quantidadeNet);
        posicoesAgrupadas[prefixo].totalContratos += quantidade;
        
        if (posicao.quantidadeNet > 0) {
            posicoesAgrupadas[prefixo].totalLong += quantidade;
              } else {
            posicoesAgrupadas[prefixo].totalShort += quantidade;
        }
    });
    
    // Gerar HTML
    const html = Object.values(posicoesAgrupadas).map(grupo => `
        <div class="detalhe-item">
            <span class="detalhe-label">${grupo.nome}:</span>
            <div class="valor-unidade">
                <div class="valor-com-prefixo">
                    <span class="detalhe-valor">${grupo.totalContratos}</span>
                    <span class="valor-prefixo verde">x</span>
              </div>
                <span class="posicoes-info">
                    <span>${grupo.totalLong}</span> Long | 
                    <span>${grupo.totalShort}</span> Short
                </span>
                </div>
                </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Atualizar tabela de últimas movimentações
 */
function atualizarUltimasMovimentacoes() {
    const tabela = document.getElementById('ultimas-movimentacoes-tabela');
    if (!tabela) return;
    
    const transacoes = window.AppState.data.transacoes;
    
    if (transacoes.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-inbox fa-2x mb-3"></i><br>
                    Nenhuma movimentação registrada<br>
                    <small>As transações aparecerão aqui automaticamente</small>
                </td>
            </tr>
        `;
        return;
    }
    
    // Pegar as últimas 5 transações
    const ultimasTransacoes = transacoes
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);
    
    const html = ultimasTransacoes.map(transacao => {
        const isPositiva = transacao.quantidade > 0;
        const tipoLabel = isPositiva ? 'Long' : 'Short';
        const badgeClass = isPositiva ? 'badge-success' : 'badge-danger';
        const valorTotal = Math.abs(transacao.quantidade * transacao.preco * window.StorageManager.getValorArroba(transacao.referencia));
        
        return `
            <tr>
                <td><strong>${transacao.referencia}</strong></td>
                <td>
                    <span class="badge ${badgeClass}">${isPositiva ? 'Compra' : 'Venda'}</span><br>
                    <small class="text-muted">${tipoLabel}</small>
                </td>
                <td>${formatarData(transacao.data)}</td>
                <td class="text-center ${isPositiva ? 'text-success' : 'text-danger'}">
                    ${isPositiva ? '+' : ''}${Math.abs(transacao.quantidade)}
                </td>
                <td class="text-right">${formatarMoeda(transacao.preco)}</td>
                <td class="text-right">${formatarMoeda(valorTotal)}</td>
                <td class="text-center"><span class="badge badge-success">Executada</span></td>
            </tr>
        `;
    }).join('');
    
    tabela.innerHTML = html;
}

// ===== FUNÇÕES AUXILIARES =====

function navigateToTab(tabName) {
    // Atualizar estado
    window.AppState.currentTab = tabName;
    
    // Remover active de todos os itens da sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativar item da sidebar selecionado
    const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`tab-${tabName}`);
    
    if (activeLink) {
        activeLink.closest('.sidebar-item').classList.add('active');
    }
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    console.log(`📍 Navegando para: ${tabName}`);
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

function atualizarElementoMonetario(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = formatarMoeda(valor);
        
        // Aplicar cor baseada no valor
        elemento.className = elemento.className.replace(/text-(success|danger|muted)/, '');
        if (valor > 0) {
            elemento.classList.add('text-success');
        } else if (valor < 0) {
            elemento.classList.add('text-danger');
        } else {
            elemento.classList.add('text-muted');
        }
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Implementação simples de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.textContent = mensagem;
    
    // Estilos inline para simplicidade
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Cores por tipo (usando as novas cores do sistema)
    const colors = {
        success: '#11b981',  // Verde - compra/positivo
        error: '#ef4544',    // Vermelho - venda/negativo  
        info: '#3b82f6'      // Azul - informações
    };
    
    notification.style.backgroundColor = colors[tipo] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Tornar funções globais para compatibilidade
window.navigateToTab = navigateToTab;
window.editarPosicao = function(referencia) {
    console.log(`Editando posição: ${referencia}`);
    mostrarNotificacao('Função de edição em desenvolvimento', 'info');
};

// ===== FUNÇÕES DE MODAL =====

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        console.log(`📋 Modal aberto: ${modalId}`);
        
        // Se for a modal de nova transação, definir data atual
        if (modalId === 'modal-nova-transacao') {
            const dataInput = document.getElementById('transacao-data');
            if (dataInput) {
                dataInput.value = new Date().toISOString().split('T')[0];
            }
            
            // Atualizar preview inicial
            setTimeout(atualizarPreviewQuantidade, 100);
        }
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        console.log(`❌ Modal fechado: ${modalId}`);
        
        // Limpar formulário se for nova transação
        if (modalId === 'modal-nova-transacao') {
            const form = document.getElementById('form-nova-transacao');
            if (form) form.reset();
            
            // Resetar botões
            const btnCompra = document.getElementById('btn-compra');
            const btnVenda = document.getElementById('btn-venda');
            if (btnCompra && btnVenda) {
                btnCompra.classList.add('active');
                btnVenda.classList.remove('active');
                window.AppState.tipoOperacao = 'compra';
                atualizarPreviewQuantidade();
            }
        }
    }
}

// ===== FUNÇÕES AUXILIARES GLOBAIS =====

function exportarDados() {
    if (window.StorageManager) {
        window.StorageManager.exportData();
        mostrarNotificacao('Backup exportado com sucesso!', 'success');
    }
}

// ===== SISTEMA DE TEMAS =====

function initTheme() {
    // Verificar preferência salva ou usar modo escuro como padrão
    const savedTheme = localStorage.getItem('bgi-theme') || 'dark';
    aplicarTema(savedTheme);
}

function alternarTema() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    aplicarTema(newTheme);
    localStorage.setItem('bgi-theme', newTheme);
    
    // Mostrar notificação
    const temaTexto = newTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro';
    mostrarNotificacao(`${temaTexto} ativado!`, 'info');
    
    console.log(`🎨 Tema alterado para: ${newTheme}`);
}

function aplicarTema(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Atualizar botão
    const themeToggle = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    const themeIcon = themeToggle?.querySelector('i');
    
    if (theme === 'light') {
        themeIcon?.classList.remove('fa-sun');
        themeIcon?.classList.add('fa-moon');
        if (themeText) themeText.textContent = 'Escuro';
  } else {
        themeIcon?.classList.remove('fa-moon');
        themeIcon?.classList.add('fa-sun');
        if (themeText) themeText.textContent = 'Claro';
    }
    
    // Atualizar gráficos se necessário
    if (window.ChartsManager) {
        setTimeout(() => {
            // Recriar gráficos com nova paleta de cores
            window.ChartsManager.atualizarTema && window.ChartsManager.atualizarTema(theme);
        }, 100);
    }
}

// Tornar funções globais
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.exportarDados = exportarDados;
window.alternarTema = alternarTema;

console.log('✅ App.js v4.0 carregado - Sistema +/-');
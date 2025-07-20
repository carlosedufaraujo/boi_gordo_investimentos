/**
 * Sistema de Gráficos - ACEX Capital Markets
 * Versão: 3.0 - Design Profissional
 */

// Configuração global do Chart.js para usar fonte Inter
if (typeof Chart !== 'undefined') {
    Chart.defaults.font = {
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        size: 12,
        style: 'normal',
        weight: '400'
    };
}

class ChartsManager {
    constructor() {
        this.charts = {};
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                                 x: {
                     display: true,
                     grid: {
                         color: '#E1DFDA'    /* Grid baseado no off-white */
                     }
                 },
                 y: {
                     display: true,
                     grid: {
                         color: '#E1DFDA'    /* Grid baseado no off-white */
                     }
                 }
            }
        };
        
        this.colors = {
            primary: '#AFD947',      /* Verde principal - referência */
            secondary: '#9DCF3A',    /* Verde secundário */
            success: '#AFD947',      /* Verde sucesso */
            danger: '#E85A4F',       /* Vermelho harmonioso */
            warning: '#F4A261',      /* Laranja harmonioso */
            info: '#4A90B8',         /* Azul harmonioso */
            light: '#EEECE8',        /* Off-white - referência */
            dark: '#5A5751'          /* Escuro harmonioso */
        };
        
        console.log('📈 ChartsManager inicializado');
    }
    
    /**
     * Inicializar todos os gráficos
     */
    init() {
        this.initEvolutionChart();
        this.initRentabilityChart();
        this.initDistributionChart();
        this.initTreemap();
        // Novos gráficos do resumo
        this.initAnalisePosicoesChart();
        this.initAtivosReferenciaChart();
        this.initPrecoMedioChart();
        this.initPrecosSentidoChart();
    }
    
    /**
     * Gráfico de Evolução do Patrimônio
     */
    initEvolutionChart() {
        const canvas = document.getElementById('chart-evolucao-patrimonio');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.evolution = new Chart(ctx, {
            type: 'line',
    data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
                    label: 'Patrimônio (R$)',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
      }]
    },
    options: {
                ...this.defaultOptions,
      plugins: {
                    ...this.defaultOptions.plugins,
                    title: {
          display: false
        }
      },
      scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        beginAtZero: true,
          ticks: {
            callback: function(value) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(value);
            }
          }
        }
      }
    }
        });
    }
    
    /**
     * Gráfico de Rentabilidade
     */
    initRentabilityChart() {
        const canvas = document.getElementById('chart-rentabilidade');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.rentability = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Rentabilidade (%)',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Gráfico de Distribuição por Referências
     */
    initDistributionChart() {
        const canvas = document.getElementById('chart-distribuicao-referencias');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
    data: {
                labels: ['Sem dados'],
      datasets: [{
                    data: [1],
                    backgroundColor: [this.colors.light],
                    borderWidth: 2,
                    borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    /**
     * Atualizar gráfico de evolução
     */
    updateEvolutionChart() {
        if (!this.charts.evolution) return;
        
        // Obter dados reais do AppState
        const transacoes = window.AppState?.data?.transacoes || [];
        
        if (transacoes.length === 0) {
            this.charts.evolution.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
            this.charts.evolution.update();
            return;
        }
        
        // Calcular evolução mensal
        const dadosMensais = this.calcularEvolutionMensal(transacoes);
        
        this.charts.evolution.data.labels = dadosMensais.labels;
        this.charts.evolution.data.datasets[0].data = dadosMensais.valores;
        this.charts.evolution.update();
    }
    
    /**
     * Atualizar gráfico de rentabilidade
     */
    updateRentabilityChart() {
        if (!this.charts.rentability) return;
        
        const posicoesLiquidadas = window.AppState?.data?.posicoesLiquidadas || [];
        
        if (posicoesLiquidadas.length === 0) {
            this.charts.rentability.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
            this.charts.rentability.update();
            return;
        }
        
        // Calcular rentabilidade acumulada
        const dadosRentabilidade = this.calcularRentabilidadeMensal(posicoesLiquidadas);
        
        this.charts.rentability.data.labels = dadosRentabilidade.labels;
        this.charts.rentability.data.datasets[0].data = dadosRentabilidade.rentabilidade;
        this.charts.rentability.update();
    }
    
    /**
     * Atualizar gráfico de distribuição
     */
    updateDistributionChart() {
        if (!this.charts.distribution) return;
        
        const posicoesAbertas = window.AppState?.data?.posicoesAbertas || [];
        
        if (posicoesAbertas.length === 0) {
            this.charts.distribution.data.labels = ['Sem dados'];
            this.charts.distribution.data.datasets[0].data = [1];
            this.charts.distribution.data.datasets[0].backgroundColor = [this.colors.light];
            this.charts.distribution.update();
    return;
  }

        // Calcular distribuição por referência
        const distribuicao = this.calcularDistribuicaoPorReferencia(posicoesAbertas);
        
        this.charts.distribution.data.labels = distribuicao.labels;
        this.charts.distribution.data.datasets[0].data = distribuicao.valores;
        this.charts.distribution.data.datasets[0].backgroundColor = this.generateColors(distribuicao.labels.length);
        this.charts.distribution.update();
    }
    
    /**
     * Calcular evolução mensal do patrimônio
     */
    calcularEvolutionMensal(transacoes) {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth();
        
        const labels = [];
        const valores = [];
        
        // Últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const mes = (mesAtual - i + 12) % 12;
            labels.push(meses[mes]);
            
            // Calcular valor acumulado até esse mês
            const valorMes = this.calcularPatrimonioAteData(transacoes, anoAtual, mes);
            valores.push(valorMes);
        }
        
        return { labels, valores };
    }
    
    /**
     * Calcular rentabilidade mensal
     */
    calcularRentabilidadeMensal(posicoesLiquidadas) {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth();
        
        const labels = [];
        const rentabilidade = [];
        let rentabilidadeAcumulada = 0;
        
        // Últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const mes = (mesAtual - i + 12) % 12;
            labels.push(meses[mes]);
            
            // Calcular rentabilidade do mês
            const rentabilidadeMes = this.calcularRentabilidadeMes(posicoesLiquidadas, anoAtual, mes);
            rentabilidadeAcumulada += rentabilidadeMes;
            rentabilidade.push(rentabilidadeAcumulada);
        }
        
        return { labels, rentabilidade };
    }
    
    /**
     * Calcular distribuição por referência
     */
    calcularDistribuicaoPorReferencia(posicoesAbertas) {
        const distribuicao = {};
        
        posicoesAbertas.forEach(posicao => {
            const precoAtual = window.AppState?.data?.precos?.[posicao.referencia] || 0;
            const valorPosicao = posicao.contratos * precoAtual * (window.getValorArroba ? window.getValorArroba(posicao.referencia) : 330);
            
            if (distribuicao[posicao.referencia]) {
                distribuicao[posicao.referencia] += Math.abs(valorPosicao);
            } else {
                distribuicao[posicao.referencia] = Math.abs(valorPosicao);
            }
        });
        
        const labels = Object.keys(distribuicao);
        const valores = Object.values(distribuicao);
        
        return { labels, valores };
    }
    
    /**
     * Métodos auxiliares
     */
    calcularPatrimonioAteData(transacoes, ano, mes) {
        // Implementação simplificada
        return Math.random() * 100000; // Placeholder
    }
    
    calcularRentabilidadeMes(posicoesLiquidadas, ano, mes) {
        // Implementação simplificada
        return (Math.random() - 0.5) * 10; // Placeholder
    }
    
    generateColors(count) {
        const baseColors = [
            this.colors.primary,     // #AFD947 - Verde principal
            this.colors.secondary,   // #9DCF3A - Verde secundário
            this.colors.info,        // #4A90B8 - Azul harmonioso
            this.colors.warning,     // #F4A261 - Laranja harmonioso
            this.colors.danger,      // #E85A4F - Vermelho harmonioso
            '#8FB635',              // Verde escuro
            '#C4E66A',              // Verde claro
            '#7BA928',              // Verde de destaque
        ];
        
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        
        return colors;
    }
    
    /**
     * Destruir todos os gráficos
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
    
    /**
     * Redimensionar gráficos
     */
    resize() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }
    
    /**
     * Inicializar Treemap de Alocação
     */
    initTreemap() {
        const container = document.getElementById('treemap-container');
        if (!container) {
            console.warn('Container treemap não encontrado');
    return;
  }

        console.log('🌳 Inicializando treemap');
        this.updateTreemap();
    }
    
    /**
     * Atualizar Treemap
     */
    updateTreemap() {
        const container = document.getElementById('treemap-container');
        if (!container) return;
        
        const posicoesAbertas = window.AppState?.data?.posicoesAbertas || [];
        
        // Limpar container
        container.innerHTML = '';
        
        if (posicoesAbertas.length === 0) {
            container.innerHTML = `
                <div class="treemap-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #7A7772;">
                    <i class="fas fa-chart-area" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Nenhuma posição aberta para exibir</p>
                </div>
            `;
    return;
  }

        // Calcular dados para o treemap
        const treemapData = this.prepararDadosTreemap(posicoesAbertas);
        
        // Criar treemap usando layout CSS simples
        this.criarTreemapHTML(container, treemapData);
    }
    
    /**
     * Preparar dados para o treemap
     */
    prepararDadosTreemap(posicoesAbertas) {
        const dados = posicoesAbertas.map(posicao => {
            const precoAtual = window.AppState?.data?.precos?.[posicao.referencia] || 0;
            const valorArroba = window.getValorArroba ? window.getValorArroba(posicao.referencia) : 330;
            const valorPosicao = Math.abs(posicao.contratos * precoAtual * valorArroba);
            const resultado = (precoAtual - posicao.precoMedio) * posicao.contratos * valorArroba;
            const percentual = valorPosicao > 0 ? (resultado / valorPosicao * 100) : 0;
            
            return {
                name: posicao.referencia,
                value: valorPosicao,
                contracts: posicao.contratos,
                type: posicao.tipo,
                currentPrice: precoAtual,
                avgPrice: posicao.precoMedio,
                result: resultado,
                percentage: percentual,
                status: resultado > 0 ? 'positive' : resultado < 0 ? 'negative' : 'neutral'
            };
        });
        
        // Ordenar por valor (maior primeiro)
        return dados.sort((a, b) => b.value - a.value);
    }
    
    /**
     * Criar treemap com layout HTML/CSS
     */
    criarTreemapHTML(container, dados) {
        const totalValue = dados.reduce((sum, d) => sum + d.value, 0);
        
        // Usar layout flexível que simula treemap
        const totalItems = dados.length;
        const itemsPerRow = Math.ceil(Math.sqrt(totalItems));
        
        dados.forEach((item, index) => {
            const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 100 / totalItems;
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            // Calcular tamanho proporcional
            const baseSize = Math.sqrt(percentage) * 10;
            const width = Math.max(15, Math.min(45, baseSize));
            const height = Math.max(12, Math.min(35, baseSize * 0.8));
            
            const div = document.createElement('div');
            div.className = `treemap-item ${item.status}`;
            
            // Posicionamento baseado em grid flexível
            const leftOffset = (col * 33.33) + (col * 2);
            const topOffset = (row * 25) + (row * 2);
            
            div.style.width = `${width}%`;
            div.style.height = `${height}%`;
            div.style.left = `${leftOffset}%`;
            div.style.top = `${topOffset}%`;
            div.style.animationDelay = `${index * 0.1}s`;
            
            div.innerHTML = `
                <div class="treemap-label">${item.name}</div>
                <div class="treemap-value">${this.formatCurrency(item.value)}</div>
                <div class="treemap-contracts">${item.contracts} contratos</div>
            `;
            
            // Adicionar tooltip
            div.title = `${item.name}: ${this.formatCurrency(item.value)} (${item.contracts} contratos)
Preço Médio: R$ ${item.avgPrice.toFixed(2)}
Preço Atual: R$ ${item.currentPrice.toFixed(2)}
Resultado: ${this.formatCurrency(item.result)} (${item.percentage.toFixed(2)}%)
Tipo: ${item.type}`;
            
            container.appendChild(div);
        });
    }
    
    /**
     * Gráfico de Análise de Posições por Sentido
     */
    initAnalisePosicoesChart() {
        const canvas = document.getElementById('chart-analise-posicoes');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Dados iniciais - modo volume
        const dadosVolume = {
            labels: ['BGI Long', 'BGI Short', 'CCM Long', 'CCM Short'],
            datasets: [{
                label: 'Volume de Contratos',
                data: [18, 10, 12, 5],
                backgroundColor: [
                    this.colors.success + '80',
                    this.colors.danger + '80',
                    this.colors.success + '60',
                    this.colors.danger + '60'
                ],
                borderColor: [
                    this.colors.success,
                    this.colors.danger,
                    this.colors.success,
                    this.colors.danger
                ],
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        };
        
        this.charts.analiseposicoes = new Chart(ctx, {
    type: 'bar',
            data: dadosVolume,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed.y;
                                if (label.includes('Long') || label.includes('Short')) {
                                    return `${label}: ${value} contratos`;
                                } else {
                                    return `${label}: R$ ${value.toFixed(2)}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                weight: 'bold'
                            },
                            maxRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.colors.light,
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return Math.round(value);
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
        
        console.log('📊 Gráfico de Análise de Posições inicializado');
    }

    /**
     * Gráfico de Quantidade de Ativos por Referência
     */
    initAtivosReferenciaChart() {
        const canvas = document.getElementById('chart-ativos-referencia');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.ativosReferencia = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['BGI - Boi Gordo (18 Long | 10 Short)', 'CCM - Milho (12 Long | 5 Short)'],
                datasets: [{
                    label: 'Posições por Referência',
                    data: [28, 17],
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.warning
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 10
                }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            }
                        }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `x${value} contratos (${percentage}%) - ${label}`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        console.log('📊 Gráfico de Ativos por Referência inicializado');
    }

    /**
     * Gráfico de Preço Médio por Ativo
     */
    initPrecoMedioChart() {
        const canvas = document.getElementById('chart-preco-medio');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.precoMedio = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'BGIV25 Long', 'BGIX25 Short', 'BGIN25 Short',
                    'CCMH25 Long', 'CCMK25 Long', 'CCMN25 Short'
                ],
                datasets: [{
                    label: 'Preço Médio por Arroba/Saco',
                    data: [287.45, 285.30, 289.45, 67.23, 66.92, 68.15],
                    backgroundColor: [
                        this.colors.success + '70',  // BGI Long
                        this.colors.danger + '70',   // BGI Short
                        this.colors.danger + '70',   // BGI Short
                        this.colors.success + '60',  // CCM Long
                        this.colors.success + '60',  // CCM Long
                        this.colors.danger + '60'    // CCM Short
                    ],
                    borderColor: [
                        this.colors.success,
                        this.colors.danger,
                        this.colors.danger,
                        this.colors.success,
                        this.colors.success,
                        this.colors.danger
                    ],
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed.y;
                                const unidade = label.includes('BGI') ? '/arroba' : '/saco';
                                const sentido = label.includes('Long') ? 'Compra (aposta na alta)' : 'Venda (aposta na queda)';
                                return [
                                    `${label}: R$ ${value.toFixed(2)}${unidade}`,
                                    `Sentido: ${sentido}`
                                ];
                            }
                        }
        }
      },
      scales: {
        x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        }
        },
        y: {
          beginAtZero: true,
                        grid: {
                            color: this.colors.light,
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
        
        console.log('📊 Gráfico de Preço Médio inicializado');
    }

    /**
     * Gráfico de Preços Médios por Sentido (no card principal)
     */
    initPrecosSentidoChart() {
        const canvas = document.getElementById('chart-precos-sentido');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.precosSentido = new Chart(ctx, {
            type: 'bar',
    data: {
                labels: ['BGI Long', 'BGI Short', 'CCM Long', 'CCM Short'],
      datasets: [{
                    label: 'Preço Médio (R$)',
                    data: [287.45, 285.30, 67.23, 68.15],
                    backgroundColor: [
                        this.colors.success + '80',
                        this.colors.danger + '80', 
                        this.colors.success + '60',
                        this.colors.danger + '60'
                    ],
                    borderColor: [
                        this.colors.success,
                        this.colors.danger,
                        this.colors.success,
                        this.colors.danger
                    ],
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
                        display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
                                const label = context.label;
                                const value = context.parsed.y;
                                const contratos = label.includes('BGI Long') ? '18' : 
                                                label.includes('BGI Short') ? '10' :
                                                label.includes('CCM Long') ? '12' : '5';
                                const unidade = label.includes('BGI') ? '/arroba' : '/saco';
                                
                                return [
                                    `${label}: R$ ${value.toFixed(2)}${unidade}`,
                                    `Contratos: ${contratos}`,
                                    `Total: R$ ${(value * parseFloat(contratos) * (label.includes('BGI') ? 330 : 450)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
                                ];
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value, context) {
                            const label = context.chart.data.labels[context.dataIndex];
                            const contratos = label.includes('BGI Long') ? '18' : 
                                            label.includes('BGI Short') ? '10' :
                                            label.includes('CCM Long') ? '12' : '5';
                            return contratos;
                        },
                        color: function(context) {
                            return context.chart.data.datasets[0].borderColor[context.dataIndex];
                        },
                        font: {
                            weight: 'bold',
                            size: 11
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            maxRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.colors.light,
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            },
                            font: {
                                size: 9
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'contractLabels',
                afterDatasetsDraw(chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const label = chart.data.labels[index];
                            const contratos = label.includes('BGI Long') ? '18' : 
                                            label.includes('BGI Short') ? '10' :
                                            label.includes('CCM Long') ? '12' : '5';
                            
                            ctx.fillStyle = dataset.borderColor[index];
                            ctx.font = 'bold 11px ' + chart.options.font?.family || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                            ctx.textAlign = 'center';
                            ctx.fillText(contratos, bar.x, bar.y - 5);
                        });
                    });
                }
            }]
        });
        
        console.log('📊 Gráfico de Preços por Sentido inicializado');
    }

    /**
     * Função para alterar modo de análise (volume, preço por arroba/saco ou resultado)
     */
    alterarModoAnalise(modo) {
        const chart = this.charts.analiseposicoes;
        if (!chart) return;

        // Atualizar botões
        document.getElementById('btn-quantidade').classList.remove('active');
        document.getElementById('btn-preco').classList.remove('active');
        document.getElementById('btn-resultado').classList.remove('active');
        document.getElementById('btn-' + modo).classList.add('active');

        let data, label, callback;
        
        switch(modo) {
            case 'quantidade':
                data = [18, 10, 12, 5]; // Volume de contratos
                label = 'Volume de Contratos';
                callback = function(value) {
                    return Math.round(value) + ' contratos';
                };
                break;
                
            case 'preco':
                data = [287.45, 285.30, 67.23, 68.15]; // Preço por arroba/saco
                label = 'Preço Médio por Unidade';
                callback = function(value) {
                    return 'R$ ' + value.toFixed(2);
                };
                break;
                
            case 'resultado':
                data = [18500, -8200, 12400, -3100]; // Resultado em reais
                label = 'Resultado Atual (R$)';
                callback = function(value) {
                    return 'R$ ' + new Intl.NumberFormat('pt-BR').format(value);
                };
                break;
        }

        // Atualizar dados do gráfico
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = label;
        
        // Atualizar callback do eixo Y
        chart.options.scales.y.ticks.callback = callback;
        
        chart.update();
    }

    /**
     * Formatar moeda
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    }
}

// Instância global do gerenciador de gráficos
window.chartsManager = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que Chart.js foi carregado
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            window.chartsManager = new ChartsManager();
            window.chartsManager.init();
            console.log('📈 Gráficos inicializados');
        } else {
            console.warn('⚠️ Chart.js não foi carregado');
        }
    }, 500);
});

// Redimensionar gráficos quando a janela for redimensionada
window.addEventListener('resize', function() {
    if (window.chartsManager) {
        window.chartsManager.resize();
    }
});

console.log('✅ charts.js carregado');


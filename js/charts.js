// charts.js modification proposal (using Chart.js)

/**
 * charts.js - Configuração e inicialização de gráficos
 * 
 * Este arquivo contém as funções para criar e atualizar os gráficos
 * da aplicação Boi Gordo Investimentos usando Chart.js.
 */

// Objeto para armazenar instâncias de gráficos
const charts = {};

// Cores para gráficos (adaptadas para Chart.js)
const chartColors = {
  primary: 'rgba(52, 152, 219, 0.8)', // #3498db
  secondary: 'rgba(44, 62, 80, 0.8)',  // #2c3e50
  accent: 'rgba(231, 76, 60, 0.8)',   // #e74c3c
  positive: 'rgba(46, 204, 113, 0.8)', // #2ecc71
  negative: 'rgba(231, 76, 60, 0.8)',   // #e74c3c
  neutral: 'rgba(149, 165, 166, 0.8)', // #95a5a6
  series: [
    'rgba(52, 152, 219, 0.8)', // #3498db
    'rgba(46, 204, 113, 0.8)', // #2ecc71
    'rgba(231, 76, 60, 0.8)',  // #e74c3c
    'rgba(243, 156, 18, 0.8)', // #f39c12
    'rgba(155, 89, 182, 0.8)', // #9b59b6
    'rgba(26, 188, 156, 0.8)', // #1abc9c
    'rgba(52, 73, 94, 0.8)',   // #34495e
    'rgba(211, 84, 0, 0.8)',   // #d35400
    'rgba(41, 128, 185, 0.8)'  // #2980b9
  ]
};

/**
 * Inicializa todos os gráficos da aplicação
 */
function inicializarGraficos() {
  console.log("Initializing Charts...");
  try {
    // Gráficos do Dashboard
    criarGraficoResultadoReferencia();
    criarGraficoDistribuicaoReferencia();
    criarGraficoLiquidacoesEstrategia();
    // criarGraficoVolumeTransacoes(); // Omitido por enquanto, precisa de dados de transações
    
    // Gráficos de Posições Abertas
    criarGraficoExposicaoReferencia();
    console.log("Charts Initialized.");
  } catch (error) {
    console.error("!!!!!!!!! Error initializing charts !!!!!!!!!", error);
    mostrarNotificacao("Erro ao inicializar gráficos. Verifique o console.", "error");
  }
}

/**
 * Atualiza todos os gráficos com dados atuais
 */
function atualizarGraficos() {
  console.log("Updating Charts...");
  try {
    // Atualizar gráficos do Dashboard
    atualizarGraficoResultadoReferencia(posicoesLiquidadas);
    atualizarGraficoDistribuicaoReferencia(posicoesAbertas); // Usar posicoesAbertas para distribuição atual
    atualizarGraficoLiquidacoesEstrategia(posicoesLiquidadas);
    // atualizarGraficoVolumeTransacoes(transacoes); // Omitido por enquanto
    
    // Atualizar gráficos de Posições Abertas
    atualizarGraficoExposicaoReferencia(posicoesAbertas);
    console.log("Charts Updated.");
  } catch (error) {
    console.error("!!!!!!!!! Error updating charts !!!!!!!!!", error);
    mostrarNotificacao("Erro ao atualizar gráficos. Verifique o console.", "error");
  }
}

/**
 * Cria o gráfico de Resultado por Referência (usando Chart.js)
 */
function criarGraficoResultadoReferencia() {
  const ctx = document.getElementById('chart-resultado-referencia')?.getContext('2d');
  if (!ctx) {
    console.warn("Canvas 'chart-resultado-referencia' not found.");
    return;
  }

  const config = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Resultado',
        data: [],
        backgroundColor: [], // Será definido dinamicamente
        borderColor: [],
        borderWidth: 1
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
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
              }
              return label;
            }
          }
        },
        noData: { // Custom plugin or handle externally
            text: 'Sem dados disponíveis'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Resultado (R$)'
          },
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
            }
          }
        }
      }
    }
  };

  charts.resultadoReferencia = new Chart(ctx, config);
}

/**
 * Atualiza o gráfico de Resultado por Referência com dados atuais (usando Chart.js)
 */
function atualizarGraficoResultadoReferencia(posicoesLiquidadasData) {
  if (!charts.resultadoReferencia) return;

  const noDataMessage = document.querySelector('#chart-resultado-referencia + .no-data-message');

  if (!posicoesLiquidadasData || posicoesLiquidadasData.length === 0) {
    charts.resultadoReferencia.data.labels = [];
    charts.resultadoReferencia.data.datasets[0].data = [];
    charts.resultadoReferencia.update();
    if (noDataMessage) noDataMessage.style.display = 'block';
    return;
  }

  // Agrupar resultados por referência
  const resultadosPorReferencia = {};
  posicoesLiquidadasData.forEach(posicao => {
    if (!resultadosPorReferencia[posicao.referencia]) {
      resultadosPorReferencia[posicao.referencia] = 0;
    }
    resultadosPorReferencia[posicao.referencia] += posicao.resultado;
  });

  const labels = Object.keys(resultadosPorReferencia);
  const data = labels.map(ref => resultadosPorReferencia[ref]);
  const backgroundColors = data.map(value => value >= 0 ? chartColors.positive : chartColors.negative);
  const borderColors = data.map(value => value >= 0 ? chartColors.positive.replace('0.8', '1') : chartColors.negative.replace('0.8', '1'));

  charts.resultadoReferencia.data.labels = labels;
  charts.resultadoReferencia.data.datasets[0].data = data;
  charts.resultadoReferencia.data.datasets[0].backgroundColor = backgroundColors;
  charts.resultadoReferencia.data.datasets[0].borderColor = borderColors;
  charts.resultadoReferencia.update();
  if (noDataMessage) noDataMessage.style.display = 'none';
}

/**
 * Cria o gráfico de Distribuição por Referência (usando Chart.js)
 */
function criarGraficoDistribuicaoReferencia() {
  const ctx = document.getElementById('chart-distribuicao-referencia')?.getContext('2d');
   if (!ctx) {
    console.warn("Canvas 'chart-distribuicao-referencia' not found.");
    return;
  }

  const config = {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        label: 'Contratos',
        data: [],
        backgroundColor: chartColors.series,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                 const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                 const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : 0;
                 label += `${percentage}% (${context.parsed} contratos)`;
              }
              return label;
            }
          }
        },
        datalabels: { // Requires chartjs-plugin-datalabels
           formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                    sum += data;
                });
                let percentage = sum > 0 ? (value*100 / sum).toFixed(1)+"%": '0%';
                return percentage;
            },
            color: '#fff',
        },
        noData: { // Custom plugin or handle externally
            text: 'Sem dados disponíveis'
        }
      }
    }
  };
  // Note: Datalabels plugin needs to be included separately if used
  // Chart.register(ChartDataLabels);
  charts.distribuicaoReferencia = new Chart(ctx, config);
}

/**
 * Atualiza o gráfico de Distribuição por Referência com dados atuais (usando Chart.js)
 */
function atualizarGraficoDistribuicaoReferencia(posicoesAbertasData) {
  if (!charts.distribuicaoReferencia) return;

  const noDataMessage = document.querySelector('#chart-distribuicao-referencia + .no-data-message');

  if (!posicoesAbertasData || posicoesAbertasData.length === 0) {
    charts.distribuicaoReferencia.data.labels = [];
    charts.distribuicaoReferencia.data.datasets[0].data = [];
    charts.distribuicaoReferencia.update();
    if (noDataMessage) noDataMessage.style.display = 'block';
    return;
  }

  // Agrupar contratos por referência
  const contratosPorReferencia = {};
  posicoesAbertasData.forEach(posicao => {
    if (!contratosPorReferencia[posicao.referencia]) {
      contratosPorReferencia[posicao.referencia] = 0;
    }
    contratosPorReferencia[posicao.referencia] += posicao.contratos;
  });

  const labels = Object.keys(contratosPorReferencia);
  const data = labels.map(ref => contratosPorReferencia[ref]);

  charts.distribuicaoReferencia.data.labels = labels;
  charts.distribuicaoReferencia.data.datasets[0].data = data;
  charts.distribuicaoReferencia.update();
  if (noDataMessage) noDataMessage.style.display = 'none';
}

/**
 * Cria o gráfico de Liquidações por Estratégia (usando Chart.js)
 */
function criarGraficoLiquidacoesEstrategia() {
  const ctx = document.getElementById('chart-liquidacoes-estrategia')?.getContext('2d');
   if (!ctx) {
    console.warn("Canvas 'chart-liquidacoes-estrategia' not found.");
    return;
  }

  const config = {
    type: 'bar',
    data: {
      labels: ['Positivas', 'Negativas'],
      datasets: [
        {
          label: 'Compra',
          data: [0, 0],
          backgroundColor: chartColors.positive,
        },
        {
          label: 'Venda',
          data: [0, 0],
          backgroundColor: chartColors.negative,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + ' liquidações';
              }
              return label;
            }
          }
        },
        noData: { // Custom plugin or handle externally
            text: 'Sem dados disponíveis'
        }
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Quantidade de Liquidações'
          }
        }
      }
    }
  };

  charts.liquidacoesEstrategia = new Chart(ctx, config);
}

/**
 * Atualiza o gráfico de Liquidações por Estratégia com dados atuais (usando Chart.js)
 */
function atualizarGraficoLiquidacoesEstrategia(posicoesLiquidadasData) {
  if (!charts.liquidacoesEstrategia) return;

  const noDataMessage = document.querySelector('#chart-liquidacoes-estrategia + .no-data-message');

  if (!posicoesLiquidadasData || posicoesLiquidadasData.length === 0) {
    charts.liquidacoesEstrategia.data.datasets[0].data = [0, 0];
    charts.liquidacoesEstrategia.data.datasets[1].data = [0, 0];
    charts.liquidacoesEstrategia.update();
    if (noDataMessage) noDataMessage.style.display = 'block';
    return;
  }

  // Contar liquidações por tipo e resultado
  const compraPositivas = posicoesLiquidadasData.filter(p => p.tipo === 'Compra' && p.resultado > 0).length;
  const compraNegativas = posicoesLiquidadasData.filter(p => p.tipo === 'Compra' && p.resultado <= 0).length; // Inclui zero
  const vendaPositivas = posicoesLiquidadasData.filter(p => p.tipo === 'Venda' && p.resultado > 0).length;
  const vendaNegativas = posicoesLiquidadasData.filter(p => p.tipo === 'Venda' && p.resultado <= 0).length; // Inclui zero

  charts.liquidacoesEstrategia.data.datasets[0].data = [compraPositivas, compraNegativas];
  charts.liquidacoesEstrategia.data.datasets[1].data = [vendaPositivas, vendaNegativas];
  charts.liquidacoesEstrategia.update();
  if (noDataMessage) noDataMessage.style.display = 'none';
}

/**
 * Cria o gráfico de Exposição por Referência (usando Chart.js)
 */
function criarGraficoExposicaoReferencia() {
  const ctx = document.getElementById('chart-exposicao-referencia')?.getContext('2d');
   if (!ctx) {
    console.warn("Canvas 'chart-exposicao-referencia' not found.");
    return;
  }

  const config = {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        label: 'Contratos',
        data: [],
        backgroundColor: chartColors.series,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                 const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                 const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : 0;
                 label += `${percentage}% (${context.parsed} contratos)`;
              }
              return label;
            }
          }
        },
        datalabels: { // Requires chartjs-plugin-datalabels
           formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                    sum += data;
                });
                let percentage = sum > 0 ? (value*100 / sum).toFixed(1)+"%": '0%';
                return percentage;
            },
            color: '#fff',
        },
        noData: { // Custom plugin or handle externally
            text: 'Sem posições abertas'
        }
      }
    }
  };
  // Note: Datalabels plugin needs to be included separately if used
  // Chart.register(ChartDataLabels);
  charts.exposicaoReferencia = new Chart(ctx, config);
}

/**
 * Atualiza o gráfico de Exposição por Referência com dados atuais (usando Chart.js)
 */
function atualizarGraficoExposicaoReferencia(posicoesAbertasData) {
  if (!charts.exposicaoReferencia) return;

  const noDataMessage = document.querySelector('#chart-exposicao-referencia + .no-data-message');

  if (!posicoesAbertasData || posicoesAbertasData.length === 0) {
    charts.exposicaoReferencia.data.labels = [];
    charts.exposicaoReferencia.data.datasets[0].data = [];
    charts.exposicaoReferencia.update();
    if (noDataMessage) noDataMessage.style.display = 'block';
    return;
  }

  // Agrupar contratos por referência
  const contratosPorReferencia = {};
  posicoesAbertasData.forEach(posicao => {
    if (!contratosPorReferencia[posicao.referencia]) {
      contratosPorReferencia[posicao.referencia] = 0;
    }
    contratosPorReferencia[posicao.referencia] += posicao.contratos;
  });

  const labels = Object.keys(contratosPorReferencia);
  const data = labels.map(ref => contratosPorReferencia[ref]);

  charts.exposicaoReferencia.data.labels = labels;
  charts.exposicaoReferencia.data.datasets[0].data = data;
  charts.exposicaoReferencia.update();
  if (noDataMessage) noDataMessage.style.display = 'none';
}

// Não é necessário inicializar aqui, app.js chama inicializarGraficos()
// document.addEventListener('DOMContentLoaded', function() {
//   inicializarGraficos();
// });


// app.js modification proposal

document.addEventListener('DOMContentLoaded', async function() {
  try { // Add top-level try-catch
    console.log("DOM Content Loaded. Initializing...");

    console.log("Initializing Theme...");
    inicializarTema();
    console.log("Theme Initialized.");

    console.log("Initializing Navigation...");
    inicializarNavegacao();
    console.log("Navigation Initialized.");

    console.log("Initializing Forms...");
    inicializarFormularios();
    console.log("Forms Initialized.");

    console.log("Initializing Simulator...");
    inicializarSimulador();
    console.log("Simulator Initialized.");

    console.log("Initializing Excel Import...");
    inicializarImportacaoExcel();
    console.log("Excel Import Initialized.");

    console.log("Initializing Cloud Storage...");
    inicializarArmazenamentoNuvem();
    console.log("Cloud Storage Initialized.");

    console.log("Initializing Data...");
    await inicializarDados(); // This calls carregarDados from data_api.js
    console.log("Data Initialized.");

    console.log("Initialization Complete.");

  } catch (error) {
    console.error("!!!!!!!!! Uncaught Error during Initialization !!!!!!!!!", error);
    // Optionally display a user-friendly error message on the page
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.padding = '10px';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '9999';
    errorDiv.textContent = 'Erro crítico durante a inicialização. Verifique o console (F12).';
    document.body.appendChild(errorDiv);
  }
});

/**
 * Inicializa os dados da aplicação
 */
async function inicializarDados() {
  console.log("inicializarDados: Start");
  mostrarNotificacao("Carregando dados...", "info");
  try {
    const sucesso = await carregarDados(); // From data_api.js
    console.log(`inicializarDados: carregarDados returned ${sucesso}`);
    if (sucesso) {
      console.log("inicializarDados: Updating UI...");
      atualizarInterface();
      console.log("inicializarDados: UI Updated.");
      // Inicializar gráficos após carregar dados
      console.log("inicializarDados: Initializing Charts...");
      inicializarGraficos();
      console.log("inicializarDados: Charts Initialized.");
      mostrarNotificacao("Dados carregados com sucesso!", "success");
    } else {
      console.log("inicializarDados: Calculating default positions...");
      calcularPosicoes(); // From data_api.js
      console.log("inicializarDados: Updating UI with default data...");
      atualizarInterface();
      console.log("inicializarDados: UI Updated with default data.");
      // Inicializar gráficos após carregar dados padrão
      console.log("inicializarDados: Initializing Charts with default data...");
      inicializarGraficos();
      console.log("inicializarDados: Charts Initialized with default data.");
      mostrarNotificacao("Usando dados padrão. Nenhum dado encontrado.", "warning");
    }
  } catch (error) {
      console.error("!!!!!!!!! Error inside inicializarDados !!!!!!!!!", error);
      mostrarNotificacao("Erro crítico ao carregar dados. Verifique o console.", "error");
      // Attempt to initialize UI even with error? Or show error state?
      // Maybe just let the top-level catch handle it.
      throw error; // Re-throw to be caught by top-level handler
  }
  console.log("inicializarDados: End");
}

/**
 * Inicializa o tema da aplicação
 */
function inicializarTema() {
  const btnTema = document.querySelector('.btn-tema');
  const temaAtual = localStorage.getItem('tema');
  
  // Aplicar tema salvo
  if (temaAtual === 'dark') {
    document.body.classList.add('dark-theme');
    btnTema.innerHTML = '<i class="fas fa-sun"></i> <span>Tema Claro</span>';
  }
  
  // Alternar tema ao clicar no botão
  btnTema.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('tema', 'dark');
      btnTema.innerHTML = '<i class="fas fa-sun"></i> <span>Tema Claro</span>';
    } else {
      localStorage.setItem('tema', 'light');
      btnTema.innerHTML = '<i class="fas fa-moon"></i> <span>Tema Escuro</span>';
    }
  });
}

/**
 * Inicializa a navegação entre seções
 */
function inicializarNavegacao() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  // Alternar menu mobile
  if (menuToggle && sidebar) { // Check if elements exist
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('show');
      });
  } else {
      console.warn("inicializarNavegacao: menuToggle or sidebar not found!");
  }
  
  // Navegação entre seções
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover classe active de todos os links e seções
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Adicionar classe active ao link clicado
      this.classList.add('active');
      
      // Mostrar seção correspondente
      const targetSectionId = this.getAttribute('data-section');
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
          targetSection.classList.add('active');
      } else {
          console.error(`inicializarNavegacao: Section with id '${targetSectionId}' not found!`);
      }
      
      // Fechar menu mobile após clicar
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('show');
      }
    });
  });
}

/**
 * Inicializa formulários e botões
 */
function inicializarFormularios() {
  console.log("inicializarFormularios: Start");
  try {
    // Modal de Nova Transação
    const btnNovaTransacao = document.getElementById('btn-nova-transacao');
    const modalNovaTransacao = document.getElementById('modal-nova-transacao');
    const formNovaTransacao = document.getElementById('form-nova-transacao');
    const btnSalvarTransacao = document.getElementById('btn-salvar-transacao');
    
    // Preencher select de referências
    const selectReferencia = document.getElementById('transacao-referencia');
    if (selectReferencia) {
      for (const [codigo, nome] of Object.entries(mesesReferencia)) {
        const option = document.createElement('option');
        option.value = codigo;
        option.textContent = `${codigo} - ${nome}`;
        selectReferencia.appendChild(option);
      }
    }
    
    // Abrir modal de Nova Transação
    if (btnNovaTransacao && modalNovaTransacao) { // Add check for modal too
      console.log("inicializarFormularios: Adding listener for btn-nova-transacao");
      btnNovaTransacao.addEventListener('click', function() {
        console.log("btn-nova-transacao clicked!"); // Log click
        // Preencher data atual
        const hoje = new Date().toISOString().split('T')[0];
        const dataInput = document.getElementById('transacao-data');
        if (dataInput) dataInput.value = hoje;
        
        // Mostrar modal
        modalNovaTransacao.classList.add('show');
      });
    } else {
      console.warn("inicializarFormularios: btn-nova-transacao or modal-nova-transacao not found!");
    }
    
    // Fechar modais ao clicar no X ou no botão Cancelar
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.classList.remove('show');
        } else {
            console.warn("modal-close clicked, but couldn't find parent modal.");
        }
      });
    });
    
    // Salvar nova transação
    if (btnSalvarTransacao && formNovaTransacao && modalNovaTransacao) {
      btnSalvarTransacao.addEventListener("click", async function() {
        // Desabilitar botão para evitar cliques duplos
        btnSalvarTransacao.disabled = true;
        btnSalvarTransacao.textContent = "Salvando...";

        try {
          // Validar formulário
          if (!formNovaTransacao.checkValidity()) {
            formNovaTransacao.reportValidity();
            return; // Não reabilitar se a validação falhar
          }
          
          // Obter valores do formulário
          const data = document.getElementById("transacao-data").value;
          const referencia = document.getElementById("transacao-referencia").value;
          const tipo = document.getElementById("transacao-tipo").value;
          const contratos = parseInt(document.getElementById("transacao-contratos").value);
          const preco = parseFloat(document.getElementById("transacao-preco").value);
          
          // Adicionar transação
          await adicionarTransacao(data, referencia, tipo, contratos, preco);
          
          // Atualizar interface
          atualizarInterface();
          
          // Fechar modal
          modalNovaTransacao.classList.remove("show");
          
          // Mostrar notificação
          mostrarNotificacao(`${tipo} de ${contratos} contratos de ${referencia} adicionada com sucesso!`, "success");
        } catch (error) {
            console.error("Erro ao salvar transação:", error);
            mostrarNotificacao("Erro ao salvar transação. Verifique o console.", "error");
            // Reabilitar botão em caso de erro
        } finally {
            // Reabilitar botão após a operação (sucesso ou erro)
            btnSalvarTransacao.disabled = false;
            btnSalvarTransacao.textContent = "Salvar";
        }
      });
    }
    
    // Modal de Liquidação
    const modalLiquidacao = document.getElementById('modal-liquidacao');
    const formLiquidacao = document.getElementById('form-liquidacao');
    const btnConfirmarLiquidacao = document.getElementById('btn-confirmar-liquidacao');
    const liquidacaoContratos = document.getElementById('liquidacao-contratos');
    const liquidacaoPreco = document.getElementById('liquidacao-preco');
    const liquidacaoResultado = document.getElementById('liquidacao-resultado');
    const liquidacaoReferenciaInput = document.getElementById('liquidacao-referencia'); // Get hidden input
    
    // Atualizar resultado estimado ao alterar valores
    if (liquidacaoContratos && liquidacaoPreco && liquidacaoReferenciaInput && liquidacaoResultado) {
      const atualizarResultadoEstimado = function() {
        const referencia = liquidacaoReferenciaInput.value;
        const contratos = parseInt(liquidacaoContratos.value) || 0;
        const preco = parseFloat(liquidacaoPreco.value) || 0;
        
        // Encontrar posição correspondente
        const posicao = posicoesAbertas.find(p => p.referencia === referencia);
        
        if (posicao) {
          let resultado = 0;
          
          if (posicao.tipo === 'Compra') {
            resultado = (preco - posicao.precoMedio) * contratos * 330; // Multiplicar por 330 arrobas
          } else {
            resultado = (posicao.precoMedio - preco) * contratos * 330; // Multiplicar por 330 arrobas
          }
          
          liquidacaoResultado.textContent = `R$ ${resultado.toFixed(2)}`;
          liquidacaoResultado.className = 'form-static ' + (resultado >= 0 ? 'positive' : 'negative');
        }
      };
      
      liquidacaoContratos.addEventListener('input', atualizarResultadoEstimado);
      liquidacaoPreco.addEventListener('input', atualizarResultadoEstimado);
    }
    
    // Confirmar liquidação
    if (btnConfirmarLiquidacao && formLiquidacao && modalLiquidacao && liquidacaoReferenciaInput) {
      btnConfirmarLiquidacao.addEventListener('click', async function() {
        // Validar formulário
        if (!formLiquidacao.checkValidity()) {
          formLiquidacao.reportValidity();
          return;
        }
        
        // Obter valores do formulário
        const referencia = liquidacaoReferenciaInput.value;
        const contratos = parseInt(liquidacaoContratos.value);
        const preco = parseFloat(liquidacaoPreco.value);
        
        // Liquidar posição
        await liquidarPosicao(referencia, contratos, preco);
        
        // Atualizar interface
        atualizarInterface();
        
        // Fechar modal
        modalLiquidacao.classList.remove('show');
        
        // Mostrar notificação
        mostrarNotificacao(`Liquidação de ${contratos} contratos de ${referencia} realizada com sucesso!`, 'success');
      });
    }
    
    // Botão de atualizar preços (Check if element exists)
    const btnAtualizarPrecos = document.getElementById('btn-atualizar-precos');
    if (btnAtualizarPrecos) {
      console.log("inicializarFormularios: Adding listener for btn-atualizar-precos");
      btnAtualizarPrecos.addEventListener('click', async function() {
        const novosPrecos = {};
        
        // Obter valores dos campos de preço
        Object.keys(precos).forEach(referencia => {
          const input = document.getElementById(`preco-${referencia}`);
          if (input) {
            novosPrecos[referencia] = parseFloat(input.value);
          }
        });
        
        // Atualizar preços
        await atualizarPrecos(novosPrecos);
        
        // Atualizar interface
        atualizarInterface();
        
        // Mostrar notificação
        mostrarNotificacao('Preços atualizados com sucesso!', 'success');
      });
    } else {
        console.warn("inicializarFormularios: btn-atualizar-precos not found.");
    }
    
    // Botão de atualizar dashboard
    const btnAtualizar = document.getElementById('btn-atualizar');
    if (btnAtualizar) {
      console.log("inicializarFormularios: Adding listener for btn-atualizar");
      btnAtualizar.addEventListener('click', function() {
        atualizarInterface();
        mostrarNotificacao('Dashboard atualizado!', 'info');
      });
    }
    
    // Botão de exportar dados (Check if element exists)
    const btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
      console.log("inicializarFormularios: Adding listener for btn-exportar");
      btnExportar.addEventListener('click', function() {
        const dados = exportarDados();
        
        // Criar link de download
        const blob = new Blob([dados], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boi_gordo_dados_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Mostrar notificação
        mostrarNotificacao('Dados exportados com sucesso!', 'success');
      });
    } else {
        console.warn("inicializarFormularios: btn-exportar not found.");
    }
    
    // Modal de Importação (Check if elements exist)
    const btnImportar = document.getElementById('btn-importar');
    const modalImportacao = document.getElementById('modal-importacao');
    const btnConfirmarImportacaoModal = document.getElementById('btn-confirmar-importacao'); // Renamed to avoid conflict
    const importacaoDadosTextarea = document.getElementById('importacao-dados');
    
    // Abrir modal de Importação
    if (btnImportar && modalImportacao) {
      console.log("inicializarFormularios: Adding listener for btn-importar");
      btnImportar.addEventListener('click', function() {
        if (importacaoDadosTextarea) importacaoDadosTextarea.value = '';
        modalImportacao.classList.add('show');
      });
    } else {
        console.warn("inicializarFormularios: btn-importar or modal-importacao not found.");
    }
    
    // Confirmar importação
    if (btnConfirmarImportacaoModal && modalImportacao && importacaoDadosTextarea) {
      btnConfirmarImportacaoModal.addEventListener('click', async function() {
        const jsonString = importacaoDadosTextarea.value;
        
        if (!jsonString.trim()) {
          mostrarNotificacao('Por favor, insira os dados JSON.', 'error');
          return;
        }
        
        try {
          // Importar dados
          const sucesso = await importarDados(jsonString);
          
          if (sucesso) {
            // Atualizar interface
            atualizarInterface();
            
            // Fechar modal
            modalImportacao.classList.remove('show');
            
            // Mostrar notificação
            mostrarNotificacao('Dados importados com sucesso!', 'success');
          } else {
            mostrarNotificacao('Erro ao importar dados. Formato inválido.', 'error');
          }
        } catch (error) {
          mostrarNotificacao('Erro ao importar dados: ' + error.message, 'error');
        }
      });
    }
    
    // Botão de resetar dados (Check if element exists)
    const btnResetar = document.getElementById('btn-resetar');
    if (btnResetar) {
      console.log("inicializarFormularios: Adding listener for btn-resetar");
      btnResetar.addEventListener('click', async function() {
        if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
          await resetarDados();
          atualizarInterface();
          mostrarNotificacao('Dados resetados com sucesso!', 'success');
        }
      });
    } else {
        console.warn("inicializarFormularios: btn-resetar not found.");
    }

  } catch (error) {
    console.error("!!!!!!!!! Error inside inicializarFormularios !!!!!!!!!", error);
    throw error; // Re-throw
  }
  console.log("inicializarFormularios: End");
}

/**
 * Inicializa o simulador de preço
 */
function inicializarSimulador() {
  const selectReferencia = document.getElementById('simulador-referencia');
  const inputPreco = document.getElementById('simulador-preco');
  const btnSimular = document.getElementById('btn-simular');
  const resultadoSimulado = document.getElementById('resultado-simulado');
  
  // Preencher select de referências
  if (selectReferencia) {
    // Opção "Todos os Contratos" já está no HTML
    
    for (const [codigo, nome] of Object.entries(mesesReferencia)) {
      const option = document.createElement('option');
      option.value = codigo;
      option.textContent = `${codigo} - ${nome}`;
      selectReferencia.appendChild(option);
    }
  }
  
  // Simular ao clicar no botão
  if (btnSimular && selectReferencia && inputPreco && resultadoSimulado) {
    btnSimular.addEventListener('click', function() {
      const referencia = selectReferencia.value;
      const preco = parseFloat(inputPreco.value);
      
      if (isNaN(preco)) {
        mostrarNotificacao('Por favor, insira um preço válido.', 'error');
        return;
      }
      
      // Calcular resultado simulado
      const resultado = simularPreco(referencia, preco);
      
      // Atualizar resultado
      resultadoSimulado.textContent = `R$ ${resultado.toFixed(2)}`;
      resultadoSimulado.className = 'simulator-value ' + (resultado >= 0 ? 'positive' : 'negative');
    });
  }
}

/**
 * Inicializa a funcionalidade de importação de Excel
 */
function inicializarImportacaoExcel() {
  const btnImportar = document.getElementById("btn-importar-excel");
  const inputImportar = document.getElementById("input-importar-excel");

  if (btnImportar && inputImportar) {
    btnImportar.addEventListener("click", () => {
      inputImportar.click(); // Aciona o input de arquivo oculto
    });

    inputImportar.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      // Mostrar indicador de carregamento
      mostrarNotificacao("Processando arquivo Excel...", "info");
      
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array", cellDates: true });

          // Assume que os dados estão na primeira planilha
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Converte a planilha para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) {
            mostrarNotificacao("Planilha vazia ou sem dados.", "error");
            return;
          }

          // Identificar índices das colunas (assumindo cabeçalho na primeira linha)
          const header = jsonData[0].map(h => String(h).trim());
          const dataIndex = header.indexOf("Data do Negócio");
          const tipoIndex = header.indexOf("Tipo de Movimentação");
          const codigoIndex = header.indexOf("Código de Negociação");
          const qtdIndex = header.indexOf("Quantidade");
          const precoIndex = header.indexOf("Preço");

          if ([dataIndex, tipoIndex, codigoIndex, qtdIndex, precoIndex].includes(-1)) {
            // Tentar encontrar colunas com nomes similares
            const colunasFaltantes = [];
            if (dataIndex === -1) {
              const possiveisData = header.findIndex(h => h.includes("Data"));
              if (possiveisData !== -1) {
                colunasFaltantes.push(`"Data do Negócio" (encontrado "${header[possiveisData]}")`);
              } else {
                colunasFaltantes.push("Data do Negócio");
              }
            }
            if (tipoIndex === -1) {
              const possiveisTipo = header.findIndex(h => h.includes("Tipo") || h.includes("Movimentação"));
              if (possiveisTipo !== -1) {
                colunasFaltantes.push(`"Tipo de Movimentação" (encontrado "${header[possiveisTipo]}")`);
              } else {
                colunasFaltantes.push("Tipo de Movimentação");
              }
            }
            if (codigoIndex === -1) {
              const possiveisCodigo = header.findIndex(h => h.includes("Código") || h.includes("Negociação"));
              if (possiveisCodigo !== -1) {
                colunasFaltantes.push(`"Código de Negociação" (encontrado "${header[possiveisCodigo]}")`);
              } else {
                colunasFaltantes.push("Código de Negociação");
              }
            }
            if (qtdIndex === -1) {
              const possiveisQtd = header.findIndex(h => h.includes("Quantidade") || h.includes("Qtd"));
              if (possiveisQtd !== -1) {
                colunasFaltantes.push(`"Quantidade" (encontrado "${header[possiveisQtd]}")`);
              } else {
                colunasFaltantes.push("Quantidade");
              }
            }
            if (precoIndex === -1) {
              const possiveisPreco = header.findIndex(h => h.includes("Preço") || h.includes("Valor"));
              if (possiveisPreco !== -1) {
                colunasFaltantes.push(`"Preço" (encontrado "${header[possiveisPreco]}")`);
              } else {
                colunasFaltantes.push("Preço");
              }
            }
            
            mostrarNotificacao(`Erro: Colunas esperadas não encontradas na planilha: ${colunasFaltantes.join(", ")}. Verifique o formato do arquivo.`, "error");
            return;
          }

          // Criar modal de pré-visualização
          const previewModal = document.createElement("div");
          previewModal.className = "modal";
          previewModal.id = "modal-preview-excel";
          previewModal.innerHTML = `
            <div class="modal-content">
              <div class="modal-header">
                <h3>Pré-visualização da Importação</h3>
                <span class="close">&times;</span>
              </div>
              <div class="modal-body">
                <p>Foram encontradas <strong>${jsonData.length - 1}</strong> transações no arquivo Excel.</p>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Referência</th>
                        <th>Tipo</th>
                        <th>Contratos</th>
                        <th>Preço</th>
                      </tr>
                    </thead>
                    <tbody id="preview-transacoes">
                      <!-- Dados serão inseridos via JavaScript -->
                    </tbody>
                  </table>
                </div>
                <div class="preview-stats">
                  <p>Resumo:</p>
                  <ul>
                    <li><span id="preview-compras">0</span> operações de compra</li>
                    <li><span id="preview-vendas">0</span> operações de venda</li>
                    <li><span id="preview-contratos">0</span> contratos no total</li>
                  </ul>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary btn-cancelar">Cancelar</button>
                <button id="btn-confirmar-importacao-excel" class="btn btn-primary">Confirmar Importação</button> <!-- ID único -->
              </div>
            </div>
          `;
          document.body.appendChild(previewModal);
          
          // Mostrar modal
          previewModal.classList.add('show');
          
          // Fechar modal ao clicar no X
          const closeBtn = previewModal.querySelector(".close");
          if (closeBtn) {
              closeBtn.addEventListener("click", () => {
                previewModal.classList.remove('show');
                document.body.removeChild(previewModal);
              });
          }
          
          // Fechar modal ao clicar em Cancelar
          const cancelBtn = previewModal.querySelector(".btn-cancelar");
          if (cancelBtn) {
              cancelBtn.addEventListener("click", () => {
                previewModal.classList.remove('show');
                document.body.removeChild(previewModal);
              });
          }
          
          // Preparar dados para pré-visualização
          const dadosPreview = [];
          let compras = 0;
          let vendas = 0;
          let totalContratos = 0;
          
          // Limitar a 10 linhas para a pré-visualização
          const maxPreviewRows = Math.min(10, jsonData.length - 1);
          
          for (let i = 1; i <= maxPreviewRows; i++) {
            const row = jsonData[i];
            
            if (row && row.length > Math.max(dataIndex, tipoIndex, codigoIndex, qtdIndex, precoIndex)) {
              const dataRaw = row[dataIndex];
              const tipo = row[tipoIndex];
              const referencia = row[codigoIndex];
              const contratos = row[qtdIndex];
              const preco = row[precoIndex];
              
              if (dataRaw && tipo && referencia && contratos && preco) {
                let dataFormatada;
                if (dataRaw instanceof Date) {
                  const year = dataRaw.getFullYear();
                  const month = String(dataRaw.getMonth() + 1).padStart(2, '0');
                  const day = String(dataRaw.getDate()).padStart(2, '0');
                  dataFormatada = `${day}/${month}/${year}`;
                } else if (typeof dataRaw === 'string') {
                  // Manter formato DD/MM/YYYY para exibição
                  dataFormatada = dataRaw;
                } else {
                  dataFormatada = String(dataRaw);
                }
                
                const tipoNormalizado = tipo.trim().charAt(0).toUpperCase() + tipo.trim().slice(1).toLowerCase();
                
                dadosPreview.push({
                  data: dataFormatada,
                  referencia: referencia,
                  tipo: tipoNormalizado,
                  contratos: contratos,
                  preco: preco
                });
                
                // Contar para estatísticas
                if (tipoNormalizado === 'Compra') {
                  compras++;
                } else if (tipoNormalizado === 'Venda') {
                  vendas++;
                }
                
                totalContratos += parseInt(contratos);
              }
            }
          }
          
          // Preencher tabela de pré-visualização
          const previewTable = document.getElementById("preview-transacoes");
          if (previewTable) {
              previewTable.innerHTML = "";
              
              dadosPreview.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                  <td>${item.data}</td>
                  <td>${item.referencia}</td>
                  <td>${item.tipo}</td>
                  <td>${item.contratos}</td>
                  <td>R$ ${parseFloat(item.preco).toFixed(2)}</td>
                `;
                previewTable.appendChild(row);
              });
              
              // Se houver mais linhas que o limite de pré-visualização
              if (jsonData.length - 1 > maxPreviewRows) {
                const rowMore = document.createElement("tr");
                rowMore.innerHTML = `
                  <td colspan="5" class="text-center">... e mais ${jsonData.length - 1 - maxPreviewRows} transações</td>
                `;
                previewTable.appendChild(rowMore);
              }
          }
          
          // Atualizar estatísticas
          const previewCompras = document.getElementById("preview-compras");
          const previewVendas = document.getElementById("preview-vendas");
          const previewContratos = document.getElementById("preview-contratos");
          if (previewCompras) previewCompras.textContent = compras;
          if (previewVendas) previewVendas.textContent = vendas;
          if (previewContratos) previewContratos.textContent = totalContratos;
          
          // Processar importação quando confirmar
          const btnConfirmarExcel = document.getElementById("btn-confirmar-importacao-excel");
          if (btnConfirmarExcel) {
              btnConfirmarExcel.addEventListener("click", async () => {
                // Fechar modal
                previewModal.classList.remove('show');
                
                // Mostrar indicador de processamento
                mostrarNotificacao("Importando transações...", "info");
                
                // Processar todas as linhas
                let transacoesImportadas = 0;
                let transacoesInvalidas = 0;
                
                // Começar da segunda linha (índice 1) para pular o cabeçalho
                for (let i = 1; i < jsonData.length; i++) {
                  const row = jsonData[i];
                  
                  if (row && row.length > Math.max(dataIndex, tipoIndex, codigoIndex, qtdIndex, precoIndex)) {
                    const dataRaw = row[dataIndex];
                    const tipo = row[tipoIndex];
                    const referencia = row[codigoIndex];
                    const contratos = row[qtdIndex];
                    const preco = row[precoIndex];
                    
                    if (dataRaw && tipo && referencia && contratos && preco) {
                      // Converter data para formato YYYY-MM-DD
                      let dataFormatada;
                      if (dataRaw instanceof Date) {
                        const year = dataRaw.getFullYear();
                        const month = String(dataRaw.getMonth() + 1).padStart(2, '0');
                        const day = String(dataRaw.getDate()).padStart(2, '0');
                        dataFormatada = `${year}-${month}-${day}`;
                      } else if (typeof dataRaw === 'string') {
                        // Tentar converter de DD/MM/YYYY para YYYY-MM-DD
                        const parts = dataRaw.split('/');
                        if (parts.length === 3) {
                          dataFormatada = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        } else {
                          // Manter como está se não for DD/MM/YYYY
                          dataFormatada = dataRaw;
                        }
                      } else {
                        // Usar data atual se não for possível converter
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const day = String(now.getDate()).padStart(2, '0');
                        dataFormatada = `${year}-${month}-${day}`;
                      }
                      
                      const tipoNormalizado = tipo.trim().toLowerCase().includes('compra') ? 'Compra' : 'Venda';
                      
                      // Verificar se referência existe
                      if (Object.keys(precos).includes(referencia)) {
                        // Adicionar transação
                        await adicionarTransacao(
                          dataFormatada,
                          referencia,
                          tipoNormalizado,
                          parseInt(contratos),
                          parseFloat(preco)
                        );
                        
                        transacoesImportadas++;
                      } else {
                        transacoesInvalidas++;
                        console.warn(`Referência inválida: ${referencia}`);
                      }
                    } else {
                      transacoesInvalidas++;
                      console.warn(`Dados incompletos na linha ${i + 1}`);
                    }
                  } else {
                    transacoesInvalidas++;
                    console.warn(`Linha ${i + 1} com formato inválido`);
                  }
                }
                
                // Atualizar interface
                atualizarInterface();
                
                // Mostrar notificação de conclusão
                if (transacoesInvalidas > 0) {
                  mostrarNotificacao(`Importação concluída: ${transacoesImportadas} transações importadas, ${transacoesInvalidas} ignoradas por erros.`, "warning");
                } else {
                  mostrarNotificacao(`Importação concluída: ${transacoesImportadas} transações importadas com sucesso!`, "success");
                }
                
                // Remover modal da DOM após uso
                if (document.body.contains(previewModal)) {
                    document.body.removeChild(previewModal);
                }
              });
          }
          
        } catch (error) {
          console.error("Erro ao processar arquivo Excel:", error);
          mostrarNotificacao(`Erro ao processar arquivo Excel: ${error.message}`, "error");
        }
      };
      
      reader.onerror = function() {
        mostrarNotificacao("Erro ao ler o arquivo.", "error");
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
}

/**
 * Inicializa as funcionalidades de armazenamento na nuvem
 */
function inicializarArmazenamentoNuvem() {
  const btnVerificarConexao = document.getElementById('btn-verificar-conexao');
  const btnMigrarDados = document.getElementById('btn-migrar-dados');
  const statusConexao = document.getElementById('status-conexao');
  
  // Verificar conexão ao carregar a página
  if (statusConexao) {
    verificarStatusConexao();
  }
  
  // Botão de verificar conexão
  if (btnVerificarConexao) {
    btnVerificarConexao.addEventListener('click', function() {
      verificarStatusConexao();
    });
  }
  
  // Botão de migrar dados
  if (btnMigrarDados) {
    btnMigrarDados.addEventListener('click', async function() {
      // Verificar conexão primeiro
      const conexaoOk = await verificarConexaoAPI();
      
      if (!conexaoOk) {
        mostrarNotificacao('Não foi possível conectar ao servidor. Verifique sua conexão.', 'error');
        return;
      }
      
      if (confirm('Deseja migrar os dados salvos localmente para a nuvem? Isso sobrescreverá os dados na nuvem.')) {
        mostrarNotificacao('Migrando dados...', 'info');
        const sucesso = await migrarDadosLocalParaAPI();
        if (sucesso) {
          mostrarNotificacao('Dados migrados para a nuvem com sucesso!', 'success');
        } else {
          mostrarNotificacao('Erro ao migrar dados.', 'error');
        }
      }
    });
  }
}

/**
 * Verifica e atualiza o status da conexão com a API
 */
async function verificarStatusConexao() {
  const statusConexao = document.getElementById('status-conexao');
  if (!statusConexao) return;
  
  statusConexao.textContent = 'Verificando...';
  statusConexao.className = 'status-conexao status-verificando';
  
  const conexaoOk = await verificarConexaoAPI();
  
  if (conexaoOk) {
    statusConexao.textContent = 'Conectado à Nuvem';
    statusConexao.className = 'status-conexao status-conectado';
  } else {
    statusConexao.textContent = 'Erro de Conexão / Offline';
    statusConexao.className = 'status-conexao status-erro';
  }
}

/**
 * Atualiza toda a interface do usuário com os dados atuais
 */
function atualizarInterface() {
  console.log("atualizarInterface: Start");
  try {
      // Atualizar tabelas
      atualizarTabelaTransacoes();
      atualizarTabelaPosicoesAbertas();
      atualizarTabelaPosicoesLiquidadas();
      
      // Atualizar métricas
      atualizarMetricasDashboard();
      atualizarMetricasLiquidadas();
      
      // Atualizar gráficos
      atualizarGraficos();
      
      // Atualizar campos de preço
      atualizarCamposPreco();
      
      // Atualizar simulador
      atualizarSimulador();
  } catch (error) {
      console.error("!!!!!!!!! Error inside atualizarInterface !!!!!!!!!", error);
      mostrarNotificacao("Erro ao atualizar a interface. Verifique o console.", "error");
  }
  console.log("atualizarInterface: End");
}

/**
 * Atualiza a tabela de transações
 */
function atualizarTabelaTransacoes() {
  const tbody = document.getElementById('transacoes-table');
  if (!tbody) return;
  
  tbody.innerHTML = ''; // Limpar tabela
  
  if (transacoes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma transação registrada</td></tr>';
    return;
  }
  
  // Ordenar por data decrescente para exibição
  const transacoesOrdenadas = [...transacoes].sort((a, b) => new Date(b.data) - new Date(a.data));
  
  transacoesOrdenadas.forEach(transacao => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatarData(transacao.data)}</td>
      <td>${transacao.referencia}</td>
      <td>${transacao.tipo}</td>
      <td>${transacao.contratos}</td>
      <td>R$ ${transacao.preco.toFixed(2)}</td>
      <td>R$ ${transacao.valorTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Atualiza as tabelas de posições abertas (Dashboard e seção completa)
 */
function atualizarTabelaPosicoesAbertas() {
  const tbodyDashboard = document.getElementById('posicoes-abertas-table');
  const tbodyFull = document.getElementById('posicoes-abertas-full-table');
  
  if (!tbodyDashboard || !tbodyFull) return;
  
  tbodyDashboard.innerHTML = '';
  tbodyFull.innerHTML = '';
  
  if (posicoesAbertas.length === 0) {
    const emptyRow = '<tr><td colspan="8" class="text-center">Nenhuma posição aberta</td></tr>';
    tbodyDashboard.innerHTML = emptyRow;
    tbodyFull.innerHTML = emptyRow;
    return;
  }
  
  posicoesAbertas.forEach(posicao => {
    const resultadoClasse = posicao.resultadoPotencial >= 0 ? 'positive' : 'negative';
    const rowHTML = `
      <td>${posicao.referencia}</td>
      <td>${posicao.tipo}</td>
      <td>${posicao.contratos}</td>
      <td>R$ ${posicao.precoMedio.toFixed(2)}</td>
      <td>R$ ${posicao.precoAtual.toFixed(2)}</td>
      <td class="${resultadoClasse}">R$ ${posicao.resultadoPotencial.toFixed(2)}</td>
      <td>${posicao.diasEmAberto}</td>
      <td>
        <button class="btn btn-sm btn-liquidar" data-referencia="${posicao.referencia}">
          <i class="fas fa-hand-holding-usd"></i> Liquidar
        </button>
      </td>
    `;
    
    const rowDashboard = document.createElement('tr');
    rowDashboard.innerHTML = rowHTML;
    tbodyDashboard.appendChild(rowDashboard);
    
    const rowFull = document.createElement('tr');
    rowFull.innerHTML = rowHTML;
    tbodyFull.appendChild(rowFull);
  });
  
  // Adicionar listeners aos botões de liquidar
  document.querySelectorAll('.btn-liquidar').forEach(button => {
    button.addEventListener('click', function() {
      const referencia = this.getAttribute('data-referencia');
      abrirModalLiquidacao(referencia);
    });
  });
}

/**
 * Atualiza as tabelas de posições liquidadas (Dashboard e seção completa)
 */
function atualizarTabelaPosicoesLiquidadas() {
  const tbodyDashboard = document.getElementById('posicoes-liquidadas-table');
  const tbodyFull = document.getElementById('posicoes-liquidadas-full-table');
  
  if (!tbodyDashboard || !tbodyFull) return;
  
  tbodyDashboard.innerHTML = '';
  tbodyFull.innerHTML = '';
  
  if (posicoesLiquidadas.length === 0) {
    const emptyRow = '<tr><td colspan="8" class="text-center">Nenhuma posição liquidada</td></tr>';
    tbodyDashboard.innerHTML = emptyRow;
    tbodyFull.innerHTML = emptyRow;
    return;
  }
  
  // Ordenar por data decrescente para exibição
  const posicoesOrdenadas = [...posicoesLiquidadas].sort((a, b) => new Date(b.dataLiquidacao) - new Date(a.dataLiquidacao));
  
  posicoesOrdenadas.forEach(posicao => {
    const resultadoClasse = posicao.resultado >= 0 ? 'positive' : 'negative';
    const rowHTML = `
      <td>${posicao.referencia}</td>
      <td>${posicao.tipo}</td>
      <td>${posicao.contratos}</td>
      <td>R$ ${posicao.precoEntrada.toFixed(2)}</td>
      <td>R$ ${posicao.precoSaida.toFixed(2)}</td>
      <td class="${resultadoClasse}">R$ ${posicao.resultado.toFixed(2)}</td>
      <td>${posicao.diasInvestidos}</td>
      <td>${formatarData(posicao.dataLiquidacao)}</td>
    `;
    
    const rowDashboard = document.createElement('tr');
    rowDashboard.innerHTML = rowHTML;
    tbodyDashboard.appendChild(rowDashboard);
    
    const rowFull = document.createElement('tr');
    rowFull.innerHTML = rowHTML;
    tbodyFull.appendChild(rowFull);
  });
}

/**
 * Atualiza as métricas do dashboard
 */
function atualizarMetricasDashboard() {
  const metricas = calcularMetricas();
  
  const resultadoAcumuladoEl = document.getElementById('resultado-acumulado');
  const contratosLiquidadosEl = document.getElementById('contratos-liquidados');
  const taxaAcertoEl = document.getElementById('taxa-acerto');
  const fatorLucroEl = document.getElementById('fator-lucro');
  
  if (resultadoAcumuladoEl) {
    resultadoAcumuladoEl.textContent = `R$ ${metricas.resultadoAcumulado.toFixed(2)}`;
    resultadoAcumuladoEl.className = 'metric-value ' + (metricas.resultadoAcumulado >= 0 ? 'positive' : 'negative');
  }
  if (contratosLiquidadosEl) {
    contratosLiquidadosEl.textContent = metricas.contratosLiquidados;
  }
  if (taxaAcertoEl) {
    taxaAcertoEl.textContent = `${metricas.taxaAcerto.toFixed(2)}%`;
  }
  if (fatorLucroEl) {
    fatorLucroEl.textContent = metricas.fatorLucro.toFixed(2);
  }
  
  // Atualizar tendências (exemplo simples, pode ser mais elaborado)
  // ... (lógica de tendência omitida por simplicidade)
}

/**
 * Atualiza as métricas da seção de posições liquidadas
 */
function atualizarMetricasLiquidadas() {
  const metricas = calcularMetricas();
  
  const resultadoPorContratoEl = document.getElementById('resultado-por-contrato');
  const spreadMedioEl = document.getElementById('spread-medio');
  const maiorGanhoEl = document.getElementById('maior-ganho');
  const maiorPerdaEl = document.getElementById('maior-perda');
  
  if (resultadoPorContratoEl) {
    resultadoPorContratoEl.textContent = `R$ ${metricas.resultadoPorContrato.toFixed(2)}`;
    resultadoPorContratoEl.className = 'metric-value ' + (metricas.resultadoPorContrato >= 0 ? 'positive' : 'negative');
  }
  if (spreadMedioEl) {
    spreadMedioEl.textContent = `R$ ${metricas.spreadMedio.toFixed(2)}`;
  }
  if (maiorGanhoEl) {
    maiorGanhoEl.textContent = `R$ ${metricas.maiorGanho.toFixed(2)}`;
  }
  if (maiorPerdaEl) {
    maiorPerdaEl.textContent = `R$ ${metricas.maiorPerda.toFixed(2)}`;
  }
}

/**
 * Atualiza os gráficos
 */
function atualizarGraficos() {
  // Chamar funções de atualização de gráficos do charts.js
  if (typeof atualizarGraficoResultadoReferencia === 'function') {
    atualizarGraficoResultadoReferencia(posicoesLiquidadas);
  }
  if (typeof atualizarGraficoDistribuicaoReferencia === 'function') {
    atualizarGraficoDistribuicaoReferencia(posicoesAbertas);
  }
  if (typeof atualizarGraficoExposicaoReferencia === 'function') {
    atualizarGraficoExposicaoReferencia(posicoesAbertas);
  }
  if (typeof atualizarGraficoLiquidacoesEstrategia === 'function') {
    atualizarGraficoLiquidacoesEstrategia(posicoesLiquidadas);
  }
}

/**
 * Atualiza os campos de preço na seção de configurações
 */
function atualizarCamposPreco() {
  const container = document.getElementById('precos-atuais-container');
  if (!container) return;
  
  container.innerHTML = ''; // Limpar container
  
  for (const [referencia, preco] of Object.entries(precos)) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = `
      <label for="preco-${referencia}">${referencia} (${mesesReferencia[referencia]}):</label>
      <input type="number" id="preco-${referencia}" class="form-control" step="0.01" value="${preco.toFixed(2)}">
    `;
    container.appendChild(formGroup);
  }
}

/**
 * Atualiza o simulador (preenche select)
 */
function atualizarSimulador() {
  const selectReferencia = document.getElementById('simulador-referencia');
  if (!selectReferencia) return;
  
  // Limpar opções existentes (exceto a primeira)
  while (selectReferencia.options.length > 1) {
    selectReferencia.remove(1);
  }
  
  // Adicionar referências das posições abertas
  const referenciasAbertas = [...new Set(posicoesAbertas.map(p => p.referencia))];
  referenciasAbertas.sort(); // Ordenar alfabeticamente
  
  referenciasAbertas.forEach(referencia => {
    const option = document.createElement('option');
    option.value = referencia;
    option.textContent = `${referencia} - ${mesesReferencia[referencia]}`;
    selectReferencia.appendChild(option);
  });
}

/**
 * Abre o modal de liquidação para uma referência específica
 * @param {string} referencia - Código da referência
 */
function abrirModalLiquidacao(referencia) {
  const posicao = posicoesAbertas.find(p => p.referencia === referencia);
  const modal = document.getElementById('modal-liquidacao');
  
  if (posicao && modal) {
    // Preencher informações da posição
    const infoEl = document.getElementById('liquidacao-info');
    const contratosEl = document.getElementById('liquidacao-contratos');
    const precoEl = document.getElementById('liquidacao-preco');
    const resultadoEl = document.getElementById('liquidacao-resultado');
    const referenciaInput = document.getElementById('liquidacao-referencia');
    
    if (infoEl) infoEl.textContent = `${posicao.tipo} ${posicao.contratos} x ${referencia} @ R$ ${posicao.precoMedio.toFixed(2)}`;
    if (contratosEl) {
        contratosEl.value = posicao.contratos;
        contratosEl.max = posicao.contratos; // Definir máximo
    }
    if (precoEl) precoEl.value = posicao.precoAtual.toFixed(2);
    if (resultadoEl) {
        resultadoEl.textContent = `R$ ${posicao.resultadoPotencial.toFixed(2)}`;
        resultadoEl.className = 'form-static ' + (posicao.resultadoPotencial >= 0 ? 'positive' : 'negative');
    }
    if (referenciaInput) referenciaInput.value = referencia;
    
    // Mostrar modal
    modal.classList.add('show');
  } else {
      console.error(`abrirModalLiquidacao: Posição para ${referencia} ou modal não encontrado.`);
  }
}

/**
 * Formata uma data no formato DD/MM/YYYY
 * @param {string} dataString - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada
 */
function formatarData(dataString) {
  if (!dataString) return '';
  try {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return dataString; // Retorna original se houver erro
  }
}

/**
 * Mostra uma notificação na tela
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação (info, success, warning, error)
 * @param {number} duracao - Duração em milissegundos
 */
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    console.log(`Notification (${tipo}): ${mensagem}`); // Log notifications
    // Check if the notification element exists or create it dynamically
    let notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        // Add styles for positioning, e.g., fixed top-right
        notificationArea.style.position = 'fixed';
        notificationArea.style.top = '20px';
        notificationArea.style.right = '20px';
        notificationArea.style.zIndex = '1060'; // Above modals
        document.body.appendChild(notificationArea);
    }

    const notificacao = document.createElement('div');
    notificacao.className = `notification notification-${tipo}`;
    notificacao.textContent = mensagem;

    notificationArea.appendChild(notificacao);

    // Auto-remove after duration
    setTimeout(() => {
        notificacao.remove();
    }, duracao);
}

// Add CSS for notifications if missing
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
#notification-area { display: flex; flex-direction: column; gap: 10px; }
.notification { padding: 15px; border-radius: 5px; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); min-width: 250px; }
.notification-info { background-color: #3498db; }
.notification-success { background-color: #2ecc71; }
.notification-warning { background-color: #f39c12; }
.notification-error { background-color: #e74c3c; }
`;
document.head.appendChild(styleSheet);


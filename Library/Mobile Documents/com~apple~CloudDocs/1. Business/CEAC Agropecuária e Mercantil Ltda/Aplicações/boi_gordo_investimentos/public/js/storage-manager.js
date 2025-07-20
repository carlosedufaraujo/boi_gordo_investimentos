// ACEX Capital Markets - Gerenciador de Armazenamento Local
// Sistema completo para persistir todas as informações da aplicação
console.log('💾 [Storage] Iniciando Sistema de Armazenamento Local');

class BoiGordoStorageManager {
    constructor() {
        this.STORAGE_KEY = 'boiGordoInvestimentos';
        this.VERSION = '2.2';
        this.BACKUP_KEY = 'boiGordoInvestimentos_backup';
        this.CONFIG_KEY = 'boiGordoInvestimentos_config';
        
        // Estrutura padrão dos dados
        this.defaultData = {
            version: this.VERSION,
            lastSaved: null,
            userData: {
                nome: '',
                email: '',
                telefone: '',
                empresa: ''
            },
            transacoes: [],
            posicoesAbertas: [],
            posicoesLiquidadas: [],
            configuracoes: {
                tema: 'light',
                moeda: 'BRL',
                timezone: 'America/Sao_Paulo',
                notificacoes: true,
                autoSave: true,
                backupAutomatico: true
            },
            tiposContrato: {
                BGI: {
                    nome: 'Boi Gordo',
                    descricao: 'Contratos futuros de Boi Gordo - B3',
                    valorArroba: 330,
                    ativo: true,
                    referencias: [
                        'BGIJ25', 'BGIK25', 'BGIM25', 'BGIN25', 
                        'BGIQ25', 'BGIU25', 'BGIV25', 'BGIX25', 'BGIZ25'
                    ]
                },
                CCM: {
                    nome: 'Milho',
                    descricao: 'Contratos futuros de Milho - B3',
                    valorArroba: 450,
                    ativo: true,
                    referencias: [
                        'CCMH25', 'CCMK25', 'CCMM25', 'CCMN25', 
                        'CCMQ25', 'CCMU25', 'CCMV25', 'CCMX25', 'CCMZ25'
                    ]
                }
            },
            precos: {
                BGIJ25: 290.00,
                BGIK25: 292.50,
                BGIM25: 295.00,
                BGIN25: 297.50,
                BGIQ25: 300.00,
                BGIU25: 302.50,
                BGIV25: 305.00,
                BGIX25: 307.50,
                BGIZ25: 310.00,
                CCMH25: 65.00,
                CCMK25: 66.50,
                CCMM25: 67.00,
                CCMN25: 68.50,
                CCMQ25: 69.00,
                CCMU25: 70.50,
                CCMV25: 71.00,
                CCMX25: 72.50,
                CCMZ25: 73.00
            },
            relatorios: {
                salvos: [],
                configuracoes: {}
            },
            historico: {
                acoes: [],
                backups: []
            },
            estatisticas: {
                totalTransacoes: 0,
                valorTotalOperado: 0,
                resultadoAcumulado: 0,
                maiorGanho: 0,
                maiorPerda: 0
            }
        };
        
        this.debugLog('Sistema de armazenamento inicializado');
        this.migrarDadosParaNovaEstrutura();
    }
    
    debugLog(message, data = null) {
        console.log(`💾 [Storage] ${message}`, data || '');
    }
    
    // ===== OPERAÇÕES BÁSICAS =====
    
    /**
     * Carrega todos os dados do localStorage
     */
    carregarDados() {
        try {
            this.debugLog('Carregando dados do localStorage...');
            
            const dadosString = localStorage.getItem(this.STORAGE_KEY);
            
            if (!dadosString) {
                this.debugLog('Nenhum dado encontrado, usando estrutura padrão');
                return this.criarEstruturaPadrao();
            }
            
            const dados = JSON.parse(dadosString);
            
            // Verificar versão e migrar se necessário
            if (dados.version !== this.VERSION) {
                this.debugLog(`Migrando dados da versão ${dados.version} para ${this.VERSION}`);
                dados = this.migrarDados(dados);
            }
            
            // Mesclar com estrutura padrão para garantir que todos os campos existam
            const dadosCompletos = this.mesclarComEstruturaPadrao(dados);
            
            this.debugLog('Dados carregados com sucesso', {
                transacoes: dadosCompletos.transacoes.length,
                posicoes: dadosCompletos.posicoesAbertas.length,
                ultimoSalvamento: dadosCompletos.lastSaved
            });
            
            return dadosCompletos;
            
        } catch (error) {
            this.debugLog('ERRO ao carregar dados: ' + error.message);
            console.error('Erro completo:', error);
            
            // Tentar recuperar backup
            const backup = this.recuperarBackup();
            if (backup) {
                this.debugLog('Dados recuperados do backup');
                return backup;
            }
            
            // Se não conseguir recuperar, usar estrutura padrão
            this.debugLog('Usando estrutura padrão devido a erro');
            return this.criarEstruturaPadrao();
        }
    }
    
    /**
     * Salva todos os dados no localStorage
     */
    salvarDados(dados) {
        try {
            this.debugLog('Salvando dados no localStorage...');
            
            // Adicionar metadados de salvamento
            dados.version = this.VERSION;
            dados.lastSaved = new Date().toISOString();
            
            // Criar backup antes de salvar
            if (dados.configuracoes?.backupAutomatico !== false) {
                this.criarBackup();
            }
            
            // Validar dados antes de salvar
            const dadosValidados = this.validarDados(dados);
            
            // Salvar no localStorage
            const dadosString = JSON.stringify(dadosValidados);
            localStorage.setItem(this.STORAGE_KEY, dadosString);
            
            // Atualizar estatísticas
            this.atualizarEstatisticas(dadosValidados);
            
            // Registrar ação no histórico
            this.registrarAcao('dados_salvos', {
                timestamp: new Date().toISOString(),
                tamanho: dadosString.length,
                transacoes: dadosValidados.transacoes.length
            });
            
            this.debugLog('Dados salvos com sucesso', {
                tamanho: dadosString.length + ' caracteres',
                transacoes: dadosValidados.transacoes.length
            });
            
            return true;
            
        } catch (error) {
            this.debugLog('ERRO ao salvar dados: ' + error.message);
            console.error('Erro completo:', error);
            return false;
        }
    }
    
    // ===== SISTEMA DE BACKUP =====
    
    /**
     * Cria backup dos dados atuais
     */
    criarBackup() {
        try {
            const dadosAtuais = localStorage.getItem(this.STORAGE_KEY);
            if (dadosAtuais) {
                const backup = {
                    timestamp: new Date().toISOString(),
                    version: this.VERSION,
                    data: dadosAtuais
                };
                
                localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
                this.debugLog('Backup criado com sucesso');
                return true;
            }
        } catch (error) {
            this.debugLog('Erro ao criar backup: ' + error.message);
            return false;
        }
    }
    
    /**
     * Recupera dados do backup
     */
    recuperarBackup() {
        try {
            const backupString = localStorage.getItem(this.BACKUP_KEY);
            if (backupString) {
                const backup = JSON.parse(backupString);
                const dados = JSON.parse(backup.data);
                
                this.debugLog('Backup recuperado', {
                    timestamp: backup.timestamp,
                    version: backup.version
                });
                
                return dados;
            }
            return null;
        } catch (error) {
            this.debugLog('Erro ao recuperar backup: ' + error.message);
            return null;
        }
    }
    
    // ===== GESTÃO DE DADOS ESPECÍFICOS =====
    
    /**
     * Salva uma transação específica
     */
    salvarTransacao(transacao) {
        const dados = this.carregarDados();
        
        // Adicionar ID único se não existir
        if (!transacao.id) {
            transacao.id = this.gerarId();
        }
        
        // Adicionar timestamp de criação
        transacao.criadoEm = new Date().toISOString();
        
        dados.transacoes.push(transacao);
        
        this.registrarAcao('transacao_adicionada', {
            id: transacao.id,
            referencia: transacao.referencia,
            tipo: transacao.tipo,
            valor: transacao.contratos * transacao.preco
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Remove uma transação específica
     */
    removerTransacao(transacaoId) {
        const dados = this.carregarDados();
        const indice = dados.transacoes.findIndex(t => t.id === transacaoId);
        
        if (indice >= 0) {
            const transacaoRemovida = dados.transacoes.splice(indice, 1)[0];
            
            this.registrarAcao('transacao_removida', {
                id: transacaoRemovida.id,
                referencia: transacaoRemovida.referencia
            });
            
            return this.salvarDados(dados);
        }
        
        return false;
    }
    
    /**
     * Salva configurações do usuário
     */
    salvarConfiguracoes(novasConfiguracoes) {
        const dados = this.carregarDados();
        dados.configuracoes = { ...dados.configuracoes, ...novasConfiguracoes };
        
        this.registrarAcao('configuracoes_atualizadas', {
            campos: Object.keys(novasConfiguracoes)
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Salva informações do usuário
     */
    salvarInformacoesUsuario(infoUsuario) {
        const dados = this.carregarDados();
        dados.userData = { ...dados.userData, ...infoUsuario };
        
        this.registrarAcao('info_usuario_atualizada', {
            campos: Object.keys(infoUsuario)
        });
        
        return this.salvarDados(dados);
    }
    
    // ===== EXPORTAR/IMPORTAR =====
    
    /**
     * Exporta todos os dados como JSON
     */
    exportarDados() {
        try {
            const dados = this.carregarDados();
            const dataExport = {
                ...dados,
                exportadoEm: new Date().toISOString(),
                exportadoPor: 'ACEX Capital Markets v' + this.VERSION
            };
            
            const blob = new Blob([JSON.stringify(dataExport, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `boi-gordo-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.registrarAcao('dados_exportados', {
                timestamp: dataExport.exportadoEm,
                transacoes: dados.transacoes.length
            });
            
            this.debugLog('Dados exportados com sucesso');
            return true;
            
        } catch (error) {
            this.debugLog('Erro ao exportar dados: ' + error.message);
            return false;
        }
    }
    
    /**
     * Importa dados de um arquivo JSON
     */
    async importarDados(arquivo) {
        try {
            const texto = await arquivo.text();
            const dadosImportados = JSON.parse(texto);
            
            // Validar estrutura dos dados importados
            if (!this.validarEstruturaDados(dadosImportados)) {
                throw new Error('Arquivo não possui estrutura válida');
            }
            
            // Fazer backup antes de importar
            this.criarBackup();
            
            // Salvar dados importados
            const sucesso = this.salvarDados(dadosImportados);
            
            if (sucesso) {
                this.registrarAcao('dados_importados', {
                    arquivo: arquivo.name,
                    timestamp: new Date().toISOString(),
                    transacoes: dadosImportados.transacoes?.length || 0
                });
                
                this.debugLog('Dados importados com sucesso');
            }
            
            return sucesso;
            
        } catch (error) {
            this.debugLog('Erro ao importar dados: ' + error.message);
            throw error;
        }
    }
    
    // ===== LIMPEZA E MANUTENÇÃO =====
    
    /**
     * Limpa todos os dados armazenados
     */
    limparTodosDados() {
        try {
            // Criar backup final antes de limpar
            this.criarBackup();
            
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.CONFIG_KEY);
            
            this.debugLog('Todos os dados foram limpos');
            return true;
            
        } catch (error) {
            this.debugLog('Erro ao limpar dados: ' + error.message);
            return false;
        }
    }
    
    /**
     * Otimiza o armazenamento removendo dados antigos
     */
    otimizarArmazenamento() {
        try {
            const dados = this.carregarDados();
            
            // Limitar histórico de ações (manter apenas últimas 100)
            if (dados.historico.acoes.length > 100) {
                dados.historico.acoes = dados.historico.acoes.slice(-100);
            }
            
            // Remover backups muito antigos do histórico
            const umMesAtras = new Date();
            umMesAtras.setMonth(umMesAtras.getMonth() - 1);
            
            dados.historico.backups = dados.historico.backups.filter(
                backup => new Date(backup.timestamp) > umMesAtras
            );
            
            this.salvarDados(dados);
            
            this.debugLog('Armazenamento otimizado');
            return true;
            
        } catch (error) {
            this.debugLog('Erro ao otimizar armazenamento: ' + error.message);
            return false;
        }
    }
    
    // ===== UTILITÁRIOS =====
    
    criarEstruturaPadrao() {
        return JSON.parse(JSON.stringify(this.defaultData));
    }
    
    mesclarComEstruturaPadrao(dados) {
        const estruturaPadrao = this.criarEstruturaPadrao();
        return this.mergeDeep(estruturaPadrao, dados);
    }
    
    mergeDeep(target, source) {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    validarDados(dados) {
        // Validações básicas
        if (!dados.transacoes) dados.transacoes = [];
        if (!dados.posicoesAbertas) dados.posicoesAbertas = [];
        if (!dados.posicoesLiquidadas) dados.posicoesLiquidadas = [];
        if (!dados.configuracoes) dados.configuracoes = this.defaultData.configuracoes;
        if (!dados.userData) dados.userData = this.defaultData.userData;
        
        return dados;
    }
    
    validarEstruturaDados(dados) {
        return dados && 
               typeof dados === 'object' && 
               Array.isArray(dados.transacoes);
    }
    
    migrarDados(dadosAntigos) {
        // Implementar migrações de versão aqui
        const dadosMigrados = { ...dadosAntigos };
        dadosMigrados.version = this.VERSION;
        
        this.debugLog('Migração de dados concluída');
        return dadosMigrados;
    }
    
    atualizarEstatisticas(dados) {
        if (!dados.estatisticas) dados.estatisticas = {};
        
        dados.estatisticas.totalTransacoes = dados.transacoes.length;
        dados.estatisticas.valorTotalOperado = dados.transacoes.reduce((total, t) => {
            return total + (t.contratos * t.preco * 330);
        }, 0);
        
        // Outras estatísticas podem ser calculadas aqui
    }
    
    // ===== GESTÃO DE TIPOS DE CONTRATO =====
    
    /**
     * Obtém todos os tipos de contrato
     */
    getTiposContrato() {
        const dados = this.carregarDados();
        return dados.tiposContrato || {};
    }
    
    /**
     * Obtém apenas tipos de contrato ativos
     */
    getTiposContratoAtivos() {
        const tipos = this.getTiposContrato();
        return Object.keys(tipos).filter(key => tipos[key].ativo).reduce((ativos, key) => {
            ativos[key] = tipos[key];
            return ativos;
        }, {});
    }
    
    /**
     * Cria um novo tipo de contrato
     */
    criarTipoContrato(codigo, dadosTipo) {
        const dados = this.carregarDados();
        
        if (!dados.tiposContrato) dados.tiposContrato = {};
        
        // Validar dados
        if (!dadosTipo.nome || !dadosTipo.valorArroba) {
            this.debugLog('Erro: dados do tipo de contrato incompletos');
            return false;
        }
        
        dados.tiposContrato[codigo] = {
            nome: dadosTipo.nome,
            descricao: dadosTipo.descricao || '',
            valorArroba: parseFloat(dadosTipo.valorArroba),
            ativo: dadosTipo.ativo !== false,
            referencias: dadosTipo.referencias || [],
            criadoEm: new Date().toISOString()
        };
        
        this.registrarAcao('tipo_contrato_criado', {
            codigo: codigo,
            nome: dadosTipo.nome
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Atualiza um tipo de contrato existente
     */
    atualizarTipoContrato(codigo, dadosTipo) {
        const dados = this.carregarDados();
        
        if (!dados.tiposContrato || !dados.tiposContrato[codigo]) {
            this.debugLog('Erro: tipo de contrato não encontrado');
            return false;
        }
        
        dados.tiposContrato[codigo] = {
            ...dados.tiposContrato[codigo],
            ...dadosTipo,
            modificadoEm: new Date().toISOString()
        };
        
        this.registrarAcao('tipo_contrato_atualizado', {
            codigo: codigo,
            alteracoes: Object.keys(dadosTipo)
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Remove um tipo de contrato
     */
    removerTipoContrato(codigo) {
        const dados = this.carregarDados();
        
        if (!dados.tiposContrato || !dados.tiposContrato[codigo]) {
            this.debugLog('Erro: tipo de contrato não encontrado');
            return false;
        }
        
        // Verificar se há transações usando este tipo
        const referenciasDeste = dados.tiposContrato[codigo].referencias || [];
        const transacoesUsando = dados.transacoes.filter(t => 
            referenciasDeste.includes(t.referencia)
        );
        
        if (transacoesUsando.length > 0) {
            this.debugLog(`Erro: não pode remover tipo com ${transacoesUsando.length} transações`);
            return false;
        }
        
        delete dados.tiposContrato[codigo];
        
        this.registrarAcao('tipo_contrato_removido', {
            codigo: codigo
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Adiciona uma referência a um tipo de contrato
     */
    adicionarReferencia(codigoTipo, referencia, precoInicial = 0) {
        const dados = this.carregarDados();
        
        if (!dados.tiposContrato || !dados.tiposContrato[codigoTipo]) {
            this.debugLog('Erro: tipo de contrato não encontrado');
            return false;
        }
        
        if (!dados.tiposContrato[codigoTipo].referencias) {
            dados.tiposContrato[codigoTipo].referencias = [];
        }
        
        // Verificar se referência já existe
        if (dados.tiposContrato[codigoTipo].referencias.includes(referencia)) {
            this.debugLog('Erro: referência já existe neste tipo');
            return false;
        }
        
        dados.tiposContrato[codigoTipo].referencias.push(referencia);
        
        // Adicionar preço inicial se fornecido
        if (precoInicial > 0) {
            if (!dados.precos) dados.precos = {};
            dados.precos[referencia] = precoInicial;
        }
        
        this.registrarAcao('referencia_adicionada', {
            tipo: codigoTipo,
            referencia: referencia,
            precoInicial: precoInicial
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Remove uma referência de um tipo de contrato
     */
    removerReferencia(codigoTipo, referencia) {
        const dados = this.carregarDados();
        
        if (!dados.tiposContrato || !dados.tiposContrato[codigoTipo]) {
            this.debugLog('Erro: tipo de contrato não encontrado');
            return false;
        }
        
        // Verificar se há transações usando esta referência
        const transacoesUsando = dados.transacoes.filter(t => t.referencia === referencia);
        if (transacoesUsando.length > 0) {
            this.debugLog(`Erro: não pode remover referência com ${transacoesUsando.length} transações`);
            return false;
        }
        
        // Remover da lista de referências
        dados.tiposContrato[codigoTipo].referencias = 
            dados.tiposContrato[codigoTipo].referencias.filter(r => r !== referencia);
        
        // Remover preço se existir
        if (dados.precos && dados.precos[referencia]) {
            delete dados.precos[referencia];
        }
        
        this.registrarAcao('referencia_removida', {
            tipo: codigoTipo,
            referencia: referencia
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Renomeia uma referência existente
     */
    renomearReferencia(codigoReferencia, novoNome) {
        const dados = this.carregarDados();
        
        if (!dados.nomesPersonalizados) dados.nomesPersonalizados = {};
        
        // Salvar nome personalizado
        dados.nomesPersonalizados[codigoReferencia] = novoNome;
        
        this.registrarAcao('referencia_renomeada', {
            referencia: codigoReferencia,
            novoNome: novoNome
        });
        
        return this.salvarDados(dados);
    }
    
    /**
     * Obtém nome personalizado de uma referência
     */
    getNomePersonalizado(codigoReferencia) {
        const dados = this.carregarDados();
        if (dados.nomesPersonalizados && dados.nomesPersonalizados[codigoReferencia]) {
            return dados.nomesPersonalizados[codigoReferencia];
        }
        return codigoReferencia; // Retorna código original se não há nome personalizado
    }
    
    /**
     * Obtém todas as referências ativas no sistema
     */
    getReferenciasTodas() {
        const tipos = this.getTiposContratoAtivos();
        const referencias = [];
        
        Object.values(tipos).forEach(tipo => {
            if (tipo.referencias) {
                referencias.push(...tipo.referencias);
            }
        });
        
        return referencias;
    }
    
    /**
     * Obtém valor da arroba para uma referência específica
     */
    getValorArrobaPorReferencia(referencia) {
        const tipos = this.getTiposContrato();
        
        for (const [codigo, tipo] of Object.entries(tipos)) {
            if (tipo.referencias && tipo.referencias.includes(referencia)) {
                return tipo.valorArroba;
            }
        }
        
        return 330; // Valor padrão (BGI)
    }
    
    /**
     * Obtém tipo de contrato por referência
     */
    getTipoContratoByReferencia(referencia) {
        const tipos = this.getTiposContrato();
        
        for (const [codigo, tipo] of Object.entries(tipos)) {
            if (tipo.referencias && tipo.referencias.includes(referencia)) {
                return { codigo, ...tipo };
            }
        }
        
        return null;
    }
    
    /**
     * Migração automática para nova estrutura BGI/CCM
     */
    migrarDadosParaNovaEstrutura() {
        try {
            const dados = this.carregarDados();
            let migracaoRealizada = false;

            // Verificar se BGI ainda está como "Ativos" ou CCM inativo
            if (dados.tiposContrato) {
                if (dados.tiposContrato.BGI && dados.tiposContrato.BGI.nome === 'Ativos') {
                    dados.tiposContrato.BGI.nome = 'Boi Gordo';
                    dados.tiposContrato.BGI.descricao = 'Contratos futuros de Boi Gordo - B3';
                    migracaoRealizada = true;
                    this.debugLog('✅ BGI migrado de "Ativos" para "Boi Gordo"');
                }

                if (dados.tiposContrato.CCM && dados.tiposContrato.CCM.ativo === false) {
                    dados.tiposContrato.CCM.ativo = true;
                    migracaoRealizada = true;
                    this.debugLog('✅ CCM ativado no sistema');
                }

                // Adicionar preços CCM se não existirem
                if (!dados.precos) dados.precos = {};
                const precosCCM = {
                    'CCMH25': 65.00, 'CCMK25': 66.50, 'CCMM25': 67.00, 'CCMN25': 68.50,
                    'CCMQ25': 69.00, 'CCMU25': 70.50, 'CCMV25': 71.00, 'CCMX25': 72.50, 'CCMZ25': 73.00
                };

                Object.entries(precosCCM).forEach(([ref, preco]) => {
                    if (!dados.precos[ref]) {
                        dados.precos[ref] = preco;
                        migracaoRealizada = true;
                    }
                });

                if (migracaoRealizada) {
                    this.salvarDados(dados);
                    this.registrarAcao('migracao_bgi_ccm', {
                        'BGI': 'Ativos → Boi Gordo',
                        'CCM': 'Inativo → Ativo',
                        'precos': 'Adicionados preços CCM'
                    });
                    this.debugLog('🔄 Migração BGI/CCM concluída com sucesso');
                }
            }
        } catch (error) {
            this.debugLog('Erro na migração BGI/CCM:', error);
        }
    }
    
    registrarAcao(acao, detalhes = {}) {
        try {
            const dados = this.carregarDados();
            
            if (!dados.historico) dados.historico = { acoes: [], backups: [] };
            if (!dados.historico.acoes) dados.historico.acoes = [];
            
            dados.historico.acoes.push({
                acao,
                timestamp: new Date().toISOString(),
                detalhes
            });
            
            // Limitar a 50 ações mais recentes para não sobrecarregar
            if (dados.historico.acoes.length > 50) {
                dados.historico.acoes = dados.historico.acoes.slice(-50);
            }
            
            // Salvar sem registrar nova ação (evitar recursão)
            const dadosString = JSON.stringify(dados);
            localStorage.setItem(this.STORAGE_KEY, dadosString);
            
        } catch (error) {
            // Falha silenciosa para não interromper outras operações
            console.warn('Erro ao registrar ação:', error);
        }
    }
    
    gerarId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    // ===== MÉTODOS DE STATUS =====
    
    /**
     * Retorna informações sobre o armazenamento
     */
    getStatusArmazenamento() {
        try {
            const dados = this.carregarDados();
            const dadosString = JSON.stringify(dados);
            
            return {
                tamanhoTotal: dadosString.length,
                tamanhoFormatado: this.formatarTamanho(dadosString.length),
                totalTransacoes: dados.transacoes?.length || 0,
                totalPosicoes: dados.posicoesAbertas?.length || 0,
                ultimoSalvamento: dados.lastSaved,
                versao: dados.version,
                temBackup: localStorage.getItem(this.BACKUP_KEY) !== null
            };
        } catch (error) {
            return {
                erro: error.message,
                tamanhoTotal: 0,
                totalTransacoes: 0
            };
        }
    }
    
    formatarTamanho(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Instanciar e exportar o gerenciador
window.StorageManager = new BoiGordoStorageManager();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoiGordoStorageManager;
}

console.log('✅ [Storage] Sistema de Armazenamento Local inicializado'); 
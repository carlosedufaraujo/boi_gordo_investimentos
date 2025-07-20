// Imports dos módulos core
import EventBus from './core/EventBus.js';
import StateManager from './core/StateManager.js';
import DataService from './services/DataService.js';

// Imports dos componentes
import BaseComponent from './components/BaseComponent.js';
import Modal from './components/Modal.js';
import Table from './components/Table.js';

// Imports dos utilitários
import { Utils } from './utils/Utils.js';
import CONFIG, { 
    APP_CONFIG, 
    EVENTS, 
    THEMES,
    NOTIFICATION_TYPES,
    COLORS 
} from './config/Constants.js';

/**
 * Classe Principal da Aplicação BGI Investimentos
 * Orquestra toda a arquitetura e componentes
 */
class App {
    constructor() {
        this.initialized = false;
        this.components = new Map();
        this.middleware = [];
        
        // Configurar debug se habilitado
        if (APP_CONFIG.debug) {
            this.setupDebugMode();
        }

        this.init();
    }

    /**
     * Inicialização principal da aplicação
     */
    async init() {
        try {
            console.log(`🚀 Inicializando ${APP_CONFIG.name} v${APP_CONFIG.version}`);
            
            // 1. Configurar sistema de eventos
            this.setupEventSystem();
            
            // 2. Inicializar gerenciador de estado
            await this.initializeStateManager();
            
            // 3. Carregar dados
            await this.loadApplicationData();
            
            // 4. Inicializar componentes da interface
            this.initializeComponents();
            
            // 5. Configurar roteamento de abas
            this.setupNavigation();
            
            // 6. Configurar tema
            this.setupTheme();
            
            // 7. Configurar auto-save
            this.setupAutoSave();
            
            // 8. Registrar service worker (se disponível)
            this.registerServiceWorker();
            
            this.initialized = true;
            EventBus.emit(EVENTS.APP_INITIALIZED, { timestamp: Date.now() });
            
            console.log('✅ Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Configurar sistema de eventos global
     */
    setupEventSystem() {
        if (APP_CONFIG.debug) {
            EventBus.setDebug(true);
        }

        // Eventos de dados
        EventBus.on(EVENTS.DATA_LOADED, (data) => {
            console.log('📊 Dados carregados:', data);
            StateManager.setState({
                'transacoes': data.transacoes || [],
                'config': data.config || {}
            });
        });

        EventBus.on(EVENTS.DATA_SAVED, () => {
            this.showNotification('Dados salvos com sucesso!', NOTIFICATION_TYPES.SUCCESS);
        });

        // Eventos de transação
        EventBus.on(EVENTS.TRANSACTION_ADDED, (transacao) => {
            StateManager.addTransacao(transacao);
            StateManager.computePosicoes();
            this.showNotification('Transação adicionada!', NOTIFICATION_TYPES.SUCCESS);
        });

        // Eventos de tema
        EventBus.on(EVENTS.THEME_CHANGED, (theme) => {
            this.applyTheme(theme);
            Utils.saveToStorage('app-theme', theme);
        });

        // Evento de erro global
        window.addEventListener('error', (event) => {
            console.error('Erro global capturado:', event.error);
            this.handleGlobalError(event.error);
        });
    }

    /**
     * Inicializar gerenciador de estado
     */
    async initializeStateManager() {
        // Middleware para log de mudanças
        StateManager.use((updates, oldState) => {
            if (APP_CONFIG.debug) {
                console.log('🔄 Estado atualizado:', updates);
            }
            return updates;
        });

        // Middleware para validação
        StateManager.use((updates, oldState) => {
            if (updates.transacoes) {
                updates.transacoes = updates.transacoes.filter(t => 
                    DataService.validateTransacao(t).isValid
                );
            }
            return updates;
        });

        // Middleware para auto-save
        StateManager.use((updates, oldState) => {
            if (APP_CONFIG.autoSave) {
                this.scheduleSave();
            }
            return updates;
        });
    }

    /**
     * Carregar dados da aplicação
     */
    async loadApplicationData() {
        try {
            EventBus.emit(EVENTS.LOADING_STARTED);
            
            const data = await DataService.loadData();
            EventBus.emit(EVENTS.DATA_LOADED, data);
            
            // Inicializar estado com dados carregados
            StateManager.setState({
                'transacoes': data.transacoes || [],
                'config': { ...APP_CONFIG, ...data.config }
            });
            
            // Calcular posições iniciais
            StateManager.computePosicoes();
            
            EventBus.emit(EVENTS.LOADING_FINISHED);
            
        } catch (error) {
            EventBus.emit(EVENTS.DATA_ERROR, error);
            throw error;
        }
    }

    /**
     * Inicializar componentes da interface
     */
    initializeComponents() {
        // Modal de nova transação
        const modalElement = document.getElementById('modal-nova-transacao');
        if (modalElement) {
            const modal = new Modal(modalElement, {
                size: 'medium',
                closeOnEscape: true,
                autoFocus: true
            });
            
            this.components.set('transaction-modal', modal);
            window.TransactionModal = modal; // Compatibilidade global
        }

        // Tabela de transações
        const transacoesTable = document.getElementById('transacoes-tabela');
        if (transacoesTable?.closest('.table-container')) {
            const table = new Table(transacoesTable.closest('.table-container'), {
                columns: [
                    { key: 'data', label: 'Data', type: 'date', sortable: true },
                    { key: 'referencia', label: 'Referência', sortable: true },
                    { 
                        key: 'quantidade', 
                        label: 'Qtd', 
                        sortable: true,
                        formatter: (value) => {
                            const color = value > 0 ? 'text-success' : 'text-danger';
                            const sign = value > 0 ? '+' : '';
                            return `<span class="${color}">${sign}${value}</span>`;
                        }
                    },
                    { key: 'preco', label: 'Preço', type: 'currency', sortable: true },
                    { 
                        key: 'total', 
                        label: 'Total', 
                        type: 'currency',
                        formatter: (value, row) => Utils.formatCurrency(row.quantidade * row.preco)
                    }
                ],
                sortable: true,
                paginated: true,
                pageSize: 10,
                emptyMessage: 'Nenhuma transação registrada'
            });
            
            this.components.set('transactions-table', table);
            
            // Sincronizar com estado
            StateManager.subscribe('transacoes', (transacoes) => {
                table.setData(transacoes);
            });
        }

        // Tabela de posições
        const posicoesTable = document.getElementById('posicoes-tabela');
        if (posicoesTable?.closest('.table-container')) {
            const table = new Table(posicoesTable.closest('.table-container'), {
                columns: [
                    { key: 'referencia', label: 'Referência', sortable: true },
                    { 
                        key: 'quantidadeNet', 
                        label: 'Posição', 
                        sortable: true,
                        formatter: (value) => {
                            const color = value > 0 ? 'text-success' : 'text-danger';
                            const direction = value > 0 ? 'Long' : 'Short';
                            return `<span class="${color}">${Math.abs(value)} ${direction}</span>`;
                        }
                    },
                    { key: 'precoMedio', label: 'Preço Médio', type: 'currency', sortable: true },
                    { key: 'valorTotal', label: 'Valor Total', type: 'currency', sortable: true }
                ],
                sortable: true,
                emptyMessage: 'Nenhuma posição em aberto'
            });
            
            this.components.set('positions-table', table);
            
            // Sincronizar com estado
            StateManager.subscribe('posicoes', (posicoes) => {
                table.setData(posicoes);
            });
        }

        console.log(`📦 ${this.components.size} componentes inicializados`);
    }

    /**
     * Configurar navegação entre abas
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('[data-tab]');
        const tabContents = document.querySelectorAll('[data-tab-content]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = link.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Tab inicial
        const initialTab = StateManager.getState('app.currentTab') || 'resumo';
        this.switchTab(initialTab);
    }

    /**
     * Alternar entre abas
     */
    switchTab(tabName) {
        // Atualizar estado
        StateManager.setState({
            'app.currentTab': tabName
        });

        // Atualizar interface
        const navLinks = document.querySelectorAll('[data-tab]');
        const tabContents = document.querySelectorAll('[data-tab-content]');

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tabName);
        });

        tabContents.forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabName);
        });

        EventBus.emit(EVENTS.TAB_CHANGED, { tab: tabName });
        console.log(`📑 Mudou para aba: ${tabName}`);
    }

    /**
     * Configurar sistema de temas
     */
    setupTheme() {
        // Carregar tema salvo ou usar padrão
        const savedTheme = Utils.loadFromStorage('app-theme', APP_CONFIG.defaultTheme);
        this.applyTheme(savedTheme);

        // Botão de alternância de tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = StateManager.getState('app.theme');
                const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
                EventBus.emit(EVENTS.THEME_CHANGED, newTheme);
            });
        }

        // Escutar mudanças do sistema
        Utils.watchSystemTheme(() => {
            const systemTheme = Utils.getSystemTheme();
            if (StateManager.getState('config.followSystemTheme')) {
                EventBus.emit(EVENTS.THEME_CHANGED, systemTheme);
            }
        });
    }

    /**
     * Aplicar tema
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        StateManager.setState({
            'app.theme': theme
        });

        // Atualizar botão de tema
        const themeToggle = document.getElementById('theme-toggle');
        const themeText = document.getElementById('theme-text');
        const themeIcon = themeToggle?.querySelector('i');

        if (themeToggle && themeText && themeIcon) {
            if (theme === THEMES.DARK) {
                themeIcon.className = 'fas fa-sun';
                themeText.textContent = 'Claro';
            } else {
                themeIcon.className = 'fas fa-moon';
                themeText.textContent = 'Escuro';
            }
        }

        console.log(`🎨 Tema aplicado: ${theme}`);
    }

    /**
     * Configurar auto-save
     */
    setupAutoSave() {
        if (!APP_CONFIG.autoSave) return;

        this.saveTimeout = null;
        
        // Função para agendar salvamento
        this.scheduleSave = Utils.debounce(async () => {
            try {
                const state = StateManager.getState();
                await DataService.saveData({
                    transacoes: state.transacoes,
                    config: state.config
                });
                
                console.log('💾 Auto-save executado');
            } catch (error) {
                console.error('❌ Erro no auto-save:', error);
            }
        }, APP_CONFIG.autoSaveDelay);
    }

    /**
     * Registrar service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('🔧 Service Worker registrado:', registration);
            } catch (error) {
                console.log('❌ Falha ao registrar Service Worker:', error);
            }
        }
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = NOTIFICATION_TYPES.INFO, duration = APP_CONFIG.notificationDuration) {
        // Implementação simples de notificação
        // Em uma versão mais robusta, seria um componente dedicado
        const notification = Utils.createElement('div', {
            className: `notification notification-${type}`,
            dataset: { type }
        }, `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `);

        // Container de notificações
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = Utils.createElement('div', {
                id: 'notifications-container',
                className: 'notifications-container'
            });
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Remover após duração especificada
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        console.log(`📢 Notificação [${type}]: ${message}`);
    }

    /**
     * Utilitários
     */
    getNotificationIcon(type) {
        const icons = {
            [NOTIFICATION_TYPES.SUCCESS]: 'check-circle',
            [NOTIFICATION_TYPES.ERROR]: 'exclamation-circle',
            [NOTIFICATION_TYPES.WARNING]: 'exclamation-triangle',
            [NOTIFICATION_TYPES.INFO]: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Tratamento de erros
     */
    handleInitializationError(error) {
        console.error('Erro crítico na inicialização:', error);
        
        // Mostrar mensagem de erro amigável
        const errorContainer = document.getElementById('app-container') || document.body;
        errorContainer.innerHTML = `
            <div class="error-screen">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h2>Erro ao Inicializar</h2>
                    <p>Ocorreu um erro ao carregar a aplicação.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Recarregar Página
                    </button>
                </div>
            </div>
        `;
    }

    handleGlobalError(error) {
        if (APP_CONFIG.debug) {
            this.showNotification(
                `Erro: ${error.message}`, 
                NOTIFICATION_TYPES.ERROR
            );
        }
    }

    /**
     * Debug mode
     */
    setupDebugMode() {
        console.log('🐛 Modo debug ativado');
        
        // Expor instâncias globais para debug
        window.App = this;
        window.EventBus = EventBus;
        window.StateManager = StateManager;
        window.DataService = DataService;
        window.Utils = Utils;
        window.CONFIG = CONFIG;

        // Comando de debug
        window.debug = {
            state: () => StateManager.debugState(),
            events: () => EventBus.setDebug(true),
            components: () => console.log('Components:', this.components),
            reload: () => window.location.reload(),
            clear: () => {
                Utils.clearStorage();
                window.location.reload();
            }
        };

        console.log('💡 Digite "debug" no console para ver comandos disponíveis');
    }

    /**
     * Métodos públicos da API
     */
    
    // Adicionar transação (compatibilidade)
    async adicionarTransacao(transacao) {
        const validation = DataService.validateTransacao(transacao);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        EventBus.emit(EVENTS.TRANSACTION_ADDED, transacao);
    }

    // Exportar dados
    async exportarDados(format = 'json') {
        try {
            const exportData = await DataService.exportData(format);
            Utils.downloadFile(exportData.data, exportData.filename, exportData.mimeType);
            EventBus.emit('data:exported', { format });
        } catch (error) {
            this.showNotification('Erro ao exportar dados', NOTIFICATION_TYPES.ERROR);
            throw error;
        }
    }

    // Alternar tema (compatibilidade)
    alternarTema() {
        const themeButton = document.getElementById('theme-toggle');
        if (themeButton) {
            themeButton.click();
        }
    }

    // Obter estado atual
    getState(path = null) {
        return StateManager.getState(path);
    }

    // Destruir aplicação
    destroy() {
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        
        this.components.clear();
        EventBus.clear();
        this.initialized = false;
        
        console.log('🗑️ Aplicação destruída');
    }
}

// Inicializar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AppInstance = new App();
    });
} else {
    window.AppInstance = new App();
}

// Export para uso como módulo
export default App;
# 📊 **ANÁLISE COMPLETA - MODELO DE CÁLCULO DO SISTEMA**

## 🎯 **VISÃO GERAL DO MODELO**

O **Boi Gordo Investimentos** utiliza um **modelo de cálculo financeiro específico para contratos futuros de boi gordo**, baseado no valor da arroba e no sistema de posições long/short.

---

## 🔢 **CONSTANTES FUNDAMENTAIS**

### **Valores Base:**
```javascript
const ARROBA_VALOR = 330;  // Cada arroba vale R$ 330,00
const REFERENCIAS = [       // Contratos disponíveis
    'BGIJ25', 'BGIK25', 'BGIM25', 'BGIN25', 
    'BGIQ25', 'BGIU25', 'BGIV25', 'BGIX25', 'BGIZ25'
];
```

### **Conceito Fundamental:**
- **1 Contrato = 330 Arrobas**
- **1 Arroba = R$ 330,00 (valor base para cálculos)**
- **Valor Nominal por Contrato = R$ 108.900,00**

---

## 💰 **FLUXO COMPLETO: NOVA TRANSAÇÃO → ATUALIZAÇÃO SISTEMA**

### **1️⃣ CADASTRO DE NOVA TRANSAÇÃO**

#### **Dados Coletados:**
```javascript
transacao = {
    id: Date.now().toString(),      // ID único baseado em timestamp
    data: "2024-01-15",            // Data da operação
    referencia: "BGIJ25",          // Código do contrato
    tipo: "Compra",                // "Compra" ou "Venda"  
    contratos: 10,                 // Quantidade de contratos
    preco: 290.50                  // Preço por arroba
}
```

#### **Validações Aplicadas:**
- ✅ Todos os campos são obrigatórios
- ✅ Contratos > 0
- ✅ Preço > 0
- ✅ Data válida
- ✅ Referência existe na lista

---

### **2️⃣ PROCESSAMENTO DA TRANSAÇÃO**

#### **A) Cálculo do Valor da Transação:**
```javascript
valorTransacao = contratos × preco × ARROBA_VALOR
// Exemplo: 10 × 290.50 × 330 = R$ 958.650,00
```

#### **B) Impacto na Posição:**
```javascript
// COMPRA: Adiciona contratos (posição long)
if (tipo === 'Compra') {
    posicao.contratos += transacao.contratos;
    posicao.valorTotal += transacao.contratos * transacao.preco;
}

// VENDA: Subtrai contratos (posição short ou reduz long)
if (tipo === 'Venda') {
    posicao.contratos -= transacao.contratos;
    posicao.valorTotal -= transacao.contratos * transacao.preco;
}
```

---

### **3️⃣ RECÁLCULO AUTOMÁTICO DE POSIÇÕES**

#### **A) Agrupamento por Referência:**
- Sistema processa **TODAS as transações** da mesma referência
- Calcula **posição líquida** (soma algébrica de compras e vendas)

#### **B) Cálculo do Preço Médio:**
```javascript
// FÓRMULA FUNDAMENTAL:
precoMedio = valorTotal ÷ contratos

// Exemplo prático:
// Transação 1: Compra 5 contratos @ R$ 290,00
// Transação 2: Compra 3 contratos @ R$ 295,00
// 
// valorTotal = (5 × 290) + (3 × 295) = 1.450 + 885 = 2.335
// contratos = 5 + 3 = 8
// precoMedio = 2.335 ÷ 8 = R$ 291,875
```

#### **C) Classificação de Posições:**
```javascript
if (contratos > 0)  → Posição LONG (comprada)
if (contratos < 0)  → Posição SHORT (vendida)  
if (contratos = 0)  → Posição FECHADA (removida das abertas)
```

---

### **4️⃣ CÁLCULOS DE RESULTADO**

#### **A) Resultado Não Realizado (Posições Abertas):**
```javascript
// POSIÇÃO LONG (comprada):
resultado = (precoAtual - precoMedio) × contratos × ARROBA_VALOR

// POSIÇÃO SHORT (vendida):
resultado = (precoMedio - precoAtual) × |contratos| × ARROBA_VALOR

// Exemplo LONG:
// Posição: 8 contratos @ R$ 291,875 (preço médio)
// Preço atual: R$ 295,00
// resultado = (295 - 291,875) × 8 × 330 = R$ 8.250,00
```

#### **B) Resultado Realizado (Liquidações):**
```javascript
// Mesmo cálculo, mas usando preço de liquidação
resultadoLiquidacao = (precoSaida - precoEntrada) × contratos × ARROBA_VALOR

// Para posições short, a fórmula se inverte:
resultadoShort = (precoEntrada - precoSaida) × contratos × ARROBA_VALOR
```

#### **C) Cálculo de Dias em Aberto:**
```javascript
dias = Math.floor((hoje - dataPrimeiraTransacao) / (1000 × 60 × 60 × 24))
```

---

### **5️⃣ MÉTRICAS AVANÇADAS CALCULADAS**

#### **A) Taxa de Acerto:**
```javascript
operacoesPositivas = posicoes.filter(pos => pos.resultado > 0).length
taxaAcerto = (operacoesPositivas ÷ totalOperacoes) × 100
```

#### **B) Fator de Lucro:**
```javascript
totalLucros = soma(resultados > 0)
totalPrejuizos = |soma(resultados ≤ 0)|
fatorLucro = totalLucros ÷ totalPrejuizos
```

#### **C) Spread Médio:**
```javascript
spreadMedio = soma(|precoSaida - precoEntrada|) ÷ numeroOperacoes
```

#### **D) Resultado por Contrato:**
```javascript
resultadoPorContrato = resultadoTotal ÷ totalContratos
```

---

### **6️⃣ PROPAGAÇÃO ENTRE PÁGINAS**

#### **A) Dashboard (Página Principal):**
- **Cards de Métricas**: Resultado acumulado, contratos liquidados, taxa de acerto
- **Gráficos Resumo**: Últimas 5 posições e transações
- **Preços Atuais**: Tabela com cotações configuráveis

#### **B) Página de Transações:**
- **Tabela Cronológica**: Ordenada por data (mais recentes primeiro)
- **Valor Total**: `contratos × preco × ARROBA_VALOR` para cada linha
- **Cor Condicional**: Compras em vermelho, vendas em verde

#### **C) Página de Posições Abertas:**
- **Resultado em Tempo Real**: Calculado vs preço atual
- **Dias em Aberto**: Atualizados automaticamente
- **Botões de Liquidação**: Com simulação de resultado

#### **D) Página de Posições Liquidadas:**
- **Métricas Históricas**: Spread médio, maior ganho/perda
- **Análise de Performance**: Por referência e estratégia
- **Gráficos Temporais**: Evolução dos resultados

---

## 🔄 **INTEGRAÇÕES E SINCRONIZAÇÃO**

### **Sistema de Auto-Save:**
- **Trigger**: Qualquer alteração nos dados
- **Frequência**: A cada 30 segundos + antes de fechar página
- **Escopo**: Todas as transações, posições e configurações

### **Atualização de Interface:**
```javascript
// SEQUÊNCIA AUTOMÁTICA após salvar transação:
1. atualizarPosicoes()       → Recalcula todas as posições
2. salvarDados()             → Persiste no localStorage/StorageManager  
3. atualizarInterface()      → Propaga para todas as seções
4. calcularMetricas()        → Recalcula indicadores
5. atualizarSecao()          → Atualiza seção ativa específica
```

### **Sistema de Backup:**
- **Backup Automático**: Antes de cada salvamento importante
- **Versionamento**: Controle automático de versões dos dados
- **Recuperação**: Sistema automático em caso de corrupção

---

## 📊 **FÓRMULAS MATEMÁTICAS RESUMIDAS**

### **Transação:**
```
valorTransacao = contratos × preço × 330
```

### **Posição:**
```
contratosLiquidos = Σ(compras) - Σ(vendas)
precoMedio = Σ(contratos × preço) ÷ contratosLiquidos
```

### **Resultado:**
```
// Long: 
resultado = (precoAtual - precoMedio) × contratos × 330

// Short:
resultado = (precoMedio - precoAtual) × |contratos| × 330
```

### **Métricas:**
```
taxaAcerto = (operacoesPositivas ÷ totalOperacoes) × 100
fatorLucro = totalLucros ÷ |totalPrejuizos|
```

---

## 🎯 **CARACTERÍSTICAS TÉCNICAS IMPORTANTES**

### **Tratamento de Precisão:**
- **Preços**: Decimais com 2 casas (centavos)
- **Cálculos**: JavaScript Number (64-bit float)
- **Exibição**: Formatação brasileira (R$ x.xxx,xx)

### **Lógica de Negócio:**
- **Posições Zeradas**: Automaticamente removidas das "abertas"
- **Preços Negativos**: Não permitidos (validação)
- **Contratos Fracionários**: Não permitidos (apenas inteiros)

### **Performance:**
- **Recálculo Completo**: A cada transação (garantia de consistência)
- **Cache**: AppState mantém dados em memória
- **Lazy Loading**: Gráficos carregam apenas quando necessário

---

## ✅ **RESULTADO FINAL**

O sistema implementa um **modelo completo de gestão de posições em futuros**, com:

✅ **Cálculos Matematicamente Corretos** para o mercado futuro  
✅ **Recálculo Automático** de todas as métricas a cada operação  
✅ **Sincronização Perfeita** entre todas as páginas e seções  
✅ **Persistência Robusta** com backup automático  
✅ **Interface Reativa** que reflete mudanças instantaneamente  

O modelo garante **consistência total** dos dados e **atualização em tempo real** de todos os cálculos e métricas em todas as páginas do sistema.

---

## 📈 **EXEMPLO PRÁTICO COMPLETO**

**Sequência de Operações:**
1. **Compra**: 10 contratos BGIJ25 @ R$ 290,00
2. **Compra**: 5 contratos BGIJ25 @ R$ 295,00  
3. **Venda**: 8 contratos BGIJ25 @ R$ 298,00

**Resultados Calculados:**
- **Posição Final**: 7 contratos LONG
- **Preço Médio**: R$ 291,67
- **Resultado Realizado**: R$ 13.200,00 (nos 8 vendidos)
- **Resultado Não Realizado**: R$ 14.438,10 (nos 7 restantes @ R$ 298,00)
- **Resultado Total**: R$ 27.638,10

**O sistema atualiza AUTOMATICAMENTE todas essas informações em TODAS as páginas!** 🚀 
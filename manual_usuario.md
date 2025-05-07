# Manual do Usuário - Aplicação de Gestão de Investimentos em Boi Gordo

Este manual detalhado explica como utilizar todas as funcionalidades da aplicação de Gestão de Investimentos em Boi Gordo após sua implantação no Cloudflare.

## Índice

1. [Introdução](#introdução)
2. [Acesso à Aplicação](#acesso-à-aplicação)
3. [Dashboard](#dashboard)
4. [Posições Abertas](#posições-abertas)
5. [Posições Liquidadas](#posições-liquidadas)
6. [Transações](#transações)
7. [Configurações](#configurações)
8. [Manutenção e Backup](#manutenção-e-backup)
9. [Solução de Problemas](#solução-de-problemas)

## Introdução

A aplicação de Gestão de Investimentos em Boi Gordo é uma ferramenta completa para acompanhar, analisar e gerenciar seus investimentos em contratos futuros de Boi Gordo na B3. Ela permite registrar transações, acompanhar posições abertas, analisar posições liquidadas e visualizar métricas de desempenho.

## Acesso à Aplicação

Após a implantação bem-sucedida no Cloudflare, sua aplicação estará disponível em um dos seguintes endereços:

- **URL padrão do Cloudflare Pages**: `https://boi-gordo-investimentos.pages.dev`
- **Seu domínio personalizado**: Se você configurou um domínio personalizado

### Primeiro Acesso

1. Abra o navegador e acesse o URL da aplicação
2. Se você configurou variáveis de ambiente para autenticação, faça login com as credenciais definidas
3. Caso contrário, você terá acesso direto à aplicação

## Dashboard

O Dashboard é a página inicial da aplicação e oferece uma visão geral do seu desempenho em investimentos de Boi Gordo.

### Cards Superiores

- **Resultado Acumulado**: Soma dos resultados de todas as posições liquidadas
- **Contratos Liquidados**: Quantidade total de contratos que foram liquidados
- **Taxa de Acerto**: Percentual de operações lucrativas em relação ao total
- **Fator de Lucro**: Relação entre ganhos totais e perdas totais (>1 indica lucratividade)

### Gráficos

- **Desempenho Mensal**: Visualização dos resultados mês a mês
  - Passe o mouse sobre as barras para ver os valores exatos
  - Clique na legenda para mostrar/ocultar séries

- **Desempenho por Estratégia**: Comparação entre operações de compra e venda
  - Clique nas fatias do gráfico para destacá-las
  - Veja a proporção de cada estratégia no seu resultado total

### Preços Atuais

Esta seção mostra os preços atuais de todos os contratos pré-cadastrados:

1. Para editar um preço, clique no botão "Editar" ao lado do contrato
2. Digite o novo preço no campo que aparece
3. Clique em "Salvar" para confirmar a alteração
4. Para atualizar todos os preços de uma vez, clique no botão "Atualizar Preços" no topo da página

### Resumos

- **Posições Abertas**: Visão rápida das suas posições em aberto
  - Clique em "Ver Todas" para acessar a página completa de Posições Abertas

- **Últimas Transações**: Registro das operações mais recentes
  - Clique em "Ver Todas" para acessar a página completa de Transações

## Posições Abertas

Esta seção permite gerenciar e analisar suas posições em aberto.

### Tabela de Posições

A tabela principal mostra todas as suas posições abertas com as seguintes informações:

- **Referência**: Código do contrato (ex: BGIJ25)
- **Tipo**: Compra (Long) ou Venda (Short)
- **Contratos**: Quantidade de contratos na posição
- **Preço Médio**: Preço médio ponderado de entrada
- **Preço Atual**: Preço atual do contrato (baseado nos preços que você definiu)
- **Resultado Potencial**: Ganho/perda estimado com o preço atual
- **Dias em Aberto**: Tempo desde a abertura da posição
- **Ações**: Botão "Liquidar" para encerrar a posição

Para liquidar uma posição:
1. Clique no botão "Liquidar" na linha da posição desejada
2. Confirme a operação no diálogo que aparece
3. A posição será movida para a seção de Posições Liquidadas

### Exposição por Referência

O gráfico de pizza mostra a distribuição percentual de cada contrato na sua carteira:
- Passe o mouse sobre as fatias para ver os detalhes
- Clique nas fatias para destacá-las
- Observe quais contratos representam maior exposição

### Simulação de Preço

Esta ferramenta permite simular resultados com diferentes cenários de preço:

1. Selecione a referência (contrato) que deseja simular
2. Ajuste o preço simulado usando o controle deslizante ou digitando diretamente
3. Clique em "Simular" para calcular o resultado potencial
4. O resultado da simulação aparecerá abaixo, mostrando o ganho ou perda estimado

## Posições Liquidadas

Esta seção apresenta análises detalhadas das posições encerradas.

### Métricas Principais

- **Taxa de Acerto**: Percentual de operações lucrativas
- **Fator de Lucro**: Relação entre ganhos e perdas
- **Payoff**: Relação entre ganho médio e perda média
- **Resultado por Dia**: Eficiência temporal das operações (R$/dia)

### Métricas Avançadas

- **Spread Médio**: Diferença média entre preços de entrada e saída
- **Tempo Médio Investido**: Média de dias nas posições
- **Maior Ganho**: Valor da operação mais lucrativa
- **Maior Perda**: Valor da operação mais prejudicial

### Liquidações por Estratégia

A tabela comparativa entre estratégias de compra e venda mostra:
- Quantidade de operações por estratégia
- Resultado acumulado por estratégia
- Taxa de acerto por estratégia

### Gráficos de Desempenho

- **Desempenho por Tipo**: Comparação visual entre compras e vendas
- **Desempenho por Referência**: Análise de resultados por contrato

### Histórico de Posições

A tabela detalhada de todas as posições liquidadas inclui:
- Informações sobre preços de entrada e saída
- Cálculo de spread, resultado e dias investidos
- Métrica de resultado por dia para cada operação

### Desempenho por Referência

A análise detalhada do desempenho por contrato mostra:
- Quantidade de contratos negociados por referência
- Resultado total e por contrato
- Percentual de contribuição para o resultado total

## Transações

Esta seção permite registrar e visualizar todas as operações.

### Nova Transação

Para registrar uma nova transação:

1. Clique no botão "Nova Transação"
2. Preencha o formulário com:
   - **Data**: Data da operação
   - **Referência**: Código do contrato (selecione entre os pré-cadastrados)
   - **Tipo**: Compra ou Venda
   - **Contratos**: Quantidade de contratos
   - **Preço**: Preço unitário da operação
3. Clique em "Salvar" para registrar a transação

A transação será processada automaticamente e afetará suas posições abertas.

### Tabela de Transações

A tabela cronológica de todas as transações mostra:
- Data da operação
- Referência do contrato
- Tipo de operação (Compra/Venda)
- Quantidade de contratos
- Preço unitário
- Valor total da operação

## Configurações

### Resetar Dados

Para limpar todos os dados e começar do zero:

1. Clique no botão "Resetar Dados" no topo do dashboard
2. Confirme a operação no diálogo que aparece
3. Todos os dados serão apagados (transações, posições abertas e liquidadas)

**Atenção**: Esta operação não pode ser desfeita. Considere fazer um backup antes.

### Atualizar Preços

Para atualizar os preços de todos os contratos:

1. Clique no botão "Atualizar Preços" no topo do dashboard
2. Na seção de Preços Atuais, edite os preços conforme necessário
3. Clique em "Salvar" para cada contrato atualizado

## Manutenção e Backup

### Exportação de Dados

O Cloudflare D1 permite exportar seus dados para backup:

1. Acesse o painel do Cloudflare
2. Vá para a seção D1
3. Selecione seu banco de dados
4. Clique em "Export" para baixar um arquivo SQL com todos os seus dados

### Importação de Dados

Para restaurar dados de um backup:

1. Acesse o painel do Cloudflare
2. Vá para a seção D1
3. Selecione seu banco de dados
4. Use a guia "Query" para executar os comandos SQL do seu backup

## Solução de Problemas

### Transação não aparece nas posições abertas

**Possíveis causas e soluções:**
- Verifique se a transação foi registrada corretamente na tabela de Transações
- Certifique-se de que a referência do contrato está correta
- Tente atualizar a página para recarregar os dados

### Erro ao liquidar posição

**Possíveis causas e soluções:**
- Verifique se o preço atual do contrato está definido
- Certifique-se de que a conexão com o banco de dados está funcionando
- Tente novamente após alguns minutos

### Gráficos não aparecem corretamente

**Possíveis causas e soluções:**
- Verifique se há dados suficientes para gerar os gráficos
- Tente usar um navegador diferente
- Limpe o cache do navegador e tente novamente

### Preços não atualizam

**Possíveis causas e soluções:**
- Verifique se você clicou em "Salvar" após editar o preço
- Certifique-se de que a conexão com o banco de dados está funcionando
- Tente atualizar a página e editar novamente

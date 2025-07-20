-- Arquivo de migração inicial para o banco de dados D1 do Cloudflare
-- migrations/0001_initial.sql

DROP TABLE IF EXISTS transacoes;
DROP TABLE IF EXISTS precos_atuais;
DROP TABLE IF EXISTS posicoes_liquidadas;

CREATE TABLE transacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  referencia TEXT NOT NULL,
  tipo TEXT NOT NULL,
  contratos INTEGER NOT NULL,
  preco REAL NOT NULL,
  valor REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE precos_atuais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referencia TEXT UNIQUE NOT NULL,
  preco REAL NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posicoes_liquidadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referencia TEXT NOT NULL,
  tipo TEXT NOT NULL,
  contratos INTEGER NOT NULL,
  preco_entrada REAL NOT NULL,
  preco_saida REAL NOT NULL,
  resultado REAL NOT NULL,
  dias_investidos INTEGER NOT NULL,
  data_entrada TEXT NOT NULL,
  data_saida TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir preços iniciais
-- BGI - Boi Gordo
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIJ25', 290.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIK25', 292.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIM25', 295.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIN25', 297.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIQ25', 300.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIU25', 302.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIV25', 305.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIX25', 307.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('BGIZ25', 310.00);

-- CCM - Milho
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMH25', 65.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMK25', 66.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMM25', 67.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMN25', 68.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMQ25', 69.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMU25', 70.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMV25', 71.00);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMX25', 72.50);
INSERT INTO precos_atuais (referencia, preco) VALUES ('CCMZ25', 73.00);

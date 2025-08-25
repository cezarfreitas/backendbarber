import { executeQuery, initDatabase } from './database';

/**
 * Script para criar e inicializar as tabelas do banco de dados
 */

// SQL para criar tabela de barbearias
const createBarbeariasTable = `
CREATE TABLE IF NOT EXISTS barbearias (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  endereco_rua VARCHAR(255) NOT NULL,
  endereco_numero VARCHAR(50) NOT NULL,
  endereco_bairro VARCHAR(100) NOT NULL,
  endereco_cidade VARCHAR(100) NOT NULL,
  endereco_estado VARCHAR(2) NOT NULL,
  endereco_cep VARCHAR(10) NOT NULL,
  contato_telefone VARCHAR(20) NOT NULL,
  contato_email VARCHAR(255) NOT NULL UNIQUE,
  contato_whatsapp VARCHAR(20),
  proprietario_nome VARCHAR(255) NOT NULL,
  proprietario_cpf VARCHAR(14) NOT NULL,
  proprietario_email VARCHAR(255) NOT NULL,
  horario_funcionamento JSON,
  status ENUM('ativa', 'inativa', 'pendente') DEFAULT 'pendente',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_cidade (endereco_cidade),
  INDEX idx_email (contato_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de barbeiros
const createBarbeirosTable = `
CREATE TABLE IF NOT EXISTS barbeiros (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  tipo ENUM('comissionado', 'funcionario', 'freelancer') NOT NULL,
  porcentagem_comissao DECIMAL(5,2) NULL,
  salario_fixo DECIMAL(10,2) NULL,
  valor_hora DECIMAL(10,2) NULL,
  barbearia_id VARCHAR(36) NOT NULL,
  especialidades JSON,
  horario_trabalho JSON,
  status ENUM('ativo', 'inativo', 'afastado') DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (barbearia_id) REFERENCES barbearias(id) ON DELETE CASCADE,
  INDEX idx_barbearia (barbearia_id),
  INDEX idx_status (status),
  INDEX idx_tipo (tipo),
  INDEX idx_email (email),
  INDEX idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de serviços
const createServicosTable = `
CREATE TABLE IF NOT EXISTS servicos (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_minutos INT NOT NULL,
  barbearia_id VARCHAR(36) NOT NULL,
  categoria VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (barbearia_id) REFERENCES barbearias(id) ON DELETE CASCADE,
  INDEX idx_barbearia (barbearia_id),
  INDEX idx_categoria (categoria),
  INDEX idx_ativo (ativo),
  INDEX idx_preco (preco),
  UNIQUE KEY unique_nome_barbearia (nome, barbearia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de combos
const createCombosTable = `
CREATE TABLE IF NOT EXISTS combos (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  barbearia_id VARCHAR(36) NOT NULL,
  valor_original DECIMAL(10,2) NOT NULL,
  valor_combo DECIMAL(10,2) NOT NULL,
  tipo_desconto ENUM('valor', 'percentual') NOT NULL,
  valor_desconto DECIMAL(10,2) NOT NULL,
  duracao_total_minutos INT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (barbearia_id) REFERENCES barbearias(id) ON DELETE CASCADE,
  INDEX idx_barbearia (barbearia_id),
  INDEX idx_ativo (ativo),
  INDEX idx_valor_combo (valor_combo),
  UNIQUE KEY unique_nome_barbearia (nome, barbearia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de relação combo-serviços (many-to-many)
const createComboServicosTable = `
CREATE TABLE IF NOT EXISTS combo_servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  combo_id VARCHAR(36) NOT NULL,
  servico_id VARCHAR(36) NOT NULL,
  ordem INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_combo_servico (combo_id, servico_id),
  INDEX idx_combo (combo_id),
  INDEX idx_servico (servico_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Dados iniciais para barbearias
const insertInitialBarbearias = `
INSERT IGNORE INTO barbearias (
  id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro, 
  endereco_cidade, endereco_estado, endereco_cep, contato_telefone, 
  contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf, 
  proprietario_email, horario_funcionamento, status
) VALUES 
(
  '1', 
  'Barbearia do João', 
  'A melhor barbearia do bairro, com mais de 20 anos de tradição',
  'Rua das Flores', 
  '123', 
  'Centro', 
  'São Paulo', 
  'SP', 
  '01234-567',
  '(11) 99999-9999',
  'contato@barbeariadoroao.com',
  '(11) 99999-9999',
  'João Silva',
  '123.456.789-00',
  'joao@barbeariadoroao.com',
  '{"segunda": {"abertura": "08:00", "fechamento": "18:00"}, "terca": {"abertura": "08:00", "fechamento": "18:00"}, "quarta": {"abertura": "08:00", "fechamento": "18:00"}, "quinta": {"abertura": "08:00", "fechamento": "18:00"}, "sexta": {"abertura": "08:00", "fechamento": "18:00"}, "sabado": {"abertura": "08:00", "fechamento": "16:00"}}',
  'ativa'
),
(
  '2',
  'BarberShop Premium',
  'Barbearia moderna com serviços premium',
  'Av. Paulista',
  '1500',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  '(11) 88888-8888',
  'contato@barbershoppremium.com',
  NULL,
  'Maria Santos',
  '987.654.321-00',
  'maria@barbershoppremium.com',
  '{"segunda": {"abertura": "09:00", "fechamento": "19:00"}, "terca": {"abertura": "09:00", "fechamento": "19:00"}, "quarta": {"abertura": "09:00", "fechamento": "19:00"}, "quinta": {"abertura": "09:00", "fechamento": "19:00"}, "sexta": {"abertura": "09:00", "fechamento": "19:00"}, "sabado": {"abertura": "09:00", "fechamento": "17:00"}}',
  'ativa'
);
`;

// Dados iniciais para barbeiros
const insertInitialBarbeiros = `
INSERT IGNORE INTO barbeiros (
  id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, 
  valor_hora, barbearia_id, especialidades, horario_trabalho, status
) VALUES 
(
  '1',
  'Carlos Silva',
  'carlos@barbeariadoroao.com',
  '(11) 98888-7777',
  '111.222.333-44',
  'comissionado',
  40.00,
  NULL,
  NULL,
  '1',
  '["Corte masculino", "Barba", "Bigode"]',
  '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}, "sabado": {"inicio": "08:00", "fim": "16:00"}}',
  'ativo'
),
(
  '2',
  'Ricardo Santos',
  'ricardo@barbeariadoroao.com',
  '(11) 97777-6666',
  '222.333.444-55',
  'funcionario',
  NULL,
  3500.00,
  NULL,
  '1',
  '["Corte feminino", "Coloração", "Tratamentos"]',
  '{"terca": {"inicio": "09:00", "fim": "19:00"}, "quarta": {"inicio": "09:00", "fim": "19:00"}, "quinta": {"inicio": "09:00", "fim": "19:00"}, "sexta": {"inicio": "09:00", "fim": "19:00"}, "sabado": {"inicio": "09:00", "fim": "17:00"}}',
  'ativo'
),
(
  '3',
  'Ana Costa',
  'ana@barbershoppremium.com',
  '(11) 96666-5555',
  '333.444.555-66',
  'freelancer',
  NULL,
  NULL,
  80.00,
  '2',
  '["Corte premium", "Barba premium", "Design de sobrancelhas"]',
  '{"segunda": {"inicio": "10:00", "fim": "16:00"}, "quarta": {"inicio": "10:00", "fim": "16:00"}, "sexta": {"inicio": "10:00", "fim": "16:00"}}',
  'ativo'
);
`;

// Dados iniciais para serviços (removendo o combo manual da lista de serviços)
const insertInitialServicos = `
INSERT IGNORE INTO servicos (
  id, nome, descricao, preco, duracao_minutos, barbearia_id, categoria, ativo
) VALUES
('1', 'Corte Masculino Tradicional', 'Corte clássico masculino com acabamento na navalha', 35.00, 45, '1', 'corte', true),
('2', 'Barba Completa', 'Aparar, modelar e finalizar barba com produtos premium', 25.00, 30, '1', 'barba', true),
('4', 'Sobrancelha Masculina', 'Design e limpeza de sobrancelhas masculinas', 20.00, 20, '1', 'design', true),
('8', 'Lavagem de Cabelo', 'Lavagem profissional com shampoo premium', 15.00, 15, '1', 'lavagem', true),
('5', 'Corte Premium Executive', 'Corte executivo com lavagem, corte e finalizações premium', 80.00, 60, '2', 'corte', true),
('6', 'Barba Premium', 'Tratamento completo da barba com produtos importados', 50.00, 45, '2', 'barba', true),
('7', 'Tratamento Capilar', 'Hidratação e tratamento do couro cabeludo', 40.00, 30, '2', 'tratamento', true),
('9', 'Relaxamento', 'Relaxamento com produtos importados', 60.00, 45, '2', 'tratamento', true);
`;

// Dados iniciais para combos
const insertInitialCombos = `
INSERT IGNORE INTO combos (
  id, nome, descricao, barbearia_id, valor_original, valor_combo,
  tipo_desconto, valor_desconto, duracao_total_minutos, ativo
) VALUES
(
  'combo1',
  'Corte + Barba Tradicional',
  'Combo clássico: corte masculino + barba completa com desconto especial',
  '1',
  60.00,
  50.00,
  'valor',
  10.00,
  75,
  true
),
(
  'combo2',
  'Pacote Completo Masculino',
  'Corte + barba + sobrancelha - economia de 15%',
  '1',
  80.00,
  68.00,
  'percentual',
  15.00,
  95,
  true
),
(
  'combo3',
  'Premium Executive',
  'Corte premium + barba premium + tratamento capilar',
  '2',
  170.00,
  140.00,
  'valor',
  30.00,
  135,
  true
),
(
  'combo4',
  'Relax Total',
  'Corte premium + tratamento + relaxamento com 20% de desconto',
  '2',
  180.00,
  144.00,
  'percentual',
  20.00,
  135,
  true
);
`;

// Dados iniciais para relação combo-serviços
const insertInitialComboServicos = `
INSERT IGNORE INTO combo_servicos (combo_id, servico_id, ordem) VALUES
-- Combo 1: Corte + Barba Tradicional
('combo1', '1', 1), -- Corte Masculino Tradicional
('combo1', '2', 2), -- Barba Completa

-- Combo 2: Pacote Completo Masculino
('combo2', '1', 1), -- Corte Masculino Tradicional
('combo2', '2', 2), -- Barba Completa
('combo2', '4', 3), -- Sobrancelha Masculina

-- Combo 3: Premium Executive
('combo3', '5', 1), -- Corte Premium Executive
('combo3', '6', 2), -- Barba Premium
('combo3', '7', 3), -- Tratamento Capilar

-- Combo 4: Relax Total
('combo4', '5', 1), -- Corte Premium Executive
('combo4', '7', 2), -- Tratamento Capilar
('combo4', '9', 3); -- Relaxamento
`;

/**
 * Função principal para inicializar o banco de dados
 */
export const initializeTables = async (): Promise<void> => {
  try {
    console.log('🗄️ Inicializando estrutura do banco de dados...');

    // Criar tabelas
    console.log('📋 Criando tabela barbearias...');
    await executeQuery(createBarbeariasTable);

    console.log('👨‍💼 Criando tabela barbeiros...');
    await executeQuery(createBarbeirosTable);

    console.log('✂️ Criando tabela servicos...');
    await executeQuery(createServicosTable);

    // Inserir dados iniciais
    console.log('📝 Inserindo dados iniciais...');
    await executeQuery(insertInitialBarbearias);
    await executeQuery(insertInitialBarbeiros);
    await executeQuery(insertInitialServicos);

    console.log('✅ Banco de dados inicializado com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

/**
 * Função para verificar se as tabelas existem
 */
export const checkTables = async (): Promise<boolean> => {
  try {
    const tables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('barbearias', 'barbeiros', 'servicos')
    `);
    
    return (tables as any[]).length === 3;
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return false;
  }
};

// Executar inicialização se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await initDatabase();
      await initializeTables();
      process.exit(0);
    } catch (error) {
      console.error('Falha na inicialização:', error);
      process.exit(1);
    }
  })();
}

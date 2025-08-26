import mysql from "mysql2/promise";

// Configuração do banco de dados MySQL
const dbConfig = {
  host: process.env.DB_HOST || "server.idenegociosdigitais.com.br",
  port: parseInt(process.env.DB_PORT || "3355"),
  user: process.env.DB_USER || "barbearia",
  password: process.env.DB_PASSWORD || "5f8dab8402afe2a6e043",
  database: process.env.DB_NAME || "barbearia-db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+00:00",
};

// Pool de conexões
let pool: mysql.Pool;

/**
 * Inicializa o pool de conexões com MySQL
 */
export const initDatabase = async (): Promise<void> => {
  try {
    pool = mysql.createPool(dbConfig);

    // Testar conexão
    const connection = await pool.getConnection();
    console.log("✅ Conectado ao MySQL:", dbConfig.host);
    connection.release();
  } catch (error) {
    console.error("❌ Erro ao conectar no MySQL:", error);
    throw error;
  }
};

/**
 * Retorna o pool de conexões
 */
export const getPool = (): mysql.Pool => {
  if (!pool) {
    throw new Error(
      "Pool de conexões não inicializado. Chame initDatabase() primeiro.",
    );
  }
  return pool;
};

/**
 * Executa uma query no banco de dados
 */
export const executeQuery = async <T = any>(
  query: string,
  params: any[] = [],
): Promise<T[]> => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error("Erro na query:", { query, params, error });
    throw error;
  }
};

/**
 * Executa uma query que retorna um único resultado
 */
export const executeQuerySingle = async <T = any>(
  query: string,
  params: any[] = [],
): Promise<T | null> => {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Inicia uma transação
 */
export const beginTransaction = async (): Promise<mysql.PoolConnection> => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

/**
 * Confirma uma transação
 */
export const commitTransaction = async (
  connection: mysql.PoolConnection,
): Promise<void> => {
  await connection.commit();
  connection.release();
};

/**
 * Desfaz uma transação
 */
export const rollbackTransaction = async (
  connection: mysql.PoolConnection,
): Promise<void> => {
  await connection.rollback();
  connection.release();
};

/**
 * Fecha o pool de conexões
 */
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    console.log("🔌 Pool de conexões MySQL fechado");
  }
};

// Tipos para facilitar o uso
export interface DatabaseRow {
  [key: string]: any;
}

export interface InsertResult {
  insertId: number;
  affectedRows: number;
}

export interface UpdateResult {
  affectedRows: number;
  changedRows: number;
}

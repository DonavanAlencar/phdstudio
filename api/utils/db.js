/**
 * Gerenciamento de conexões com banco de dados
 * - PostgreSQL para CRM
 * - MySQL para produtos (WordPress)
 */

import pg from 'pg';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Pool PostgreSQL para CRM
const crmPool = new Pool({
  host: process.env.CRM_DB_HOST || 'localhost',
  port: parseInt(process.env.CRM_DB_PORT || '5432', 10),
  user: process.env.CRM_DB_USER || 'phd_crm_user',
  password: process.env.CRM_DB_PASSWORD,
  database: process.env.CRM_DB_NAME || 'phd_crm',
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Pool MySQL para produtos (WordPress)
const productsPool = mysql.createPool({
  host: process.env.WP_DB_HOST || 'localhost',
  user: process.env.WP_DB_USER || 'root',
  password: process.env.WP_DB_PASSWORD,
  database: process.env.WP_DB_NAME || 'wordpress',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.WP_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Testar conexão PostgreSQL
crmPool.on('connect', () => {
  console.log('✅ PostgreSQL (CRM) conectado');
});

crmPool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err);
});

// Testar conexão MySQL
productsPool.getConnection()
  .then((connection) => {
    console.log('✅ MySQL (Produtos) conectado');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar MySQL:', err);
  });

/**
 * Executar query no PostgreSQL (CRM)
 */
export async function queryCRM(text, params) {
  try {
    const result = await crmPool.query(text, params);
    return result;
  } catch (error) {
    console.error('Erro na query PostgreSQL:', error);
    throw error;
  }
}

/**
 * Executar query no MySQL (Produtos)
 */
export async function queryProducts(text, params) {
  try {
    const [rows] = await productsPool.execute(text, params);
    return rows;
  } catch (error) {
    console.error('Erro na query MySQL:', error);
    throw error;
  }
}

/**
 * Obter cliente do pool PostgreSQL (para transações)
 */
export function getCRMClient() {
  return crmPool.connect();
}

/**
 * Obter conexão MySQL (para transações)
 */
export function getProductsConnection() {
  return productsPool.getConnection();
}

/**
 * Fechar todas as conexões (usado em shutdown)
 */
export async function closeConnections() {
  await crmPool.end();
  await productsPool.end();
  console.log('Conexões fechadas');
}

export { crmPool, productsPool };


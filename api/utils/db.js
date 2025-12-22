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
  connectionTimeoutMillis: 5000, // Reduzido para 5s
  query_timeout: 10000, // Timeout de 10s para queries
  statement_timeout: 10000, // Timeout de 10s para statements
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

// Testar conexão explicitamente na inicialização
(async () => {
  try {
    const testResult = await crmPool.query('SELECT 1 as test');
    console.log('✅ PostgreSQL (CRM) conectado e testado');
  } catch (error) {
    console.error('❌ Erro ao testar conexão PostgreSQL:', error.message);
    if (error.message.includes('EAI_AGAIN') || error.message.includes('getaddrinfo')) {
      console.error('   → Problema de DNS/rede. Verifique se o container phd-crm-db está acessível.');
    }
  }
})();

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
  const startTime = Date.now();
  try {
    // Adicionar timeout manual se a query demorar muito
    const queryPromise = crmPool.query(text, params);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout após 10 segundos')), 10000);
    });
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`⚠️ Query lenta (${duration}ms): ${text.substring(0, 100)}...`);
    }
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Erro na query PostgreSQL (${duration}ms):`, error.message);
    if (error.message.includes('timeout') || error.message.includes('EAI_AGAIN')) {
      console.error('   → Possível problema de conexão com o banco de dados');
    }
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


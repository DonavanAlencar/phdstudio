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
  max: 30, // Aumentado para 30 conexões
  idleTimeoutMillis: 60000, // Aumentado para 60s
  connectionTimeoutMillis: 10000, // Aumentado para 10s
  query_timeout: 30000, // Timeout de 30s para queries (aumentado)
  statement_timeout: 30000, // Timeout de 30s para statements (aumentado)
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
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
  const queryId = Math.random().toString(36).substring(7);
  
  try {
    // Log da query (apenas em desenvolvimento ou se muito lenta)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 [DB] Query ${queryId}: ${text.substring(0, 100)}...`);
    }
    
    const result = await crmPool.query(text, params);
    const duration = Date.now() - startTime;
    
    // Avisar se query demorou mais de 1s
    if (duration > 1000) {
      console.warn(`⚠️ [DB] Query lenta (${duration}ms) [${queryId}]: ${text.substring(0, 100)}...`);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ [DB] Query ${queryId} concluída em ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [DB] Erro na query PostgreSQL (${duration}ms) [${queryId}]:`, error.message);
    console.error(`   Query: ${text.substring(0, 200)}...`);
    
    if (error.message.includes('timeout') || error.message.includes('EAI_AGAIN') || error.message.includes('ETIMEDOUT')) {
      console.error('   → Possível problema de conexão com o banco de dados');
      console.error('   → Verifique: 1) Banco está acessível, 2) Rede está OK, 3) Índices existem');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Conexão recusada - banco pode estar offline');
    }
    
    if (error.code === '28P01') {
      console.error('   → Erro de autenticação - credenciais incorretas');
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


/**
 * API REST para produtos PHD Studio
 * Acessa o banco de dados PostgreSQL
 * 
 * SEGURANÇA:
 * - Autenticação via API Key
 * - Rate limiting
 * - Headers de segurança
 * - Validação rigorosa de inputs
 * - Prepared statements (proteção SQL injection)
 * - Sanitização de dados
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// Swagger/OpenAPI Documentation
import { swaggerSpec, swaggerUi } from './swagger.js';
import { queryCRM, closeConnections, crmPool } from './utils/db.js';
// Importar rotas do CRM
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import tagsRoutes from './routes/tags.js';
import activitiesRoutes from './routes/activities.js';
import kanbanRoutes from './routes/kanban.js';
import dashboardRoutes from './routes/dashboard.js';
import productsRoutes from './routes/products.js';
import customFieldsRoutes from './routes/customFields.js';
import messagesRoutes from './routes/messages.js';
import eventsRoutes from './routes/events.js';
import pipelinesRoutes from './routes/pipelines.js';
import dealsRoutes from './routes/deals.js';
import lossReasonsRoutes from './routes/lossReasons.js';
import integrationsRoutes from './routes/integrations.js';
import filesRoutes from './routes/files.js';
import reportsRoutes from './routes/reports.js';
import profileRoutes from './routes/profile.js';
import workflowsRoutes from './routes/workflows.js';
import botRoutes from './routes/bot.js';
import instagramRoutes from './routes/instagram.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Configurar Express para confiar no proxy (Traefik)
// Isso é necessário para que express-rate-limit funcione corretamente com X-Forwarded-For
app.set('trust proxy', true);

// Validar variáveis de ambiente críticas
if (!process.env.PHD_API_KEY) {
    console.error('❌ ERRO: PHD_API_KEY não definida no .env');
    process.exit(1);
}

// Middleware simples de log de requisições (debug)
app.use((req, res, next) => {
    console.log(`➡️ [REQ] ${req.method} ${req.originalUrl}`);
    next();
});

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configurado de forma segura
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['https://phdstudio.com.br', 'http://phdstudio.com.br'];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requisições sem origin (mobile apps, Postman, etc) em desenvolvimento
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS bloqueado para origem: ${origin}`);
            callback(new Error('Não permitido por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-PHD-API-KEY', 'Authorization'],
    exposedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

const MEDIA_BASE_URL = process.env.PRODUCTS_MEDIA_BASE_URL || process.env.WP_URL || 'https://phdstudio.com.br';

// Rate limiting - proteção contra brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições por IP
    message: {
        error: 'Muitas requisições deste IP',
        message: 'Por favor, tente novamente em alguns minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/phd/', limiter);

// Rate limiting mais restritivo para autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // máximo 5 tentativas de autenticação
    skipSuccessfulRequests: true,
});
app.use('/phd/v1/', authLimiter);

// Limitar tamanho do body
app.use(express.json({ limit: '10kb' }));

// API Key para autenticação (OBRIGATÓRIA via .env)
const API_KEY = process.env.PHD_API_KEY;

// Logs de segurança
const securityLog = {
    failedAuth: [],
    logFailedAuth: (ip, apiKey) => {
        const entry = {
            ip,
            timestamp: new Date().toISOString(),
            apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'missing'
        };
        securityLog.failedAuth.push(entry);
        // Manter apenas últimos 100 logs
        if (securityLog.failedAuth.length > 100) {
            securityLog.failedAuth.shift();
        }
        console.warn(`⚠️  Tentativa de autenticação falhada de ${ip} às ${entry.timestamp}`);
    }
};

/**
 * Middleware de autenticação via API Key
 * Com proteção contra timing attacks usando comparação segura
 */
function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-phd-api-key'];
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    if (!apiKey) {
        securityLog.logFailedAuth(clientIp, null);
        return res.status(401).json({
            error: 'API Key não fornecida',
            message: 'Envie o header X-PHD-API-KEY com sua chave de API'
        });
    }

    // Comparação segura contra timing attacks
    if (!secureCompare(apiKey, API_KEY)) {
        securityLog.logFailedAuth(clientIp, apiKey);
        return res.status(403).json({
            error: 'API Key inválida',
            message: 'A chave de API fornecida não é válida'
        });
    }

    next();
}

/**
 * Comparação segura de strings (proteção contra timing attacks)
 */
function secureCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Sanitizar e validar entrada de ID
 */
function validateId(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0 || numId > 2147483647) {
        return null;
    }
    return numId;
}

/**
 * Sanitizar string para prevenir XSS
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '') // Remove < e >
        .trim()
        .substring(0, 1000); // Limite de tamanho
}

/**
 * Normaliza campo de atributos vindo do Postgres ou legado em texto
 */
function parseAttributesField(raw) {
    if (!raw) return {};

    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return raw;
    }

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            return {};
        }
    }

    return {};
}

/**
 * GET /phd/v1/products
 * Lista todos os produtos
 * Nota: O prefixo /api é removido pelo Traefik
 */
app.get('/phd/v1/products', authenticateApiKey, async (req, res) => {
    try {
        const result = await queryCRM(
            `SELECT id, nome, categoria, atributos, preco_estimado, foto_url, updated_at 
             FROM products
             WHERE deleted_at IS NULL
             ORDER BY categoria, nome ASC 
             LIMIT 1000`
        );

        // Processar produtos e formatar atributos JSON com sanitização
        const products = result.rows.map(product => {
            const atributos = parseAttributesField(product.atributos);

            // Sanitizar e validar URL da foto
            let foto_url = sanitizeString(product.foto_url || '');
            if (foto_url && !foto_url.startsWith('http')) {
                if (MEDIA_BASE_URL.match(/^https?:\/\/.+/)) {
                    foto_url = foto_url.startsWith('/')
                        ? `${MEDIA_BASE_URL}${foto_url}`
                        : `${MEDIA_BASE_URL}/${foto_url}`;
                }
            }

            return {
                id: parseInt(product.id, 10),
                nome: sanitizeString(product.nome || ''),
                categoria: sanitizeString(product.categoria || ''),
                atributos: atributos,
                preco_estimado: sanitizeString(product.preco_estimado || ''),
                foto_url: foto_url,
                updated_at: product.updated_at || null
            };
        });

        // Headers de segurança adicionais
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        res.json({
            success: true,
            count: products.length,
            data: products,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);

        // Não expor detalhes do erro em produção
        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : error.message;

        res.status(500).json({
            success: false,
            error: 'Erro ao buscar produtos',
            message: errorMessage
        });
    }
});

/**
 * GET /phd/v1/products/:id
 * Obter um produto específico por ID
 * Nota: O prefixo /api é removido pelo Traefik
 */
app.get('/phd/v1/products/:id', authenticateApiKey, async (req, res) => {
    try {
        // Validar e sanitizar ID
        const productId = validateId(req.params.id);

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
                message: 'O ID deve ser um número inteiro positivo'
            });
        }

        // Query segura usando prepared statements no PostgreSQL
        const result = await queryCRM(
            `SELECT id, nome, categoria, atributos, preco_estimado, foto_url, updated_at 
             FROM products
             WHERE id = $1 AND deleted_at IS NULL
             LIMIT 1`,
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Produto não encontrado'
            });
        }

        const product = result.rows[0];
        const atributos = parseAttributesField(product.atributos);

        let foto_url = sanitizeString(product.foto_url || '');
        if (foto_url && !foto_url.startsWith('http')) {
            if (MEDIA_BASE_URL.match(/^https?:\/\/.+/)) {
                foto_url = foto_url.startsWith('/')
                    ? `${MEDIA_BASE_URL}${foto_url}`
                    : `${MEDIA_BASE_URL}/${foto_url}`;
            }
        }

        // Headers de segurança
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        res.json({
            success: true,
            data: {
                id: parseInt(product.id, 10),
                nome: sanitizeString(product.nome || ''),
                categoria: sanitizeString(product.categoria || ''),
                atributos: atributos,
                preco_estimado: sanitizeString(product.preco_estimado || ''),
                foto_url: foto_url,
                updated_at: product.updated_at || null
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao buscar produto:', error);

        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : error.message;

        res.status(500).json({
            success: false,
            error: 'Erro ao buscar produto',
            message: errorMessage
        });
    }
});

// Health check para CRM (ANTES das rotas para evitar 404)
app.get('/api/crm/v1/health', async (req, res) => {
    res.json({
        status: 'ok',
        service: 'CRM API',
        timestamp: new Date().toISOString()
    });
});
app.get('/crm/v1/health', async (req, res) => {
    res.json({
        status: 'ok',
        service: 'CRM API',
        timestamp: new Date().toISOString()
    });
});

// Rotas públicas (Instagram Feed)
app.use('/api/instagram', instagramRoutes);
app.use('/instagram', instagramRoutes); // Rota alternativa sem /api para Traefik

// Rotas do CRM
// NOTA: O Traefik remove o prefixo /api, então as rotas aqui não devem incluir /api
app.use('/api/crm/v1/auth', authRoutes);
app.use('/crm/v1/auth', authRoutes); // Rota alternativa sem /api para Traefik
app.use('/api/crm/v1/leads', leadsRoutes);
app.use('/crm/v1/leads', leadsRoutes);
app.use('/api/crm/v1/tags', tagsRoutes);
app.use('/crm/v1/tags', tagsRoutes);
app.use('/api/crm/v1/activities', activitiesRoutes);
app.use('/crm/v1/activities', activitiesRoutes);
app.use('/api/crm/v1/kanban', kanbanRoutes);
app.use('/crm/v1/kanban', kanbanRoutes);
app.use('/api/crm/v1/dashboard', dashboardRoutes);
app.use('/crm/v1/dashboard', dashboardRoutes);
app.use('/api/crm/v1/products', productsRoutes);
app.use('/crm/v1/products', productsRoutes);
app.use('/api/crm/v1/custom-fields', customFieldsRoutes);
app.use('/crm/v1/custom-fields', customFieldsRoutes);
app.use('/api/crm/v1/messages', messagesRoutes);
app.use('/crm/v1/messages', messagesRoutes);
app.use('/api/crm/v1', eventsRoutes);
app.use('/crm/v1', eventsRoutes);
app.use('/api/crm/v1/pipelines', pipelinesRoutes);
app.use('/crm/v1/pipelines', pipelinesRoutes);
app.use('/api/crm/v1/deals', dealsRoutes);
app.use('/crm/v1/deals', dealsRoutes);
app.use('/api/crm/v1/loss-reasons', lossReasonsRoutes);
app.use('/crm/v1/loss-reasons', lossReasonsRoutes);
app.use('/api/crm/v1/integrations', integrationsRoutes);
app.use('/crm/v1/integrations', integrationsRoutes);
app.use('/api/crm/v1', filesRoutes);
app.use('/crm/v1', filesRoutes);
app.use('/api/crm/v1/reports', reportsRoutes);
app.use('/crm/v1/reports', reportsRoutes);
app.use('/api/crm/v1/profile', profileRoutes);
app.use('/crm/v1/profile', profileRoutes);
app.use('/api/crm/v1/workflows', workflowsRoutes);
app.use('/crm/v1/workflows', workflowsRoutes);
app.use('/api/crm/v1/bot', botRoutes);
app.use('/crm/v1/bot', botRoutes);

// Swagger UI - DEPOIS das rotas CRM para evitar conflitos
// IMPORTANTE: Deve estar antes do 404 handler
// Endpoint de teste para verificar se o problema é do Swagger
app.get('/api/docs/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Endpoint de teste do Swagger funcionando',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PHD Studio API - Documentação',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
    },
    customJs: [],
    customCssUrl: null,
}));
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PHD Studio API - Documentação',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
    },
    customJs: [],
    customCssUrl: null,
}));

/**
 * GET /health
 * Endpoint de health check (legado)
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : err.message
    });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado',
        message: 'A rota solicitada não existe'
    });
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado (unhandledRejection):', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada (uncaughtException):', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM recebido, encerrando servidor...');
    if (crmPool) {
        await closeConnections();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT recebido, encerrando servidor...');
    if (crmPool) {
        await closeConnections();
    }
    process.exit(0);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API PHD Products rodando na porta ${PORT}`);
    console.log(`📡 Endpoint: http://0.0.0.0:${PORT}/phd/v1/products`);
    console.log(`🌐 Via Traefik: https://phdstudio.com.br/api/phd/v1/products`);
    console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Segurança: Rate limiting, Helmet, Validação ativados`);
    console.log(`🌍 CORS: ${allowedOrigins.join(', ')}`);
});

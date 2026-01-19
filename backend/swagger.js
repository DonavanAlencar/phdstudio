/**
 * Configuração Swagger/OpenAPI para documentação da API
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PHD Studio API',
      version: '1.0.0',
      description: `
# API PHD Studio - Documentação Completa

Esta API fornece acesso completo ao sistema CRM e produtos do PHD Studio.

## Autenticação

### CRM API (JWT)
A maioria dos endpoints do CRM requer autenticação via JWT Bearer Token.
1. Faça login em \`POST /api/crm/v1/auth/login\`
2. Use o \`accessToken\` retornado no header: \`Authorization: Bearer <token>\`
3. Tokens expiram em 1 hora. Use \`POST /api/crm/v1/auth/refresh\` para renovar.

### Produtos API (API Key)
Os endpoints de produtos requerem API Key no header:
- Header: \`X-PHD-API-KEY: <sua-api-key>\`

## Base URLs

- **Produção**: \`https://phdstudio.com.br/api\`
- **Desenvolvimento**: \`http://localhost:3001\`

## Estrutura de Respostas

### Sucesso
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
\`\`\`

### Erro
\`\`\`json
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição detalhada do erro"
}
\`\`\`

## Rate Limiting

- **CRM API**: 100 requisições por IP a cada 15 minutos
- **Autenticação**: 5 tentativas por IP a cada 15 minutos
- **Produtos API**: 100 requisições por IP a cada 15 minutos

## Códigos de Status HTTP

- \`200\` - Sucesso
- \`201\` - Criado com sucesso
- \`400\` - Requisição inválida
- \`401\` - Não autenticado
- \`403\` - Acesso negado
- \`404\` - Recurso não encontrado
- \`409\` - Conflito (ex: email já existe)
- \`500\` - Erro interno do servidor
      `,
      contact: {
        name: 'PHD Studio',
        email: 'contato@phdstudio.com.br',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'https://phdstudio.com.br/api',
        description: 'Produção',
      },
      {
        url: 'http://localhost:3001',
        description: 'Desenvolvimento Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido via /api/crm/v1/auth/login',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-PHD-API-KEY',
          description: 'API Key para acesso aos endpoints de produtos',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Tipo do erro',
            },
            message: {
              type: 'string',
              example: 'Descrição detalhada do erro',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'admin@phdstudio.com.br' },
            first_name: { type: 'string', example: 'Admin' },
            last_name: { type: 'string', example: 'User' },
            role: { type: 'string', enum: ['admin', 'manager', 'user'], example: 'admin' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            last_login: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'lead@example.com' },
            first_name: { type: 'string', example: 'João' },
            last_name: { type: 'string', example: 'Silva' },
            phone: { type: 'string', example: '+5511999999999', nullable: true },
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
              example: 'new',
            },
            stage: {
              type: 'string',
              enum: ['Curioso', 'Avaliando', 'Pronto para agir'],
              example: 'Curioso',
            },
            source: { type: 'string', example: 'Website', nullable: true },
            pain_point: { type: 'string', example: 'Necessita aumentar vendas', nullable: true },
            assigned_to: { type: 'integer', example: 1, nullable: true },
            custom_fields: {
              type: 'object',
              additionalProperties: true,
              example: { intencao_estagio: 'Avaliando', dor_necessidade: 'Aumentar vendas' },
            },
            tags: {
              type: 'array',
              items: { $ref: '#/components/schemas/Tag' },
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            deleted_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Hot Lead' },
            color: { type: 'string', example: '#3B82F6' },
            description: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            lead_id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            type: {
              type: 'string',
              enum: ['call', 'email', 'meeting', 'note', 'task'],
              example: 'call',
            },
            title: { type: 'string', example: 'Ligar para cliente' },
            description: { type: 'string', nullable: true },
            due_date: { type: 'string', format: 'date-time', nullable: true },
            completed_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        KanbanBoard: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Pipeline de Vendas' },
            description: { type: 'string', nullable: true },
            user_id: { type: 'integer', example: 1 },
            is_default: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        KanbanColumn: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            board_id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Novos Leads' },
            position: { type: 'integer', example: 0 },
            color: { type: 'string', example: '#3B82F6' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        KanbanCard: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            column_id: { type: 'integer', example: 1 },
            lead_id: { type: 'integer', example: 1 },
            position: { type: 'integer', example: 0 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Consultoria em Marketing Digital' },
            categoria: { type: 'string', example: 'Consultoria' },
            atributos: {
              type: 'object',
              additionalProperties: true,
              example: { duracao: '3 meses', investimento: 'R$ 15.000' },
            },
            preco_estimado: { type: 'string', example: 'R$ 15.000 - R$ 30.000' },
            foto_url: { type: 'string', format: 'uri', nullable: true },
            updated_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            leads: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 150 },
                by_status: {
                  type: 'object',
                  additionalProperties: { type: 'integer' },
                },
                by_stage: {
                  type: 'object',
                  additionalProperties: { type: 'integer' },
                },
              },
            },
            activities: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 45 },
                pending: { type: 'integer', example: 12 },
                completed: { type: 'integer', example: 33 },
              },
            },
            top_tags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  color: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: {},
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 150 },
                totalPages: { type: 'integer', example: 8 },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints para autenticação e gerenciamento de sessão',
      },
      {
        name: 'Leads',
        description: 'Gerenciamento completo de leads do CRM',
      },
      {
        name: 'Tags',
        description: 'Gerenciamento de tags para organização de leads',
      },
      {
        name: 'Atividades',
        description: 'Gerenciamento de atividades relacionadas a leads',
      },
      {
        name: 'Kanban',
        description: 'Sistema de Kanban para visualização e gestão de pipeline',
      },
      {
        name: 'Dashboard',
        description: 'Estatísticas e métricas do CRM',
      },
      {
        name: 'Produtos',
        description: 'Gerenciamento de produtos/serviços do PHD Studio',
      },
      {
        name: 'Health',
        description: 'Endpoints de health check e status do sistema',
      },
    ],
  },
  apis: [], // Caminhos para arquivos com anotações Swagger (vazio por enquanto, usando apenas definição manual)
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };


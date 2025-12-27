/**
 * Middleware de validação usando express-validator
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware para verificar erros de validação
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
}

/**
 * Validações para Leads
 */
export const validateLead = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sobrenome deve ter no máximo 100 caracteres'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
    .withMessage('Status inválido'),
  body('stage')
    .optional()
    .isIn(['Curioso', 'Avaliando', 'Pronto para agir'])
    .withMessage('Estágio inválido'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Origem deve ter no máximo 100 caracteres'),
  body('pain_point')
    .optional()
    .trim(),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do usuário atribuído deve ser um número válido'),
  validateRequest
];

/**
 * Validações para Tags
 */
export const validateTag = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome da tag deve ter entre 1 e 100 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve ser um código hexadecimal válido (ex: #3B82F6)'),
  body('description')
    .optional()
    .trim(),
  validateRequest
];

/**
 * Validações para Produtos
 */
export const validateProduct = [
  body('nome')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome do produto deve ter entre 1 e 255 caracteres'),
  body('categoria')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Categoria deve ter entre 1 e 100 caracteres'),
  body('atributos')
    .optional()
    .custom((value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Atributos deve ser um objeto');
      }
      return true;
    }),
  body('preco_estimado')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Preço estimado deve ter no máximo 255 caracteres'),
  body('foto_url')
    .optional()
    .trim()
    .isLength({ max: 2048 })
    .withMessage('URL da foto deve ter no máximo 2048 caracteres'),
  validateRequest
];

/**
 * Validações para Campos Customizados
 */
export const validateCustomField = [
  body('field_key')
    .trim()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Chave deve conter apenas letras, números e underline')
    .isLength({ min: 1, max: 100 })
    .withMessage('Chave deve ter entre 1 e 100 caracteres'),
  body('label')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Label deve ter entre 1 e 150 caracteres'),
  body('field_type')
    .isIn(['text', 'number', 'date', 'select', 'boolean'])
    .withMessage('Tipo de campo inválido'),
  body('options')
    .optional()
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('Opções devem ser um array');
      }
      return true;
    }),
  body('applies_to')
    .isIn(['lead', 'deal'])
    .withMessage('Aplicação inválida'),
  body('is_required')
    .optional()
    .isBoolean()
    .withMessage('is_required deve ser boolean'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active deve ser boolean'),
  validateRequest
];

/**
 * Validações para Atividades
 */
export const validateActivity = [
  body('lead_id')
    .isInt({ min: 1 })
    .withMessage('ID do lead é obrigatório e deve ser um número válido'),
  body('type')
    .isIn(['call', 'email', 'meeting', 'note', 'task'])
    .withMessage('Tipo de atividade inválido'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Título deve ter entre 1 e 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601'),
  body('user_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número válido'),
  validateRequest
];

/**
 * Validações para Mensagens
 */
export const validateMessage = [
  body('lead_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('lead_id inválido'),
  body('deal_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('deal_id inválido'),
  body('channel')
    .isIn(['whatsapp', 'email', 'sms'])
    .withMessage('Canal inválido'),
  body('direction')
    .isIn(['inbound', 'outbound'])
    .withMessage('Direção inválida'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Assunto deve ter no máximo 255 caracteres'),
  body('body')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Mensagem não pode ser vazia'),
  body('metadata')
    .optional()
    .custom((value) => {
      if (value && (typeof value !== 'object' || Array.isArray(value))) {
        throw new Error('metadata deve ser um objeto');
      }
      return true;
    }),
  validateRequest
];

/**
 * Validações para Pipelines
 */
export const validatePipeline = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Nome deve ter entre 1 e 150 caracteres'),
  body('pipeline_type')
    .isIn(['sales', 'post_sales', 'support'])
    .withMessage('Tipo de pipeline inválido'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default deve ser boolean'),
  validateRequest
];

export const validatePipelineStage = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Nome da etapa deve ter entre 1 e 150 caracteres'),
  body('position')
    .isInt({ min: 0 })
    .withMessage('Posição inválida'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor inválida'),
  body('is_won')
    .optional()
    .isBoolean()
    .withMessage('is_won deve ser boolean'),
  body('is_lost')
    .optional()
    .isBoolean()
    .withMessage('is_lost deve ser boolean'),
  validateRequest
];

/**
 * Validações para Deals
 */
export const validateDeal = [
  body('lead_id')
    .isInt({ min: 1 })
    .withMessage('lead_id inválido'),
  body('pipeline_id')
    .isInt({ min: 1 })
    .withMessage('pipeline_id inválido'),
  body('stage_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('stage_id inválido'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Título inválido'),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Valor inválido'),
  body('currency')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Moeda inválida'),
  body('status')
    .optional()
    .isIn(['open', 'won', 'lost'])
    .withMessage('Status inválido'),
  validateRequest
];

/**
 * Validações para Motivos de Perda
 */
export const validateLossReason = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Nome inválido'),
  body('description')
    .optional()
    .trim(),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active deve ser boolean'),
  validateRequest
];

/**
 * Validações para Integracoes
 */
export const validateIntegration = [
  body('integration_type')
    .isIn(['zapier', 'whatsapp', 'google_calendar'])
    .withMessage('Tipo de integração inválido'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Nome inválido'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'error'])
    .withMessage('Status inválido'),
  body('settings')
    .optional()
    .custom((value) => {
      if (value && (typeof value !== 'object' || Array.isArray(value))) {
        throw new Error('settings deve ser objeto');
      }
      return true;
    }),
  validateRequest
];

/**
 * Validações para Workflows
 */
export const validateWorkflow = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Nome inválido'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active inválido'),
  body('triggers')
    .optional()
    .isArray()
    .withMessage('triggers deve ser array'),
  body('actions')
    .optional()
    .isArray()
    .withMessage('actions deve ser array'),
  validateRequest
];

/**
 * Validações para Perfil
 */
export const validateProfile = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome inválido'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sobrenome inválido'),
  body('avatar_url')
    .optional()
    .trim()
    .isLength({ max: 2048 })
    .withMessage('Avatar inválido'),
  body('notification_prefs')
    .optional()
    .custom((value) => {
      if (value && (typeof value !== 'object' || Array.isArray(value))) {
        throw new Error('notification_prefs deve ser objeto');
      }
      return true;
    }),
  validateRequest
];

export const validatePasswordChange = [
  body('current_password')
    .isLength({ min: 6 })
    .withMessage('Senha atual inválida'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nova senha inválida'),
  validateRequest
];

/**
 * Validações para Login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  validateRequest
];

/**
 * Validação de ID numérico
 */
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido'),
  validateRequest
];

/**
 * Validações para query params de listagem
 */
export const validateListQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve ser um número entre 1 e 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Busca deve ter no máximo 255 caracteres'),
  validateRequest
];

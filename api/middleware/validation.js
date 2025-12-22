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


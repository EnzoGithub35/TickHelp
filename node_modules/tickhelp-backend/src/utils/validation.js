import { body, param, query, validationResult } from 'express-validator';

// Middleware pour gérer les résultats de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }
  next();
};

// Validations pour l'authentification
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Role must be user, manager, or admin'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Validations pour les tickets
export const validateCreateTicket = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('type')
    .optional()
    .isIn(['bug', 'feature', 'task', 'improvement'])
    .withMessage('Type must be bug, feature, task, or improvement'),
  body('assignee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('estimated_hours')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Estimated hours must be between 1 and 1000'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  handleValidationErrors,
];

export const validateUpdateTicket = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Ticket ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be todo, in_progress, resolved, or closed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('type')
    .optional()
    .isIn(['bug', 'feature', 'task', 'improvement'])
    .withMessage('Type must be bug, feature, task, or improvement'),
  body('assignee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('estimated_hours')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Estimated hours must be between 1 and 1000'),
  body('actual_hours')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Actual hours must be between 1 and 1000'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  handleValidationErrors,
];

// Validations pour les paramètres d'URL
export const validateTicketId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Ticket ID must be a positive integer'),
  handleValidationErrors,
];

export const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  handleValidationErrors,
];

// Validations pour les requêtes de recherche
export const validateTicketQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be todo, in_progress, resolved, or closed'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  query('type')
    .optional()
    .isIn(['bug', 'feature', 'task', 'improvement'])
    .withMessage('Type must be bug, feature, task, or improvement'),
  query('assignee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  query('reporter_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reporter ID must be a positive integer'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search term must not exceed 255 characters'),
  query('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'due_date', 'priority', 'status'])
    .withMessage('Sort by must be created_at, updated_at, due_date, priority, or status'),
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors,
];
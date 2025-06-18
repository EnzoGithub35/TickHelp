// backend/src/middleware/validation.js
import { body, validationResult } from 'express-validator';

/**
 * Middleware for validating request body/params
 */
export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    next();
  };
};

/**
 * Validation rules for user registration
 */
export const validateRegistration = validateRequest([
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
]);

/**
 * Validation rules for login
 */
export const validateLogin = validateRequest([
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]);

/**
 * Validation rules for profile update
 */
export const validateProfileUpdate = validateRequest([
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
]);

/**
 * Validation rules for user update (admin/manager)
 */
export const validateUserUpdate = validateRequest([
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user'])
    .withMessage('Role must be admin, manager, or user'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
]);

/**
 * Validation rules for ticket creation
 */
export const validateTicketCreate = validateRequest([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('type')
    .optional()
    .isIn(['bug', 'feature', 'task', 'improvement'])
    .withMessage('Type must be bug, feature, task, or improvement'),
  body('assigneeId')
    .optional()
    .isInt()
    .withMessage('Assignee ID must be an integer'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated hours must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
]);

/**
 * Validation rules for ticket update
 */
export const validateTicketUpdate = validateRequest([
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
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
  body('assigneeId')
    .optional()
    .isInt()
    .withMessage('Assignee ID must be an integer'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated hours must be a positive integer'),
  body('actualHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Actual hours must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
]);

/**
 * Validation rules for comment
 */
export const validateComment = validateRequest([
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean')
]);

// backend/src/utils/errors.js
class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, code, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message, code = 'AUTHENTICATION_ERROR') {
    super(message, code, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message, code = 'AUTHORIZATION_ERROR') {
    super(message, code, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message, code = 'NOT_FOUND') {
    super(message, code, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, code, 409);
  }
}

export class ServerError extends AppError {
  constructor(message, code = 'SERVER_ERROR') {
    super(message, code, 500);
  }
}

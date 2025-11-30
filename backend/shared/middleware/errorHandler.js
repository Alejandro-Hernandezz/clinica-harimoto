/**
 * ERROR HANDLER - Middleware de manejo de errores
 *
 * Propósito:
 * Centralizar el manejo de errores en la aplicación
 *
 * Patrones aplicados:
 * - Error Handling: Captura y formatea errores consistentemente
 * - Middleware: Intercepta errores antes de enviar respuesta
 *
 * Uso:
 * app.use(errorHandler);
 *
 * Tipos de errores manejados:
 * - Errores de validación (400)
 * - Errores de autenticación (401)
 * - Errores de autorización (403)
 * - Errores de recurso no encontrado (404)
 * - Errores de servidor (500)
 */

/**
 * Middleware de manejo de errores
 *
 * @param {Error} err - Error capturado
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  console.error('[Error Handler] ❌ Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Determinar código de estado
  const statusCode = err.statusCode || err.status || 500;

  // Determinar tipo de error
  const errorType = getErrorType(err);

  // Preparar respuesta
  const response = {
    success: false,
    error: {
      type: errorType,
      message: err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR'
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Añadir detalles adicionales en modo desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = err.details || null;
  }

  // Enviar respuesta
  res.status(statusCode).json(response);
};

/**
 * Determinar tipo de error
 *
 * @param {Error} err
 * @returns {string}
 */
const getErrorType = (err) => {
  const statusCode = err.statusCode || err.status || 500;

  switch (statusCode) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'AUTHENTICATION_ERROR';
    case 403:
      return 'AUTHORIZATION_ERROR';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'UNKNOWN_ERROR';
  }
};

/**
 * Middleware para rutas no encontradas (404)
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

/**
 * Clase de error personalizado
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores comunes predefinidos
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Wrapper para funciones asíncronas
 * Evita tener que usar try-catch en cada controlador
 *
 * Uso:
 * router.get('/sensores', asyncHandler(async (req, res) => {
 *   const sensores = await Sensor.findAll();
 *   res.json(sensores);
 * }));
 *
 * @param {Function} fn - Función asíncrona
 * @returns {Function}
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};

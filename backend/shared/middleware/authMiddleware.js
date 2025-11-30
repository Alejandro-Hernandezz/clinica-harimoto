/**
 * AUTH MIDDLEWARE - Middleware de autenticación
 *
 * Propósito:
 * Validar tokens JWT en las peticiones HTTP
 *
 * Patrones aplicados:
 * - Middleware: Intercepta peticiones para validar autenticación
 * - JWT: Tokens seguros sin estado
 *
 * Uso:
 * const { authenticate } = require('../shared/middleware/authMiddleware');
 * router.get('/sensores', authenticate, controller.getSensores);
 *
 * Headers requeridos:
 * Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'riego_smart_secret_key_2024_ultra_secure';

/**
 * Middleware de autenticación
 *
 * Valida el token JWT en el header Authorization
 * Añade el usuario decodificado a req.user
 *
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 */
const authenticate = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación',
        code: 'NO_TOKEN'
      });
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const token = parts[1];

    // Verificar y decodificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Añadir usuario a la petición
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      iat: decoded.iat,
      exp: decoded.exp
    };

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.log(`[Auth] ✅ Usuario autenticado: ${req.user.email} (${req.user.id})`);

    next();

  } catch (error) {
    console.error('[Auth] ❌ Error de autenticación:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error al validar autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware opcional de autenticación
 *
 * No requiere token, pero si está presente lo valida
 * Útil para endpoints públicos que tienen funcionalidad extra para usuarios autenticados
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No hay token, continuar sin autenticar
      req.user = null;
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre
    };

    console.log(`[Auth] ✅ Usuario autenticado (opcional): ${req.user.email}`);

    next();

  } catch (error) {
    // Si falla, continuar sin autenticación
    req.user = null;
    next();
  }
};

/**
 * Generar token JWT
 *
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (default: 24h)
 * @returns {string} Token JWT
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verificar token JWT
 *
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Decodificar token sin verificar
 *
 * @param {string} token
 * @returns {Object} Payload decodificado
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
  verifyToken,
  decodeToken,
  JWT_SECRET
};

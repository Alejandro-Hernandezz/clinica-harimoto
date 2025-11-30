/**
 * LOGGER - Middleware de logging estructurado
 *
 * Propósito:
 * Registrar todas las peticiones HTTP y eventos del sistema
 *
 * Patrones aplicados:
 * - Logging: Trazabilidad de operaciones
 * - Middleware: Intercepta peticiones para logging
 *
 * Uso:
 * app.use(requestLogger);
 *
 * Características:
 * - Logging de peticiones HTTP
 * - Tiempo de respuesta
 * - Códigos de estado
 * - Errores detallados
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Colores de texto
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Colores de fondo
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

/**
 * Middleware de logging de peticiones HTTP
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capturar el método original de res.json para loguear respuestas
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    const duration = Date.now() - startTime;
    logRequest(req, res, duration);
    return originalJson(data);
  };

  // Capturar el método send también
  const originalSend = res.send.bind(res);

  res.send = function (data) {
    const duration = Date.now() - startTime;
    logRequest(req, res, duration);
    return originalSend(data);
  };

  next();
};

/**
 * Loguear petición HTTP
 *
 * @param {Object} req
 * @param {Object} res
 * @param {number} duration
 */
const logRequest = (req, res, duration) => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const status = res.statusCode;
  const timestamp = new Date().toISOString();

  // Color según código de estado
  let statusColor;
  if (status >= 500) {
    statusColor = colors.red;
  } else if (status >= 400) {
    statusColor = colors.yellow;
  } else if (status >= 300) {
    statusColor = colors.cyan;
  } else if (status >= 200) {
    statusColor = colors.green;
  } else {
    statusColor = colors.white;
  }

  // Color según método HTTP
  let methodColor;
  switch (method) {
    case 'GET':
      methodColor = colors.blue;
      break;
    case 'POST':
      methodColor = colors.green;
      break;
    case 'PUT':
    case 'PATCH':
      methodColor = colors.yellow;
      break;
    case 'DELETE':
      methodColor = colors.red;
      break;
    default:
      methodColor = colors.white;
  }

  // Formatear duración
  let durationColor = colors.white;
  if (duration > 1000) {
    durationColor = colors.red;
  } else if (duration > 500) {
    durationColor = colors.yellow;
  } else {
    durationColor = colors.green;
  }

  // Log formateado
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ` +
    `${methodColor}${method.padEnd(7)}${colors.reset} ` +
    `${statusColor}${status}${colors.reset} ` +
    `${colors.white}${url}${colors.reset} ` +
    `${durationColor}${duration}ms${colors.reset}`
  );

  // Log de cuerpo de petición en desarrollo (solo POST/PUT/PATCH)
  if (process.env.NODE_ENV === 'development' && ['POST', 'PUT', 'PATCH'].includes(method)) {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`${colors.dim}Body:${colors.reset}`, JSON.stringify(req.body, null, 2));
    }
  }
};

/**
 * Logger general para eventos del sistema
 *
 * @param {string} level - Nivel de log (info, warn, error, success)
 * @param {string} message - Mensaje
 * @param {Object} meta - Metadata adicional
 */
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();

  let levelColor;
  let levelText;

  switch (level) {
    case 'info':
      levelColor = colors.blue;
      levelText = 'INFO';
      break;
    case 'warn':
      levelColor = colors.yellow;
      levelText = 'WARN';
      break;
    case 'error':
      levelColor = colors.red;
      levelText = 'ERROR';
      break;
    case 'success':
      levelColor = colors.green;
      levelText = 'SUCCESS';
      break;
    case 'debug':
      levelColor = colors.magenta;
      levelText = 'DEBUG';
      break;
    default:
      levelColor = colors.white;
      levelText = 'LOG';
  }

  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ` +
    `${levelColor}${levelText.padEnd(7)}${colors.reset} ` +
    `${message}`
  );

  if (Object.keys(meta).length > 0) {
    console.log(`${colors.dim}Meta:${colors.reset}`, JSON.stringify(meta, null, 2));
  }
};

/**
 * Funciones de logging específicas
 */
const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  success: (message, meta) => log('success', message, meta),
  debug: (message, meta) => log('debug', message, meta)
};

/**
 * Logger para eventos de RabbitMQ
 */
const logRabbitMQ = (type, queue, message) => {
  const icons = {
    publish: '📤',
    consume: '📥',
    ack: '✅',
    nack: '❌',
    error: '⚠️'
  };

  const icon = icons[type] || '📌';

  console.log(
    `${icon} ${colors.magenta}[RabbitMQ]${colors.reset} ` +
    `${type.toUpperCase().padEnd(10)} ` +
    `${colors.cyan}${queue}${colors.reset} ` +
    `${message ? '- ' + JSON.stringify(message) : ''}`
  );
};

/**
 * Logger para eventos de base de datos
 */
const logDatabase = (operation, model, details = {}) => {
  console.log(
    `${colors.yellow}[Database]${colors.reset} ` +
    `${operation.toUpperCase().padEnd(10)} ` +
    `${colors.cyan}${model}${colors.reset} ` +
    `${details ? '- ' + JSON.stringify(details) : ''}`
  );
};

module.exports = {
  requestLogger,
  logger,
  logRabbitMQ,
  logDatabase,
  log
};

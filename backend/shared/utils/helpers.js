/**
 * HELPERS - Funciones auxiliares reutilizables
 *
 * Propósito:
 * Proporcionar funciones de utilidad comunes
 *
 * Uso:
 * const { formatDate, calculatePercentage } = require('../shared/utils/helpers');
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Formatear fecha a ISO 8601
 *
 * @param {Date|string|number} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString();
};

/**
 * Formatear fecha a formato legible
 *
 * @param {Date|string|number} date
 * @param {string} locale - Locale (default: 'es-MX')
 * @returns {string}
 */
const formatDateHuman = (date, locale = 'es-MX') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calcular diferencia de tiempo en palabras
 *
 * @param {Date|string|number} date
 * @returns {string} "hace 5 minutos", "hace 2 horas", etc.
 */
const timeAgo = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const seconds = Math.floor((new Date() - d) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `hace ${interval} año${interval > 1 ? 's' : ''}`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `hace ${interval} mes${interval > 1 ? 'es' : ''}`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `hace ${interval} día${interval > 1 ? 's' : ''}`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `hace ${interval} hora${interval > 1 ? 's' : ''}`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `hace ${interval} minuto${interval > 1 ? 's' : ''}`;

  return 'hace unos segundos';
};

/**
 * Calcular porcentaje
 *
 * @param {number} value
 * @param {number} total
 * @param {number} decimals - Decimales (default: 2)
 * @returns {number}
 */
const calculatePercentage = (value, total, decimals = 2) => {
  if (total === 0) return 0;

  const percentage = (value / total) * 100;
  return parseFloat(percentage.toFixed(decimals));
};

/**
 * Redondear número a decimales específicos
 *
 * @param {number} value
 * @param {number} decimals - Decimales (default: 2)
 * @returns {number}
 */
const roundNumber = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return 0;

  return parseFloat(value.toFixed(decimals));
};

/**
 * Generar UUID v4
 *
 * @returns {string}
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Generar hash de contraseña
 *
 * @param {string} password
 * @param {number} saltRounds - Rondas de salt (default: 10)
 * @returns {Promise<string>}
 */
const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Comparar contraseña con hash
 *
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generar código aleatorio
 *
 * @param {number} length - Longitud del código (default: 6)
 * @returns {string}
 */
const generateCode = (length = 6) => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
};

/**
 * Generar token aleatorio
 *
 * @param {number} bytes - Bytes (default: 32)
 * @returns {string}
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Esperar (delay)
 *
 * @param {number} ms - Milisegundos
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Chunkar array (dividir en partes)
 *
 * @param {Array} array
 * @param {number} size - Tamaño de cada chunk
 * @returns {Array<Array>}
 */
const chunkArray = (array, size) => {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};

/**
 * Agrupar array por campo
 *
 * @param {Array} array
 * @param {string} key - Campo por el cual agrupar
 * @returns {Object}
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];

    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Ordenar array de objetos por campo
 *
 * @param {Array} array
 * @param {string} key - Campo por el cual ordenar
 * @param {string} order - 'asc' o 'desc' (default: 'asc')
 * @returns {Array}
 */
const sortBy = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Remover duplicados de array
 *
 * @param {Array} array
 * @param {string} key - Campo único (opcional)
 * @returns {Array}
 */
const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Paginar array
 *
 * @param {Array} array
 * @param {number} page - Página (1-indexed)
 * @param {number} limit - Elementos por página
 * @returns {Object} { data, page, totalPages, totalItems }
 */
const paginate = (array, page = 1, limit = 20) => {
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const data = array.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page: currentPage,
      limit,
      totalPages,
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
};

/**
 * Formatear respuesta de éxito
 *
 * @param {any} data
 * @param {string} message
 * @param {Object} meta
 * @returns {Object}
 */
const successResponse = (data, message = 'Operación exitosa', meta = {}) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...meta
  };
};

/**
 * Formatear respuesta de error
 *
 * @param {string} message
 * @param {string} code
 * @param {Object} details
 * @returns {Object}
 */
const errorResponse = (message, code = 'ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code
    },
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * Capitalizar primera letra
 *
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convertir a camelCase
 *
 * @param {string} str
 * @returns {string}
 */
const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
};

/**
 * Convertir a snake_case
 *
 * @param {string} str
 * @returns {string}
 */
const toSnakeCase = (str) => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

/**
 * Generar slug a partir de string
 *
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con -
    .replace(/^-+|-+$/g, ''); // Remover - al inicio y final
};

module.exports = {
  formatDate,
  formatDateHuman,
  timeAgo,
  calculatePercentage,
  roundNumber,
  generateUUID,
  hashPassword,
  comparePassword,
  generateCode,
  generateToken,
  sleep,
  chunkArray,
  groupBy,
  sortBy,
  removeDuplicates,
  paginate,
  successResponse,
  errorResponse,
  capitalize,
  toCamelCase,
  toSnakeCase,
  slugify
};

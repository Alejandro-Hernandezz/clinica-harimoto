/**
 * VALIDATORS - Funciones de validación reutilizables
 *
 * Propósito:
 * Validar datos de entrada en la aplicación
 *
 * Uso:
 * const { validateEmail, validatePassword } = require('../shared/utils/validators');
 * if (!validateEmail(email)) throw new Error('Email inválido');
 */

/**
 * Validar email
 *
 * @param {string} email
 * @returns {boolean}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña
 *
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos una letra
 * - Al menos un número
 *
 * @param {string} password
 * @returns {boolean}
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;

  // Mínimo 8 caracteres
  if (password.length < 8) return false;

  // Al menos una letra
  if (!/[a-zA-Z]/.test(password)) return false;

  // Al menos un número
  if (!/[0-9]/.test(password)) return false;

  return true;
};

/**
 * Validar UUID
 *
 * @param {string} uuid
 * @returns {boolean}
 */
const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validar teléfono (formato internacional o local)
 *
 * @param {string} phone
 * @returns {boolean}
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;

  // Remover espacios y guiones
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Validar formato: +528123456789 o 8123456789
  const phoneRegex = /^(\+?[0-9]{10,15})$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validar rango de valores numéricos
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
const validateRange = (value, min, max) => {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
};

/**
 * Validar que un valor no esté vacío
 *
 * @param {any} value
 * @returns {boolean}
 */
const validateRequired = (value) => {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }

  return true;
};

/**
 * Validar fecha ISO 8601
 *
 * @param {string} date
 * @returns {boolean}
 */
const validateISODate = (date) => {
  if (!date || typeof date !== 'string') return false;

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoDateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Validar enumeración (valores permitidos)
 *
 * @param {any} value
 * @param {Array} allowedValues
 * @returns {boolean}
 */
const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Validar objeto con esquema
 *
 * @param {Object} obj - Objeto a validar
 * @param {Object} schema - Esquema de validación
 * @returns {Object} { valid: boolean, errors: Array }
 *
 * Ejemplo:
 * const schema = {
 *   email: { type: 'string', required: true, validator: validateEmail },
 *   edad: { type: 'number', required: false, min: 18, max: 100 }
 * };
 * const result = validateObject(data, schema);
 */
const validateObject = (obj, schema) => {
  const errors = [];

  for (const field in schema) {
    const rules = schema[field];
    const value = obj[field];

    // Validar requerido
    if (rules.required && !validateRequired(value)) {
      errors.push(`Campo '${field}' es requerido`);
      continue;
    }

    // Si no es requerido y está vacío, saltar validaciones
    if (!rules.required && !validateRequired(value)) {
      continue;
    }

    // Validar tipo
    if (rules.type && typeof value !== rules.type) {
      errors.push(`Campo '${field}' debe ser de tipo ${rules.type}`);
      continue;
    }

    // Validar rango numérico
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Campo '${field}' debe ser mayor o igual a ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Campo '${field}' debe ser menor o igual a ${rules.max}`);
      }
    }

    // Validar longitud de string
    if (rules.type === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`Campo '${field}' debe tener al menos ${rules.minLength} caracteres`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`Campo '${field}' debe tener como máximo ${rules.maxLength} caracteres`);
      }
    }

    // Validar enumeración
    if (rules.enum && !validateEnum(value, rules.enum)) {
      errors.push(`Campo '${field}' debe ser uno de: ${rules.enum.join(', ')}`);
    }

    // Validador personalizado
    if (rules.validator && !rules.validator(value)) {
      errors.push(`Campo '${field}' no es válido`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizar string (remover caracteres peligrosos)
 *
 * @param {string} str
 * @returns {string}
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, ''); // Remover atributos on*=
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUUID,
  validatePhone,
  validateRange,
  validateRequired,
  validateISODate,
  validateEnum,
  validateObject,
  sanitizeString
};

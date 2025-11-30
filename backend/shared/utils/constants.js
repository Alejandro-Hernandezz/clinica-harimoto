/**
 * CONSTANTS - Constantes del sistema RIEGO-SMART
 *
 * Propósito:
 * Centralizar todas las constantes utilizadas en el sistema
 *
 * Uso:
 * const { SENSOR_TYPES, ALERT_TYPES } = require('../shared/utils/constants');
 */

/**
 * Tipos de sensores
 */
const SENSOR_TYPES = {
  HUMEDAD: 'HUMEDAD',
  TEMPERATURA: 'TEMPERATURA',
  HUMEDAD_SUELO: 'HUMEDAD_SUELO',
  LUZ: 'LUZ',
  PH: 'PH'
};

/**
 * Estados de sensores
 */
const SENSOR_STATUS = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  ERROR: 'ERROR',
  MANTENIMIENTO: 'MANTENIMIENTO'
};

/**
 * Estados de datos de sensores
 */
const DATA_STATUS = {
  NORMAL: 'NORMAL',
  ALERTA: 'ALERTA',
  CRITICO: 'CRITICO'
};

/**
 * Tipos de alertas
 */
const ALERT_TYPES = {
  RIEGO_NECESARIO: 'RIEGO_NECESARIO',
  TEMPERATURA_CRITICA: 'TEMPERATURA_CRITICA',
  SENSOR_DESCONECTADO: 'SENSOR_DESCONECTADO',
  HUMEDAD_EXCESIVA: 'HUMEDAD_EXCESIVA',
  TEMPERATURA_BAJA: 'TEMPERATURA_BAJA',
  BATERIA_BAJA: 'BATERIA_BAJA'
};

/**
 * Niveles de severidad de alertas
 */
const ALERT_SEVERITY = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA'
};

/**
 * Estados de alertas
 */
const ALERT_STATUS = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  RESUELTA: 'RESUELTA',
  IGNORADA: 'IGNORADA'
};

/**
 * Tipos de notificaciones
 */
const NOTIFICATION_TYPES = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  WEBHOOK: 'WEBHOOK'
};

/**
 * Estados de notificaciones
 */
const NOTIFICATION_STATUS = {
  PENDIENTE: 'PENDIENTE',
  ENVIANDO: 'ENVIANDO',
  ENVIADA: 'ENVIADA',
  FALLIDA: 'FALLIDA',
  CANCELADA: 'CANCELADA'
};

/**
 * Roles de usuario
 */
const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  VIEWER: 'VIEWER'
};

/**
 * Unidades de medida
 */
const UNITS = {
  HUMEDAD: '%',
  TEMPERATURA: '°C',
  LUZ: 'lux',
  PH: 'pH',
  VOLTAJE: 'V'
};

/**
 * Rangos de valores normales por tipo de sensor
 */
const NORMAL_RANGES = {
  HUMEDAD: {
    MIN: 30,
    MAX: 70,
    CRITICAL_MIN: 20,
    CRITICAL_MAX: 80
  },
  TEMPERATURA: {
    MIN: 15,
    MAX: 35,
    CRITICAL_MIN: 5,
    CRITICAL_MAX: 45
  },
  PH: {
    MIN: 5.5,
    MAX: 7.5,
    CRITICAL_MIN: 4.0,
    CRITICAL_MAX: 9.0
  }
};

/**
 * Intervalos de tiempo (en milisegundos)
 */
const INTERVALS = {
  SENSOR_READING: 5 * 60 * 1000,        // 5 minutos
  SENSOR_TIMEOUT: 30 * 60 * 1000,       // 30 minutos
  ALERT_COOLDOWN: 60 * 60 * 1000,       // 1 hora
  NOTIFICATION_RETRY: 5 * 60 * 1000,    // 5 minutos
  DATA_RETENTION: 30 * 24 * 60 * 60 * 1000  // 30 días
};

/**
 * Configuración de reintentos
 */
const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BACKOFF_MULTIPLIER: 2,
  INITIAL_DELAY: 5000 // 5 segundos
};

/**
 * Códigos de error personalizados
 */
const ERROR_CODES = {
  // Autenticación
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Validación
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',

  // Recursos
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Sensores
  SENSOR_NOT_FOUND: 'SENSOR_NOT_FOUND',
  SENSOR_INACTIVE: 'SENSOR_INACTIVE',
  SENSOR_DATA_INVALID: 'SENSOR_DATA_INVALID',

  // Base de datos
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',

  // Message Broker
  MQ_CONNECTION_ERROR: 'MQ_CONNECTION_ERROR',
  MQ_PUBLISH_ERROR: 'MQ_PUBLISH_ERROR',

  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * Mensajes de respuesta estándar
 */
const MESSAGES = {
  SUCCESS: {
    CREATED: 'Recurso creado exitosamente',
    UPDATED: 'Recurso actualizado exitosamente',
    DELETED: 'Recurso eliminado exitosamente',
    FETCHED: 'Datos obtenidos exitosamente'
  },
  ERROR: {
    NOT_FOUND: 'Recurso no encontrado',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso prohibido',
    VALIDATION: 'Error de validación',
    INTERNAL: 'Error interno del servidor'
  }
};

/**
 * Configuración de paginación
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

module.exports = {
  SENSOR_TYPES,
  SENSOR_STATUS,
  DATA_STATUS,
  ALERT_TYPES,
  ALERT_SEVERITY,
  ALERT_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUS,
  USER_ROLES,
  UNITS,
  NORMAL_RANGES,
  INTERVALS,
  RETRY_CONFIG,
  ERROR_CODES,
  MESSAGES,
  PAGINATION
};

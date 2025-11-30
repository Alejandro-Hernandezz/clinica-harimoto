/**
 * TYPES - Definiciones de tipos compartidos
 *
 * Propósito:
 * Centralizar las definiciones de tipos/interfaces utilizados en el sistema
 *
 * Nota: En JavaScript puro, esto sirve principalmente como documentación
 * En TypeScript, estas serían interfaces/types reales
 */

/**
 * @typedef {Object} User
 * @property {string} id - UUID del usuario
 * @property {string} email - Email único
 * @property {string} password - Password hasheado
 * @property {string} nombre - Nombre completo
 * @property {string} telefonoPropiedad - Teléfono de contacto
 * @property {string} emailPropiedad - Email secundario
 * @property {Object} preferenciasNotificacion - Preferencias de notificación
 * @property {boolean} preferenciasNotificacion.sms - Recibir SMS
 * @property {boolean} preferenciasNotificacion.email - Recibir emails
 * @property {boolean} activo - Usuario activo
 * @property {Date} fechaRegistro - Fecha de registro
 */

/**
 * @typedef {Object} Sensor
 * @property {string} id - UUID del sensor
 * @property {string} usuarioId - UUID del usuario propietario
 * @property {string} nombre - Nombre del sensor
 * @property {string} tipo - Tipo: HUMEDAD, TEMPERATURA, etc
 * @property {string} ubicacion - Ubicación física
 * @property {number} umbralMinimo - Umbral mínimo para alertas
 * @property {number} umbralMaximo - Umbral máximo para alertas
 * @property {Object} ultimaLectura - Última lectura recibida
 * @property {number} ultimaLectura.valor - Valor de la lectura
 * @property {Date} ultimaLectura.timestamp - Timestamp de la lectura
 * @property {string} estado - Estado: ACTIVO, INACTIVO, ERROR
 * @property {Object} configuracion - Configuración adicional
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de actualización
 */

/**
 * @typedef {Object} SensorData
 * @property {string} id - UUID del dato
 * @property {string} sensorId - UUID del sensor
 * @property {string} usuarioId - UUID del usuario
 * @property {number} valor - Valor numérico de la lectura
 * @property {string} unidad - Unidad de medida (%, °C, etc)
 * @property {number} temperatura - Temperatura contextual (opcional)
 * @property {Date} timestamp - Timestamp de la lectura
 * @property {string} estado - Estado: NORMAL, ALERTA, CRITICO
 * @property {Date} createdAt - Fecha de creación
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - UUID de la alerta
 * @property {string} usuarioId - UUID del usuario
 * @property {string} sensorId - UUID del sensor
 * @property {string} tipo - Tipo de alerta: RIEGO_NECESARIO, etc
 * @property {string} severidad - Severidad: BAJA, MEDIA, ALTA, CRITICA
 * @property {string} mensaje - Mensaje descriptivo
 * @property {string} recomendacion - Recomendación de acción
 * @property {boolean} leida - Si fue leída por el usuario
 * @property {boolean} resuelta - Si fue resuelta
 * @property {Date} fechaGeneracion - Fecha de generación
 * @property {Date} fechaResolucion - Fecha de resolución (null si no resuelta)
 * @property {Date} createdAt - Fecha de creación
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - UUID de la notificación
 * @property {string} usuarioId - UUID del usuario
 * @property {string} alertaId - UUID de la alerta relacionada
 * @property {string} tipo - Tipo: SMS, EMAIL, PUSH
 * @property {string} estado - Estado: PENDIENTE, ENVIADA, FALLIDA
 * @property {string} contenido - Contenido de la notificación
 * @property {number} intentos - Número de intentos de envío
 * @property {Date} ultimoIntento - Fecha del último intento
 * @property {Date} proximoReintento - Fecha del próximo reintento
 * @property {string} respuestaServicio - Respuesta del servicio de envío
 * @property {Date} createdAt - Fecha de creación
 */

/**
 * @typedef {Object} QueueMessage
 * @property {string} messageId - UUID del mensaje
 * @property {string} queue - Nombre de la cola
 * @property {Object} payload - Payload del mensaje
 * @property {Date} timestamp - Timestamp de publicación
 * @property {number} retryCount - Contador de reintentos
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {string} message - Mensaje descriptivo
 * @property {any} data - Datos de respuesta
 * @property {Object} meta - Metadata adicional (paginación, etc)
 * @property {string} timestamp - Timestamp de respuesta
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Siempre false
 * @property {Object} error - Objeto de error
 * @property {string} error.type - Tipo de error
 * @property {string} error.message - Mensaje del error
 * @property {string} error.code - Código del error
 * @property {any} error.details - Detalles adicionales
 * @property {string} timestamp - Timestamp del error
 * @property {string} path - Ruta de la petición
 * @property {string} method - Método HTTP
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Número de página (1-indexed)
 * @property {number} limit - Elementos por página
 * @property {string} sortBy - Campo por el cual ordenar
 * @property {string} order - Orden: 'asc' o 'desc'
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page - Página actual
 * @property {number} limit - Elementos por página
 * @property {number} totalPages - Total de páginas
 * @property {number} totalItems - Total de elementos
 * @property {boolean} hasNextPage - Tiene página siguiente
 * @property {boolean} hasPrevPage - Tiene página anterior
 */

/**
 * Tipos de eventos del sistema
 */
const EVENTS = {
  // Eventos de sensores
  SENSOR_CREATED: 'sensor.created',
  SENSOR_UPDATED: 'sensor.updated',
  SENSOR_DELETED: 'sensor.deleted',
  SENSOR_DATA_RECEIVED: 'sensor.data.received',

  // Eventos de alertas
  ALERT_GENERATED: 'alert.generated',
  ALERT_RESOLVED: 'alert.resolved',
  ALERT_READ: 'alert.read',

  // Eventos de notificaciones
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',
  NOTIFICATION_RETRY: 'notification.retry',

  // Eventos de usuario
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout'
};

module.exports = {
  EVENTS
};

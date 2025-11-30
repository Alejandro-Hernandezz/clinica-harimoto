/**
 * CONFIGURACIÓN DE COLAS - RabbitMQ Queue Configuration
 *
 * Propósito:
 * Define todas las colas utilizadas en el sistema RIEGO-SMART
 *
 * Patrones aplicados:
 * - Message Broker: Comunicación asíncrona entre microservicios
 * - Event-Driven Architecture: Eventos de dominio
 *
 * Colas definidas:
 * 1. sensor.data.received: Datos de sensores → Análisis
 * 2. alert.generated: Alertas → Notificaciones
 * 3. notification.sent: Notificaciones → Dashboard
 * 4. notification.failed: Notificaciones fallidas → Reintentos
 *
 * Características:
 * - Durables: Sobreviven a reinicios de RabbitMQ
 * - TTL: Tiempo de vida de mensajes
 * - Dead Letter Queues: Para mensajes fallidos
 */

const QUEUE_CONFIG = {
  // Cola 1: Datos de sensores recibidos
  'sensor.data.received': {
    description: 'Datos de sensores enviados al servicio de análisis',
    exchange: {
      name: 'riego-smart.sensor',
      type: 'topic'
    },
    routingKey: 'sensor.data.*',
    ttl: 3600000, // 1 hora
    deadLetterExchange: 'riego-smart.dlx',
    consumer: 'analysis-service',
    producer: 'sensor-service',
    messageFormat: {
      sensorId: 'string (UUID)',
      usuarioId: 'string (UUID)',
      tipo: 'string (HUMEDAD | TEMPERATURA)',
      valor: 'number',
      unidad: 'string (%,  °C)',
      temperatura: 'number (contexto)',
      timestamp: 'ISO 8601 string',
      ubicacion: 'string'
    },
    example: {
      sensorId: '550e8400-e29b-41d4-a716-446655440000',
      usuarioId: '123e4567-e89b-12d3-a456-426614174000',
      tipo: 'HUMEDAD',
      valor: 28.5,
      unidad: '%',
      temperatura: 32.1,
      timestamp: '2024-01-10T14:30:00Z',
      ubicacion: 'Parcela A'
    }
  },

  // Cola 2: Alertas generadas
  'alert.generated': {
    description: 'Alertas generadas por el servicio de análisis',
    exchange: {
      name: 'riego-smart.alerts',
      type: 'topic'
    },
    routingKey: 'alert.*',
    ttl: 7200000, // 2 horas
    deadLetterExchange: 'riego-smart.dlx',
    consumer: 'notification-service',
    producer: 'analysis-service',
    messageFormat: {
      alertaId: 'string (UUID)',
      usuarioId: 'string (UUID)',
      sensorId: 'string (UUID)',
      tipo: 'string (RIEGO_NECESARIO | TEMPERATURA_CRITICA | etc)',
      severidad: 'string (BAJA | MEDIA | ALTA)',
      mensaje: 'string',
      recomendacion: 'string',
      timestamp: 'ISO 8601 string'
    },
    example: {
      alertaId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      usuarioId: '123e4567-e89b-12d3-a456-426614174000',
      sensorId: '550e8400-e29b-41d4-a716-446655440000',
      tipo: 'RIEGO_NECESARIO',
      severidad: 'ALTA',
      mensaje: 'Humedad baja detectada en Parcela A',
      recomendacion: 'Activar sistema de riego inmediatamente',
      timestamp: '2024-01-10T14:30:00Z'
    }
  },

  // Cola 3: Notificaciones enviadas
  'notification.sent': {
    description: 'Notificaciones enviadas exitosamente',
    exchange: {
      name: 'riego-smart.notifications',
      type: 'topic'
    },
    routingKey: 'notification.sent',
    ttl: 86400000, // 24 horas
    consumer: 'frontend-websocket',
    producer: 'notification-service',
    messageFormat: {
      notificacionId: 'string (UUID)',
      usuarioId: 'string (UUID)',
      alertaId: 'string (UUID)',
      tipo: 'string (SMS | EMAIL | PUSH)',
      estado: 'string (ENVIADA)',
      timestamp: 'ISO 8601 string'
    },
    example: {
      notificacionId: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
      usuarioId: '123e4567-e89b-12d3-a456-426614174000',
      alertaId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      tipo: 'SMS',
      estado: 'ENVIADA',
      timestamp: '2024-01-10T14:31:00Z'
    }
  },

  // Cola 4: Notificaciones fallidas (para reintentos)
  'notification.failed': {
    description: 'Notificaciones que fallaron al enviarse',
    exchange: {
      name: 'riego-smart.notifications',
      type: 'topic'
    },
    routingKey: 'notification.failed',
    ttl: 86400000, // 24 horas
    deadLetterExchange: 'riego-smart.dlx',
    consumer: 'notification-service (retry handler)',
    producer: 'notification-service',
    messageFormat: {
      notificacionId: 'string (UUID)',
      usuarioId: 'string (UUID)',
      alertaId: 'string (UUID)',
      tipo: 'string (SMS | EMAIL | PUSH)',
      intentos: 'number',
      error: 'string',
      timestamp: 'ISO 8601 string'
    },
    example: {
      notificacionId: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
      usuarioId: '123e4567-e89b-12d3-a456-426614174000',
      alertaId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      tipo: 'SMS',
      intentos: 2,
      error: 'Timeout en servicio SMS',
      timestamp: '2024-01-10T14:31:00Z'
    }
  }
};

/**
 * Obtener configuración de una cola
 * @param {string} queueName
 * @returns {Object}
 */
function getQueueConfig(queueName) {
  return QUEUE_CONFIG[queueName] || null;
}

/**
 * Listar todas las colas
 * @returns {Array<string>}
 */
function listQueues() {
  return Object.keys(QUEUE_CONFIG);
}

/**
 * Validar formato de mensaje
 * @param {string} queueName
 * @param {Object} message
 * @returns {boolean}
 */
function validateMessage(queueName, message) {
  const config = QUEUE_CONFIG[queueName];
  if (!config) return false;

  const format = config.messageFormat;
  for (const field in format) {
    if (!(field in message)) {
      console.warn(`[Queue Config] ⚠️ Campo faltante '${field}' en mensaje para '${queueName}'`);
      return false;
    }
  }

  return true;
}

module.exports = {
  QUEUE_CONFIG,
  getQueueConfig,
  listQueues,
  validateMessage
};

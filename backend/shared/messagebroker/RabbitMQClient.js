/**
 * RABBITMQ CLIENT - Cliente reutilizable para Message Broker
 *
 * Propósito:
 * Proporciona una interfaz simplificada para interactuar con RabbitMQ
 * desde cualquier servicio del sistema RIEGO-SMART
 *
 * Patrones aplicados:
 * - Singleton: Una única instancia por servicio
 * - Message Broker: Comunicación asíncrona entre servicios
 *
 * Características:
 * - Conexión automática con reconexión
 * - Publicación de mensajes
 * - Consumo de mensajes con ACK/NACK
 * - Reintentos automáticos
 * - Logging de errores
 *
 * Uso:
 * const rabbitClient = new RabbitMQClient();
 * await rabbitClient.connect();
 * await rabbitClient.publish('sensor.data.received', data);
 * await rabbitClient.consume('alert.generated', handler);
 */

const amqp = require('amqplib');
const { QUEUE_CONFIG } = require('./queueConfig');

class RabbitMQClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 segundos
  }

  /**
   * Conectar a RabbitMQ
   *
   * @param {string} url - URL de conexión (default: RABBITMQ_URL de env)
   * @returns {Promise<boolean>}
   */
  async connect(url = process.env.RABBITMQ_URL || 'amqp://riego_rabbit:rabbit_password_2024@localhost:5672') {
    try {
      console.log('[RabbitMQ] Conectando a RabbitMQ...');

      // Crear conexión
      this.connection = await amqp.connect(url);

      // Crear canal
      this.channel = await this.connection.createChannel();

      // Configurar prefetch (procesar 1 mensaje a la vez)
      await this.channel.prefetch(1);

      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('[RabbitMQ] ✅ Conectado exitosamente');

      // Manejar cierre de conexión
      this.connection.on('close', () => {
        console.log('[RabbitMQ] ⚠️ Conexión cerrada');
        this.isConnected = false;
        this.reconnect();
      });

      // Manejar errores de conexión
      this.connection.on('error', (err) => {
        console.error('[RabbitMQ] ❌ Error de conexión:', err.message);
        this.isConnected = false;
      });

      // Crear colas y exchanges definidos en la configuración
      await this.setupQueues();

      return true;
    } catch (error) {
      console.error('[RabbitMQ] ❌ Error al conectar:', error.message);
      this.isConnected = false;

      // Intentar reconexión
      await this.reconnect();
      return false;
    }
  }

  /**
   * Reconectar a RabbitMQ (con backoff exponencial)
   */
  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[RabbitMQ] ❌ Máximo de reintentos alcanzado');
      process.exit(1); // Salir si no se puede conectar
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`[RabbitMQ] 🔄 Reintentando conexión en ${delay / 1000}s (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  /**
   * Configurar colas y exchanges
   */
  async setupQueues() {
    try {
      for (const queueName in QUEUE_CONFIG) {
        const config = QUEUE_CONFIG[queueName];

        // Crear exchange si está definido
        if (config.exchange) {
          await this.channel.assertExchange(
            config.exchange.name,
            config.exchange.type,
            { durable: true }
          );
        }

        // Crear cola
        await this.channel.assertQueue(queueName, {
          durable: true,
          deadLetterExchange: config.deadLetterExchange || '',
          messageTtl: config.ttl || undefined
        });

        // Bind cola a exchange si es necesario
        if (config.exchange && config.routingKey) {
          await this.channel.bindQueue(
            queueName,
            config.exchange.name,
            config.routingKey
          );
        }

        console.log(`[RabbitMQ] ✅ Cola '${queueName}' configurada`);
      }
    } catch (error) {
      console.error('[RabbitMQ] ❌ Error al configurar colas:', error.message);
      throw error;
    }
  }

  /**
   * Publicar mensaje en una cola
   *
   * @param {string} queue - Nombre de la cola
   * @param {Object} message - Mensaje a publicar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<boolean>}
   */
  async publish(queue, message, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('RabbitMQ no está conectado');
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));

      const publishOptions = {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        ...options
      };

      const result = this.channel.sendToQueue(queue, messageBuffer, publishOptions);

      if (result) {
        console.log(`[RabbitMQ] ✅ Mensaje publicado en '${queue}':`, message);
        return true;
      } else {
        console.warn(`[RabbitMQ] ⚠️ Buffer lleno, mensaje no enviado a '${queue}'`);
        return false;
      }
    } catch (error) {
      console.error(`[RabbitMQ] ❌ Error al publicar en '${queue}':`, error.message);
      throw error;
    }
  }

  /**
   * Consumir mensajes de una cola
   *
   * @param {string} queue - Nombre de la cola
   * @param {Function} handler - Función que procesa el mensaje
   * @param {Object} options - Opciones de consumo
   * @returns {Promise<void>}
   */
  async consume(queue, handler, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('RabbitMQ no está conectado');
      }

      console.log(`[RabbitMQ] 👂 Escuchando cola '${queue}'...`);

      await this.channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[RabbitMQ] 📩 Mensaje recibido de '${queue}':`, content);

            // Procesar mensaje con el handler
            await handler(content, msg);

            // Confirmar procesamiento (ACK)
            this.channel.ack(msg);
            console.log(`[RabbitMQ] ✅ Mensaje procesado y confirmado (ACK)`);

          } catch (error) {
            console.error(`[RabbitMQ] ❌ Error al procesar mensaje de '${queue}':`, error.message);

            // Rechazar mensaje y reenviarlo a la cola (NACK)
            // Si falla 3 veces, se envía a dead letter queue
            const retryCount = (msg.properties.headers && msg.properties.headers['x-retry-count']) || 0;

            if (retryCount < 3) {
              console.log(`[RabbitMQ] 🔄 Reintentando mensaje (intento ${retryCount + 1}/3)...`);

              // Incrementar contador de reintentos
              const headers = msg.properties.headers || {};
              headers['x-retry-count'] = retryCount + 1;

              // Republicar con delay
              setTimeout(() => {
                this.channel.publish(
                  '',
                  queue,
                  msg.content,
                  { headers, persistent: true }
                );
                this.channel.ack(msg);
              }, 5000); // Esperar 5 segundos antes de reintentar

            } else {
              console.error(`[RabbitMQ] ❌ Mensaje falló 3 veces, enviando a DLQ`);
              this.channel.nack(msg, false, false); // No requeue
            }
          }
        },
        {
          noAck: false, // Requerir confirmación manual
          ...options
        }
      );

      console.log(`[RabbitMQ] ✅ Consumer activo en cola '${queue}'`);

    } catch (error) {
      console.error(`[RabbitMQ] ❌ Error al consumir de '${queue}':`, error.message);
      throw error;
    }
  }

  /**
   * Cerrar conexión
   */
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log('[RabbitMQ] 👋 Conexión cerrada');
    } catch (error) {
      console.error('[RabbitMQ] ❌ Error al cerrar conexión:', error.message);
    }
  }

  /**
   * Verificar si está conectado
   */
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

module.exports = RabbitMQClient;

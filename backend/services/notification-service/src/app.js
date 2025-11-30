/**
 * NOTIFICATION SERVICE - Aplicación principal
 *
 * Puerto: 3003
 * Funcionalidades:
 * - Envío de notificaciones (simulado)
 * - Consumer de alertas de RabbitMQ
 * - Gestión de historial de notificaciones
 */

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const RabbitMQClient = require('../../../shared/messagebroker/RabbitMQClient');
const { authenticate } = require('../../../shared/middleware/authMiddleware');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse } = require('../../../shared/utils/helpers');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// ========== DATABASE ==========

const sequelize = new Sequelize(
  process.env.DB_NAME || 'notification_service',
  process.env.DB_USER || 'riego_admin',
  process.env.DB_PASSWORD || 'riego_password_2024',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// ========== MODELO ==========

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  alertaId: { type: DataTypes.UUID, allowNull: false, field: 'alerta_id' },
  tipo: { type: DataTypes.ENUM('SMS', 'EMAIL', 'PUSH'), allowNull: false },
  estado: { type: DataTypes.ENUM('PENDIENTE', 'ENVIADA', 'FALLIDA'), defaultValue: 'PENDIENTE' },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  intentos: { type: DataTypes.INTEGER, defaultValue: 0 },
  respuestaServicio: { type: DataTypes.TEXT, allowNull: true, field: 'respuesta_servicio' }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// ========== SERVICIO ==========

class NotificationService {
  constructor() {
    this.rabbitClient = null;
  }

  async initialize() {
    this.rabbitClient = new RabbitMQClient();
    await this.rabbitClient.connect();
  }

  /**
   * Enviar notificación (SIMULADO)
   */
  async enviarNotificacion(usuarioId, alerta) {
    const { alertaId, tipo, mensaje, severidad } = alerta;

    // Crear contenido de notificación
    const contenido = `🚨 ALERTA ${severidad}: ${mensaje}`;

    // Tipos de notificación (simulados)
    const tipos = ['SMS', 'EMAIL'];

    for (const tipoNotif of tipos) {
      try {
        // Simular envío
        console.log(`[Notification] 📤 Enviando ${tipoNotif} a usuario ${usuarioId}`);
        console.log(`[Notification] 💬 Contenido: ${contenido}`);

        // Guardar en BD
        await Notification.create({
          usuarioId,
          alertaId,
          tipo: tipoNotif,
          estado: 'ENVIADA',
          contenido,
          intentos: 1,
          respuestaServicio: 'Simulado exitosamente'
        });

        // Publicar evento de notificación enviada
        if (this.rabbitClient && this.rabbitClient.isConnected) {
          await this.rabbitClient.publish('notification.sent', {
            notificacionId: alertaId,
            usuarioId,
            alertaId,
            tipo: tipoNotif,
            estado: 'ENVIADA',
            timestamp: new Date()
          });
        }

        console.log(`[Notification] ✅ ${tipoNotif} enviado exitosamente`);

      } catch (error) {
        console.error(`[Notification] ❌ Error al enviar ${tipoNotif}:`, error.message);

        await Notification.create({
          usuarioId,
          alertaId,
          tipo: tipoNotif,
          estado: 'FALLIDA',
          contenido,
          intentos: 1,
          respuestaServicio: error.message
        });
      }
    }
  }

  async getNotificaciones(usuarioId, filters = {}) {
    const where = { usuarioId };

    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.estado) where.estado = filters.estado;

    return await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters.limit || 50
    });
  }
}

const notificationService = new NotificationService();

// ========== CONSUMER ==========

async function startConsumer() {
  try {
    await notificationService.initialize();

    // Escuchar cola de alertas
    await notificationService.rabbitClient.consume(
      'alert.generated',
      async (alerta) => {
        console.log(`[Consumer] 📩 Alerta recibida:`, alerta);

        // Enviar notificación
        await notificationService.enviarNotificacion(alerta.usuarioId, alerta);
      }
    );

    console.log('[Consumer] ✅ Consumer de alertas iniciado');

  } catch (error) {
    console.error('[Consumer] ❌ Error al iniciar consumer:', error.message);
  }
}

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'notification-service', status: 'healthy' });
});

app.get('/api/notificaciones', authenticate, asyncHandler(async (req, res) => {
  const usuarioId = req.user.id;
  const notificaciones = await notificationService.getNotificaciones(usuarioId, req.query);
  res.json(successResponse(notificaciones, 'Notificaciones obtenidas'));
}));

// ========== INICIO ==========

const startServer = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🚀 RIEGO-SMART - NOTIFICATION SERVICE');
    console.log('='.repeat(60));

    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('[Database] ✅ Conectado');

    await startConsumer();

    app.listen(PORT, () => {
      console.log(`✅ Notification Service escuchando en puerto ${PORT}`);
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;

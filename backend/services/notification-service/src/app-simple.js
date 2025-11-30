/**
 * NOTIFICATION SERVICE SIMPLIFICADO - Sin RabbitMQ
 */

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

// ========== BASE DE DATOS ==========

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
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  alertaId: { type: DataTypes.UUID, allowNull: false, field: 'alerta_id' },
  tipo: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.STRING, defaultValue: 'ENVIADA' },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  intentos: { type: DataTypes.INTEGER, defaultValue: 1 },
  respuestaServicio: { type: DataTypes.TEXT, field: 'respuesta_servicio' }
}, { tableName: 'notifications' });

// ========== MIDDLEWARE AUTH ==========

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ========== SERVICIO DE NOTIFICACIONES ==========

async function enviarNotificaciones(usuarioId, alerta) {
  const tipos = ['SMS', 'EMAIL'];
  const notificaciones = [];

  for (const tipo of tipos) {
    try {
      const contenido = `🚨 ALERTA ${alerta.severidad}: ${alerta.mensaje}`;

      console.log(`📤 Enviando ${tipo} a usuario ${usuarioId}`);
      console.log(`💬 Contenido: ${contenido}`);

      // Crear notificación en BD
      const notif = await Notification.create({
        usuarioId,
        alertaId: alerta.id,
        tipo,
        estado: 'ENVIADA',
        contenido,
        intentos: 1,
        respuestaServicio: 'Simulado exitosamente'
      });

      notificaciones.push(notif);
      console.log(`✅ ${tipo} enviado exitosamente`);

    } catch (error) {
      console.error(`❌ Error al enviar ${tipo}:`, error.message);

      await Notification.create({
        usuarioId,
        alertaId: alerta.id,
        tipo,
        estado: 'FALLIDA',
        contenido: `Error: ${error.message}`,
        intentos: 1,
        respuestaServicio: error.message
      });
    }
  }

  return notificaciones;
}

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'notification-service' });
});

// Endpoint para recibir alertas del Analysis Service
app.post('/api/notificar', async (req, res) => {
  try {
    const { usuarioId, alerta } = req.body;

    const notificaciones = await enviarNotificaciones(usuarioId, alerta);

    res.json({
      success: true,
      data: notificaciones,
      message: `${notificaciones.length} notificaciones enviadas`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar notificaciones
app.get('/api/notificaciones', authenticate, async (req, res) => {
  try {
    const notificaciones = await Notification.findAll({
      where: { usuarioId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit) || 50
    });
    res.json({ success: true, data: notificaciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener notificación por ID
app.get('/api/notificaciones/:id', authenticate, async (req, res) => {
  try {
    const notificacion = await Notification.findOne({
      where: { id: req.params.id, usuarioId: req.user.id }
    });
    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ success: true, data: notificacion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== INICIO ==========

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');

    await sequelize.sync({ alter: true });
    console.log('✅ BD sincronizada');

    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`✅ Notification Service escuchando en puerto ${PORT}`);
      console.log('   Con simulador SMS/Email integrado');
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

start();

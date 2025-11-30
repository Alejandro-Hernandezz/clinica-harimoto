/**
 * ANALYSIS SERVICE SIMPLIFICADO - Sin RabbitMQ
 */

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

// ========== BASE DE DATOS ==========

const sequelize = new Sequelize(
  process.env.DB_NAME || 'analysis_service',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Adezito666',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// ========== MODELO ==========

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  sensorId: { type: DataTypes.UUID, allowNull: false, field: 'sensor_id' },
  tipo: { type: DataTypes.STRING, allowNull: false },
  severidad: { type: DataTypes.STRING, defaultValue: 'MEDIA' },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  recomendacion: { type: DataTypes.TEXT },
  leida: { type: DataTypes.BOOLEAN, defaultValue: false },
  resuelta: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'alerts' });

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

// ========== LÓGICA DE ANÁLISIS ==========

async function analizarDato(dato) {
  const { sensorId, usuarioId, valor, umbralMinimo, umbralMaximo, tipo, ubicacion } = dato;

  let alerta = null;

  // Regla 1: Riego necesario
  if (valor < umbralMinimo) {
    alerta = await Alert.create({
      usuarioId,
      sensorId,
      tipo: 'RIEGO_NECESARIO',
      severidad: 'ALTA',
      mensaje: `Humedad baja detectada en ${ubicacion || 'sensor'}: ${valor}%`,
      recomendacion: 'Activar sistema de riego inmediatamente'
    });

    // Notificar a Notification Service
    try {
      await axios.post('http://localhost:3003/api/notificar', {
        usuarioId,
        alerta: {
          id: alerta.id,
          tipo: alerta.tipo,
          severidad: alerta.severidad,
          mensaje: alerta.mensaje
        }
      });
    } catch (error) {
      console.log('⚠️ Notification service no disponible');
    }
  }

  // Regla 2: Humedad excesiva
  if (valor > umbralMaximo) {
    alerta = await Alert.create({
      usuarioId,
      sensorId,
      tipo: 'HUMEDAD_EXCESIVA',
      severidad: 'MEDIA',
      mensaje: `Humedad excesiva en ${ubicacion || 'sensor'}: ${valor}%`,
      recomendacion: 'Verificar drenaje y detener riego'
    });

    try {
      await axios.post('http://localhost:3003/api/notificar', {
        usuarioId,
        alerta: {
          id: alerta.id,
          tipo: alerta.tipo,
          severidad: alerta.severidad,
          mensaje: alerta.mensaje
        }
      });
    } catch (error) {
      console.log('⚠️ Notification service no disponible');
    }
  }

  return alerta;
}

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'analysis-service' });
});

// Endpoint para recibir datos de sensores
app.post('/api/analizar', async (req, res) => {
  try {
    const alerta = await analizarDato(req.body);
    res.json({ success: true, alerta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar alertas
app.get('/api/alertas', authenticate, async (req, res) => {
  try {
    const alertas = await Alert.findAll({
      where: { usuarioId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit) || 50
    });
    res.json({ success: true, data: alertas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar como leída
app.put('/api/alertas/:id/leer', authenticate, async (req, res) => {
  try {
    const alerta = await Alert.findOne({
      where: { id: req.params.id, usuarioId: req.user.id }
    });
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });

    alerta.leida = true;
    await alerta.save();

    res.json({ success: true, data: alerta });
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
      console.log(`✅ Analysis Service escuchando en puerto ${PORT}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

start();

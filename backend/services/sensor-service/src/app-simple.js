/**
 * SENSOR SERVICE SIMPLIFICADO - Con simulador integrado, sin RabbitMQ
 */

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

// ========== BASE DE DATOS ==========

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sensor_service',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Adezito666',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// ========== MODELOS ==========

const Sensor = sequelize.define('Sensor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  nombre: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.STRING, defaultValue: 'HUMEDAD' },
  ubicacion: { type: DataTypes.STRING },
  umbralMinimo: { type: DataTypes.FLOAT, defaultValue: 30, field: 'umbral_minimo' },
  umbralMaximo: { type: DataTypes.FLOAT, defaultValue: 70, field: 'umbral_maximo' },
  estado: { type: DataTypes.STRING, defaultValue: 'ACTIVO' }
}, { tableName: 'sensors' });

const SensorData = sequelize.define('SensorData', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sensorId: { type: DataTypes.UUID, allowNull: false, field: 'sensor_id' },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  valor: { type: DataTypes.FLOAT, allowNull: false },
  unidad: { type: DataTypes.STRING, defaultValue: '%' },
  temperatura: { type: DataTypes.FLOAT },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'sensor_data', timestamps: false });

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

// ========== SIMULADOR ==========

function generarHumedad(ultimo = 50) {
  const variacion = (Math.random() - 0.5) * 10;
  let nuevo = ultimo + variacion;
  nuevo = Math.max(20, Math.min(80, nuevo));
  return Math.round(nuevo * 10) / 10;
}

function generarTemperatura() {
  const hora = new Date().getHours();
  const ciclo = Math.sin((hora - 2) * Math.PI / 24);
  const base = 25 + (ciclo * 10);
  const ruido = (Math.random() - 0.5) * 2;
  return Math.round((base + ruido) * 10) / 10;
}

async function notificarAnalysis(dato) {
  try {
    // Enviar a Analysis Service por HTTP
    await axios.post('http://localhost:3002/api/analizar', dato);
  } catch (error) {
    console.log('⚠️ Analysis service no disponible');
  }
}

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'sensor-service' });
});

// Crear sensor
app.post('/api/sensores', authenticate, async (req, res) => {
  try {
    const sensor = await Sensor.create({
      ...req.body,
      usuarioId: req.user.id
    });
    res.status(201).json({ success: true, data: sensor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar sensores
app.get('/api/sensores', authenticate, async (req, res) => {
  try {
    const sensores = await Sensor.findAll({
      where: { usuarioId: req.user.id }
    });
    res.json({ success: true, data: sensores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener sensor
app.get('/api/sensores/:id', authenticate, async (req, res) => {
  try {
    const sensor = await Sensor.findOne({
      where: { id: req.params.id, usuarioId: req.user.id }
    });
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });
    res.json({ success: true, data: sensor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guardar dato
app.post('/api/sensores/:id/datos', authenticate, async (req, res) => {
  try {
    const { valor, unidad, temperatura } = req.body;

    const sensor = await Sensor.findOne({
      where: { id: req.params.id, usuarioId: req.user.id }
    });
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });

    const dato = await SensorData.create({
      sensorId: req.params.id,
      usuarioId: req.user.id,
      valor,
      unidad: unidad || '%',
      temperatura
    });

    // Notificar a Analysis Service
    await notificarAnalysis({
      sensorId: sensor.id,
      usuarioId: req.user.id,
      valor,
      umbralMinimo: sensor.umbralMinimo,
      umbralMaximo: sensor.umbralMaximo,
      tipo: sensor.tipo,
      ubicacion: sensor.ubicacion
    });

    res.status(201).json({ success: true, data: dato });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SIMULADOR - Generar datos bulk
app.post('/api/sensores/:id/simular/bulk', authenticate, async (req, res) => {
  try {
    const { cantidad = 288 } = req.body;

    const sensor = await Sensor.findOne({
      where: { id: req.params.id, usuarioId: req.user.id }
    });
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });

    const datos = [];
    let ultimaHumedad = 50;
    const ahora = Date.now();
    const intervalo = (24 * 60 * 60 * 1000) / cantidad;

    for (let i = 0; i < cantidad; i++) {
      const timestamp = new Date(ahora - (cantidad - i) * intervalo);
      const valor = generarHumedad(ultimaHumedad);
      const temp = generarTemperatura();

      const dato = await SensorData.create({
        sensorId: sensor.id,
        usuarioId: req.user.id,
        valor,
        unidad: '%',
        temperatura: temp,
        timestamp
      });

      // Notificar a Analysis cada 10 datos
      if (i % 10 === 0) {
        await notificarAnalysis({
          sensorId: sensor.id,
          usuarioId: req.user.id,
          valor,
          umbralMinimo: sensor.umbralMinimo,
          umbralMaximo: sensor.umbralMaximo,
          tipo: sensor.tipo,
          ubicacion: sensor.ubicacion
        });
      }

      datos.push(dato);
      ultimaHumedad = valor;
    }

    res.status(201).json({
      success: true,
      message: `${cantidad} datos generados`,
      data: { total: datos.length, sensor: sensor.nombre }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial
app.get('/api/sensores/:id/datos/historial', authenticate, async (req, res) => {
  try {
    const datos = await SensorData.findAll({
      where: { sensorId: req.params.id, usuarioId: req.user.id },
      order: [['timestamp', 'DESC']],
      limit: parseInt(req.query.limit) || 100
    });
    res.json({ success: true, data: datos });
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
      console.log(`✅ Sensor Service escuchando en puerto ${PORT}`);
      console.log('   Con simulador integrado');
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

start();

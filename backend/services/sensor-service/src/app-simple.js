const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

const Sensor = sequelize.define('Sensor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuarioId: { type: DataTypes.UUID, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  ubicacion: { type: DataTypes.STRING, allowNull: false },
  umbralMinimo: { type: DataTypes.FLOAT },
  umbralMaximo: { type: DataTypes.FLOAT },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const SensorData = sequelize.define('SensorData', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sensorId: { type: DataTypes.UUID, allowNull: false },
  valor: { type: DataTypes.FLOAT, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalido' });
  }
};

function generarHumedad(ultimo = 50) {
  // Generar valores que produzcan alertas frecuentemente
  const random = Math.random();
  if (random < 0.4) {
    // 40% de probabilidad: humedad BAJA (genera alerta RIEGO_NECESARIO)
    return Math.round((15 + Math.random() * 15) * 10) / 10; // 15-30%
  } else if (random < 0.7) {
    // 30% de probabilidad: humedad ALTA (genera alerta EXCESO_HUMEDAD)
    return Math.round((70 + Math.random() * 15) * 10) / 10; // 70-85%
  } else {
    // 30% de probabilidad: humedad normal (sin alerta)
    return Math.round((40 + Math.random() * 20) * 10) / 10; // 40-60%
  }
}

function generarTemperatura() {
  const hora = new Date().getHours();
  const ciclo = Math.sin((hora - 2) * Math.PI / 24);
  const base = 25 + (ciclo * 10);
  const ruido = (Math.random() - 0.5) * 2;
  return Math.round((base + ruido) * 10) / 10;
}

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'sensor-service', port: PORT });
});

app.post('/api/sensores', authenticate, async (req, res) => {
  try {
    const sensor = await Sensor.create({ ...req.body, usuarioId: req.user.id });
    res.json({ success: true, data: sensor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sensores', authenticate, async (req, res) => {
  try {
    const sensores = await Sensor.findAll({ where: { usuarioId: req.user.id } });
    res.json({ success: true, data: sensores });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/sensores/:id/simular', authenticate, async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });

    const valor = sensor.tipo === 'HUMEDAD' ? generarHumedad() : generarTemperatura();
    const dato = await SensorData.create({ sensorId: sensor.id, valor });

    try {
      await axios.post('http://localhost:3002/api/analizar', {
        sensorId: sensor.id,
        usuarioId: sensor.usuarioId,
        valor,
        umbralMinimo: sensor.umbralMinimo,
        umbralMaximo: sensor.umbralMaximo,
        tipo: sensor.tipo,
        ubicacion: sensor.ubicacion
      });
    } catch (e) {
      console.log('Analysis Service no disponible');
    }

    res.json({ success: true, data: dato });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sensores/:id/datos', authenticate, async (req, res) => {
  try {
    const datos = await SensorData.findAll({
      where: { sensorId: req.params.id },
      order: [['timestamp', 'DESC']],
      limit: parseInt(req.query.limit) || 100
    });
    res.json({ success: true, data: datos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

console.log('Iniciando Sensor Service...');
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos SQLite lista');
    app.listen(PORT, () => {
      console.log('Sensor Service escuchando en puerto ' + PORT);
      console.log('Base de datos: database.sqlite');
    });
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });

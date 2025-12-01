const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../../../../config');

const app = express();
const PORT = config.ports.sensor;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(
  config.database.databases.sensor,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: false
  }
);

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
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalido' });
  }
};

function generarHumedad(ultimo = 50) {
  const variacion = (Math.random() - 0.5) * 10;
  let nuevo = ultimo + variacion;
  return Math.max(20, Math.min(80, Math.round(nuevo * 10) / 10));
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
      await axios.post('http://localhost:' + config.ports.analysis + '/api/analizar', {
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

console.log('Conectando a:', config.database.databases.sensor);
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Conectado a MySQL');
    app.listen(PORT, () => {
      console.log('Sensor Service escuchando en puerto ' + PORT);
    });
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    console.error('Edita config.js o crea la BD');
    process.exit(1);
  });

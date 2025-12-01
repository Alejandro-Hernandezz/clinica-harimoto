const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3002;
const JWT_SECRET = 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sensorId: { type: DataTypes.UUID, allowNull: false },
  usuarioId: { type: DataTypes.UUID, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  severidad: { type: DataTypes.STRING, allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  recomendacion: { type: DataTypes.TEXT },
  leido: { type: DataTypes.BOOLEAN, defaultValue: false }
});

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

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'analysis-service', port: PORT });
});

app.post('/api/analizar', async (req, res) => {
  try {
    const { sensorId, usuarioId, valor, umbralMinimo, umbralMaximo, tipo, ubicacion } = req.body;
    let alerta = null;

    if (tipo === 'HUMEDAD' && valor < umbralMinimo) {
      alerta = await Alert.create({
        sensorId, usuarioId,
        tipo: 'RIEGO_NECESARIO',
        severidad: 'ALTA',
        mensaje: 'Humedad baja detectada en ' + ubicacion + ': ' + valor + '%',
        recomendacion: 'Activar sistema de riego inmediatamente'
      });

      try {
        await axios.post('http://localhost:3003/api/notificar', {
          usuarioId,
          alerta: { id: alerta.id, tipo: alerta.tipo, severidad: alerta.severidad, mensaje: alerta.mensaje }
        });
      } catch (e) {
        console.log('Notification Service no disponible');
      }
    }

    if (tipo === 'HUMEDAD' && valor > umbralMaximo) {
      alerta = await Alert.create({
        sensorId, usuarioId,
        tipo: 'EXCESO_HUMEDAD',
        severidad: 'MEDIA',
        mensaje: 'Humedad alta detectada en ' + ubicacion + ': ' + valor + '%',
        recomendacion: 'Detener riego y verificar drenaje'
      });
    }

    res.json({ success: true, data: { analizado: true, alerta } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/alertas', authenticate, async (req, res) => {
  try {
    const alertas = await Alert.findAll({
      where: { usuarioId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit) || 50
    });
    res.json({ success: true, data: alertas });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/alertas/:id/leer', authenticate, async (req, res) => {
  try {
    const alerta = await Alert.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
    alerta.leido = true;
    await alerta.save();
    res.json({ success: true, data: alerta });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

console.log('Iniciando Analysis Service...');
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos SQLite lista');
    app.listen(PORT, () => {
      console.log('Analysis Service escuchando en puerto ' + PORT);
      console.log('Base de datos: database.sqlite');
    });
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });

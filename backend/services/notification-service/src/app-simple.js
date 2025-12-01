const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3003;
const JWT_SECRET = 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuarioId: { type: DataTypes.UUID, allowNull: false },
  alertaId: { type: DataTypes.UUID, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.STRING, defaultValue: 'ENVIADA' },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  intentos: { type: DataTypes.INTEGER, defaultValue: 1 },
  respuestaServicio: { type: DataTypes.TEXT }
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
  res.json({ success: true, service: 'notification-service', port: PORT });
});

app.post('/api/notificar', async (req, res) => {
  try {
    const { usuarioId, alerta } = req.body;
    const tipos = ['SMS', 'EMAIL'];
    const notificaciones = [];

    for (const tipo of tipos) {
      const contenido = 'ALERTA ' + alerta.severidad + ': ' + alerta.mensaje;

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
      console.log('Enviando ' + tipo + ' a usuario ' + usuarioId);
      console.log('Contenido: ' + contenido);
    }

    res.json({ success: true, data: notificaciones });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/notificaciones', authenticate, async (req, res) => {
  try {
    const notificaciones = await Notification.findAll({
      where: { usuarioId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit) || 50
    });
    res.json({ success: true, data: notificaciones });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

console.log('Iniciando Notification Service...');
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos SQLite lista');
    app.listen(PORT, () => {
      console.log('Notification Service escuchando en puerto ' + PORT);
      console.log('Base de datos: database.sqlite');
    });
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });

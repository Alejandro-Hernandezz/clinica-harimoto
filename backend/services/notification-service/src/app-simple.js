const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const config = require('../../../config');

const app = express();
const PORT = config.ports.notification;

app.use(cors());
app.use(express.json());

// BASE DE DATOS
const sequelize = new Sequelize(
  config.database.databases.notification,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: false
  }
);

// MODELO
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

// MIDDLEWARE AUTH
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

// RUTAS
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

// INICIO
console.log('Conectando a:', config.database.databases.notification);
sequelize.authenticate()
  .then(() => {
    console.log('Conectado a BD');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('BD sincronizada');
    app.listen(PORT, () => {
      console.log('Notification Service escuchando en puerto ' + PORT);
    });
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    console.error('Edita config.js con tus credenciales');
    process.exit(1);
  });

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../../config');

const app = express();
const PORT = config.ports.auth;

app.use(cors());
app.use(express.json());

// MYSQL DATABASE
const sequelize = new Sequelize(
  config.database.databases.auth,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: false
  }
);

// MODELO USER
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

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

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'auth-service', port: PORT });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    const user = await User.create({ email, password, nombre });
    res.json({ success: true, data: { id: user.id, email: user.email, nombre: user.nombre } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '24h' });
    res.json({ success: true, data: { token, user: { id: user.id, email: user.email, nombre: user.nombre } } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'nombre', 'activo'] });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

console.log('Conectando a MySQL...');
console.log('Host:', config.database.host);
console.log('Usuario:', config.database.user);
console.log('Base de datos:', config.database.databases.auth);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Conectado a MySQL y BD sincronizada');
    app.listen(PORT, () => {
      console.log('Auth Service escuchando en puerto ' + PORT);
    });
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    console.error('');
    console.error('SOLUCION:');
    console.error('1. Verifica que MySQL este corriendo');
    console.error('2. Edita config.js con tu password de MySQL');
    console.error('3. Crea la base de datos: CREATE DATABASE ' + config.database.databases.auth + ';');
    process.exit(1);
  });

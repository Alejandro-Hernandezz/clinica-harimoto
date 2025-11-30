/**
 * AUTH SERVICE SIMPLIFICADO - Sin dependencias compartidas
 */

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'riego_smart_secret_2024';

app.use(cors());
app.use(express.json());

// ========== BASE DE DATOS ==========

const sequelize = new Sequelize(
  process.env.DB_NAME || 'auth_service',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// ========== MODELO USER ==========

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

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

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'auth-service' });
});

// Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email ya existe' });
    }

    const user = await User.create({ email, password, nombre });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, nombre: user.nombre },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, nombre: user.nombre },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener perfil
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, data: user });
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
      console.log(`✅ Auth Service escuchando en puerto ${PORT}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

start();

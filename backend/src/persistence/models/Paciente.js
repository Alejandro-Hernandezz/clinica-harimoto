// GUARDAR COMO: backend/src/persistence/models/Paciente.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Paciente = sequelize.define('Paciente', {
  paciente_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rut: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  direccion: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'activo'
  }
}, {
  tableName: 'pacientes',
  timestamps: true,
  createdAt: 'fecha_registro',
  updatedAt: false
});

module.exports = Paciente;
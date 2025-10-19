// GUARDAR COMO: backend/src/persistence/models/Medico.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Medico = sequelize.define('Medico', {
  medico_id: {
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
  especialidad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'activo'
  }
}, {
  tableName: 'medicos',
  timestamps: false
});

module.exports = Medico;
// GUARDAR COMO: backend/src/persistence/models/Especialidad.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Especialidad = sequelize.define('Especialidad', {
  especialidad_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'especialidades',
  timestamps: false
});

module.exports = Especialidad;


// GUARDAR COMO: backend/src/persistence/models/Cita.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Cita = sequelize.define('Cita', {
  cita_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'programada'
  }
}, {
  tableName: 'citas',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Cita;
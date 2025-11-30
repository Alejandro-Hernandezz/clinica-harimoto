/**
 * ALERT MODEL - Modelo de Alertas
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { ALERT_TYPES, ALERT_SEVERITY } = require('../../../../shared/utils/constants');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'usuario_id'
  },

  sensorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sensor_id'
  },

  tipo: {
    type: DataTypes.ENUM(...Object.values(ALERT_TYPES)),
    allowNull: false
  },

  severidad: {
    type: DataTypes.ENUM(...Object.values(ALERT_SEVERITY)),
    allowNull: false,
    defaultValue: ALERT_SEVERITY.MEDIA
  },

  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  recomendacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  resuelta: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  fechaGeneracion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_generacion'
  },

  fechaResolucion: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_resolucion'
  }

}, {
  tableName: 'alerts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['sensor_id'] },
    { fields: ['tipo'] },
    { fields: ['leida'] },
    { fields: ['resuelta'] }
  ]
});

module.exports = Alert;

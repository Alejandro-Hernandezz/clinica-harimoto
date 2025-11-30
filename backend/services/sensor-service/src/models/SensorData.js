/**
 * SENSORDATA MODEL - Modelo de Datos de Sensor
 *
 * Campos:
 * - id: UUID único
 * - sensorId: UUID del sensor
 * - usuarioId: UUID del usuario
 * - valor: Valor numérico de la lectura
 * - unidad: Unidad de medida (%, °C, etc)
 * - temperatura: Temperatura contextual (opcional)
 * - timestamp: Fecha/hora de la lectura
 * - estado: Estado de la lectura (NORMAL, ALERTA, CRITICO)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { DATA_STATUS } = require('../../../../shared/utils/constants');

const SensorData = sequelize.define('SensorData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  sensorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sensor_id'
  },

  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'usuario_id'
  },

  valor: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  unidad: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '%'
  },

  temperatura: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  estado: {
    type: DataTypes.ENUM(...Object.values(DATA_STATUS)),
    allowNull: false,
    defaultValue: DATA_STATUS.NORMAL
  }

}, {
  tableName: 'sensor_data',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['sensor_id'] },
    { fields: ['usuario_id'] },
    { fields: ['timestamp'] },
    { fields: ['estado'] }
  ]
});

module.exports = SensorData;

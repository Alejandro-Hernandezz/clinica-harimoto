/**
 * SENSOR MODEL - Modelo de Sensor
 *
 * Campos:
 * - id: UUID único
 * - usuarioId: UUID del usuario propietario
 * - nombre: Nombre del sensor
 * - tipo: Tipo de sensor (HUMEDAD, TEMPERATURA, etc)
 * - ubicacion: Ubicación física del sensor
 * - umbralMinimo: Umbral mínimo para alertas
 * - umbralMaximo: Umbral máximo para alertas
 * - ultimaLectura: Objeto JSON con última lectura
 * - estado: Estado del sensor (ACTIVO, INACTIVO, ERROR)
 * - configuracion: Configuración adicional JSON
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { SENSOR_TYPES, SENSOR_STATUS } = require('../../../../shared/utils/constants');

const Sensor = sequelize.define('Sensor', {
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

  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  tipo: {
    type: DataTypes.ENUM(...Object.values(SENSOR_TYPES)),
    allowNull: false,
    defaultValue: SENSOR_TYPES.HUMEDAD
  },

  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  umbralMinimo: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 30,
    field: 'umbral_minimo'
  },

  umbralMaximo: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 70,
    field: 'umbral_maximo'
  },

  ultimaLectura: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
    field: 'ultima_lectura'
  },

  estado: {
    type: DataTypes.ENUM(...Object.values(SENSOR_STATUS)),
    allowNull: false,
    defaultValue: SENSOR_STATUS.ACTIVO
  },

  configuracion: {
    type: DataTypes.JSONB,
    defaultValue: {
      intervaloMuestreo: 300, // 5 minutos en segundos
      calibracion: 1.0
    }
  }

}, {
  tableName: 'sensors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['tipo'] },
    { fields: ['estado'] }
  ]
});

// Métodos de instancia
Sensor.prototype.updateLastReading = async function(valor, timestamp) {
  this.ultimaLectura = {
    valor,
    timestamp: timestamp || new Date()
  };
  await this.save();
};

module.exports = Sensor;

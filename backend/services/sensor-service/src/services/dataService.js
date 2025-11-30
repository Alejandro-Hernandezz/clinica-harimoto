/**
 * DATA SERVICE - Servicio de gestión de datos de sensores
 */

const SensorData = require('../models/SensorData');
const Sensor = require('../models/Sensor');
const RabbitMQClient = require('../../../../shared/messagebroker/RabbitMQClient');
const { NotFoundError } = require('../../../../shared/middleware/errorHandler');

class DataService {
  constructor() {
    this.rabbitClient = null;
  }

  async initialize() {
    this.rabbitClient = new RabbitMQClient();
    await this.rabbitClient.connect();
  }

  async saveData(dataObj) {
    const { sensorId, usuarioId, valor, unidad, temperatura, timestamp, estado } = dataObj;

    // Guardar en BD
    const data = await SensorData.create({
      sensorId,
      usuarioId,
      valor,
      unidad,
      temperatura,
      timestamp: timestamp || new Date(),
      estado: estado || 'NORMAL'
    });

    // Actualizar última lectura en sensor
    const sensor = await Sensor.findByPk(sensorId);
    if (sensor) {
      await sensor.updateLastReading(valor, timestamp);
    }

    // Publicar a RabbitMQ para análisis
    if (this.rabbitClient && this.rabbitClient.isConnected) {
      await this.rabbitClient.publish('sensor.data.received', {
        sensorId,
        usuarioId,
        tipo: sensor?.tipo,
        valor,
        unidad,
        temperatura,
        timestamp: timestamp || new Date(),
        ubicacion: sensor?.ubicacion
      });
    }

    return data;
  }

  async getDataHistory(sensorId, usuarioId, filters = {}) {
    const where = { sensorId, usuarioId };

    const { limit = 100, offset = 0, desde, hasta } = filters;

    if (desde) {
      where.timestamp = { ...where.timestamp, $gte: new Date(desde) };
    }
    if (hasta) {
      where.timestamp = { ...where.timestamp, $lte: new Date(hasta) };
    }

    const data = await SensorData.findAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });

    return data;
  }

  async getStatistics(sensorId, usuarioId) {
    const sensor = await Sensor.findOne({ where: { id: sensorId, usuarioId } });
    if (!sensor) throw new NotFoundError('Sensor');

    const data = await SensorData.findAll({
      where: { sensorId },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    if (data.length === 0) {
      return {
        promedio: 0,
        maximo: 0,
        minimo: 0,
        total: 0
      };
    }

    const valores = data.map(d => d.valor);

    return {
      promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
      maximo: Math.max(...valores),
      minimo: Math.min(...valores),
      total: data.length,
      ultimaLectura: data[0]
    };
  }
}

module.exports = new DataService();

/**
 * SENSOR SERVICE - Servicio de gestión de sensores
 */

const Sensor = require('../models/Sensor');
const { NotFoundError, ValidationError } = require('../../../../shared/middleware/errorHandler');

class SensorService {
  async createSensor(usuarioId, sensorData) {
    const { nombre, tipo, ubicacion, umbralMinimo, umbralMaximo } = sensorData;

    const sensor = await Sensor.create({
      usuarioId,
      nombre,
      tipo,
      ubicacion,
      umbralMinimo: umbralMinimo || 30,
      umbralMaximo: umbralMaximo || 70,
      estado: 'ACTIVO'
    });

    console.log(`[SensorService] ✅ Sensor creado: ${sensor.nombre}`);
    return sensor;
  }

  async getSensors(usuarioId, filters = {}) {
    const where = { usuarioId };

    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.estado) where.estado = filters.estado;

    const sensors = await Sensor.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return sensors;
  }

  async getSensorById(sensorId, usuarioId) {
    const sensor = await Sensor.findOne({
      where: { id: sensorId, usuarioId }
    });

    if (!sensor) {
      throw new NotFoundError('Sensor');
    }

    return sensor;
  }

  async updateSensor(sensorId, usuarioId, updateData) {
    const sensor = await this.getSensorById(sensorId, usuarioId);

    const { nombre, ubicacion, umbralMinimo, umbralMaximo, estado } = updateData;

    if (nombre) sensor.nombre = nombre;
    if (ubicacion) sensor.ubicacion = ubicacion;
    if (umbralMinimo !== undefined) sensor.umbralMinimo = umbralMinimo;
    if (umbralMaximo !== undefined) sensor.umbralMaximo = umbralMaximo;
    if (estado) sensor.estado = estado;

    await sensor.save();

    console.log(`[SensorService] ✅ Sensor actualizado: ${sensor.nombre}`);
    return sensor;
  }

  async deleteSensor(sensorId, usuarioId) {
    const sensor = await this.getSensorById(sensorId, usuarioId);
    await sensor.destroy();

    console.log(`[SensorService] ✅ Sensor eliminado: ${sensor.nombre}`);
    return true;
  }
}

module.exports = new SensorService();

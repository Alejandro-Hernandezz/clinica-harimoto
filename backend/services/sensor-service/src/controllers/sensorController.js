/**
 * SENSOR CONTROLLER - Controlador de sensores y datos
 */

const sensorService = require('../services/sensorService');
const dataService = require('../services/dataService');
const simulatorService = require('../services/simulatorService');
const { asyncHandler } = require('../../../../shared/middleware/errorHandler');
const { successResponse } = require('../../../../shared/utils/helpers');

// ========== CRUD DE SENSORES ==========

const createSensor = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id;
  const sensorData = req.body;

  const sensor = await sensorService.createSensor(usuarioId, sensorData);

  res.status(201).json(
    successResponse(sensor, 'Sensor creado exitosamente')
  );
});

const getSensors = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id;
  const filters = req.query;

  const sensors = await sensorService.getSensors(usuarioId, filters);

  res.status(200).json(
    successResponse(sensors, 'Sensores obtenidos exitosamente')
  );
});

const getSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.user.id;

  const sensor = await sensorService.getSensorById(id, usuarioId);

  res.status(200).json(
    successResponse(sensor, 'Sensor obtenido exitosamente')
  );
});

const updateSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.user.id;
  const updateData = req.body;

  const sensor = await sensorService.updateSensor(id, usuarioId, updateData);

  res.status(200).json(
    successResponse(sensor, 'Sensor actualizado exitosamente')
  );
});

const deleteSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.user.id;

  await sensorService.deleteSensor(id, usuarioId);

  res.status(200).json(
    successResponse(null, 'Sensor eliminado exitosamente')
  );
});

// ========== GESTIÓN DE DATOS ==========

const saveData = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId
  const usuarioId = req.user.id;
  const { valor, unidad, temperatura } = req.body;

  const dataObj = {
    sensorId: id,
    usuarioId,
    valor,
    unidad,
    temperatura
  };

  const data = await dataService.saveData(dataObj);

  res.status(201).json(
    successResponse(data, 'Dato guardado exitosamente')
  );
});

const getDataHistory = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId
  const usuarioId = req.user.id;
  const filters = req.query;

  const data = await dataService.getDataHistory(id, usuarioId, filters);

  res.status(200).json(
    successResponse(data, 'Historial obtenido exitosamente')
  );
});

const getStatistics = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId
  const usuarioId = req.user.id;

  const stats = await dataService.getStatistics(id, usuarioId);

  res.status(200).json(
    successResponse(stats, 'Estadísticas obtenidas exitosamente')
  );
});

// ========== SIMULADOR ==========

const generateBulkData = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId
  const usuarioId = req.user.id;
  const { cantidad = 288, horasAtras = 24 } = req.body;

  const sensor = await sensorService.getSensorById(id, usuarioId);

  // Generar datos
  const datos = simulatorService.generarBulk(sensor, cantidad, horasAtras);

  // Guardar en BD
  for (const dato of datos) {
    await dataService.saveData(dato);
  }

  res.status(201).json(
    successResponse(
      { total: datos.length, sensor: sensor.nombre },
      `${datos.length} datos generados exitosamente`
    )
  );
});

const startStreamSimulation = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId
  const usuarioId = req.user.id;
  const { duracionMinutos = 60, intervaloSegundos = 5 } = req.body;

  const sensor = await sensorService.getSensorById(id, usuarioId);

  // Iniciar simulación en background
  simulatorService.generarStream(sensor, duracionMinutos, intervaloSegundos);

  res.status(200).json(
    successResponse(
      { sensorId: sensor.id, duracionMinutos, intervaloSegundos },
      'Simulación iniciada en background'
    )
  );
});

const stopStreamSimulation = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId

  const stopped = simulatorService.detenerStream(id);

  res.status(200).json(
    successResponse(
      { stopped },
      stopped ? 'Simulación detenida' : 'No hay simulación activa'
    )
  );
});

const generateEventData = asyncHandler(async (req, res) => {
  const { id } = req.params; // sensorId
  const usuarioId = req.user.id;
  const { evento } = req.body; // 'sequia', 'lluvia', 'temperatura-critica'

  const sensor = await sensorService.getSensorById(id, usuarioId);

  let datos = [];

  switch (evento) {
    case 'sequia':
      datos = simulatorService.generarEventoSequia(sensor);
      break;
    case 'lluvia':
      datos = simulatorService.generarEventoLluvia(sensor);
      break;
    case 'temperatura-critica':
      datos = simulatorService.generarEventoTemperaturaCritica(sensor);
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'Evento no válido. Use: sequia, lluvia, temperatura-critica'
      });
  }

  // Guardar en BD
  for (const dato of datos) {
    await dataService.saveData(dato);
  }

  res.status(201).json(
    successResponse(
      { total: datos.length, evento, sensor: sensor.nombre },
      `Evento '${evento}' generado exitosamente`
    )
  );
});

module.exports = {
  createSensor,
  getSensors,
  getSensor,
  updateSensor,
  deleteSensor,
  saveData,
  getDataHistory,
  getStatistics,
  generateBulkData,
  startStreamSimulation,
  stopStreamSimulation,
  generateEventData
};

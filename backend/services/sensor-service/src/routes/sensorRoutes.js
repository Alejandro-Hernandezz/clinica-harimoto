/**
 * SENSOR ROUTES - Rutas del servicio de sensores
 */

const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { authenticate } = require('../../../../shared/middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// ========== CRUD DE SENSORES ==========

router.post('/sensores', sensorController.createSensor);
router.get('/sensores', sensorController.getSensors);
router.get('/sensores/:id', sensorController.getSensor);
router.put('/sensores/:id', sensorController.updateSensor);
router.delete('/sensores/:id', sensorController.deleteSensor);

// ========== GESTIÓN DE DATOS ==========

router.post('/sensores/:id/datos', sensorController.saveData);
router.get('/sensores/:id/datos/historial', sensorController.getDataHistory);
router.get('/sensores/:id/estadisticas', sensorController.getStatistics);

// ========== SIMULADOR ==========

router.post('/sensores/:id/simular/bulk', sensorController.generateBulkData);
router.post('/sensores/:id/simular/stream/start', sensorController.startStreamSimulation);
router.post('/sensores/:id/simular/stream/stop', sensorController.stopStreamSimulation);
router.post('/sensores/:id/simular/evento', sensorController.generateEventData);

module.exports = router;

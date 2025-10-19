const express = require('express');
const CitaController = require('../controllers/CitaController');

const router = express.Router();

router.post('/citas', CitaController.agendarCita.bind(CitaController));
router.put('/citas/:citaId', CitaController.modificarCita.bind(CitaController));
router.delete('/citas/:citaId', CitaController.cancelarCita.bind(CitaController));
router.get('/citas/paciente/:pacienteId', CitaController.obtenerCitasPaciente.bind(CitaController));
router.get('/citas/disponibilidad', CitaController.consultarDisponibilidad.bind(CitaController));

module.exports = router;
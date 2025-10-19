const express = require('express');
const EspecialidadController = require('../controllers/EspecialidadController');

const router = express.Router();

// Obtener todas las especialidades
router.get('/especialidades', EspecialidadController.listarEspecialidades.bind(EspecialidadController));

// Obtener especialidades con cantidad de médicos
router.get('/especialidades/conteo', EspecialidadController.listarEspecialidadesConConteo.bind(EspecialidadController));

// Obtener una especialidad específica con sus médicos
router.get('/especialidades/:especialidadId', EspecialidadController.obtenerEspecialidad.bind(EspecialidadController));

// Crear nueva especialidad
router.post('/especialidades', EspecialidadController.crearEspecialidad.bind(EspecialidadController));

module.exports = router;
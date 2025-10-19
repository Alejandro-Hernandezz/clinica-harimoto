const express = require('express');
const MedicoController = require('../controllers/MedicoController');

const router = express.Router();

// Obtener todos los médicos activos
router.get('/medicos', MedicoController.listarMedicos.bind(MedicoController));

// Obtener médicos por especialidad
router.get('/medicos/especialidad/:especialidadId', MedicoController.listarMedicosPorEspecialidad.bind(MedicoController));

// Obtener un médico específico
router.get('/medicos/:medicoId', MedicoController.obtenerMedico.bind(MedicoController));

// Crear nuevo médico
router.post('/medicos', MedicoController.crearMedico.bind(MedicoController));

// Actualizar médico 
router.put('/medicos/:medicoId', MedicoController.actualizarMedico.bind(MedicoController));

module.exports = router;
// GUARDAR COMO: backend/src/presentation/controllers/MedicoController.js

const MedicoRepository = require('../../data/repositories/MedicoRepository');

class MedicoController {

  async listarMedicos(req, res) {
    try {
      const medicos = await MedicoRepository.findAll();

      res.status(200).json({
        success: true,
        data: medicos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarMedicosPorEspecialidad(req, res) {
    try {
      const { especialidadId } = req.params;

      const medicos = await MedicoRepository.findByEspecialidad(especialidadId);

      res.status(200).json({
        success: true,
        data: medicos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerMedico(req, res) {
    try {
      const { medicoId } = req.params;

      const medico = await MedicoRepository.findById(medicoId);

      if (!medico) {
        return res.status(404).json({
          success: false,
          message: 'Médico no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: medico
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async crearMedico(req, res) {
    try {
      const { rut, nombres, apellidos, especialidad_id, email, telefono } = req.body;

      // Validaciones
      if (!rut || !nombres || !apellidos || !especialidad_id || !email) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: rut, nombres, apellidos, especialidad_id, email'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      // Validar formato de RUT chileno (básico)
      const rutRegex = /^\d{7,8}-[\dkK]$/;
      if (!rutRegex.test(rut)) {
        return res.status(400).json({
          success: false,
          message: 'RUT inválido. Formato esperado: 12345678-9'
        });
      }

      const medicoData = {
        rut,
        nombres,
        apellidos,
        especialidad_id,
        email,
        telefono: telefono || null,
        estado: 'activo'
      };

      const medico = await MedicoRepository.create(medicoData);

      // Obtener el médico con la especialidad incluida
      const medicoCompleto = await MedicoRepository.findById(medico.medico_id);

      res.status(201).json({
        success: true,
        message: 'Médico creado exitosamente',
        data: medicoCompleto
      });
    } catch (error) {
      // Errores de duplicados (RUT o email ya existen)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'El RUT o email ya está registrado'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ← AGREGAR MÉTODO PARA ACTUALIZAR MÉDICO (BONUS)
  async actualizarMedico(req, res) {
    try {
      const { medicoId } = req.params;
      const { nombres, apellidos, especialidad_id, email, telefono, estado } = req.body;

      const medicoExistente = await MedicoRepository.findById(medicoId);

      if (!medicoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Médico no encontrado'
        });
      }

      const datosActualizados = {};
      if (nombres) datosActualizados.nombres = nombres;
      if (apellidos) datosActualizados.apellidos = apellidos;
      if (especialidad_id) datosActualizados.especialidad_id = especialidad_id;
      if (email) datosActualizados.email = email;
      if (telefono) datosActualizados.telefono = telefono;
      if (estado) datosActualizados.estado = estado;

      const medicoActualizado = await MedicoRepository.update(medicoId, datosActualizados);

      res.status(200).json({
        success: true,
        message: 'Médico actualizado exitosamente',
        data: medicoActualizado
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado por otro médico'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MedicoController();
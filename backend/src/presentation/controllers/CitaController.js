// GUARDAR COMO: backend/src/presentation/controllers/CitaController.js

const CitaService = require('../../business/services/CitaService');

class CitaController {
  
  async agendarCita(req, res) {
    try {
      const citaData = req.body;
      const cita = await CitaService.agendarCita(citaData);
      
      res.status(201).json({
        success: true,
        message: 'Cita agendada exitosamente',
        data: cita
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async modificarCita(req, res) {
    try {
      const { citaId } = req.params;
      const citaData = req.body;
      
      const cita = await CitaService.modificarCita(citaId, citaData);
      
      res.status(200).json({
        success: true,
        message: 'Cita modificada exitosamente',
        data: cita
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelarCita(req, res) {
    try {
      const { citaId } = req.params;
      const cita = await CitaService.cancelarCita(citaId);
      
      res.status(200).json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: cita
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerCitasPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const citas = await CitaService.obtenerCitasPorPaciente(pacienteId);
      
      res.status(200).json({
        success: true,
        data: citas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async consultarDisponibilidad(req, res) {
    try {
      const { medicoId, fecha } = req.query;
      
      if (!medicoId || !fecha) {
        return res.status(400).json({
          success: false,
          message: 'medicoId y fecha son requeridos'
        });
      }

      const disponibilidad = await CitaService.obtenerDisponibilidadMedico(
        medicoId, 
        fecha
      );
      
      res.status(200).json({
        success: true,
        data: disponibilidad
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CitaController();
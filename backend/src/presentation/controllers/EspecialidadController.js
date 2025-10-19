const EspecialidadRepository = require('../../data/repositories/EspecialidadRepository');

class EspecialidadController {
  
  async listarEspecialidades(req, res) {
    try {
      const especialidades = await EspecialidadRepository.findAll();
      
      res.status(200).json({
        success: true,
        data: especialidades
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarEspecialidadesConConteo(req, res) {
    try {
      const especialidades = await EspecialidadRepository.findAllWithMedicoCount();
      
      res.status(200).json({
        success: true,
        data: especialidades
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerEspecialidad(req, res) {
    try {
      const { especialidadId } = req.params;
      
      const especialidad = await EspecialidadRepository.findById(especialidadId);
      
      if (!especialidad) {
        return res.status(404).json({
          success: false,
          message: 'Especialidad no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: especialidad
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async crearEspecialidad(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la especialidad es requerido'
        });
      }

      const especialidad = await EspecialidadRepository.create({ nombre, descripcion });
      
      res.status(201).json({
        success: true,
        message: 'Especialidad creada exitosamente',
        data: especialidad
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EspecialidadController();
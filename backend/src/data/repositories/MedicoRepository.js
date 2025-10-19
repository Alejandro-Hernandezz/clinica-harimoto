const { Medico, Especialidad } = require('../../persistence/models');

class MedicoRepository {
  
  async findById(medicoId) {
    try {
      const medico = await Medico.findByPk(medicoId, {
        attributes: ['medico_id', 'nombres', 'apellidos', 'especialidad_id', 'email', 'telefono', 'estado'],
        include: [{
          model: Especialidad,
          as: 'Especialidad',
          attributes: ['especialidad_id', 'nombre']
        }]
      });
      return medico;
    } catch (error) {
      throw new Error(`Error al buscar médico: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const medicos = await Medico.findAll({
        where: { estado: 'activo' },
        attributes: ['medico_id', 'nombres', 'apellidos', 'especialidad_id', 'email', 'telefono'],
        include: [{
          model: Especialidad,
          as: 'Especialidad',
          attributes: ['especialidad_id', 'nombre']
        }],
        order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
      });
      return medicos;
    } catch (error) {
      throw new Error(`Error al listar médicos: ${error.message}`);
    }
  }

  async findByEspecialidad(especialidadId) {
    try {
      const medicos = await Medico.findAll({
        where: { 
          especialidad_id: especialidadId,
          estado: 'activo'
        },
        attributes: ['medico_id', 'nombres', 'apellidos', 'email', 'telefono'],
        include: [{
          model: Especialidad,
          as: 'Especialidad',
          attributes: ['especialidad_id', 'nombre']
        }],
        order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
      });
      return medicos;
    } catch (error) {
      throw new Error(`Error al buscar médicos por especialidad: ${error.message}`);
    }
  }

  async create(medicoData) {
    try {
      const medico = await Medico.create(medicoData);
      return medico;
    } catch (error) {
      throw new Error(`Error al crear médico: ${error.message}`);
    }
  }

  async update(medicoId, medicoData) {
    try {
      const [rowsUpdated] = await Medico.update(medicoData, {
        where: { medico_id: medicoId }
      });
      
      if (rowsUpdated > 0) {
        return await this.findById(medicoId);
      }
      return null;
    } catch (error) {
      throw new Error(`Error al actualizar médico: ${error.message}`);
    }
  }
}

module.exports = new MedicoRepository();
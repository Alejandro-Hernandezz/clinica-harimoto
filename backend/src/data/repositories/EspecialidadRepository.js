const { Especialidad, Medico } = require('../../persistence/models');

class EspecialidadRepository {
  
  async findAll() {
    try {
      const especialidades = await Especialidad.findAll({
        attributes: ['especialidad_id', 'nombre', 'descripcion'],
        order: [['nombre', 'ASC']]
      });
      return especialidades;
    } catch (error) {
      throw new Error(`Error al listar especialidades: ${error.message}`);
    }
  }

  async findById(especialidadId) {
    try {
      const especialidad = await Especialidad.findByPk(especialidadId, {
        attributes: ['especialidad_id', 'nombre', 'descripcion'],
        include: [{
          model: Medico,
          as: 'Medicos',
          attributes: ['medico_id', 'nombres', 'apellidos', 'email'],
          where: { estado: 'activo' },
          required: false
        }]
      });
      return especialidad;
    } catch (error) {
      throw new Error(`Error al buscar especialidad: ${error.message}`);
    }
  }

  async findAllWithMedicoCount() {
    try {
      const especialidades = await Especialidad.findAll({
        attributes: [
          'especialidad_id', 
          'nombre', 
          'descripcion',
          [Especialidad.sequelize.fn('COUNT', Especialidad.sequelize.col('Medicos.medico_id')), 'cantidad_medicos']
        ],
        include: [{
          model: Medico,
          as: 'Medicos',
          attributes: [],
          where: { estado: 'activo' },
          required: false
        }],
        group: ['Especialidad.especialidad_id'],
        order: [['nombre', 'ASC']]
      });
      return especialidades;
    } catch (error) {
      throw new Error(`Error al listar especialidades con conteo: ${error.message}`);
    }
  }

  async create(especialidadData) {
    try {
      const especialidad = await Especialidad.create(especialidadData);
      return especialidad;
    } catch (error) {
      throw new Error(`Error al crear especialidad: ${error.message}`);
    }
  }

  async update(especialidadId, especialidadData) {
    try {
      const [rowsUpdated] = await Especialidad.update(especialidadData, {
        where: { especialidad_id: especialidadId }
      });
      
      if (rowsUpdated > 0) {
        return await this.findById(especialidadId);
      }
      return null;
    } catch (error) {
      throw new Error(`Error al actualizar especialidad: ${error.message}`);
    }
  }
}

module.exports = new EspecialidadRepository();
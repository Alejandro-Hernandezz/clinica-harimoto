const { Cita, Medico, Paciente } = require('../../persistence/models');
const { Op } = require('sequelize');

class CitaRepository {
  
  async create(citaData) {
    try {
      const cita = await Cita.create(citaData);
      return cita;
    } catch (error) {
      throw new Error(`Error al crear cita: ${error.message}`);
    }
  }

  async findById(citaId) {
    try {
      const cita = await Cita.findByPk(citaId, {
        include: [
          {
            model: Paciente,
            as: 'Paciente',
            attributes: ['paciente_id', 'nombres', 'apellidos', 'email', 'telefono']
          },
          {
            model: Medico,
            as: 'Medico',
            attributes: ['medico_id', 'nombres', 'apellidos', 'email']
          }
        ]
      });
      return cita;
    } catch (error) {
      throw new Error(`Error al buscar cita: ${error.message}`);
    }
  }

  async findByMedicoAndFecha(medicoId, fecha) {
    try {
      const citas = await Cita.findAll({
        where: {
          medico_id: medicoId,
          fecha: fecha,
          estado: {
            [Op.ne]: 'cancelada'
          }
        },
        order: [['hora_inicio', 'ASC']]
      });
      return citas;
    } catch (error) {
      throw new Error(`Error al buscar citas: ${error.message}`);
    }
  }

  async findByPaciente(pacienteId) {
    try {
      const citas = await Cita.findAll({
        where: { paciente_id: pacienteId },
        include: [
          {
            model: Medico,
            as: 'Medico',
            attributes: ['nombres', 'apellidos']
          }
        ],
        order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
      });
      return citas;
    } catch (error) {
      throw new Error(`Error al buscar citas del paciente: ${error.message}`);
    }
  }

  async update(citaId, citaData) {
    try {
      const [rowsUpdated] = await Cita.update(citaData, {
        where: { cita_id: citaId }
      });
      
      if (rowsUpdated > 0) {
        return await this.findById(citaId);
      }
      return null;
    } catch (error) {
      throw new Error(`Error al actualizar cita: ${error.message}`);
    }
  }

  async delete(citaId) {
    try {
      const deleted = await Cita.destroy({
        where: { cita_id: citaId }
      });
      return deleted > 0;
    } catch (error) {
      throw new Error(`Error al eliminar cita: ${error.message}`);
    }
  }
}

module.exports = new CitaRepository();
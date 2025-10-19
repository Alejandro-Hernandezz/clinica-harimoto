// GUARDAR COMO: backend/src/business/services/ValidacionService.js

const CitaRepository = require('../../data/repositories/CitaRepository');

class ValidacionService {
  
  async validarDisponibilidad(medicoId, fecha, horaInicio, horaFin) {
    try {
      const citasExistentes = await CitaRepository.findByMedicoAndFecha(medicoId, fecha);
      
      const hayConflicto = citasExistentes.some(cita => {
        return (
          (horaInicio >= cita.hora_inicio && horaInicio < cita.hora_fin) ||
          (horaFin > cita.hora_inicio && horaFin <= cita.hora_fin) ||
          (horaInicio <= cita.hora_inicio && horaFin >= cita.hora_fin)
        );
      });

      if (hayConflicto) {
        return {
          disponible: false,
          mensaje: 'Ya existe una cita en ese horario'
        };
      }

      return {
        disponible: true,
        mensaje: 'Horario disponible'
      };
    } catch (error) {
      throw new Error(`Error al validar disponibilidad: ${error.message}`);
    }
  }

  validarDatosCita(citaData) {
    const errores = [];

    if (!citaData.paciente_id) {
      errores.push('El ID del paciente es requerido');
    }

    if (!citaData.medico_id) {
      errores.push('El ID del medico es requerido');
    }

    if (!citaData.fecha) {
      errores.push('La fecha es requerida');
    } else {
      const fechaCita = new Date(citaData.fecha + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaCita < hoy) {
        errores.push('No se pueden agendar citas en fechas pasadas');
      }
    }

    if (!citaData.hora_inicio || !citaData.hora_fin) {
      errores.push('Las horas de inicio y fin son requeridas');
    } else {
      if (citaData.hora_inicio >= citaData.hora_fin) {
        errores.push('La hora de inicio debe ser menor a la hora de fin');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  getDiaSemana(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const date = new Date(fecha + 'T00:00:00');
    return dias[date.getDay()];
  }
}

module.exports = new ValidacionService();
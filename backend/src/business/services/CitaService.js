// GUARDAR COMO: backend/src/business/services/CitaService.js

const CitaRepository = require('../../data/repositories/CitaRepository');
const ValidacionService = require('./ValidacionService');
const NotificacionService = require('./NotificacionService');

class CitaService {
  
  async agendarCita(citaData) {
    // Paso 1: Validar datos
    const validacion = ValidacionService.validarDatosCita(citaData);
    if (!validacion.valido) {
      throw new Error(`Datos invalidos: ${validacion.errores.join(', ')}`);
    }

    // Paso 2: Verificar disponibilidad
    const disponibilidad = await ValidacionService.validarDisponibilidad(
      citaData.medico_id,
      citaData.fecha,
      citaData.hora_inicio,
      citaData.hora_fin
    );

    if (!disponibilidad.disponible) {
      throw new Error(disponibilidad.mensaje);
    }

    // Paso 3: Crear la cita
    const cita = await CitaRepository.create(citaData);

    // Paso 4: Obtener información completa
    const citaCompleta = await CitaRepository.findById(cita.cita_id);

    // Paso 5: Enviar notificaciones
    await NotificacionService.enviarConfirmacionCita(
      citaCompleta,
      citaCompleta.Paciente,
      citaCompleta.Medico
    );

    return citaCompleta;
  }

  async modificarCita(citaId, citaData) {
    const citaExistente = await CitaRepository.findById(citaId);
    if (!citaExistente) {
      throw new Error('Cita no encontrada');
    }

    if (citaData.fecha || citaData.hora_inicio || citaData.hora_fin) {
      const disponibilidad = await ValidacionService.validarDisponibilidad(
        citaData.medico_id || citaExistente.medico_id,
        citaData.fecha || citaExistente.fecha,
        citaData.hora_inicio || citaExistente.hora_inicio,
        citaData.hora_fin || citaExistente.hora_fin
      );

      if (!disponibilidad.disponible) {
        throw new Error(disponibilidad.mensaje);
      }
    }

    const citaActualizada = await CitaRepository.update(citaId, citaData);

    await NotificacionService.enviarEmail(
      citaActualizada.Paciente.email,
      'Modificacion de Cita - Clinica Harimoto',
      `<p>Su cita ha sido modificada. Nueva fecha: ${citaActualizada.fecha}</p>`
    );

    return citaActualizada;
  }

  async cancelarCita(citaId) {
    const cita = await CitaRepository.findById(citaId);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    const citaCancelada = await CitaRepository.update(citaId, { estado: 'cancelada' });

    await NotificacionService.enviarEmail(
      citaCancelada.Paciente.email,
      'Cancelacion de Cita - Clinica Harimoto',
      `<p>Su cita del ${citaCancelada.fecha} ha sido cancelada.</p>`
    );

    return citaCancelada;
  }

  async obtenerCitasPorPaciente(pacienteId) {
    return await CitaRepository.findByPaciente(pacienteId);
  }

  async obtenerDisponibilidadMedico(medicoId, fecha) {
    const citasExistentes = await CitaRepository.findByMedicoAndFecha(medicoId, fecha);
    
    const slots = this.generarSlots(citasExistentes);

    return {
      medico_id: medicoId,
      fecha: fecha,
      slots: slots
    };
  }

  generarSlots(citasExistentes) {
    const slots = [];
    const horaInicio = '08:00';
    const horaFin = '20:00';
    const duracionCita = 30;

    let horaActual = horaInicio;
    
    while (horaActual < horaFin) {
      const horaSiguiente = this.sumarMinutos(horaActual, duracionCita);
      
      const ocupado = citasExistentes.some(cita => 
        horaActual >= cita.hora_inicio && horaActual < cita.hora_fin
      );

      slots.push({
        hora_inicio: horaActual,
        hora_fin: horaSiguiente,
        disponible: !ocupado
      });

      horaActual = horaSiguiente;
    }

    return slots;
  }

  sumarMinutos(hora, minutos) {
    const [h, m] = hora.split(':').map(Number);
    const totalMinutos = h * 60 + m + minutos;
    const nuevaHora = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    return `${String(nuevaHora).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
  }
}

module.exports = new CitaService();
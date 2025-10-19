


class NotificacionService {
  
  constructor() {
    console.log('⚠️ Servicio de notificaciones iniciado (modo simulación)');
  }

  async enviarConfirmacionCita(cita, paciente, medico) {
    console.log('='.repeat(50));
    console.log('📧 NOTIFICACIÓN: Cita agendada');
    console.log(`   Paciente: ${paciente.nombres} ${paciente.apellidos}`);
    console.log(`   Email: ${paciente.email}`);
    console.log(`   Médico: Dr(a). ${medico.nombres} ${medico.apellidos}`);
    console.log(`   Fecha: ${cita.fecha}`);
    console.log(`   Hora: ${cita.hora_inicio}`);
    console.log('='.repeat(50));
    return true;
  }

  async enviarEmail(destinatario, asunto, contenido) {
    console.log(`📧 Email simulado enviado a: ${destinatario}`);
    console.log(`   Asunto: ${asunto}`);
    return true;
  }

  generarEmailPaciente(cita, paciente, medico) {
    return 'HTML Email';
  }

  generarEmailMedico(cita, paciente, medico) {
    return 'HTML Email';
  }
}

module.exports = new NotificacionService();
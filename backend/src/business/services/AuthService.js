// GUARDAR COMO: backend/src/business/services/AuthService.js

const { Paciente, Medico } = require('../../persistence/models');

class AuthService {
  
  /**
   * Extrae los últimos 4 dígitos del RUT (sin dígito verificador)
   * Ejemplo: "12345678-9" -> "5678"
   */
  extraerPassword(rut) {
    const rutSinDV = rut.split('-')[0]; // "12345678"
    return rutSinDV.slice(-4); // "5678"
  }

  /**
   * Intenta autenticar un usuario (paciente o médico)
   * @param {string} email - Email del usuario
   * @param {string} password - Últimos 4 dígitos del RUT
   * @returns {Object} - { success, tipo, usuario }
   */
  async autenticar(email, password) {
    try {
      // Buscar en pacientes
      const paciente = await Paciente.findOne({ 
        where: { email, estado: 'activo' } 
      });

      if (paciente) {
        const passwordCorrecta = this.extraerPassword(paciente.rut);
        
        if (password === passwordCorrecta) {
          return {
            success: true,
            tipo: 'paciente',
            usuario: {
              id: paciente.paciente_id,
              rut: paciente.rut,
              nombres: paciente.nombres,
              apellidos: paciente.apellidos,
              email: paciente.email,
              telefono: paciente.telefono
            }
          };
        }
      }

      // Buscar en médicos
      const medico = await Medico.findOne({ 
        where: { email, estado: 'activo' } 
      });

      if (medico) {
        const passwordCorrecta = this.extraerPassword(medico.rut);
        
        if (password === passwordCorrecta) {
          return {
            success: true,
            tipo: 'medico',
            usuario: {
              id: medico.medico_id,
              rut: medico.rut,
              nombres: medico.nombres,
              apellidos: medico.apellidos,
              email: medico.email,
              telefono: medico.telefono,
              especialidad_id: medico.especialidad_id
            }
          };
        }
      }

      // Usuario no encontrado o contraseña incorrecta
      return {
        success: false,
        message: 'Email o contraseña incorrectos'
      };

    } catch (error) {
      throw new Error(`Error en autenticación: ${error.message}`);
    }
  }

  /**
   * Verifica si un email existe en el sistema
   */
  async verificarEmail(email) {
    const paciente = await Paciente.findOne({ where: { email } });
    const medico = await Medico.findOne({ where: { email } });

    if (paciente) {
      return { existe: true, tipo: 'paciente' };
    }
    if (medico) {
      return { existe: true, tipo: 'medico' };
    }
    return { existe: false };
  }
}

module.exports = new AuthService();
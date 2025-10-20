// GUARDAR COMO: frontend/src/services/api.js
import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== SERVICIOS DE CITAS ====================
const citaService = {
  // POST /citas - Agendar nueva cita
  agendarCita: async (citaData) => {
    try {
      const response = await api.post('/citas', citaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /citas/paciente/:pacienteId - Obtener citas de un paciente
  obtenerCitasPaciente: async (pacienteId) => {
    try {
      const response = await api.get(`/citas/paciente/${pacienteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // PUT /citas/:citaId - Modificar cita
  modificarCita: async (citaId, citaData) => {
    try {
      const response = await api.put(`/citas/${citaId}`, citaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // DELETE /citas/:citaId - Cancelar cita
  cancelarCita: async (citaId) => {
    try {
      const response = await api.delete(`/citas/${citaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /citas/disponibilidad - Consultar disponibilidad
  consultarDisponibilidad: async (medicoId, fecha) => {
    try {
      const response = await api.get('/citas/disponibilidad', {
        params: { medicoId, fecha }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

// ==================== SERVICIOS DE MÉDICOS ====================
const medicoService = {
  // GET /medicos - Listar todos activos
  listarTodos: async () => {
    try {
      const response = await api.get('/medicos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /medicos/especialidad/:id - Por especialidad
  listarPorEspecialidad: async (especialidadId) => {
    try {
      const response = await api.get(`/medicos/especialidad/${especialidadId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /medicos/:id - Uno específico
  obtenerUno: async (medicoId) => {
    try {
      const response = await api.get(`/medicos/${medicoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // POST /medicos - Crear nuevo médico
  crearMedico: async (medicoData) => {
    try {
      const response = await api.post('/medicos', medicoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // PUT /medicos/:id - Actualizar médico
  actualizarMedico: async (medicoId, medicoData) => {
    try {
      const response = await api.put(`/medicos/${medicoId}`, medicoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

// ==================== SERVICIOS DE ESPECIALIDADES ====================
const especialidadService = {
  // GET /especialidades - Lista todas
  listarTodas: async () => {
    try {
      const response = await api.get('/especialidades');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /especialidades/conteo - Con cantidad de médicos
  conConteo: async () => {
    try {
      const response = await api.get('/especialidades/conteo');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /especialidades/:id - Una específica con sus médicos
  obtenerUna: async (especialidadId) => {
    try {
      const response = await api.get(`/especialidades/${especialidadId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // POST /especialidades - Crear nueva especialidad
  crearEspecialidad: async (especialidadData) => {
    try {
      const response = await api.post('/especialidades', especialidadData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

// ==================== SERVICIOS DE AUTENTICACIÓN ====================
const authService = {
  // POST /auth/login - Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /auth/verificar-email - Verificar si email existe
  verificarEmail: async (email) => {
    try {
      const response = await api.get('/auth/verificar-email', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

// ==================== EXPORTACIONES ====================
export { authService, citaService, medicoService, especialidadService };
export default api;
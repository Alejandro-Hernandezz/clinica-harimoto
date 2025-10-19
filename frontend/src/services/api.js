// GUARDAR COMO: frontend/src/services/api.js
import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Servicios de Citas
export const citaService = {
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

// Servicios de Médicos
export const medicoService = {
  // GET /api/medicos - Listar todos activos
  listarTodos: async () => {
    try {
      const response = await api.get('/medicos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /api/medicos/especialidad/:id - Por especialidad
  listarPorEspecialidad: async (especialidadId) => {
    try {
      const response = await api.get(`/medicos/especialidad/${especialidadId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /api/medicos/:id - Uno específico
  obtenerUno: async (medicoId) => {
    try {
      const response = await api.get(`/medicos/${medicoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

// Servicios de Especialidades
export const especialidadService = {
  // GET /api/especialidades - Lista todas
  listarTodas: async () => {
    try {
      const response = await api.get('/especialidades');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /api/especialidades/conteo - Con cantidad de médicos
  conConteo: async () => {
    try {
      const response = await api.get('/especialidades/conteo');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // GET /api/especialidades/:id - Una específica con sus médicos
  obtenerUna: async (especialidadId) => {
    try {
      const response = await api.get(`/especialidades/${especialidadId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

export default api;
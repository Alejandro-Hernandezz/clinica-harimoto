import React, { useState, useEffect } from 'react';
import { citaService, medicoService } from '../services/api';

export default function AgendarCita({ pacienteId }) {
  const [formData, setFormData] = useState({
    paciente_id: pacienteId,
    medico_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(true);

  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // Cargar médicos al montar componente
  useEffect(() => {
    cargarMedicos();
  }, []);

  const cargarMedicos = async () => {
    setLoadingMedicos(true);
    try {
      const response = await medicoService.listarTodos();
      setMedicos(response.data || []);
    } catch (error) {
      console.error('Error al cargar médicos:', error);
      setMensaje('error_medicos');
      setTimeout(() => setMensaje(''), 3000);
    } finally {
      setLoadingMedicos(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'hora_inicio' && value) {
      const [h, m] = value.split(':');
      const total = parseInt(h) * 60 + parseInt(m) + 30;
      const nuevaH = Math.floor(total / 60);
      const nuevaM = total % 60;
      setFormData(prev => ({
        ...prev,
        hora_fin: `${String(nuevaH).padStart(2, '0')}:${String(nuevaM).padStart(2, '0')}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      await citaService.agendarCita(formData);
      setMensaje('success');
      setTimeout(() => setMensaje(''), 3000);
      setFormData({
        paciente_id: pacienteId,
        medico_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        motivo: ''
      });
    } catch (error) {
      console.error('Error al agendar:', error);
      setMensaje('error');
      setTimeout(() => setMensaje(''), 3000);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      background: 'white',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '20px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <span style={{ fontSize: '3rem' }}>📅</span>
        </div>
        <h2 style={{ 
          margin: '0 0 10px 0',
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700'
        }}>
          Agendar Nueva Cita
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
          Complete el formulario para reservar su cita médica
        </p>
      </div>

      {mensaje === 'success' && (
        <div style={{
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem' }}>¡Cita agendada exitosamente!</strong>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Revisa tu email para más detalles
            </span>
          </div>
        </div>
      )}

      {mensaje === 'error' && (
        <div style={{
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '2rem' }}>❌</span>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem' }}>Error al agendar</strong>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Por favor, intente nuevamente
            </span>
          </div>
        </div>
      )}
{mensaje === 'error_medicos' && (
  <div style={{
    padding: '20px',
    marginBottom: '30px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
    animation: 'slideIn 0.3s ease-out'
  }}>
    <span style={{ fontSize: '2rem' }}>⚠️</span>
    <div>
      <strong style={{ display: 'block', fontSize: '1.1rem' }}>Error al cargar médicos</strong>
      <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
        Verifique la conexión con el servidor
      </span>
    </div>
  </div>
)}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Selector de Médico */}
        <div>
          <label style={{ 
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: '#1e293b',
            fontSize: '0.95rem'
          }}>
            Seleccionar Médico *
          </label>
          <select
            name="medico_id"
            value={formData.medico_id}
            onChange={handleChange}
            required
            disabled={loadingMedicos}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              background: loadingMedicos ? '#f1f5f9' : '#f8fafc',
              transition: 'all 0.3s',
              cursor: loadingMedicos ? 'not-allowed' : 'pointer'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          >
            <option value="">
              {loadingMedicos ? '⏳ Cargando médicos...' : '-- Seleccione un médico --'}
            </option>
            {medicos.map(m => (
              <option key={m.medico_id} value={m.medico_id}>
                👨‍⚕️ Dr(a). {m.nombres} {m.apellidos} - {m.Especialidad?.nombre || 'Sin especialidad'}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label style={{ 
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: '#1e293b',
            fontSize: '0.95rem'
          }}>
            Fecha de la Cita *
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              background: '#f8fafc',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Horas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '0.95rem'
            }}>
              Hora Inicio *
            </label>
            <select
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#f8fafc',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="">-- Hora --</option>
              {horarios.map(h => (
                <option key={h} value={h}>🕐 {h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '0.95rem'
            }}>
              Hora Fin
            </label>
            <input
              type="time"
              name="hora_fin"
              value={formData.hora_fin}
              readOnly
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#f1f5f9',
                color: '#64748b'
              }}
            />
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label style={{ 
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: '#1e293b',
            fontSize: '0.95rem'
          }}>
            Motivo de la Consulta
          </label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            rows="4"
            placeholder="Describa brevemente el motivo de su consulta..."
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              background: '#f8fafc',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading || loadingMedicos}
          style={{
            padding: '18px',
            background: (loading || loadingMedicos)
              ? '#94a3b8'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: (loading || loadingMedicos) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || loadingMedicos)
              ? 'none'
              : '0 10px 30px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s',
            transform: (loading || loadingMedicos) ? 'none' : 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            if (!loading && !loadingMedicos) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !loadingMedicos) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              {' '}Agendando...
            </>
          ) : loadingMedicos ? (
            '⏳ Cargando...'
          ) : (
            <>✅ Agendar Cita</>
          )}
        </button>
      </form>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { citaService } from '../services/api';

export default function ListaCitas({ pacienteId }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarCitas();
  }, [pacienteId]);

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const response = await citaService.obtenerCitasPaciente(pacienteId);
      setCitas(response.data || []);
      setMensaje('');
    } catch (error) {
      setMensaje('❌ Error al cargar citas: ' + error.message);
    }
    setLoading(false);
  };

  const handleCancelar = async (citaId) => {
    if (!window.confirm('¿Está seguro de cancelar esta cita?')) return;

    try {
      await citaService.cancelarCita(citaId);
      setMensaje('✅ Cita cancelada exitosamente');
      cargarCitas();
    } catch (error) {
      setMensaje('❌ Error al cancelar: ' + error.message);
    }
  };

  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', opciones);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'programada': '#dbeafe',
      'confirmada': '#d1fae5',
      'completada': '#e0e7ff',
      'cancelada': '#fee2e2'
    };
    return colores[estado] || '#f1f5f9';
  };

  const getEstadoIcono = (estado) => {
    const iconos = {
      'programada': '📅',
      'confirmada': '✅',
      'completada': '✔️',
      'cancelada': '❌'
    };
    return iconos[estado] || '📋';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>⏳ Cargando citas...</h2>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px', color: '#1e40af' }}>📋 Mis Citas</h2>

      {mensaje && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '5px',
          background: mensaje.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: mensaje.includes('✅') ? '#065f46' : '#991b1b'
        }}>
          {mensaje}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '20px', 
          borderRadius: '10px', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{citas.length}</div>
          <div style={{ fontSize: '14px' }}>Total Citas</div>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '20px', 
          borderRadius: '10px', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {citas.filter(c => c.estado === 'programada').length}
          </div>
          <div style={{ fontSize: '14px' }}>Programadas</div>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '20px', 
          borderRadius: '10px', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {citas.filter(c => c.estado === 'completada').length}
          </div>
          <div style={{ fontSize: '14px' }}>Completadas</div>
        </div>
      </div>

      {citas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p style={{ fontSize: '24px', marginBottom: '10px' }}>📭 No tienes citas registradas</p>
          <p>Agenda tu primera cita usando el formulario</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {citas.map(cita => (
            <div key={cita.cita_id} style={{
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{
                background: getEstadoColor(cita.estado),
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {getEstadoIcono(cita.estado)} {cita.estado.toUpperCase()}
                </span>
                <span style={{ color: '#64748b', fontSize: '14px' }}>#{cita.cita_id}</span>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>👨‍⚕️ Médico</div>
                  <div style={{ fontWeight: 'bold' }}>
                    Dr(a). {cita.Medico.nombres} {cita.Medico.apellidos}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>📅 Fecha</div>
                  <div style={{ fontWeight: 'bold' }}>{formatearFecha(cita.fecha)}</div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>🕐 Horario</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {cita.hora_inicio} - {cita.hora_fin}
                  </div>
                </div>

                {cita.motivo && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>📝 Motivo</div>
                    <div>{cita.motivo}</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '15px', background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                {cita.estado === 'programada' ? (
                  <button
                    onClick={() => handleCancelar(cita.cita_id)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Cancelar Cita
                  </button>
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748b', margin: 0, fontStyle: 'italic' }}>
                    Esta cita fue {cita.estado}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={cargarCitas}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '15px',
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        🔄 Recargar Citas
      </button>
    </div>
  );
}
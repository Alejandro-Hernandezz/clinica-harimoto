// GUARDAR COMO: frontend/src/components/GestionEspecialidades.jsx
import React, { useState, useEffect } from 'react';
import { especialidadService } from '../services/api';

export default function GestionEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [vistaActual, setVistaActual] = useState('lista');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    setLoading(true);
    try {
      const response = await especialidadService.listarTodas();
      setEspecialidades(response.data || []);
    } catch (error) {
      setMensaje('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setMensaje('❌ El nombre es requerido');
      return;
    }

    try {
      await especialidadService.crearEspecialidad(formData);
      setMensaje('✅ Especialidad creada');
      setFormData({ nombre: '', descripcion: '' });
      setVistaActual('lista');
      cargarEspecialidades();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
      <p style={{ color: '#6b7280' }}>Cargando...</p>
    </div>;
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(255, 107, 53, 0.15)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #fdb750 100%)',
        padding: '30px',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>🏥 Especialidades</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>Total: {especialidades.length}</p>
      </div>

      <div style={{ padding: '30px' }}>
        {mensaje && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '24px',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: mensaje.includes('✅') ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white'
          }}>
            {mensaje}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2.5px solid #fed7aa' }}>
          <button
            onClick={() => setVistaActual('lista')}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              color: vistaActual === 'lista' ? '#ff6b35' : '#6b7280',
              border: 'none',
              borderBottom: vistaActual === 'lista' ? '3px solid #ff6b35' : 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s'
            }}
          >
            📋 Lista ({especialidades.length})
          </button>
          <button
            onClick={() => setVistaActual('crear')}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              color: vistaActual === 'crear' ? '#ff6b35' : '#6b7280',
              border: 'none',
              borderBottom: vistaActual === 'crear' ? '3px solid #ff6b35' : 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s'
            }}
          >
            ➕ Crear
          </button>
        </div>

        {/* Lista */}
        {vistaActual === 'lista' && (
          <div>
            {especialidades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <p>No hay especialidades</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {especialidades.map(esp => (
                  <div key={esp.especialidad_id} style={{
                    border: '2px solid #fed7aa',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                      color: 'white',
                      padding: '18px'
                    }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                        {esp.nombre}
                      </h3>
                    </div>
                    
                    <div style={{ padding: '18px' }}>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                        {esp.descripcion || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Crear */}
        {vistaActual === 'crear' && (
          <form onSubmit={handleCrear} style={{
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '0.95rem'
              }}>
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cardiología"
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '2px solid #fed7aa',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b35';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fed7aa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '0.95rem'
              }}>
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '2px solid #fed7aa',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b35';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fed7aa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ✅ Crear
              </button>
              <button
                type="button"
                onClick={() => { setVistaActual('lista'); setFormData({ nombre: '', descripcion: '' }); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
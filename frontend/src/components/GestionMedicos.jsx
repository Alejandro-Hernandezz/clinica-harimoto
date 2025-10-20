// GUARDAR COMO: frontend/src/components/GestionMedicos.jsx
import React, { useState, useEffect } from 'react';
import { medicoService, especialidadService } from '../services/api';

export default function GestionMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [vistaActual, setVistaActual] = useState('lista');
  
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellidos: '',
    especialidad_id: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const respMedicos = await medicoService.listarTodos();
      setMedicos(respMedicos.data || []);

      const respEsp = await especialidadService.listarTodas();
      setEspecialidades(respEsp.data || []);
    } catch (error) {
      setMensaje('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!formData.rut || !formData.nombres || !formData.apellidos || !formData.especialidad_id || !formData.email) {
      setMensaje('❌ Todos los campos* son requeridos');
      return;
    }

    const rutRegex = /^\d{7,8}-[\dkK]$/;
    if (!rutRegex.test(formData.rut)) {
      setMensaje('❌ RUT inválido (Formato: 12345678-9)');
      return;
    }

    try {
      await medicoService.crearMedico(formData);
      setMensaje('✅ Médico creado');
      setFormData({ rut: '', nombres: '', apellidos: '', especialidad_id: '', email: '', telefono: '' });
      setVistaActual('lista');
      cargarDatos();
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
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>👨‍⚕️ Médicos</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>Total: {medicos.length}</p>
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
            📋 Lista ({medicos.length})
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
            {medicos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <p>No hay médicos</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {medicos.map(medico => (
                  <div key={medico.medico_id} style={{
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
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                        Dr(a). {medico.nombres} {medico.apellidos}
                      </h3>
                    </div>
                    
                    <div style={{ padding: '18px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <small style={{ color: '#9ca3af', fontWeight: '700' }}>RUT</small>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{medico.rut}</div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <small style={{ color: '#9ca3af', fontWeight: '700' }}>Especialidad</small>
                        <div style={{ fontWeight: '600', color: '#ff6b35' }}>
                          {medico.Especialidad?.nombre || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <small style={{ color: '#9ca3af', fontWeight: '700' }}>Email</small>
                        <div style={{ fontSize: '0.9rem', color: '#1f2937', wordBreak: 'break-all' }}>
                          {medico.email}
                        </div>
                      </div>
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>
                RUT *
              </label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                placeholder="12345678-9"
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                placeholder="Juan"
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                placeholder="Pérez"
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>Especialidad *</label>
              <select
                name="especialidad_id"
                value={formData.especialidad_id}
                onChange={(e) => setFormData({ ...formData, especialidad_id: e.target.value })}
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
              >
                <option value="">-- Seleccione --</option>
                {especialidades.map(esp => (
                  <option key={esp.especialidad_id} value={esp.especialidad_id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="medico@example.com"
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+56987654321"
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

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
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
                onClick={() => { setVistaActual('lista'); setFormData({ rut: '', nombres: '', apellidos: '', especialidad_id: '', email: '', telefono: '' }); }}
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
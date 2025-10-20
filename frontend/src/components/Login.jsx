// GUARDAR COMO: frontend/src/components/Login.jsx
import React, { useState } from 'react';
import { authService } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      if (!/^\d{4}$/.test(password)) {
        setTipoMensaje('error');
        setMensaje('La contraseña debe ser 4 dígitos');
        setLoading(false);
        setTimeout(() => setMensaje(''), 3000);
        return;
      }

      const resultado = await authService.login(email, password);

      if (resultado.success) {
        setTipoMensaje('success');
        setMensaje('✅ Inicio de sesión exitoso');
        onLoginSuccess(resultado.data);
        setEmail('');
        setPassword('');
      } else {
        setTipoMensaje('error');
        setMensaje('❌ ' + resultado.message);
      }
    } catch (error) {
      setTipoMensaje('error');
      setMensaje('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🏥</div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '1.8rem',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Clínica Harimoto
          </h1>
          <p style={{ margin: '0', fontSize: '0.95rem', opacity: 0.95 }}>
            Sistema de Gestión Médica
          </p>
        </div>

        {/* Contenido */}
        <div style={{ padding: '40px 30px' }}>
          {mensaje && (
            <div style={{
              padding: '14px 16px',
              marginBottom: '24px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '500',
              background: tipoMensaje === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: tipoMensaje === 'success' ? '#047857' : '#991b1b',
              border: `1px solid ${tipoMensaje === 'success' ? '#6ee7b7' : '#fca5a5'}`
            }}>
              {mensaje}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#1f2937',
                fontSize: '0.95rem'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#1f2937',
                fontSize: '0.95rem'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4 dígitos"
                maxLength="4"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit',
                  outline: 'none',
                  letterSpacing: '2px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <small style={{ color: '#6b7280', display: 'block', marginTop: '6px', fontSize: '0.85rem' }}>
                Últimos 4 dígitos de tu RUT (sin puntos ni guión)
              </small>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 16px',
                background: loading ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 10px 25px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Iniciando...' : '🔓 Iniciar Sesión'}
            </button>
          </form>

          {/* Datos de prueba */}
          <div style={{
            marginTop: '28px',
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '12px',
            borderLeft: '4px solid #667eea'
          }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
              📝 Datos de Prueba
            </p>
            <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.8' }}>
              <div>
                <strong style={{ color: '#667eea' }}>Paciente:</strong><br />
                paciente@example.com / 5678
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: '#667eea' }}>Médico:</strong><br />
                medico@example.com / 4321
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// GUARDAR COMO: frontend/src/main.jsx - REEMPLAZA TODO
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import AgendarCita from './components/AgendarCita'
import ListaCitas from './components/ListaCitas'
import Login from './components/Login'
import GestionMedicos from './components/GestionMedicos'
import GestionEspecialidades from './components/GestionEspecialidades'

function App() {
  const [vista, setVista] = useState('login')
  const [usuario, setUsuario] = useState(null)
  const [pacienteId, setPacienteId] = useState(1)

  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
    if (datosUsuario.tipo === 'paciente') {
      setPacienteId(datosUsuario.usuario.id);
      setVista('agendar');
    } else if (datosUsuario.tipo === 'medico') {
      setVista('medicos');
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setPacienteId(1);
    setVista('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafaf9' }}>
      
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #fdb750 100%)',
        color: 'white',
        padding: '0',
        boxShadow: '0 8px 24px rgba(255, 107, 53, 0.25)',
        borderBottom: '4px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de brillo animado */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          animation: 'shine 3s infinite'
        }} />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '2.5rem', animation: 'pulse 2s ease-in-out infinite' }}>🏥</div>
            <div>
              <h1 style={{ fontSize: '1.8rem', margin: '0', fontWeight: '800', letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                Clínica Médica Harimoto
              </h1>
              <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0', opacity: 0.95, fontWeight: '500' }}>Sistema Integral de Gestión</p>
            </div>
          </div>
          {usuario && (
            <div style={{ textAlign: 'right', animation: 'slideInRight 0.6s ease-out' }}>
              <div style={{ fontSize: '0.95rem', marginBottom: '8px', fontWeight: '600' }}>
                👤 {usuario.usuario.nombres} <span style={{ opacity: 0.85, fontSize: '0.9rem' }}>({usuario.tipo})</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  backdropFilter: 'blur(10px)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🔓 Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      {usuario && (
        <nav style={{
          background: 'white',
          padding: '0 30px',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.08)',
          borderBottom: '2px solid #fed7aa'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {usuario.tipo === 'paciente' && (
              <>
                <button
                  onClick={() => setVista('agendar')}
                  style={{
                    padding: '16px 22px',
                    border: 'none',
                    background: 'transparent',
                    color: vista === 'agendar' ? '#ff6b35' : '#6b7280',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    borderBottom: vista === 'agendar' ? '4px solid #ff6b35' : '4px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (vista !== 'agendar') {
                      e.target.style.color = '#ff6b35';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (vista !== 'agendar') {
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'none';
                    }
                  }}
                >
                  📅 Agendar Cita
                </button>
                <button
                  onClick={() => setVista('lista')}
                  style={{
                    padding: '16px 22px',
                    border: 'none',
                    background: 'transparent',
                    color: vista === 'lista' ? '#ff6b35' : '#6b7280',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    borderBottom: vista === 'lista' ? '4px solid #ff6b35' : '4px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (vista !== 'lista') {
                      e.target.style.color = '#ff6b35';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (vista !== 'lista') {
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'none';
                    }
                  }}
                >
                  📋 Mis Citas
                </button>
              </>
            )}
            
            {usuario.tipo === 'medico' && (
              <>
                <button
                  onClick={() => setVista('medicos')}
                  style={{
                    padding: '16px 22px',
                    border: 'none',
                    background: 'transparent',
                    color: vista === 'medicos' ? '#ff6b35' : '#6b7280',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    borderBottom: vista === 'medicos' ? '4px solid #ff6b35' : '4px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (vista !== 'medicos') {
                      e.target.style.color = '#ff6b35';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (vista !== 'medicos') {
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'none';
                    }
                  }}
                >
                  👨‍⚕️ Médicos
                </button>
              </>
            )}

            <button
              onClick={() => setVista('especialidades')}
              style={{
                padding: '16px 22px',
                border: 'none',
                background: 'transparent',
                color: vista === 'especialidades' ? '#ff6b35' : '#6b7280',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                borderBottom: vista === 'especialidades' ? '4px solid #ff6b35' : '4px solid transparent',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (vista !== 'especialidades') {
                  e.target.style.color = '#ff6b35';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (vista !== 'especialidades') {
                  e.target.style.color = '#6b7280';
                  e.target.style.transform = 'none';
                }
              }}
            >
              🏥 Especialidades
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: usuario ? '30px' : '0',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: usuario ? 'stretch' : 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {!usuario ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div style={{ width: '100%', animation: 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {vista === 'agendar' && <AgendarCita pacienteId={pacienteId} />}
            {vista === 'lista' && <ListaCitas pacienteId={pacienteId} />}
            {vista === 'medicos' && <GestionMedicos />}
            {vista === 'especialidades' && <GestionEspecialidades />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '28px 20px',
        marginTop: 'auto',
        borderTop: '3px solid #ff6b35',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.2), transparent)',
          animation: 'shine 4s infinite'
        }} />
        <p style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', position: 'relative', zIndex: 1 }}>
          © 2025 Clínica Médica Harimoto
        </p>
        <small style={{ opacity: 0.8, fontSize: '0.85rem', position: 'relative', zIndex: 1, fontWeight: '500' }}>
          Arquitectura de Capas • 16 Endpoints REST • PostgreSQL
        </small>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import AgendarCita from './components/AgendarCita'
import ListaCitas from './components/ListaCitas'

function App() {
  const [vista, setVista] = useState('agendar')
  const pacienteId = 1

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2563eb, #1e40af)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>🏥 Clínica Médica Harimoto</h1>
        <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>Sistema de Gestión de Pacientes</p>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        padding: '15px 20px',
        display: 'flex',
        gap: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setVista('agendar')}
          style={{
            padding: '12px 30px',
            border: 'none',
            background: vista === 'agendar' ? '#2563eb' : '#e2e8f0',
            color: vista === 'agendar' ? 'white' : '#475569',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          📅 Agendar Cita
        </button>
        <button
          onClick={() => setVista('lista')}
          style={{
            padding: '12px 30px',
            border: 'none',
            background: vista === 'lista' ? '#2563eb' : '#e2e8f0',
            color: vista === 'lista' ? 'white' : '#475569',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          📋 Mis Citas
        </button>
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '30px 20px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {vista === 'agendar' ? (
          <AgendarCita pacienteId={pacienteId} />
        ) : (
          <ListaCitas pacienteId={pacienteId} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#1e293b',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: '30px'
      }}>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          © 2025 Clínica Médica Harimoto - Arquitectura de Capas
        </p>
      </footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
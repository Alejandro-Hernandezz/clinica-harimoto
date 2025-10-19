import React, { useState } from 'react';
import AgendarCita from './components/AgendarCita';
import ListaCitas from './components/ListaCitas';
import './styles/App.css';

function App() {
  const [vistaActual, setVistaActual] = useState('agendar');
  const [pacienteId] = useState(1);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Clínica Médica Harimoto</h1>
        <p>Sistema de Gestión de Pacientes</p>
      </header>

      <nav className="app-nav">
        <button 
          className={vistaActual === 'agendar' ? 'active' : ''}
          onClick={() => setVistaActual('agendar')}
        >
          📅 Agendar Cita
        </button>
        <button 
          className={vistaActual === 'lista' ? 'active' : ''}
          onClick={() => setVistaActual('lista')}
        >
          📋 Mis Citas
        </button>
      </nav>

      <main className="app-main">
        {vistaActual === 'agendar' && <AgendarCita pacienteId={pacienteId} />}
        {vistaActual === 'lista' && <ListaCitas pacienteId={pacienteId} />}
      </main>

      <footer className="app-footer">
        <p>© 2025 Clínica Harimoto - Arquitectura de Capas</p>
      </footer>
    </div>
  );
}

export default App;
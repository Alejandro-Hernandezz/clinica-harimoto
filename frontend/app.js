// Configuración
const API_BASE = 'http://localhost';
const AUTH_PORT = 3000;
const SENSOR_PORT = 3001;
const ANALYSIS_PORT = 3002;
const NOTIFICATION_PORT = 3003;

let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || '{}');
let isRegistering = false;

// Inicialización
window.onload = function() {
    if (token) {
        showMainSection();
    }
};

// Autenticación
function toggleRegister() {
    isRegistering = !isRegistering;
    const nombreGroup = document.getElementById('nombreGroup');
    const btn = event.target;

    if (isRegistering) {
        nombreGroup.classList.remove('hidden');
        btn.textContent = 'Volver a Login';
        btn.previousElementSibling.textContent = 'Registrarse';
    } else {
        nombreGroup.classList.add('hidden');
        btn.textContent = 'Registrarse';
        btn.previousElementSibling.textContent = 'Iniciar Sesión';
    }
}

async function login() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const nombre = document.getElementById('authNombre').value;

    if (!email || !password) {
        showMessage('authMessage', 'Por favor completa todos los campos', 'error');
        return;
    }

    if (isRegistering && !nombre) {
        showMessage('authMessage', 'Por favor ingresa tu nombre', 'error');
        return;
    }

    try {
        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const body = isRegistering ? { email, password, nombre } : { email, password };

        const response = await fetch(`${API_BASE}:${AUTH_PORT}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (data.success) {
            if (isRegistering) {
                showMessage('authMessage', 'Registro exitoso. Ahora inicia sesión.', 'success');
                toggleRegister();
            } else {
                token = data.data.token;
                user = data.data.user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                showMainSection();
            }
        } else {
            showMessage('authMessage', data.error || 'Error en autenticación', 'error');
        }
    } catch (error) {
        showMessage('authMessage', 'Error de conexión con el servidor', 'error');
        console.error(error);
    }
}

function logout() {
    token = null;
    user = {};
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
}

function showMainSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');
    document.getElementById('userName').textContent = user.nombre;
    document.getElementById('userEmail').textContent = user.email;
    cargarSensores();
}

// Tabs
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');

    if (tabName === 'alertas') cargarAlertas();
    if (tabName === 'notificaciones') cargarNotificaciones();
}

// Sensores
async function crearSensor() {
    const nombre = document.getElementById('sensorNombre').value;
    const tipo = document.getElementById('sensorTipo').value;
    const ubicacion = document.getElementById('sensorUbicacion').value;
    const umbralMinimo = parseFloat(document.getElementById('sensorMin').value);
    const umbralMaximo = parseFloat(document.getElementById('sensorMax').value);

    if (!nombre || !ubicacion) {
        showMessage('sensorMessage', 'Completa todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}:${SENSOR_PORT}/api/sensores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, tipo, ubicacion, umbralMinimo, umbralMaximo })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('sensorMessage', 'Sensor creado exitosamente', 'success');
            document.getElementById('sensorNombre').value = '';
            document.getElementById('sensorUbicacion').value = '';
            cargarSensores();
        } else {
            showMessage('sensorMessage', data.error, 'error');
        }
    } catch (error) {
        showMessage('sensorMessage', 'Error de conexión', 'error');
        console.error(error);
    }
}

async function cargarSensores() {
    try {
        const response = await fetch(`${API_BASE}:${SENSOR_PORT}/api/sensores`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            mostrarSensores(data.data);
        }
    } catch (error) {
        console.error('Error cargando sensores:', error);
    }
}

function mostrarSensores(sensores) {
    const container = document.getElementById('sensoresList');

    if (sensores.length === 0) {
        container.innerHTML = '<p>No tienes sensores creados. Crea uno arriba.</p>';
        return;
    }

    container.innerHTML = sensores.map(s => `
        <div class="sensor-card">
            <h3>${s.nombre}</h3>
            <div class="sensor-info">
                <div class="info-item">
                    <div class="info-label">Tipo</div>
                    <div class="info-value">${s.tipo}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Ubicación</div>
                    <div class="info-value">${s.ubicacion}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Umbral Mínimo</div>
                    <div class="info-value">${s.umbralMinimo}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Umbral Máximo</div>
                    <div class="info-value">${s.umbralMaximo}%</div>
                </div>
            </div>
            <button onclick="simularDato('${s.id}')">Simular Lectura</button>
            <button class="secondary" onclick="verDatos('${s.id}')">Ver Datos</button>
        </div>
    `).join('');
}

async function simularDato(sensorId) {
    try {
        const response = await fetch(`${API_BASE}:${SENSOR_PORT}/api/sensores/${sensorId}/simular`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            alert(`Dato simulado: ${data.data.valor} - Timestamp: ${new Date(data.data.timestamp).toLocaleString()}`);
        }
    } catch (error) {
        alert('Error simulando dato');
        console.error(error);
    }
}

async function verDatos(sensorId) {
    try {
        const response = await fetch(`${API_BASE}:${SENSOR_PORT}/api/sensores/${sensorId}/datos?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            const datos = data.data.map(d =>
                `${new Date(d.timestamp).toLocaleString()}: ${d.valor}`
            ).join('\n');
            alert('Últimas 10 lecturas:\n\n' + datos);
        }
    } catch (error) {
        console.error(error);
    }
}

// Alertas
async function cargarAlertas() {
    try {
        const response = await fetch(`${API_BASE}:${ANALYSIS_PORT}/api/alertas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            mostrarAlertas(data.data);
        }
    } catch (error) {
        console.error('Error cargando alertas:', error);
    }
}

function mostrarAlertas(alertas) {
    const container = document.getElementById('alertasList');

    if (alertas.length === 0) {
        container.innerHTML = '<p>No hay alertas generadas.</p>';
        return;
    }

    container.innerHTML = alertas.map(a => `
        <div class="alert-card alert-${a.severidad.toLowerCase()}">
            <h3>${a.tipo.replace('_', ' ')}</h3>
            <div class="alert-info">
                <div class="info-item">
                    <div class="info-label">Severidad</div>
                    <div class="info-value">${a.severidad}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fecha</div>
                    <div class="info-value">${new Date(a.createdAt).toLocaleString()}</div>
                </div>
            </div>
            <p><strong>Mensaje:</strong> ${a.mensaje}</p>
            <p><strong>Recomendación:</strong> ${a.recomendacion || 'N/A'}</p>
            ${!a.leido ? `<button onclick="marcarLeida('${a.id}')">Marcar como Leída</button>` : '<p style="color: green;">✓ Leída</p>'}
        </div>
    `).join('');
}

async function marcarLeida(alertaId) {
    try {
        await fetch(`${API_BASE}:${ANALYSIS_PORT}/api/alertas/${alertaId}/leer`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarAlertas();
    } catch (error) {
        console.error(error);
    }
}

// Notificaciones
async function cargarNotificaciones() {
    try {
        const response = await fetch(`${API_BASE}:${NOTIFICATION_PORT}/api/notificaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            mostrarNotificaciones(data.data);
        }
    } catch (error) {
        console.error('Error cargando notificaciones:', error);
    }
}

function mostrarNotificaciones(notificaciones) {
    const container = document.getElementById('notificacionesList');

    if (notificaciones.length === 0) {
        container.innerHTML = '<p>No hay notificaciones.</p>';
        return;
    }

    container.innerHTML = notificaciones.map(n => `
        <div class="sensor-card">
            <h3>Notificación ${n.tipo}</h3>
            <div class="sensor-info">
                <div class="info-item">
                    <div class="info-label">Estado</div>
                    <div class="info-value">${n.estado}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fecha</div>
                    <div class="info-value">${new Date(n.createdAt).toLocaleString()}</div>
                </div>
            </div>
            <p>${n.contenido}</p>
        </div>
    `).join('');
}

// Utilidades
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="${type}-msg">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 5000);
}

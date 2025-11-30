/**
 * ALERT RULES - Reglas de alertas configurables
 */

const { ALERT_TYPES, ALERT_SEVERITY } = require('../../../../shared/utils/constants');

const ALERT_RULES = {
  // Regla 1: Riego necesario (humedad baja)
  RIEGO_NECESARIO: {
    condicion: (valor, tipo) => tipo === 'HUMEDAD' && valor < 30,
    tipo: ALERT_TYPES.RIEGO_NECESARIO,
    severidad: ALERT_SEVERITY.ALTA,
    mensaje: (valor, ubicacion) => `Humedad baja detectada en ${ubicacion}: ${valor}%`,
    recomendacion: 'Activar sistema de riego inmediatamente'
  },

  // Regla 2: Humedad excesiva
  HUMEDAD_EXCESIVA: {
    condicion: (valor, tipo) => tipo === 'HUMEDAD' && valor > 80,
    tipo: ALERT_TYPES.HUMEDAD_EXCESIVA,
    severidad: ALERT_SEVERITY.MEDIA,
    mensaje: (valor, ubicacion) => `Humedad excesiva en ${ubicacion}: ${valor}%`,
    recomendacion: 'Verificar drenaje y detener riego'
  },

  // Regla 3: Temperatura crítica
  TEMPERATURA_CRITICA: {
    condicion: (valor, tipo) => tipo === 'TEMPERATURA' && valor > 40,
    tipo: ALERT_TYPES.TEMPERATURA_CRITICA,
    severidad: ALERT_SEVERITY.CRITICA,
    mensaje: (valor, ubicacion) => `Temperatura crítica en ${ubicacion}: ${valor}°C`,
    recomendacion: 'Activar sistemas de enfriamiento o sombreado'
  },

  // Regla 4: Temperatura baja
  TEMPERATURA_BAJA: {
    condicion: (valor, tipo) => tipo === 'TEMPERATURA' && valor < 10,
    tipo: ALERT_TYPES.TEMPERATURA_BAJA,
    severidad: ALERT_SEVERITY.ALTA,
    mensaje: (valor, ubicacion) => `Temperatura baja en ${ubicacion}: ${valor}°C`,
    recomendacion: 'Proteger cultivos del frío'
  }
};

module.exports = { ALERT_RULES };

/**
 * SIMULATOR SERVICE - Servicio de simulación de datos de sensores
 *
 * Propósito:
 * Generar datos realistas de sensores SIN REQUERIR HARDWARE ARDUINO
 *
 * Características:
 * - Datos realistas con variación gradual
 * - Ciclos día/noche para temperatura
 * - Múltiples modos: Stream, Bulk, Eventos especiales
 * - Exportable para análisis
 *
 * Modos:
 * 1. Stream: Genera datos continuamente
 * 2. Bulk: Genera múltiples datos en una llamada
 * 3. Eventos: Sequía, lluvia, temperatura crítica
 */

const RabbitMQClient = require('../../../../shared/messagebroker/RabbitMQClient');
const { SENSOR_TYPES, UNITS } = require('../../../../shared/utils/constants');
const { sleep } = require('../../../../shared/utils/helpers');

class SimulatorService {
  constructor() {
    this.rabbitClient = null;
    this.activeSimulations = new Map(); // Simulaciones activas
  }

  /**
   * Inicializar conexión a RabbitMQ
   */
  async initialize() {
    this.rabbitClient = new RabbitMQClient();
    await this.rabbitClient.connect();
  }

  /**
   * Generar valor de humedad realista
   *
   * Rango: 20% - 80%
   * Variación: ±5% gradual
   *
   * @param {number} ultimoValor - Valor anterior
   * @returns {number}
   */
  generarHumedad(ultimoValor = 50) {
    const variacion = (Math.random() - 0.5) * 10; // ±5%
    let nuevoValor = ultimoValor + variacion;

    // Mantener en rango realista
    nuevoValor = Math.max(20, Math.min(80, nuevoValor));

    return Math.round(nuevoValor * 10) / 10;
  }

  /**
   * Generar valor de temperatura realista
   *
   * Rango: 15°C - 35°C
   * Ciclo día/noche: Máximo 14:00h, Mínimo 6:00h
   *
   * @returns {number}
   */
  generarTemperatura() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const minuto = ahora.getMinutes();

    // Ciclo sinusoidal: pico a las 14:00
    const horaDec = hora + minuto / 60;
    const ciclo = Math.sin((horaDec - 2) * Math.PI / 24);

    const baseTemp = 25 + (ciclo * 10); // 15°C a 35°C
    const ruido = (Math.random() - 0.5) * 2; // ±1°C

    return Math.round((baseTemp + ruido) * 10) / 10;
  }

  /**
   * Generar dato completo de sensor
   *
   * @param {Object} sensor - Sensor
   * @param {number} ultimoValor - Último valor (para continuidad)
   * @returns {Object}
   */
  generarDato(sensor, ultimoValor = null) {
    let valor;
    let unidad;

    switch (sensor.tipo) {
      case SENSOR_TYPES.HUMEDAD:
      case SENSOR_TYPES.HUMEDAD_SUELO:
        valor = this.generarHumedad(ultimoValor || sensor.ultimaLectura?.valor || 50);
        unidad = UNITS.HUMEDAD;
        break;

      case SENSOR_TYPES.TEMPERATURA:
        valor = this.generarTemperatura();
        unidad = UNITS.TEMPERATURA;
        break;

      default:
        valor = 50 + (Math.random() - 0.5) * 20;
        unidad = '%';
    }

    // Determinar estado basado en umbrales
    let estado = 'NORMAL';
    if (valor < sensor.umbralMinimo || valor > sensor.umbralMaximo) {
      estado = 'ALERTA';
    }
    if (valor < sensor.umbralMinimo * 0.8 || valor > sensor.umbralMaximo * 1.2) {
      estado = 'CRITICO';
    }

    return {
      sensorId: sensor.id,
      usuarioId: sensor.usuarioId,
      tipo: sensor.tipo,
      valor: Math.round(valor * 10) / 10,
      unidad,
      temperatura: this.generarTemperatura(),
      timestamp: new Date(),
      ubicacion: sensor.ubicacion,
      estado
    };
  }

  /**
   * MODO BULK: Generar múltiples datos históricos
   *
   * Útil para llenar historial inicial
   *
   * @param {Object} sensor - Sensor
   * @param {number} cantidad - Cantidad de datos a generar
   * @param {number} horasAtras - Horas hacia atrás desde ahora
   * @returns {Array<Object>}
   */
  generarBulk(sensor, cantidad = 288, horasAtras = 24) {
    const datos = [];
    let ultimoValor = sensor.ultimaLectura?.valor || 50;

    const ahora = Date.now();
    const intervaloMs = (horasAtras * 60 * 60 * 1000) / cantidad;

    for (let i = 0; i < cantidad; i++) {
      const timestamp = new Date(ahora - (cantidad - i) * intervaloMs);

      const dato = this.generarDato(sensor, ultimoValor);
      dato.timestamp = timestamp;

      datos.push(dato);
      ultimoValor = dato.valor;
    }

    console.log(`[Simulator] ✅ Generados ${cantidad} datos bulk para sensor ${sensor.nombre}`);

    return datos;
  }

  /**
   * MODO STREAM: Generar flujo continuo de datos
   *
   * Publica datos cada N segundos a RabbitMQ
   *
   * @param {Object} sensor - Sensor
   * @param {number} duracionMinutos - Duración de la simulación
   * @param {number} intervaloSegundos - Intervalo entre datos
   */
  async generarStream(sensor, duracionMinutos = 60, intervaloSegundos = 5) {
    const simulationId = sensor.id;

    // Verificar si ya hay simulación activa
    if (this.activeSimulations.has(simulationId)) {
      console.log(`[Simulator] ⚠️ Simulación ya activa para sensor ${sensor.nombre}`);
      return false;
    }

    console.log(`[Simulator] 🚀 Iniciando simulación stream para ${sensor.nombre} (${duracionMinutos} min)`);

    this.activeSimulations.set(simulationId, true);

    const inicio = Date.now();
    const duracion = duracionMinutos * 60 * 1000;
    let ultimoValor = sensor.ultimaLectura?.valor || 50;
    let contador = 0;

    try {
      while (Date.now() - inicio < duracion) {
        // Verificar si fue detenida
        if (!this.activeSimulations.get(simulationId)) {
          console.log(`[Simulator] ⏸️ Simulación detenida para ${sensor.nombre}`);
          break;
        }

        // Generar dato
        const dato = this.generarDato(sensor, ultimoValor);
        ultimoValor = dato.valor;
        contador++;

        // Publicar a RabbitMQ
        if (this.rabbitClient && this.rabbitClient.isConnected) {
          await this.rabbitClient.publish('sensor.data.received', dato);
        }

        console.log(`[Simulator] 📊 Dato ${contador} - ${sensor.nombre}: ${dato.valor}${dato.unidad}`);

        // Esperar intervalo
        await sleep(intervaloSegundos * 1000);
      }

      console.log(`[Simulator] ✅ Simulación completada para ${sensor.nombre} (${contador} datos)`);

    } catch (error) {
      console.error(`[Simulator] ❌ Error en simulación:`, error.message);
    } finally {
      this.activeSimulations.delete(simulationId);
    }

    return contador;
  }

  /**
   * Detener simulación activa
   *
   * @param {string} sensorId
   */
  detenerStream(sensorId) {
    if (this.activeSimulations.has(sensorId)) {
      this.activeSimulations.set(sensorId, false);
      console.log(`[Simulator] 🛑 Deteniendo simulación para sensor ${sensorId}`);
      return true;
    }
    return false;
  }

  /**
   * EVENTO ESPECIAL: Sequía (baja humedad gradual)
   *
   * Simula falta de riego por varios días
   *
   * @param {Object} sensor
   * @returns {Array<Object>}
   */
  generarEventoSequia(sensor) {
    const datos = [];
    let humedad = 70; // Empezar alto

    // Descender gradualmente en 48 datos (~4 horas)
    for (let i = 0; i < 48; i++) {
      humedad -= 0.9; // Baja ~1% cada 5min
      humedad = Math.max(15, humedad);

      const dato = {
        sensorId: sensor.id,
        usuarioId: sensor.usuarioId,
        tipo: sensor.tipo,
        valor: Math.round(humedad * 10) / 10,
        unidad: '%',
        temperatura: this.generarTemperatura(),
        timestamp: new Date(Date.now() - (48 - i) * 5 * 60 * 1000),
        ubicacion: sensor.ubicacion,
        estado: humedad < 30 ? 'ALERTA' : 'NORMAL'
      };

      datos.push(dato);
    }

    console.log(`[Simulator] 🌵 Evento SEQUÍA generado para ${sensor.nombre}`);

    return datos;
  }

  /**
   * EVENTO ESPECIAL: Lluvia (sube humedad rápidamente)
   *
   * @param {Object} sensor
   * @returns {Array<Object>}
   */
  generarEventoLluvia(sensor) {
    const datos = [];
    let humedad = 30; // Empezar bajo

    // Subir rápidamente en 12 datos (~1 hora)
    for (let i = 0; i < 12; i++) {
      humedad += 4; // Sube 4% cada 5min
      humedad = Math.min(85, humedad);

      const dato = {
        sensorId: sensor.id,
        usuarioId: sensor.usuarioId,
        tipo: sensor.tipo,
        valor: Math.round(humedad * 10) / 10,
        unidad: '%',
        temperatura: this.generarTemperatura() - 2, // Más frío cuando llueve
        timestamp: new Date(Date.now() - (12 - i) * 5 * 60 * 1000),
        ubicacion: sensor.ubicacion,
        estado: humedad > 80 ? 'ALERTA' : 'NORMAL'
      };

      datos.push(dato);
    }

    console.log(`[Simulator] 🌧️ Evento LLUVIA generado para ${sensor.nombre}`);

    return datos;
  }

  /**
   * EVENTO ESPECIAL: Temperatura crítica
   *
   * @param {Object} sensor
   * @returns {Array<Object>}
   */
  generarEventoTemperaturaCritica(sensor) {
    const datos = [];
    let temp = 30;

    // Subir temperatura gradualmente hasta nivel crítico
    for (let i = 0; i < 20; i++) {
      temp += 0.8;
      temp = Math.min(45, temp);

      const dato = {
        sensorId: sensor.id,
        usuarioId: sensor.usuarioId,
        tipo: SENSOR_TYPES.TEMPERATURA,
        valor: Math.round(temp * 10) / 10,
        unidad: '°C',
        temperatura: temp,
        timestamp: new Date(Date.now() - (20 - i) * 5 * 60 * 1000),
        ubicacion: sensor.ubicacion,
        estado: temp > 40 ? 'CRITICO' : (temp > 35 ? 'ALERTA' : 'NORMAL')
      };

      datos.push(dato);
    }

    console.log(`[Simulator] 🔥 Evento TEMPERATURA CRÍTICA generado para ${sensor.nombre}`);

    return datos;
  }

  /**
   * Obtener estadísticas de simulaciones activas
   */
  getEstadisticas() {
    return {
      simulacionesActivas: this.activeSimulations.size,
      sensores: Array.from(this.activeSimulations.keys())
    };
  }
}

module.exports = new SimulatorService();

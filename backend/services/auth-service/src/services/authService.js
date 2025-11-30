/**
 * AUTH SERVICE - Servicio de autenticación
 *
 * Propósito:
 * Lógica de negocio para autenticación de usuarios
 *
 * Métodos:
 * - register: Registrar nuevo usuario
 * - login: Iniciar sesión
 * - refreshToken: Refrescar token
 * - logout: Cerrar sesión
 * - validateToken: Validar token JWT
 */

const User = require('../models/User');
const { generateToken, verifyToken } = require('../../../../shared/middleware/authMiddleware');
const { ValidationError, AuthenticationError } = require('../../../../shared/middleware/errorHandler');
const { validateEmail, validatePassword } = require('../../../../shared/utils/validators');

class AuthService {
  /**
   * Registrar nuevo usuario
   *
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} { user, token }
   */
  async register(userData) {
    const { email, password, nombre, telefonoPropiedad, emailPropiedad, preferenciasNotificacion } = userData;

    // Validar email
    if (!validateEmail(email)) {
      throw new ValidationError('Email inválido');
    }

    // Validar contraseña
    if (!validatePassword(password)) {
      throw new ValidationError('Contraseña debe tener al menos 8 caracteres, una letra y un número');
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('El email ya está registrado', { field: 'email' });
    }

    // Crear usuario
    const user = await User.create({
      email,
      password,
      nombre,
      telefonoPropiedad,
      emailPropiedad,
      preferenciasNotificacion: preferenciasNotificacion || {
        sms: true,
        email: true,
        push: false
      }
    });

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre
    });

    console.log('[AuthService] ✅ Usuario registrado:', user.email);

    return {
      user: user.toPublicJSON(),
      token
    };
  }

  /**
   * Iniciar sesión
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} { user, token }
   */
  async login(email, password) {
    // Validar datos
    if (!email || !password) {
      throw new ValidationError('Email y contraseña son requeridos');
    }

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    // Verificar si está activo
    if (!user.activo) {
      throw new AuthenticationError('Usuario inactivo. Contacte al administrador');
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    // Actualizar último acceso
    await user.updateLastAccess();

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre
    });

    console.log('[AuthService] ✅ Usuario autenticado:', user.email);

    return {
      user: user.toPublicJSON(),
      token
    };
  }

  /**
   * Refrescar token
   *
   * @param {string} oldToken
   * @returns {Promise<Object>} { token }
   */
  async refreshToken(oldToken) {
    try {
      // Verificar token (aunque esté expirado, podemos obtener los datos)
      const decoded = verifyToken(oldToken);

      // Buscar usuario
      const user = await User.findByPk(decoded.id);
      if (!user || !user.activo) {
        throw new AuthenticationError('Usuario no encontrado o inactivo');
      }

      // Generar nuevo token
      const token = generateToken({
        id: user.id,
        email: user.email,
        nombre: user.nombre
      });

      console.log('[AuthService] ✅ Token refrescado para:', user.email);

      return { token };

    } catch (error) {
      throw new AuthenticationError('Token inválido o expirado');
    }
  }

  /**
   * Cerrar sesión
   *
   * En una implementación real, aquí se invalidaría el token
   * (usando Redis, blacklist, etc.)
   *
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async logout(userId) {
    // En una implementación real:
    // - Agregar token a blacklist en Redis
    // - Invalidar refresh tokens
    // - Limpiar sesiones activas

    console.log('[AuthService] ✅ Usuario desconectado:', userId);

    return true;
  }

  /**
   * Validar token JWT
   *
   * @param {string} token
   * @returns {Promise<Object>} Usuario decodificado
   */
  async validateToken(token) {
    try {
      const decoded = verifyToken(token);

      // Verificar que el usuario existe y está activo
      const user = await User.findByPk(decoded.id);
      if (!user || !user.activo) {
        throw new AuthenticationError('Usuario no encontrado o inactivo');
      }

      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre
      };

    } catch (error) {
      throw new AuthenticationError('Token inválido');
    }
  }
}

module.exports = new AuthService();

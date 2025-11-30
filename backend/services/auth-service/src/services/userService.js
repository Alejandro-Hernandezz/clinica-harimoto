/**
 * USER SERVICE - Servicio de gestión de usuarios
 *
 * Propósito:
 * Lógica de negocio para gestión de usuarios
 *
 * Métodos:
 * - getProfile: Obtener perfil de usuario
 * - updateProfile: Actualizar perfil
 * - updatePassword: Cambiar contraseña
 * - updatePreferences: Actualizar preferencias de notificación
 * - getUsers: Listar usuarios (admin)
 * - deactivateUser: Desactivar usuario
 */

const User = require('../models/User');
const { NotFoundError, ValidationError, AuthenticationError } = require('../../../../shared/middleware/errorHandler');
const { validateEmail, validatePassword, validatePhone } = require('../../../../shared/utils/validators');

class UserService {
  /**
   * Obtener perfil de usuario
   *
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    return user.toPublicJSON();
  }

  /**
   * Actualizar perfil de usuario
   *
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    const { nombre, telefonoPropiedad, emailPropiedad } = updateData;

    // Validar email propiedad si se proporciona
    if (emailPropiedad && !validateEmail(emailPropiedad)) {
      throw new ValidationError('Email de propiedad inválido');
    }

    // Validar teléfono si se proporciona
    if (telefonoPropiedad && !validatePhone(telefonoPropiedad)) {
      throw new ValidationError('Teléfono inválido');
    }

    // Actualizar campos
    if (nombre) user.nombre = nombre;
    if (telefonoPropiedad !== undefined) user.telefonoPropiedad = telefonoPropiedad;
    if (emailPropiedad !== undefined) user.emailPropiedad = emailPropiedad;

    await user.save();

    console.log('[UserService] ✅ Perfil actualizado:', user.email);

    return user.toPublicJSON();
  }

  /**
   * Cambiar contraseña
   *
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<boolean>}
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    // Validar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('Contraseña actual incorrecta');
    }

    // Validar nueva contraseña
    if (!validatePassword(newPassword)) {
      throw new ValidationError('Nueva contraseña debe tener al menos 8 caracteres, una letra y un número');
    }

    // Actualizar contraseña (el hook beforeUpdate la hasheará)
    user.password = newPassword;
    await user.save();

    console.log('[UserService] ✅ Contraseña actualizada:', user.email);

    return true;
  }

  /**
   * Actualizar preferencias de notificación
   *
   * @param {string} userId
   * @param {Object} preferences
   * @returns {Promise<Object>}
   */
  async updatePreferences(userId, preferences) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    // Validar estructura de preferencias
    const { sms, email, push } = preferences;

    if (sms !== undefined && typeof sms !== 'boolean') {
      throw new ValidationError('Preferencia SMS debe ser booleana');
    }

    if (email !== undefined && typeof email !== 'boolean') {
      throw new ValidationError('Preferencia email debe ser booleana');
    }

    if (push !== undefined && typeof push !== 'boolean') {
      throw new ValidationError('Preferencia push debe ser booleana');
    }

    // Actualizar preferencias
    user.preferenciasNotificacion = {
      ...user.preferenciasNotificacion,
      ...preferences
    };

    await user.save();

    console.log('[UserService] ✅ Preferencias actualizadas:', user.email);

    return user.toPublicJSON();
  }

  /**
   * Listar usuarios (admin)
   *
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async getUsers(filters = {}) {
    const { activo, limit = 50, offset = 0 } = filters;

    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    const users = await User.findAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    return users.map(user => user.toPublicJSON());
  }

  /**
   * Desactivar usuario
   *
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deactivateUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    user.activo = false;
    await user.save();

    console.log('[UserService] ⚠️ Usuario desactivado:', user.email);

    return true;
  }

  /**
   * Reactivar usuario
   *
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async activateUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    user.activo = true;
    await user.save();

    console.log('[UserService] ✅ Usuario reactivado:', user.email);

    return true;
  }
}

module.exports = new UserService();

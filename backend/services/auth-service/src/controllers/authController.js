/**
 * AUTH CONTROLLER - Controlador de autenticación
 *
 * Propósito:
 * Manejar peticiones HTTP relacionadas con autenticación
 *
 * Endpoints:
 * POST /api/auth/register - Registrar usuario
 * POST /api/auth/login - Iniciar sesión
 * POST /api/auth/logout - Cerrar sesión
 * POST /api/auth/refresh-token - Refrescar token
 * GET /api/auth/profile - Obtener perfil (requiere auth)
 * PUT /api/auth/profile - Actualizar perfil (requiere auth)
 * PUT /api/auth/change-password - Cambiar contraseña (requiere auth)
 */

const authService = require('../services/authService');
const userService = require('../services/userService');
const { asyncHandler } = require('../../../../shared/middleware/errorHandler');
const { successResponse } = require('../../../../shared/utils/helpers');

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, nombre, telefonoPropiedad, emailPropiedad, preferenciasNotificacion } = req.body;

  const result = await authService.register({
    email,
    password,
    nombre,
    telefonoPropiedad,
    emailPropiedad,
    preferenciasNotificacion
  });

  res.status(201).json(
    successResponse(result, 'Usuario registrado exitosamente')
  );
});

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json(
    successResponse(result, 'Inicio de sesión exitoso')
  );
});

/**
 * Cerrar sesión
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await authService.logout(userId);

  res.status(200).json(
    successResponse(null, 'Sesión cerrada exitosamente')
  );
});

/**
 * Refrescar token
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const result = await authService.refreshToken(token);

  res.status(200).json(
    successResponse(result, 'Token refrescado exitosamente')
  );
});

/**
 * Obtener perfil de usuario
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await userService.getProfile(userId);

  res.status(200).json(
    successResponse(profile, 'Perfil obtenido exitosamente')
  );
});

/**
 * Actualizar perfil de usuario
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const profile = await userService.updateProfile(userId, updateData);

  res.status(200).json(
    successResponse(profile, 'Perfil actualizado exitosamente')
  );
});

/**
 * Cambiar contraseña
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  await userService.updatePassword(userId, currentPassword, newPassword);

  res.status(200).json(
    successResponse(null, 'Contraseña actualizada exitosamente')
  );
});

/**
 * Actualizar preferencias de notificación
 * PUT /api/auth/preferences
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const preferences = req.body;

  const profile = await userService.updatePreferences(userId, preferences);

  res.status(200).json(
    successResponse(profile, 'Preferencias actualizadas exitosamente')
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  updatePreferences
};

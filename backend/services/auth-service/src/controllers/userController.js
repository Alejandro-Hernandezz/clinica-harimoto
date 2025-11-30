/**
 * USER CONTROLLER - Controlador de usuarios
 *
 * Propósito:
 * Manejar peticiones HTTP relacionadas con gestión de usuarios
 *
 * Endpoints:
 * GET /api/usuarios - Listar usuarios
 * GET /api/usuarios/:id - Obtener usuario por ID
 * PUT /api/usuarios/:id/activate - Activar usuario
 * PUT /api/usuarios/:id/deactivate - Desactivar usuario
 */

const userService = require('../services/userService');
const { asyncHandler } = require('../../../../shared/middleware/errorHandler');
const { successResponse } = require('../../../../shared/utils/helpers');

/**
 * Listar usuarios
 * GET /api/usuarios
 */
const getUsers = asyncHandler(async (req, res) => {
  const { activo, limit, offset } = req.query;

  const filters = {
    activo: activo !== undefined ? activo === 'true' : undefined,
    limit: limit ? parseInt(limit) : 50,
    offset: offset ? parseInt(offset) : 0
  };

  const users = await userService.getUsers(filters);

  res.status(200).json(
    successResponse(users, 'Usuarios obtenidos exitosamente')
  );
});

/**
 * Obtener usuario por ID
 * GET /api/usuarios/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getProfile(id);

  res.status(200).json(
    successResponse(user, 'Usuario obtenido exitosamente')
  );
});

/**
 * Activar usuario
 * PUT /api/usuarios/:id/activate
 */
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.activateUser(id);

  res.status(200).json(
    successResponse(null, 'Usuario activado exitosamente')
  );
});

/**
 * Desactivar usuario
 * PUT /api/usuarios/:id/deactivate
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.deactivateUser(id);

  res.status(200).json(
    successResponse(null, 'Usuario desactivado exitosamente')
  );
});

module.exports = {
  getUsers,
  getUserById,
  activateUser,
  deactivateUser
};

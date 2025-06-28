import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 * name: Users
 * description: Operaciones relacionadas con los usuarios.
 */

// /**
//  * @swagger
//  * /api/users:
//  * get:
//  * summary: Obtiene todos los usuarios.
//  * tags: [Users]
//  * responses:
//  * 200:
//  * description: Lista de usuarios obtenida exitosamente.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: success
//  * payload:
//  * type: array
//  * items:
//  * $ref: '#/components/schemas/User'
//  * 500:
//  * description: Error interno del servidor.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: Internal Server Error
//  */
router.get('/', usersController.getAllUsers);

// /**
//  * @swagger
//  * /api/users/{uid}:
//  * get:
//  * summary: Obtiene un usuario por su ID.
//  * tags: [Users]
//  * parameters:
//  * - in: path
//  * name: uid
//  * schema:
//  * type: string
//  * required: true
//  * description: ID único del usuario.
//  * example: 60c72b2f9f1b2c001c8e4d1a
//  * responses:
//  * 200:
//  * description: Usuario obtenido exitosamente.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: success
//  * payload:
//  * $ref: '#/components/schemas/User'
//  * 404:
//  * description: Usuario no encontrado.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: User not found
//  * 500:
//  * description: Error interno del servidor o ID inválido.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: Internal Server Error | Cast to ObjectId failed for value ...
//  */
router.get('/:uid', usersController.getUser);
// /**
//  * @swagger
//  * /api/users/{uid}:
//  * put:
//  * summary: Actualiza un usuario por su ID.
//  * tags: [Users]
//  * parameters:
//  * - in: path
//  * name: uid
//  * schema:
//  * type: string
//  * required: true
//  * description: ID único del usuario a actualizar.
//  * example: 60c72b2f9f1b2c001c8e4d1a
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * first_name:
//  * type: string
//  * description: Nuevo nombre del usuario.
//  * example: NuevoNombre
//  * last_name:
//  * type: string
//  * description: Nuevo apellido del usuario.
//  * example: NuevoApellido
//  * email:
//  * type: string
//  * format: email
//  * description: Nuevo correo electrónico del usuario.
//  * example: nuevo.email@example.com
//  * password:
//  * type: string
//  * description: Nueva contraseña del usuario.
//  * example: nueva_clave_segura
//  * example: # Este 'example' es del request body completo
//  * last_name: "García" # Solo un ejemplo de un campo a actualizar
//  * responses:
//  * 200:
//  * description: Usuario actualizado exitosamente.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: success
//  * message:
//  * type: string
//  * example: User updated
//  * 400:
//  * description: Datos de entrada inválidos.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: Incomplete values | Invalid data provided
//  * 404:
//  * description: Usuario no encontrado.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: User not found
//  * 500:
//  * description: Error interno del servidor.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: Internal Server Error
//  */
router.put('/:uid', usersController.updateUser);
// /**
//  * @swagger
//  * /api/users/{uid}:
//  * delete:
//  * summary: Elimina un usuario por su ID.
//  * tags: [Users]
//  * parameters:
//  * - in: path
//  * name: uid
//  * schema:
//  * type: string
//  * required: true
//  * description: ID único del usuario a eliminar.
//  * example: 60c72b2f9f1b2c001c8e4d1a
//  * responses:
//  * 200:
//  * description: Usuario eliminado exitosamente.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: success
//  * message:
//  * type: string
//  * example: User deleted
//  * 404:
//  * description: Usuario no encontrado para eliminar.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: User not found
//  * 500:
//  * description: Error interno del servidor.
//  * content:
//  * application/json:
//  * schema:
//  * type: object
//  * properties:
//  * status:
//  * type: string
//  * example: error
//  * error:
//  * type: string
//  * example: Internal Server Error
//  */
router.delete('/:uid', usersController.deleteUser);

export default router;
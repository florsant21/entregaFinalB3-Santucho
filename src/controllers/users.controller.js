import { usersService } from "../services/index.js";
import logger from '../utils/logger.js';

const getAllUsers = async (req, res, next) => {
    try {
        const users = await usersService.getAll();
        res.send({ status: "success", payload: users });
    } catch (error) {
        req.logger.error("Error al obtener todos los usuarios:", error);
        next(error);
    }
}

const getUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) {
            req.logger.warning(`Usuario no encontrado con ID: ${userId}`);
            return res.status(404).send({ status: "error", error: "User not found" });
        }
        res.send({ status: "success", payload: user });
    } catch (error) {
        req.logger.error(`Error al obtener usuario por ID ${req.params.uid}:`, error);
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) {
            req.logger.warning(`Usuario no encontrado para actualizar con ID: ${userId}`);
            return res.status(404).send({ status: "error", error: "User not found" });
        }
        const result = await usersService.update(userId, updateBody);
        req.logger.info(`Usuario actualizado: ${userId}`);
        res.send({ status: "success", message: "User updated" });
    } catch (error) {
        req.logger.error(`Error al actualizar usuario con ID ${req.params.uid}:`, error);
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const result = await usersService.delete(userId);
        if (!result) {
            req.logger.warning(`Usuario no encontrado para eliminar con ID: ${userId}`);
            return res.status(404).send({ status: "error", error: "User not found" });
        }
        req.logger.info(`Usuario eliminado: ${userId}`);
        res.send({ status: "success", message: "User deleted" });
    } catch (error) {
        req.logger.error(`Error al eliminar usuario con ID ${req.params.uid}:`, error);
        next(error);
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}
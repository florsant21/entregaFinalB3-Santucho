import { adoptionsService, petsService, usersService } from "../services/index.js";
import logger from '../utils/logger.js';

const getAllAdoptions = async (req, res, next) => {
    try {
        const result = await adoptionsService.getAll();
        res.send({ status: "success", payload: result });
    } catch (error) {
        req.logger.error("Error al obtener todas las adopciones:", error);
        next(error);
    }
}

const getAdoption = async (req, res, next) => {
    try {
        const adoptionId = req.params.aid;
        const adoption = await adoptionsService.getBy({ _id: adoptionId });
        if (!adoption) {
            req.logger.warning(`Adopción no encontrada con ID: ${adoptionId}`);
            return res.status(404).send({ status: "error", error: "Adoption not found" });
        }
        res.send({ status: "success", payload: adoption });
    } catch (error) {
        req.logger.error(`Error al obtener adopción por ID ${req.params.aid}:`, error);
        next(error);
    }
}

const createAdoption = async (req, res, next) => {
    try {
        const { uid, pid } = req.params;
        const user = await usersService.getUserById(uid);
        if (!user) {
            req.logger.warning(`Usuario no encontrado para adopción con ID: ${uid}`);
            return res.status(404).send({ status: "error", error: "User Not found" });
        }
        const pet = await petsService.getBy({ _id: pid });
        if (!pet) {
            req.logger.warning(`Mascota no encontrada para adopción con ID: ${pid}`);
            return res.status(404).send({ status: "error", error: "Pet not found" });
        }
        if (pet.adopted) {
            req.logger.warning(`Intento de adoptar mascota ya adoptada: ${pid}`);
            return res.status(400).send({ status: "error", error: "Pet is already adopted" });
        }
        user.pets.push(pet._id);
        await usersService.update(user._id, { pets: user.pets });
        await petsService.update(pet._id, { adopted: true, owner: user._id });
        await adoptionsService.create({ owner: user._id, pet: pet._id });
        req.logger.info(`Mascota ${pet._id} adoptada por el usuario ${user._id}`);
        res.send({ status: "success", message: "Pet adopted" });
    } catch (error) {
        req.logger.error("Error al crear adopción:", error);
        next(error);
    }
}

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption
}
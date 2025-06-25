import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js";
import __dirname from "../utils/index.js";
import logger from '../utils/logger.js';

const getAllPets = async (req, res, next) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: "success", payload: pets });
    } catch (error) {
        req.logger.error("Error al obtener todas las mascotas:", error);
        next(error);
    }
}

const createPet = async (req, res, next) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
            req.logger.warning("Valores incompletos al crear mascota");
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);
        req.logger.info(`Mascota creada: ${result.name}`);
        res.send({ status: "success", payload: result });
    } catch (error) {
        req.logger.error("Error al crear mascota:", error);
        next(error);
    }
}

const updatePet = async (req, res, next) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        const result = await petsService.update(petId, petUpdateBody);
        if (!result) {
            req.logger.warning(`Mascota no encontrada para actualizar con ID: ${petId}`);
            return res.status(404).send({ status: "error", error: "Pet not found" });
        }
        req.logger.info(`Mascota actualizada: ${petId}`);
        res.send({ status: "success", message: "pet updated" });
    } catch (error) {
        req.logger.error(`Error al actualizar mascota con ID ${req.params.pid}:`, error);
        next(error);
    }
}

const deletePet = async (req, res, next) => {
    try {
        const petId = req.params.pid;
        const result = await petsService.delete(petId);
        if (!result) {
            req.logger.warning(`Mascota no encontrada para eliminar con ID: ${petId}`);
            return res.status(404).send({ status: "error", error: "Pet not found" });
        }
        req.logger.info(`Mascota eliminada: ${petId}`);
        res.send({ status: "success", message: "pet deleted" });
    } catch (error) {
        req.logger.error(`Error al eliminar mascota con ID ${req.params.pid}:`, error);
        next(error);
    }
}

const createPetWithImage = async (req, res, next) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate || !file) {
            req.logger.warning("Valores incompletos o archivo no subido al crear mascota con imagen.");
            return res.status(400).send({ status: "error", error: "Incomplete values or image not provided" });
        }
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `/img/${file.filename}`
        });
        const result = await petsService.create(pet);
        req.logger.info(`Mascota con imagen creada: ${result.name}`);
        res.send({ status: "success", payload: result });
    } catch (error) {
        req.logger.error("Error al crear mascota con imagen:", error);
        next(error);
    }
}

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}
import { Router } from 'express';
import { generateUser, generatePet } from '../utils/mockingModule.js';
import { usersService, petsService } from '../services/index.js';
import PetDTO from '../dto/Pet.dto.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/mockingpets', (req, res, next) => {
    try {
        const quantity = parseInt(req.query.quantity) || 10;
        if (isNaN(quantity) || quantity < 0) {
            req.logger.warning(`Solicitud inválida para /mockingpets con cantidad: ${req.query.quantity}`);
            return res.status(400).send({ status: "error", error: "La cantidad debe ser un número positivo." });
        }

        const mockPets = [];
        for (let i = 0; i < quantity; i++) {
            mockPets.push(generatePet());
        }
        res.send({ status: "success", payload: mockPets });
    } catch (error) {
        req.logger.error(`Error en /mockingpets: ${error.message}`);
        next(error);
    }
});

router.get('/mockingusers', async (req, res, next) => {
    try {
        const quantity = parseInt(req.query.quantity) || 50;
        if (isNaN(quantity) || quantity < 0) {
            req.logger.warning(`Solicitud inválida para /mockingusers con cantidad: ${req.query.quantity}`);
            return res.status(400).send({ status: "error", error: "La cantidad debe ser un número positivo." });
        }

        const mockUsers = [];
        for (let i = 0; i < quantity; i++) {
            mockUsers.push(await generateUser());
        }
        res.send({ status: "success", payload: mockUsers });
    } catch (error) {
        req.logger.error(`Error en /mockingusers: ${error.message}`);
        next(error);
    }
});

router.get('/generateData', async (req, res, next) => {
    try {
        const numUsers = parseInt(req.query.users);
        const numPets = parseInt(req.query.pets);

        if (isNaN(numUsers) || numUsers < 0 || isNaN(numPets) || numPets < 0) {
            req.logger.warning(`Solicitud inválida para /generateData con users: ${req.query.users}, pets: ${req.query.pets}`);
            return res.status(400).send({ status: "error", error: "Por favor, proporcione números positivos válidos para 'users' y 'pets' en la consulta (query)." });
        }

        const insertedUsers = [];
        for (let i = 0; i < numUsers; i++) {
            const user = await generateUser(true);
            const result = await usersService.create(user);
            insertedUsers.push(result);
            req.logger.info(`Usuario generado e insertado: ${result.email}`);
        }

        const insertedPets = [];
        for (let i = 0; i < numPets; i++) {
            const petData = generatePet();
            const pet = PetDTO.getPetInputFrom({
                name: petData.name,
                specie: petData.specie,
                birthDate: petData.birthDate,
                image: petData.image
            });
            const result = await petsService.create(pet);
            insertedPets.push(result);
            req.logger.info(`Mascota generada e insertada: ${result.name}`);
        }

        res.send({
            status: "success",
            message: `${insertedUsers.length} usuarios y ${insertedPets.length} mascotas generados e insertados exitosamente.`,
            insertedUsers: insertedUsers.map(user => user._id),
            insertedPets: insertedPets.map(pet => pet._id)
        });

    } catch (error) {
        req.logger.error("Error al generar o insertar datos:", error);
        next(error);
    }
});

export default router;
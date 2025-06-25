import { Router } from 'express';
import { generateMockUsers } from '../utils/mockingModule.js';
import { createHash } from '../utils/index.js';
import { usersService, petsService } from '../services/index.js';
import PetDTO from '../dto/Pet.dto.js';

const router = Router();

router.get('/mockingpets', (req, res) => {
    const mockPets = [];
    for (let i = 0; i < 10; i++) {
        mockPets.push({
            _id: `mockPetId${i}`, 
            name: `Mocky Pet ${i}`,
            specie: i % 2 === 0 ? 'Dog' : 'Cat',
            birthDate: new Date(2020, i, 1),
            adopted: false,
            image: 'no-image.jpg'
        });
    }
    res.send({ status: "success", payload: mockPets });
});

router.get('/mockingusers', async (req, res) => {
    const numberOfUsers = 50;
    const mockUsers = await generateMockUsers(numberOfUsers); 
    res.send({ status: "success", payload: mockUsers });
});

router.post('/generateData', async (req, res) => {
    const { users: numUsers, pets: numPets } = req.body;

    if (typeof numUsers !== 'number' || typeof numPets !== 'number' || numUsers < 0 || numPets < 0) {
        return res.status(400).send({ status: "error", error: "Please provide valid positive numbers for 'users' and 'pets'." });
    }

    try {
        const generatedUsers = await generateMockUsers(numUsers, true); 
        const insertedUsers = [];
        for (const user of generatedUsers) {
            const result = await usersService.create(user);
            insertedUsers.push(result);
        }

        const insertedPets = [];
        for (let i = 0; i < numPets; i++) {
            const pet = PetDTO.getPetInputFrom({
                name: `Generated Pet ${i}`,
                specie: i % 2 === 0 ? 'Dog' : 'Cat',
                birthDate: new Date(2021, i % 12, (i % 28) + 1),
                image: 'generated-image.jpg'
            });
            const result = await petsService.create(pet); 
            insertedPets.push(result);
        }

        res.send({
            status: "success",
            message: `${insertedUsers.length} users and ${insertedPets.length} pets generated and inserted successfully.`,
            insertedUsers: insertedUsers.map(user => user._id),
            insertedPets: insertedPets.map(pet => pet._id)
        });

    } catch (error) {
        console.error("Error generating or inserting data:", error);
        res.status(500).send({ status: "error", error: "Failed to generate and insert data." });
    }
});

export default router;
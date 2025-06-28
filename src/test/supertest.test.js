import chai from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { generatePet, generateUser } from '../utils/mockingModule.js';
import { faker } from '@faker-js/faker';
import { petsService } from '../services/index.js';
import app from '../app.js';
import { createHash } from '../utils/index.js';
import { usersService } from '../services/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToImage = path.join(__dirname, '../public/img/1671549990926-coderDog.jpg');

const expect = chai.expect;
const requester = supertest(app);

describe('Testing de Módulo de Mascotas', () => {
    let testPetId;
    let testUserId;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }
        await petsService.dao.clearAll();
        await usersService.dao.clearAll();
    });

    after(async () => {
        await petsService.dao.clearAll();
        await usersService.dao.clearAll();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    beforeEach(async () => {
        const mockUser = {
            first_name: 'Test',
            last_name: 'User',
            email: `test${Date.now()}@example.com`,
            password: await createHash('password123')
        };
        const user = await usersService.create(mockUser);
        testUserId = user._id;
    });

    describe('GET /api/pets', () => {
        it('Debería devolver un array de mascotas si la consulta es exitosa', async () => {
            const res = await requester.get('/api/pets');
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array');
        });
    });

    describe('POST /api/pets', () => {
        it('Debería crear una nueva mascota con los datos correctos', async () => {
            const mockPet = generatePet();
            const res = await requester.post('/api/pets').send({
                name: mockPet.name,
                specie: mockPet.specie,
                birthDate: mockPet.birthDate.toISOString().split('T')[0]
            });

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id');
            expect(res.body.payload.name).to.equal(mockPet.name);
            expect(res.body.payload.specie).to.equal(mockPet.specie);
            expect(res.body.payload.adopted).to.be.false;
            testPetId = res.body.payload._id;

            const createdPet = await petsService.getBy({ _id: testPetId });
            expect(createdPet).to.exist;
            expect(createdPet.name).to.equal(mockPet.name);
        });

        it('Debería devolver un error 400 si faltan datos obligatorios al crear una mascota', async () => {
            const res = await requester.post('/api/pets').send({
                name: 'Mascota Incompleta'
            });
            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Incomplete values');
        });
    });

    describe('POST /api/pets/withimage', () => {
        it('Debería crear una nueva mascota con una imagen subida', async () => {
            const mockPet = generatePet();
            const res = await requester.post('/api/pets/withimage')
                .field('name', mockPet.name)
                .field('specie', mockPet.specie)
                .field('birthDate', mockPet.birthDate.toISOString().split('T')[0])
                .attach('image', pathToImage);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id');
            expect(res.body.payload.name).to.equal(mockPet.name);
            expect(res.body.payload.image).to.exist;
            expect(res.body.payload.image).to.include('/img/');
        });

        it('Debería devolver un error 400 si faltan datos o la imagen al crear mascota con imagen', async () => {
            const mockPet = generatePet();
            const res = await requester.post('/api/pets/withimage')
                .field('name', mockPet.name)
                .field('specie', mockPet.specie);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Incomplete values or image not provided');
        });
    });

    describe('PUT /api/pets/:pid', () => {
        let petToUpdateId;

        beforeEach(async () => {
            const mockPet = generatePet();
            const createdPet = await petsService.create({
                name: mockPet.name,
                specie: mockPet.specie,
                birthDate: mockPet.birthDate
            });
            petToUpdateId = createdPet._id;
        });

        it('Debería actualizar una mascota existente', async () => {
            const updatedSpecie = 'Dragón';
            const res = await requester.put(`/api/pets/${petToUpdateId}`).send({
                specie: updatedSpecie
            });

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('pet updated');

            const petInDb = await petsService.getBy({ _id: petToUpdateId });
            expect(petInDb.specie).to.equal(updatedSpecie);
        });

        it('Debería devolver un error 404 si se intenta actualizar una mascota no existente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await requester.put(`/api/pets/${nonExistentId}`).send({
                name: 'No Existe'
            });
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Pet not found');
        });
    });

    describe('DELETE /api/pets/:pid', () => {
        let petToDeleteId;

        beforeEach(async () => {
            const mockPet = generatePet();
            const createdPet = await petsService.create({
                name: mockPet.name,
                specie: mockPet.specie,
                birthDate: mockPet.birthDate
            });
            petToDeleteId = createdPet._id;
        });

        it('Debería eliminar una mascota existente', async () => {
            const res = await requester.delete(`/api/pets/${petToDeleteId}`);
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('pet deleted');

            const deletedPet = await petsService.getBy({ _id: petToDeleteId });
            expect(deletedPet).to.be.null;
        });

        it('Debería devolver un error 404 si se intenta eliminar una mascota no existente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await requester.delete(`/api/pets/${nonExistentId}`);
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Pet not found');
        });
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        let petToAdoptId;

        beforeEach(async () => {
            const mockPet = generatePet();
            const createdPet = await petsService.create({
                name: mockPet.name,
                specie: mockPet.specie,
                birthDate: mockPet.birthDate,
                adopted: false
            });
            petToAdoptId = createdPet._id;
        });

        it('Debería permitir a un usuario adoptar una mascota no adoptada', async () => {
            const res = await requester.post(`/api/adoptions/${testUserId}/${petToAdoptId}`);
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Pet adopted');

            const adoptedPet = await petsService.getBy({ _id: petToAdoptId });
            expect(adoptedPet.adopted).to.be.true;
            expect(adoptedPet.owner.toString()).to.equal(testUserId.toString());

            const userWithPet = await usersService.getUserById(testUserId);
            expect(userWithPet.pets.some(p => p._id && p._id.toString() === petToAdoptId.toString())).to.be.true;
        });

        it('Debería devolver un error 400 si se intenta adoptar una mascota ya adoptada', async () => {
            await petsService.update(petToAdoptId, { adopted: true, owner: testUserId });

            const res = await requester.post(`/api/adoptions/${testUserId}/${petToAdoptId}`);
            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Pet is already adopted');
        });

        it('Debería devolver un error 404 si el usuario no existe para la adopción', async () => {
            const nonExistentUserId = new mongoose.Types.ObjectId();
            const res = await requester.post(`/api/adoptions/${nonExistentUserId}/${petToAdoptId}`);
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('User Not found');
        });

        it('Debería devolver un error 404 si la mascota no existe para la adopción', async () => {
            const nonExistentPetId = new mongoose.Types.ObjectId();
            const res = await requester.post(`/api/adoptions/${testUserId}/${nonExistentPetId}`);
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Pet not found');
        });
    });
});

describe('Testing de Módulo de Usuarios', () => {
    let testUserId;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }
        await usersService.dao.clearAll();
    });

    after(async () => {
        await usersService.dao.clearAll();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('GET /api/users', () => {
        it('Debería devolver un array de usuarios si la consulta es exitosa', async () => {
            const res = await requester.get('/api/users');
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array');
        });
    });

    describe('POST /api/sessions/register', () => {
        it('Debería registrar un nuevo usuario con los datos correctos', async () => {
            const mockUser = await generateUser(true);
            const res = await requester.post('/api/sessions/register').send({
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                email: mockUser.email,
                password: 'testpassword123'
            });

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.exist;
            testUserId = res.body.payload;

            const createdUser = await usersService.getUserById(testUserId);
            expect(createdUser.email).to.equal(mockUser.email);
            expect(createdUser.first_name).to.equal(mockUser.first_name);
        });

        it('Debería devolver un error 400 si faltan datos en el registro', async () => {
            const res = await requester.post('/api/sessions/register').send({
                first_name: 'Faltan',
                email: 'datos@test.com'
            });
            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('Incomplete values');
        });

        it('Debería devolver un error 400 si el usuario ya existe', async () => {
            const existingUser = await generateUser(true);
            await usersService.create({
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                password: await createHash('testpassword123')
            });

            const res = await requester.post('/api/sessions/register').send({
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                password: 'newpassword'
            });

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('User already exists');
        });
    });

    describe('GET /api/users/:uid', () => {
        it('Debería devolver un usuario si el ID es válido', async () => {
            if (!testUserId) {
                const mockUser = await generateUser(true);
                const createdUser = await usersService.create({
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    email: mockUser.email,
                    password: await createHash('password123')
                });
                testUserId = createdUser._id;
            }

            const res = await requester.get(`/api/users/${testUserId}`);
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id', testUserId.toString());
            expect(res.body.payload).to.have.property('email');
        });

        it('Debería devolver un error 404 si el ID del usuario no existe', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await requester.get(`/api/users/${nonExistentId}`);
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('User not found');
        });

        it('Debería devolver un error 500 si el ID no es un formato válido de ObjectId', async () => {
            const invalidId = 'invalid-id-format';
            const res = await requester.get(`/api/users/${invalidId}`);
            expect(res.status).to.equal(500);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.include('Internal Server Error');
        });
    });

    describe('PUT /api/users/:uid', () => {
        it('Debería actualizar un usuario existente', async () => {
            if (!testUserId) {
                const mockUser = await generateUser(true);
                const createdUser = await usersService.create({
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    email: mockUser.email,
                    password: await createHash('password123')
                });
                testUserId = createdUser._id;
            }

            const updatedLastName = 'NuevoApellido';
            const res = await requester.put(`/api/users/${testUserId}`).send({
                last_name: updatedLastName
            });

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('User updated');

            const userInDb = await usersService.getUserById(testUserId);
            expect(userInDb.last_name).to.equal(updatedLastName);
        });

        it('Debería devolver un error 404 si se intenta actualizar un usuario no existente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await requester.put(`/api/users/${nonExistentId}`).send({
                first_name: 'NonExistent'
            });
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('User not found');
        });
    });

    describe('DELETE /api/users/:uid', () => {
        let userToDeleteId;
        beforeEach(async () => {
            const mockUser = await generateUser(true);
            const user = await usersService.create({
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                email: faker.internet.email(),
                password: await createHash('deletepassword')
            });
            userToDeleteId = user._id;
        });

        it('Debería eliminar un usuario existente', async () => {
            const res = await requester.delete(`/api/users/${userToDeleteId}`);
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('User deleted');
            const deletedUser = await usersService.getUserById(userToDeleteId);
            expect(deletedUser).to.be.null;
        });

        it('Debería devolver un error 404 si se intenta eliminar un usuario no existente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await requester.delete(`/api/users/${nonExistentId}`);
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.error).to.equal('User not found');
        });
    });
});
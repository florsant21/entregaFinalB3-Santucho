import { fakerES as faker } from '@faker-js/faker';
import { createHash } from './index.js';

export const generateUser = async (forDbInsertion = false) => {
    const hashedPassword = await createHash(faker.internet.password());
    const user = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: faker.helpers.arrayElement(['user', 'admin']),
        pets: []
    };

    if (!forDbInsertion) {
        user._id = faker.database.mongodbObjectId();
    }
    return user;
};

export const generatePet = () => {
    const pet = {
        _id: faker.database.mongodbObjectId(),
        name: faker.animal.type() + ' ' + faker.person.firstName(),
        specie: faker.helpers.arrayElement(['Dog', 'Cat', 'Bird', 'Reptile', 'Fish']),
        birthDate: faker.date.past({ years: 5 }),
        adopted: faker.datatype.boolean(),
        image: faker.image.urlLoremFlickr({ category: 'animals' })
    };
    return pet;
};
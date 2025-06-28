import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentación de la API de Adopción de Mascotas',
      version: '1.0.0',
      description: 'API para la gestión de usuarios y mascotas, incluyendo adopciones.',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario',
              example: '60c72b2f9f1b2c001c8e4d1a'
            },
            first_name: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan'
            },
            last_name: {
              type: 'string',
              description: 'Apellido del usuario',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
              example: 'juan.perez@example.com'
            },
            password: {
              type: 'string',
              description: 'Contraseña hasheada del usuario (no se expone en GET)',
              example: 'hashedpassword123'
            },
            pets: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Pet'
              },
              description: 'Mascotas adoptadas por el usuario'
            },
            role: {
                type: 'string',
                description: 'Rol del usuario (ej. user, admin)',
                example: 'user'
            }
          },
          example: {
            _id: "60c72b2f9f1b2c001c8e4d1a",
            first_name: "Juan",
            last_name: "Pérez",
            email: "juan.perez@example.com",
            pets: [],
            role: "user"
          }
        },
        Pet: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                specie: { type: 'string' },
                birthDate: { type: 'string', format: 'date' },
                adopted: { type: 'boolean' },
                owner: { type: 'string', format: 'uuid' }
            }
        }
      }
    }
  },

  apis: [
    './src/routes/*.js',
    './src/docs/*.yaml'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
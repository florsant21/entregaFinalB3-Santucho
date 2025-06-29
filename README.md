# Proyecto de API de Adopción de Mascotas

Este proyecto implementa una API REST para la gestión de usuarios y mascotas, incluyendo funcionalidades de adopción. Está construido con Node.js, Express y MongoDB, y utiliza Mocha, Chai y Supertest para el testing, y Swagger para la documentación de la API.

## Funcionalidades Principales

-   Gestión completa de **Usuarios** (CRUD).
-   Gestión completa de **Mascotas** (CRUD, incluyendo subida de imágenes).
-   Sistema de **Adopciones** que vincula usuarios y mascotas.

## Documentación de la API (Swagger)

La documentación interactiva de la API está disponible a través de Swagger UI una vez que la aplicación está en ejecución.

Puedes acceder a ella en: `http://localhost:8080/apidocs`.

## Tests

El proyecto incluye una suite de tests funcionales y de integración utilizando Mocha, Chai y Supertest para asegurar la calidad de los endpoints.

Para ejecutar los tests, usa el siguiente comando:

```bash
npm test
```

## Dockerización

Este proyecto está Dockerizado, lo que permite un despliegue y ejecución consistentes en cualquier entorno compatible con Docker.

```bash
docker pull andreafsantucho/adopcion-mascotas-api:1.0.0
```

## Configuración y Ejecución Local

Requisitos:

Node.js (v18 o superior recomendado)

npm (Node Package Manager)

MongoDB (local o remoto)

## Instalación

### Clona el repositorio:

```bash
git clone https://github.com/florsant21/entregaFinalB3-Santucho.git
```

### Instala las dependencias:

```bash
npm install
```

Crea un archivo .env en la raíz de tu proyecto con tus variables de entorno.

## Ejecución
Para iniciar el servidor de la API:

```bash
npm start
```

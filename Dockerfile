# Dockerfile

# Etapa 1: Construir la aplicación (usando una imagen base de Node.js)
FROM node:18-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición del proyecto y dependencias
# Esto es más eficiente para el cacheo de Docker, ya que los package.json/lock.json
# cambian con menos frecuencia que el código fuente.
COPY package*.json ./

# Instala las dependencias
# --production para instalar solo las dependencias de producción
# --no-optional para evitar paquetes opcionales que puedan causar problemas de compilación en Alpine
RUN npm install --production --no-optional

# Copia el resto del código de la aplicación
COPY . .

# Expón el puerto en el que tu aplicación Node.js escucha
# Asegúrate de que este puerto coincida con el puerto de tu app.js (ej. app.listen(8080))
EXPOSE 8080

# Comando para ejecutar la aplicación cuando el contenedor se inicie
# Usa 'node dist/app.js' si estás compilando tu JS (ej. con Babel/TypeScript)
# Si tu app principal es 'src/app.js' y la ejecutas directamente:
CMD ["node", "src/app.js"]

# Si usas un script de inicio en package.json (ej. "start": "node src/app.js"):
# CMD ["npm", "start"]

# Notas adicionales:
# - Puedes usar una imagen de Node.js más específica (ej. node:lts-slim o node:18-bullseye)
#   "alpine" es bueno para imágenes pequeñas, pero a veces puede faltar alguna librería.
# - Si tu aplicación tiene una etapa de "build" (ej. TypeScript, Webpack), necesitarías una etapa de multi-stage build:
#   FROM node:18-alpine AS build
#   WORKDIR /app
#   COPY package*.json ./
#   RUN npm install
#   COPY . .
#   RUN npm run build # Asumiendo un script 'build' en package.json
#
#   FROM node:18-alpine AS production # Nueva etapa para la imagen final, más ligera
#   WORKDIR /app
#   COPY --from=build /app/node_modules ./node_modules
#   COPY --from=build /app/dist ./dist # Si tu build genera archivos en 'dist'
#   EXPOSE 8080
#   CMD ["node", "dist/app.js"]
#
# Para tu caso actual, asumiendo que ejecutas 'src/app.js' directamente, la primera versión del Dockerfile es la adecuada.
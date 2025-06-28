import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoption.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import mocksRouter from "./routes/mocks.router.js";

import dotenv from "dotenv";
import logger, { addLogger } from "./utils/logger.js";
import errorHandler from "./middlewares/errorHandler.js";

import swaggerUiExpress from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.config.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => logger.info("Conexión exitosa a la base de datos"))
  .catch((err) => logger.fatal("Error al conectar a la base de datos:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(addLogger);

app.use(
  "/apidocs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerSpec)
);

app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/mocks", mocksRouter);

app.get("/loggerTest", (req, res) => {
  req.logger.debug("Este es un mensaje de DEBUG");
  req.logger.http("Este es un mensaje de HTTP");
  req.logger.info("Este es un mensaje de INFO");
  req.logger.warning("Este es un mensaje de WARNING");
  req.logger.error("Este es un mensaje de ERROR");
  req.logger.fatal("Este es un mensaje de FATAL");
  res.send("Logs enviados, revisa tu consola y el archivo errors.log");
});

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Servidor escuchando en el puerto ${PORT}`));

export default app;

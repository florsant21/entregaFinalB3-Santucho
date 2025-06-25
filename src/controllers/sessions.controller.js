import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import logger from '../utils/logger.js';

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            req.logger.warning("Valores incompletos al registrar usuario.");
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const exists = await usersService.getUserByEmail(email);
        if (exists) {
            req.logger.warning(`Intento de registro de usuario existente: ${email}`);
            return res.status(400).send({ status: "error", error: "User already exists" });
        }
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        };
        let result = await usersService.create(user);
        req.logger.info(`Usuario registrado exitosamente: ${result.email}`);
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        req.logger.error("Error al registrar usuario:", error);
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            req.logger.warning("Valores incompletos al iniciar sesión.");
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            req.logger.warning(`Intento de login con usuario no existente: ${email}`);
            return res.status(404).send({ status: "error", error: "User doesn't exist" });
        }
        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            req.logger.warning(`Intento de login con contraseña incorrecta para: ${email}`);
            return res.status(400).send({ status: "error", error: "Incorrect password" });
        }
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });
        req.logger.info(`Usuario logeado exitosamente: ${email}`);
        res.cookie('coderCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Logged in" });
    } catch (error) {
        req.logger.error("Error al iniciar sesión:", error);
        next(error);
    }
}

const current = async (req, res, next) => {
    try {
        const cookie = req.cookies['coderCookie'];
        if (!cookie) {
            req.logger.info("Acceso a current sin cookie de sesión.");
            return res.status(401).send({ status: "error", error: "No session cookie found" });
        }
        const user = jwt.verify(cookie, 'tokenSecretJWT');
        req.logger.info(`Usuario actual obtenido: ${user.email}`);
        res.send({ status: "success", payload: user });
    } catch (error) {
        req.logger.error("Error al obtener usuario actual de la cookie:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send({ status: "error", error: "Invalid or expired token" });
        }
        next(error);
    }
}

const unprotectedLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            req.logger.warning("Valores incompletos al iniciar sesión sin protección.");
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            req.logger.warning(`Intento de login sin protección con usuario no existente: ${email}`);
            return res.status(404).send({ status: "error", error: "User doesn't exist" });
        }
        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            req.logger.warning(`Intento de login sin protección con contraseña incorrecta para: ${email}`);
            return res.status(400).send({ status: "error", error: "Incorrect password" });
        }
        const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });
        req.logger.info(`Usuario logeado sin protección: ${email}`);
        res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" });
    } catch (error) {
        req.logger.error("Error en login sin protección:", error);
        next(error);
    }
}

const unprotectedCurrent = async (req, res, next) => {
    try {
        const cookie = req.cookies['unprotectedCookie'];
        if (!cookie) {
            req.logger.info("Acceso a current sin protección sin cookie.");
            return res.status(401).send({ status: "error", error: "No unprotected session cookie found" });
        }
        const user = jwt.verify(cookie, 'tokenSecretJWT');
        req.logger.info(`Usuario actual (sin protección) obtenido: ${user.email}`);
        res.send({ status: "success", payload: user });
    } catch (error) {
        req.logger.error("Error al obtener usuario actual (sin protección) de la cookie:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send({ status: "error", error: "Invalid or expired unprotected token" });
        }
        next(error);
    }
}

export default {
    current,
    login,
    register,
    unprotectedLogin,
    unprotectedCurrent
}
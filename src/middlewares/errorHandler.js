import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    if (err.name === 'ValidationError') {
        return res.status(400).send({ status: "error", error: err.message, details: err.errors });
    }
    res.status(500).send({ status: "error", error: "Internal Server Error", message: err.message });
};

export default errorHandler;
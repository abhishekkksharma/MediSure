"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ServiceError_1 = require("./ServiceError");
const handleControllerError = (res, error, fallbackMessage) => {
    if (error instanceof ServiceError_1.ServiceError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        const errors = Object.values(error.errors).map((e) => e.message);
        res.status(400).json({ message: 'Validation failed', errors });
        return;
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
    }
    if (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000) {
        res.status(409).json({ message: 'A record with this unique value already exists' });
        return;
    }
    console.error(fallbackMessage, error);
    res.status(500).json({ message: fallbackMessage });
};
exports.handleControllerError = handleControllerError;

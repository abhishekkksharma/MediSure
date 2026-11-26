"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = void 0;
/**
 * Structured application error thrown by service functions and mapped to HTTP responses by controllers.
 */
class ServiceError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
    }
}
exports.ServiceError = ServiceError;

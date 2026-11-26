"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Establishes a connection to MongoDB using the configured MONGO_URI.
 */
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medisure';
    const dbName = process.env.MONGO_DB_NAME || 'medisure';
    try {
        const conn = await mongoose_1.default.connect(mongoUri, { dbName });
        console.log(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;

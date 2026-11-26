"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const doctors_seed_1 = require("./seeds/doctors.seed");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const diagnosis_routes_1 = __importDefault(require("./routes/diagnosis.routes"));
const bloodRequest_routes_1 = __importDefault(require("./routes/bloodRequest.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Core middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'medisure-server',
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use('/api/users', user_routes_1.default);
app.use('/api/doctors', doctor_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/diagnosis', diagnosis_routes_1.default);
app.use('/api/blood-requests', bloodRequest_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});
const startServer = async () => {
    await (0, db_1.connectDB)();
    await (0, doctors_seed_1.seedDefaultDoctors)();
    app.listen(PORT, () => {
        console.log(`MediSure server running on http://localhost:${PORT}`);
    });
};
startServer();
exports.default = app;

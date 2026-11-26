"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Manual & AI-assisted appointment booking
router.post('/', (0, auth_middleware_1.requirePermission)('appointment:create'), appointment_controller_1.createManualAppointment);
router.post('/ai-diagnosis', (0, auth_middleware_1.requirePermission)('appointment:create'), appointment_controller_1.createAiDiagnosisAppointment);
// Read & manage appointments
router.get('/', appointment_controller_1.getAppointments);
router.get('/:id', appointment_controller_1.getAppointmentById);
router.patch('/:id/status', appointment_controller_1.updateAppointmentStatus);
exports.default = router;

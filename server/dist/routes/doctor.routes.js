"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctor_controller_1 = require("../controllers/doctor.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public / authenticated discovery routes for AI diagnosis & appointment booking
router.get('/departments', doctor_controller_1.getDepartmentsWithDoctors);
router.get('/', doctor_controller_1.listDoctors);
// Schedule management (doctor self or admin)
router.put('/:id/schedule', auth_middleware_1.authenticate, (0, auth_middleware_1.requireSelfOrPermission)('user:update_all'), doctor_controller_1.updateDoctorSchedule);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDoctorSchedule = exports.listDoctors = exports.getDepartmentsWithDoctors = void 0;
const doctor_service_1 = require("../services/doctor.service");
const errorHandler_1 = require("../utils/errorHandler");
const getDepartmentsWithDoctors = async (req, res) => {
    try {
        const includeUnverified = req.query.includeUnverified === 'true';
        const result = await (0, doctor_service_1.getDepartmentsWithDoctorsService)(includeUnverified);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch departments and doctor schedules');
    }
};
exports.getDepartmentsWithDoctors = getDepartmentsWithDoctors;
const listDoctors = async (req, res) => {
    try {
        const { department, day, specialization, city, includeUnverified } = req.query;
        const doctors = await (0, doctor_service_1.listDoctorsService)({
            department: typeof department === 'string' ? department : undefined,
            day: typeof day === 'string' ? day : undefined,
            specialization: typeof specialization === 'string' ? specialization : undefined,
            city: typeof city === 'string' ? city : undefined,
            includeUnverified: includeUnverified === 'true',
        });
        res.status(200).json({ count: doctors.length, doctors });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch doctors');
    }
};
exports.listDoctors = listDoctors;
const updateDoctorSchedule = async (req, res) => {
    try {
        const doctor = await (0, doctor_service_1.updateDoctorScheduleService)(String(req.params.id), req.body);
        res.status(200).json({
            message: 'Doctor schedule updated successfully',
            doctor,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to update doctor schedule');
    }
};
exports.updateDoctorSchedule = updateDoctorSchedule;

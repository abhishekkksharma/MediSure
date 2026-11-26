"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getAppointmentById = exports.getAppointments = exports.createAiDiagnosisAppointment = exports.createManualAppointment = void 0;
const appointment_service_1 = require("../services/appointment.service");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * POST /api/appointments
 * Creates a manual appointment for the authenticated patient (or specified patientId for admins).
 */
const createManualAppointment = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const patientId = req.user.role === 'admin' && req.body.patientId
            ? req.body.patientId
            : req.user._id.toString();
        const appointment = await (0, appointment_service_1.createAppointmentService)({
            patientId,
            doctorId: req.body.doctorId,
            department: req.body.department,
            appointmentDate: req.body.appointmentDate,
            timeSlot: req.body.timeSlot,
            bookingType: 'manual',
            symptoms: req.body.symptoms,
            notes: req.body.notes,
        });
        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to book appointment');
    }
};
exports.createManualAppointment = createManualAppointment;
/**
 * POST /api/appointments/ai-diagnosis
 * Books an appointment automatically based on AI diagnosis output.
 */
const createAiDiagnosisAppointment = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const patientId = req.user.role === 'admin' && req.body.patientId
            ? req.body.patientId
            : req.user._id.toString();
        const appointment = await (0, appointment_service_1.bookAppointmentFromAiDiagnosisService)({
            patientId,
            recommendedDepartment: req.body.recommendedDepartment,
            preferredDate: req.body.preferredDate,
            preferredTimeSlot: req.body.preferredTimeSlot,
            symptoms: req.body.symptoms || [],
            aiDiagnosisSummary: req.body.aiDiagnosisSummary || '',
            diagnosisId: req.body.diagnosisId,
            notes: req.body.notes,
        });
        res.status(201).json({
            message: 'AI-assisted appointment booked successfully',
            appointment,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to book AI-assisted appointment');
    }
};
exports.createAiDiagnosisAppointment = createAiDiagnosisAppointment;
/**
 * GET /api/appointments
 * Lists appointments scoped to the authenticated user's role (patient, doctor, or admin).
 */
const getAppointments = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const { status, page, limit } = req.query;
        const result = await (0, appointment_service_1.listAppointmentsService)({
            userId: req.user._id.toString(),
            role: req.user.role,
            status: typeof status === 'string' ? status : undefined,
            page: typeof page === 'string' ? parseInt(page, 10) : undefined,
            limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
        });
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch appointments');
    }
};
exports.getAppointments = getAppointments;
/**
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const appointment = await (0, appointment_service_1.getAppointmentByIdService)(String(req.params.id), req.user._id.toString(), req.user.role);
        res.status(200).json({ appointment });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch appointment');
    }
};
exports.getAppointmentById = getAppointmentById;
/**
 * PATCH /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const appointment = await (0, appointment_service_1.updateAppointmentStatusService)({
            appointmentId: String(req.params.id),
            requesterId: req.user._id.toString(),
            requesterRole: req.user.role,
            status: req.body.status,
            notes: req.body.notes,
        });
        res.status(200).json({
            message: 'Appointment status updated successfully',
            appointment,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to update appointment status');
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;

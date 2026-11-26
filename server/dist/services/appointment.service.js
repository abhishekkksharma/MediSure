"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatusService = exports.getAppointmentByIdService = exports.listAppointmentsService = exports.bookAppointmentFromAiDiagnosisService = exports.createAppointmentService = void 0;
const appointment_model_1 = __importStar(require("../models/appointment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const doctor_types_1 = require("../types/doctor.types");
const doctor_service_1 = require("./doctor.service");
const ServiceError_1 = require("../utils/ServiceError");
const getWeekdayFromDate = (date) => {
    const jsDay = date.getDay(); // 0 = Sun ... 6 = Sat
    const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[jsDay] || 'Mon';
};
/**
 * Creates a manual or AI-triggered appointment after validating patient & verified doctor.
 */
const createAppointmentService = async (input) => {
    if (!input.patientId || !input.doctorId || !input.appointmentDate || !input.timeSlot) {
        throw new ServiceError_1.ServiceError(400, 'patientId, doctorId, appointmentDate, and timeSlot are required');
    }
    const [patient, doctor] = await Promise.all([
        user_model_1.default.findById(input.patientId),
        user_model_1.default.findById(input.doctorId),
    ]);
    if (!patient || !patient.isActive) {
        throw new ServiceError_1.ServiceError(404, 'Active patient not found');
    }
    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive || !doctor.doctorProfile) {
        throw new ServiceError_1.ServiceError(404, 'Active doctor not found');
    }
    if (!doctor.doctorProfile.isVerified) {
        throw new ServiceError_1.ServiceError(400, 'Selected doctor is not verified yet');
    }
    const resolvedDepartment = input.department && doctor_types_1.DEPARTMENT_NAMES.includes(input.department)
        ? input.department
        : doctor.doctorProfile.department || 'GeneralMedicine';
    const parsedDate = new Date(input.appointmentDate);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new ServiceError_1.ServiceError(400, 'Invalid appointmentDate format');
    }
    const appointment = await appointment_model_1.default.create({
        patient: patient._id,
        doctor: doctor._id,
        department: resolvedDepartment,
        appointmentDate: parsedDate,
        timeSlot: input.timeSlot.trim(),
        bookingType: input.bookingType || 'manual',
        status: input.bookingType === 'ai_diagnosis' ? 'confirmed' : 'pending',
        symptoms: input.symptoms || [],
        aiDiagnosisSummary: input.aiDiagnosisSummary,
        diagnosisId: input.diagnosisId,
        notes: input.notes,
    });
    return appointment.populate([
        { path: 'patient', select: 'name email phone bloodGroup' },
        { path: 'doctor', select: 'name email phone doctorProfile location' },
    ]);
};
exports.createAppointmentService = createAppointmentService;
/**
 * Reusable internal service for AI diagnosis flow:
 * picks an available verified doctor in the recommended department and books the appointment.
 */
const bookAppointmentFromAiDiagnosisService = async (input) => {
    if (!doctor_types_1.DEPARTMENT_NAMES.includes(input.recommendedDepartment)) {
        throw new ServiceError_1.ServiceError(400, `Invalid recommendedDepartment. Allowed: ${doctor_types_1.DEPARTMENT_NAMES.join(', ')}`);
    }
    const targetDate = input.preferredDate
        ? new Date(input.preferredDate)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // default: next day
    if (Number.isNaN(targetDate.getTime())) {
        throw new ServiceError_1.ServiceError(400, 'Invalid preferredDate format');
    }
    const preferredDay = getWeekdayFromDate(targetDate);
    const doctor = await (0, doctor_service_1.findDoctorForDepartmentService)(input.recommendedDepartment, doctor_types_1.WEEKDAYS.includes(preferredDay) ? preferredDay : undefined);
    const defaultSlot = doctor.doctorProfile?.opdTimings?.label ||
        (doctor.doctorProfile?.opdTimings
            ? `${doctor.doctorProfile.opdTimings.start} - ${doctor.doctorProfile.opdTimings.end}`
            : '10:00 AM');
    return (0, exports.createAppointmentService)({
        patientId: input.patientId,
        doctorId: doctor._id.toString(),
        department: doctor.doctorProfile?.department || input.recommendedDepartment,
        appointmentDate: targetDate,
        timeSlot: input.preferredTimeSlot?.trim() || defaultSlot,
        bookingType: 'ai_diagnosis',
        symptoms: input.symptoms,
        aiDiagnosisSummary: input.aiDiagnosisSummary,
        diagnosisId: input.diagnosisId,
        notes: input.notes,
    });
};
exports.bookAppointmentFromAiDiagnosisService = bookAppointmentFromAiDiagnosisService;
const listAppointmentsService = async (params) => {
    const filter = {};
    if (params.role === 'patient') {
        filter.patient = params.userId;
    }
    else if (params.role === 'doctor') {
        filter.doctor = params.userId;
    }
    if (params.status &&
        appointment_model_1.APPOINTMENT_STATUSES.includes(params.status)) {
        filter.status = params.status;
    }
    const pageNum = Math.max(1, params.page || 1);
    const limitNum = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (pageNum - 1) * limitNum;
    const [appointments, total] = await Promise.all([
        appointment_model_1.default.find(filter)
            .populate('patient', 'name email phone bloodGroup')
            .populate('doctor', 'name email phone doctorProfile location')
            .sort({ appointmentDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        appointment_model_1.default.countDocuments(filter),
    ]);
    return {
        appointments,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};
exports.listAppointmentsService = listAppointmentsService;
const getAppointmentByIdService = async (appointmentId, requesterId, requesterRole) => {
    const appointment = await appointment_model_1.default.findById(appointmentId)
        .populate('patient', 'name email phone bloodGroup')
        .populate('doctor', 'name email phone doctorProfile location');
    if (!appointment) {
        throw new ServiceError_1.ServiceError(404, 'Appointment not found');
    }
    const isPatientOwner = appointment.patient._id.toString() === requesterId;
    const isAssignedDoctor = appointment.doctor._id.toString() === requesterId;
    if (requesterRole !== 'admin' && !isPatientOwner && !isAssignedDoctor) {
        throw new ServiceError_1.ServiceError(403, 'Access denied to view this appointment');
    }
    return appointment;
};
exports.getAppointmentByIdService = getAppointmentByIdService;
const updateAppointmentStatusService = async (params) => {
    if (!appointment_model_1.APPOINTMENT_STATUSES.includes(params.status)) {
        throw new ServiceError_1.ServiceError(400, `Invalid status. Allowed: ${appointment_model_1.APPOINTMENT_STATUSES.join(', ')}`);
    }
    const appointment = await appointment_model_1.default.findById(params.appointmentId);
    if (!appointment) {
        throw new ServiceError_1.ServiceError(404, 'Appointment not found');
    }
    const isPatientOwner = appointment.patient.toString() === params.requesterId;
    const isAssignedDoctor = appointment.doctor.toString() === params.requesterId;
    if (params.requesterRole === 'patient') {
        if (!isPatientOwner || params.status !== 'cancelled') {
            throw new ServiceError_1.ServiceError(403, 'Patients can only cancel their own appointments');
        }
    }
    else if (params.requesterRole === 'doctor') {
        if (!isAssignedDoctor) {
            throw new ServiceError_1.ServiceError(403, 'Doctors can only update their assigned appointments');
        }
    }
    else if (params.requesterRole !== 'admin') {
        throw new ServiceError_1.ServiceError(403, 'Access denied');
    }
    appointment.status = params.status;
    if (params.notes !== undefined) {
        appointment.notes = params.notes;
    }
    await appointment.save();
    return appointment.populate([
        { path: 'patient', select: 'name email phone bloodGroup' },
        { path: 'doctor', select: 'name email phone doctorProfile location' },
    ]);
};
exports.updateAppointmentStatusService = updateAppointmentStatusService;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDoctorScheduleService = exports.findDoctorForDepartmentService = exports.listDoctorsService = exports.getDepartmentsWithDoctorsService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const doctor_types_1 = require("../types/doctor.types");
const ServiceError_1 = require("../utils/ServiceError");
const getDepartmentsWithDoctorsService = async (includeUnverified = false) => {
    const filter = {
        role: 'doctor',
        isActive: true,
    };
    if (!includeUnverified) {
        filter['doctorProfile.isVerified'] = true;
    }
    const doctors = await user_model_1.default.find(filter)
        .select('name email doctorProfile location')
        .sort({ 'doctorProfile.experienceYears': -1 });
    const departments = doctor_types_1.DEPARTMENT_NAMES.reduce((acc, dept) => {
        acc[dept] = [];
        return acc;
    }, {});
    for (const doc of doctors) {
        const profile = doc.doctorProfile;
        if (!profile)
            continue;
        const deptName = doctor_types_1.DEPARTMENT_NAMES.includes(profile.department)
            ? profile.department
            : 'GeneralMedicine';
        const schedule = {
            doctorId: doc._id.toString(),
            doctor: doc.name,
            email: doc.email,
            department: deptName,
            opdTimings: profile.opdTimings || {
                start: '09:00',
                end: '17:00',
                label: '9:00 AM - 5:00 PM',
            },
            days: profile.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            qualifications: profile.qualifications,
            experienceYears: profile.experienceYears,
            consultationFee: profile.consultationFee,
            isVerified: profile.isVerified,
        };
        departments[deptName].push(schedule);
    }
    return {
        departmentNames: doctor_types_1.DEPARTMENT_NAMES,
        departmentLabels: doctor_types_1.DEPARTMENT_LABELS,
        departments,
    };
};
exports.getDepartmentsWithDoctorsService = getDepartmentsWithDoctorsService;
const listDoctorsService = async (query) => {
    const filter = {
        role: 'doctor',
        isActive: true,
    };
    if (!query.includeUnverified) {
        filter['doctorProfile.isVerified'] = true;
    }
    if (query.department && doctor_types_1.DEPARTMENT_NAMES.includes(query.department)) {
        filter['doctorProfile.department'] = query.department;
    }
    if (query.day && doctor_types_1.WEEKDAYS.includes(query.day)) {
        filter['doctorProfile.days'] = query.day;
    }
    if (query.specialization) {
        filter['doctorProfile.specialization'] = new RegExp(query.specialization.trim(), 'i');
    }
    if (query.city) {
        filter['location.city'] = new RegExp(query.city.trim(), 'i');
    }
    return user_model_1.default.find(filter)
        .select('name email phone location doctorProfile gender')
        .sort({ 'doctorProfile.experienceYears': -1 });
};
exports.listDoctorsService = listDoctorsService;
/**
 * Reusable helper for AI diagnosis: finds the best active, verified doctor
 * in the recommended department (falling back to GeneralMedicine if none are found).
 */
const findDoctorForDepartmentService = async (department, preferredDay) => {
    const baseFilter = {
        role: 'doctor',
        isActive: true,
        'doctorProfile.isVerified': true,
        'doctorProfile.department': department,
    };
    if (preferredDay) {
        const dayMatch = await user_model_1.default.findOne({
            ...baseFilter,
            'doctorProfile.days': preferredDay,
        }).sort({ 'doctorProfile.experienceYears': -1 });
        if (dayMatch)
            return dayMatch;
    }
    const deptMatch = await user_model_1.default.findOne(baseFilter).sort({
        'doctorProfile.experienceYears': -1,
    });
    if (deptMatch)
        return deptMatch;
    if (department !== 'GeneralMedicine') {
        const fallbackMatch = await user_model_1.default.findOne({
            role: 'doctor',
            isActive: true,
            'doctorProfile.isVerified': true,
            'doctorProfile.department': 'GeneralMedicine',
        }).sort({ 'doctorProfile.experienceYears': -1 });
        if (fallbackMatch)
            return fallbackMatch;
    }
    throw new ServiceError_1.ServiceError(404, `No verified doctor available for department '${department}'`);
};
exports.findDoctorForDepartmentService = findDoctorForDepartmentService;
const updateDoctorScheduleService = async (doctorId, input) => {
    const targetUser = await user_model_1.default.findById(doctorId);
    if (!targetUser || targetUser.role !== 'doctor' || !targetUser.doctorProfile) {
        throw new ServiceError_1.ServiceError(404, 'Doctor not found');
    }
    if (input.department !== undefined) {
        if (!doctor_types_1.DEPARTMENT_NAMES.includes(input.department)) {
            throw new ServiceError_1.ServiceError(400, `Invalid department. Allowed: ${doctor_types_1.DEPARTMENT_NAMES.join(', ')}`);
        }
        targetUser.doctorProfile.department = input.department;
    }
    if (input.opdTimings !== undefined) {
        targetUser.doctorProfile.opdTimings = input.opdTimings;
    }
    if (input.days !== undefined) {
        if (!Array.isArray(input.days) || input.days.some((d) => !doctor_types_1.WEEKDAYS.includes(d))) {
            throw new ServiceError_1.ServiceError(400, `Invalid days. Allowed values: ${doctor_types_1.WEEKDAYS.join(', ')}`);
        }
        targetUser.doctorProfile.days = input.days;
    }
    if (input.consultationFee !== undefined) {
        targetUser.doctorProfile.consultationFee = Number(input.consultationFee);
    }
    if (input.availableSlots !== undefined) {
        targetUser.doctorProfile.availableSlots = input.availableSlots;
    }
    await targetUser.save();
    return targetUser;
};
exports.updateDoctorScheduleService = updateDoctorScheduleService;

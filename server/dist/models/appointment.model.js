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
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_BOOKING_TYPES = exports.APPOINTMENT_STATUSES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const doctor_types_1 = require("../types/doctor.types");
exports.APPOINTMENT_STATUSES = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
];
exports.APPOINTMENT_BOOKING_TYPES = ['manual', 'ai_diagnosis'];
const appointmentSchema = new mongoose_1.Schema({
    patient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient reference is required'],
        index: true,
    },
    doctor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor reference is required'],
        index: true,
    },
    department: {
        type: String,
        enum: doctor_types_1.DEPARTMENT_NAMES,
        required: [true, 'Department is required'],
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required'],
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        trim: true,
    },
    bookingType: {
        type: String,
        enum: exports.APPOINTMENT_BOOKING_TYPES,
        default: 'manual',
    },
    status: {
        type: String,
        enum: exports.APPOINTMENT_STATUSES,
        default: 'pending',
        index: true,
    },
    symptoms: {
        type: [String],
        default: [],
    },
    aiDiagnosisSummary: {
        type: String,
        trim: true,
    },
    diagnosisId: {
        type: mongoose_1.Schema.Types.ObjectId,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
const Appointment = mongoose_1.default.model('Appointment', appointmentSchema);
exports.default = Appointment;

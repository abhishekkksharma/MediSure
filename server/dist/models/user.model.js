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
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.GENDERS = exports.BLOOD_GROUPS = exports.USER_ROLES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const doctor_types_1 = require("../types/doctor.types");
exports.USER_ROLES = ['patient', 'doctor', 'admin'];
exports.BLOOD_GROUPS = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
];
exports.GENDERS = ['male', 'female', 'other'];
exports.PERMISSIONS = [
    'user:read_own',
    'user:update_own',
    'user:delete_own',
    'user:read_all',
    'user:create',
    'user:update_all',
    'user:delete_all',
    'user:read_patients',
    'doctor:verify',
    'diagnosis:create',
    'diagnosis:read_own',
    'diagnosis:read_assigned',
    'appointment:create',
    'appointment:read_own',
    'appointment:read_assigned',
    'appointment:read_all',
    'appointment:update_status',
    'appointment:cancel_own',
    'blood_request:create',
    'blood_request:respond',
    'blood_request:manage_all',
];
exports.ROLE_PERMISSIONS = {
    patient: [
        'user:read_own',
        'user:update_own',
        'user:delete_own',
        'diagnosis:create',
        'diagnosis:read_own',
        'appointment:create',
        'appointment:read_own',
        'appointment:cancel_own',
        'blood_request:create',
        'blood_request:respond',
    ],
    doctor: [
        'user:read_own',
        'user:update_own',
        'user:read_patients',
        'diagnosis:read_assigned',
        'appointment:read_assigned',
        'appointment:update_status',
        'blood_request:create',
        'blood_request:respond',
    ],
    admin: [...exports.PERMISSIONS],
};
const locationSchema = new mongoose_1.Schema({
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
}, { _id: false });
const patientProfileSchema = new mongoose_1.Schema({
    medicalHistory: [{ type: String, trim: true }],
    allergies: [{ type: String, trim: true }],
    emergencyContact: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        relation: { type: String, trim: true },
    },
}, { _id: false });
const availabilitySlotSchema = new mongoose_1.Schema({
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
}, { _id: false });
const opdTimingsSchema = new mongoose_1.Schema({
    start: { type: String, required: true, trim: true, default: '09:00' },
    end: { type: String, required: true, trim: true, default: '17:00' },
    label: { type: String, trim: true },
}, { _id: false });
const doctorProfileSchema = new mongoose_1.Schema({
    department: {
        type: String,
        enum: doctor_types_1.DEPARTMENT_NAMES,
        default: 'GeneralMedicine',
    },
    specialization: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    opdTimings: {
        type: opdTimingsSchema,
        default: () => ({ start: '09:00', end: '17:00', label: '9:00 AM - 5:00 PM' }),
    },
    days: {
        type: [String],
        enum: doctor_types_1.WEEKDAYS,
        default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    experienceYears: { type: Number, min: 0, default: 0 },
    qualifications: [{ type: String, trim: true }],
    consultationFee: { type: Number, min: 0, default: 0 },
    isVerified: { type: Boolean, default: false },
    availableSlots: [availabilitySlotSchema],
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: exports.USER_ROLES,
        default: 'patient',
        index: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    bloodGroup: {
        type: String,
        enum: exports.BLOOD_GROUPS,
        index: true,
    },
    isBloodDonorAvailable: {
        type: Boolean,
        default: false,
    },
    location: locationSchema,
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: exports.GENDERS,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    permissions: {
        type: [String],
        enum: exports.PERMISSIONS,
        default: undefined,
    },
    patientProfile: patientProfileSchema,
    doctorProfile: doctorProfileSchema,
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
});
userSchema.index({ bloodGroup: 1, isBloodDonorAvailable: 1, isActive: 1 });
userSchema.index({ role: 1, 'doctorProfile.specialization': 1, 'doctorProfile.isVerified': 1 });
userSchema.pre('save', async function () {
    if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
        this.permissions = [...exports.ROLE_PERMISSIONS[this.role]];
    }
    if (this.isModified('password')) {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
userSchema.methods.getEffectivePermissions = function () {
    const roleDefaults = exports.ROLE_PERMISSIONS[this.role] || [];
    const custom = this.permissions || [];
    return Array.from(new Set([...roleDefaults, ...custom]));
};
userSchema.methods.hasPermission = function (permission) {
    if (this.role === 'admin')
        return true;
    return this.getEffectivePermissions().includes(permission);
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;

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
exports.BLOOD_REQUEST_STATUSES = exports.BLOOD_REQUEST_URGENCIES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_model_1 = require("./user.model");
exports.BLOOD_REQUEST_URGENCIES = ['normal', 'urgent', 'critical'];
exports.BLOOD_REQUEST_STATUSES = ['open', 'fulfilled', 'cancelled'];
const notifiedDonorSchema = new mongoose_1.Schema({
    donor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, trim: true },
    emailed: { type: Boolean, default: false },
}, { _id: false });
const bloodRequestSchema = new mongoose_1.Schema({
    requester: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    bloodGroup: {
        type: String,
        enum: user_model_1.BLOOD_GROUPS,
        required: [true, 'Blood group is required'],
        index: true,
    },
    unitsRequired: {
        type: Number,
        default: 1,
        min: 1,
    },
    urgency: {
        type: String,
        enum: exports.BLOOD_REQUEST_URGENCIES,
        default: 'urgent',
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    requirements: { type: String, trim: true },
    notifiedDonors: {
        type: [notifiedDonorSchema],
        default: [],
    },
    status: {
        type: String,
        enum: exports.BLOOD_REQUEST_STATUSES,
        default: 'open',
        index: true,
    },
}, { timestamps: true });
const BloodRequest = mongoose_1.default.model('BloodRequest', bloodRequestSchema);
exports.default = BloodRequest;

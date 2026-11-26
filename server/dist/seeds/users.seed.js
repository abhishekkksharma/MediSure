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
exports.seedDefaultUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importStar(require("../models/user.model"));
const FIRST_NAMES = [
    { name: 'Aarav', gender: 'male' },
    { name: 'Diya', gender: 'female' },
    { name: 'Kabir', gender: 'male' },
    { name: 'Anjali', gender: 'female' },
    { name: 'Rohan', gender: 'male' },
    { name: 'Meera', gender: 'female' },
    { name: 'Karthik', gender: 'male' },
    { name: 'Nisha', gender: 'female' },
    { name: 'Devansh', gender: 'male' },
    { name: 'Riya', gender: 'female' },
    { name: 'Aditya', gender: 'male' },
    { name: 'Snehal', gender: 'female' },
    { name: 'Vikas', gender: 'male' },
    { name: 'Pooja', gender: 'female' },
    { name: 'Siddharth', gender: 'male' },
    { name: 'Kavya', gender: 'female' },
    { name: 'Arjun', gender: 'male' },
    { name: 'Neha', gender: 'female' },
    { name: 'Pranav', gender: 'male' },
    { name: 'Ishita', gender: 'female' },
];
const LAST_NAMES = [
    'Sharma',
    'Deshpande',
    'Kulkarni',
    'Verma',
    'Malhotra',
    'Reddy',
    'Krishnan',
    'Iyer',
    'Patel',
    'Desai',
    'Chatterjee',
    'Rathore',
    'Nair',
    'Tiwari',
    'Joshi',
    'Banerjee',
    'Menon',
    'Kapoor',
    'Saxena',
    'Bansal',
];
const LOCATIONS = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Nagpur', state: 'Maharashtra' },
    { city: 'New Delhi', state: 'Delhi' },
    { city: 'Dwarka', state: 'Delhi' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Mysuru', state: 'Karnataka' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Coimbatore', state: 'Tamil Nadu' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Surat', state: 'Gujarat' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Siliguri', state: 'West Bengal' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Udaipur', state: 'Rajasthan' },
    { city: 'Kochi', state: 'Kerala' },
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Noida', state: 'Uttar Pradesh' },
    { city: 'Indore', state: 'Madhya Pradesh' },
    { city: 'Bhopal', state: 'Madhya Pradesh' },
    { city: 'Chandigarh', state: 'Punjab' },
];
const SEED_PATIENTS = Array.from({ length: 100 }, (_, index) => {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[(index * 3 + Math.floor(index / FIRST_NAMES.length)) % LAST_NAMES.length];
    const loc = LOCATIONS[index % LOCATIONS.length];
    const bloodGroup = user_model_1.BLOOD_GROUPS[index % user_model_1.BLOOD_GROUPS.length];
    const numSuffix = String(index + 1).padStart(3, '0');
    return {
        name: `${first.name} ${last}`,
        email: `${first.name.toLowerCase()}.${last.toLowerCase()}.${numSuffix}@medisure.in`,
        phone: `+91 98${String(10000000 + index * 7919).slice(0, 8)}`,
        bloodGroup,
        gender: first.gender,
        city: loc.city,
        state: loc.state,
        isBloodDonorAvailable: true,
    };
});
/**
 * Idempotently seeds 100 sample patient/blood-donor accounts into MongoDB
 * so real-time donor queries and location dropdowns return live data.
 */
const seedDefaultUsers = async () => {
    try {
        const existingEmails = new Set((await user_model_1.default.find({
            email: { $in: SEED_PATIENTS.map((p) => p.email) },
        }).select('email')).map((u) => u.email));
        const missing = SEED_PATIENTS.filter((p) => !existingEmails.has(p.email));
        if (missing.length === 0)
            return;
        const defaultPassword = process.env.SEED_USER_PASSWORD || 'Patient@123';
        const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
        const docs = missing.map((patient) => ({
            name: patient.name,
            email: patient.email,
            password: hashedPassword,
            role: 'patient',
            phone: patient.phone,
            bloodGroup: patient.bloodGroup,
            gender: patient.gender,
            isBloodDonorAvailable: patient.isBloodDonorAvailable,
            isActive: true,
            permissions: [...user_model_1.ROLE_PERMISSIONS.patient],
            location: {
                city: patient.city,
                state: patient.state,
            },
        }));
        await user_model_1.default.insertMany(docs, { ordered: false });
        console.log(`Seeded ${missing.length} sample patient/donor accounts.`);
    }
    catch (error) {
        console.error('Failed to seed default users:', error);
    }
};
exports.seedDefaultUsers = seedDefaultUsers;

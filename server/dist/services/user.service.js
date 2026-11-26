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
exports.deleteUserService = exports.updateUserPermissionsService = exports.verifyDoctorService = exports.updateUserProfileService = exports.getUserByIdWithAccessCheckService = exports.findBloodDonorsService = exports.listUsersService = exports.createUserByAdminService = exports.loginUserService = exports.registerUserService = exports.signUserToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importStar(require("../models/user.model"));
const ServiceError_1 = require("../utils/ServiceError");
const signUserToken = (user) => {
    const secret = process.env.JWT_SECRET || 'dev_medisure_jwt_secret_change_in_prod';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jsonwebtoken_1.default.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn });
};
exports.signUserToken = signUserToken;
const registerUserService = async (input) => {
    const role = input.role || 'patient';
    if (role === 'admin') {
        throw new ServiceError_1.ServiceError(403, 'Admin accounts cannot be self-registered. Contact a system administrator.');
    }
    if (!user_model_1.USER_ROLES.includes(role)) {
        throw new ServiceError_1.ServiceError(400, `Invalid role. Allowed roles: ${user_model_1.USER_ROLES.join(', ')}`);
    }
    if (role === 'doctor' &&
        (!input.doctorProfile?.specialization || !input.doctorProfile?.licenseNumber)) {
        throw new ServiceError_1.ServiceError(400, 'Doctor registration requires doctorProfile.specialization and doctorProfile.licenseNumber');
    }
    const sanitizedDoctorProfile = role === 'doctor' && input.doctorProfile
        ? { ...input.doctorProfile, isVerified: false }
        : undefined;
    const user = await user_model_1.default.create({
        name: input.name,
        email: input.email,
        password: input.password,
        role,
        phone: input.phone,
        bloodGroup: input.bloodGroup,
        isBloodDonorAvailable: Boolean(input.isBloodDonorAvailable),
        location: input.location,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        patientProfile: role === 'patient' ? input.patientProfile : undefined,
        doctorProfile: sanitizedDoctorProfile,
        permissions: [...user_model_1.ROLE_PERMISSIONS[role]],
    });
    const token = (0, exports.signUserToken)(user);
    return { user, token };
};
exports.registerUserService = registerUserService;
const loginUserService = async (email, password) => {
    if (!email || !password) {
        throw new ServiceError_1.ServiceError(400, 'Email and password are required');
    }
    const user = await user_model_1.default.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
        throw new ServiceError_1.ServiceError(401, 'Invalid email or password');
    }
    if (!user.isActive) {
        throw new ServiceError_1.ServiceError(403, 'Account is deactivated. Contact an administrator.');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ServiceError_1.ServiceError(401, 'Invalid email or password');
    }
    const token = (0, exports.signUserToken)(user);
    return {
        user,
        token,
        effectivePermissions: user.getEffectivePermissions(),
    };
};
exports.loginUserService = loginUserService;
const createUserByAdminService = async (input) => {
    const role = input.role || 'patient';
    if (!user_model_1.USER_ROLES.includes(role)) {
        throw new ServiceError_1.ServiceError(400, `Invalid role. Allowed roles: ${user_model_1.USER_ROLES.join(', ')}`);
    }
    const userPermissions = Array.isArray(input.permissions) && input.permissions.length > 0
        ? input.permissions
        : [...user_model_1.ROLE_PERMISSIONS[role]];
    return user_model_1.default.create({
        name: input.name,
        email: input.email,
        password: input.password,
        role,
        phone: input.phone,
        bloodGroup: input.bloodGroup,
        isBloodDonorAvailable: Boolean(input.isBloodDonorAvailable),
        location: input.location,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
        permissions: userPermissions,
        patientProfile: input.patientProfile,
        doctorProfile: input.doctorProfile,
    });
};
exports.createUserByAdminService = createUserByAdminService;
const listUsersService = async (query) => {
    const filter = {};
    if (query.role && user_model_1.USER_ROLES.includes(query.role)) {
        filter.role = query.role;
    }
    if (query.bloodGroup && user_model_1.BLOOD_GROUPS.includes(query.bloodGroup)) {
        filter.bloodGroup = query.bloodGroup;
    }
    if (query.isBloodDonorAvailable !== undefined) {
        filter.isBloodDonorAvailable = query.isBloodDonorAvailable === 'true';
    }
    if (query.isActive !== undefined) {
        filter.isActive = query.isActive === 'true';
    }
    if (query.search) {
        const regex = new RegExp(query.search.trim(), 'i');
        filter.$or = [{ name: regex }, { email: regex }];
    }
    const pageNum = Math.max(1, query.page || 1);
    const limitNum = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (pageNum - 1) * limitNum;
    const [users, total] = await Promise.all([
        user_model_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        user_model_1.default.countDocuments(filter),
    ]);
    return {
        users,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};
exports.listUsersService = listUsersService;
const findBloodDonorsService = async (params) => {
    if (!params.bloodGroup || !user_model_1.BLOOD_GROUPS.includes(params.bloodGroup)) {
        throw new ServiceError_1.ServiceError(400, `Valid bloodGroup query parameter is required (${user_model_1.BLOOD_GROUPS.join(', ')})`);
    }
    const filter = {
        bloodGroup: params.bloodGroup,
        isBloodDonorAvailable: true,
        isActive: true,
    };
    if (params.excludeUserId) {
        filter._id = { $ne: params.excludeUserId };
    }
    if (params.city) {
        filter['location.city'] = new RegExp(params.city.trim(), 'i');
    }
    if (params.state) {
        filter['location.state'] = new RegExp(params.state.trim(), 'i');
    }
    const donors = await user_model_1.default.find(filter)
        .select('name phone email bloodGroup location isBloodDonorAvailable')
        .sort({ updatedAt: -1 });
    return {
        bloodGroup: params.bloodGroup,
        count: donors.length,
        donors,
    };
};
exports.findBloodDonorsService = findBloodDonorsService;
const getUserByIdWithAccessCheckService = async (targetId, requester) => {
    const targetUser = await user_model_1.default.findById(targetId);
    if (!targetUser) {
        throw new ServiceError_1.ServiceError(404, 'User not found');
    }
    const isSelf = requester?._id.toString() === targetUser._id.toString();
    const canReadAll = requester?.hasPermission('user:read_all');
    const isDoctorReadingPatient = requester?.hasPermission('user:read_patients') && targetUser.role === 'patient';
    if (!isSelf && !canReadAll && !isDoctorReadingPatient) {
        throw new ServiceError_1.ServiceError(403, 'Access denied to view this user profile');
    }
    return targetUser;
};
exports.getUserByIdWithAccessCheckService = getUserByIdWithAccessCheckService;
const updateUserProfileService = async (targetId, body, canUpdateAll) => {
    const targetUser = await user_model_1.default.findById(targetId);
    if (!targetUser) {
        throw new ServiceError_1.ServiceError(404, 'User not found');
    }
    const allowedSelfFields = [
        'name',
        'phone',
        'bloodGroup',
        'isBloodDonorAvailable',
        'location',
        'dateOfBirth',
        'gender',
        'password',
        'patientProfile',
        'doctorProfile',
    ];
    for (const field of allowedSelfFields) {
        if (body[field] !== undefined) {
            if (field === 'doctorProfile' && !canUpdateAll && targetUser.doctorProfile) {
                const currentVerified = targetUser.doctorProfile.isVerified;
                targetUser.set('doctorProfile', {
                    ...body.doctorProfile,
                    isVerified: currentVerified,
                });
            }
            else {
                targetUser.set(field, body[field]);
            }
        }
    }
    if (canUpdateAll) {
        if (body.role !== undefined)
            targetUser.role = body.role;
        if (body.permissions !== undefined)
            targetUser.permissions = body.permissions;
        if (body.isActive !== undefined)
            targetUser.isActive = Boolean(body.isActive);
    }
    await targetUser.save();
    return targetUser;
};
exports.updateUserProfileService = updateUserProfileService;
const verifyDoctorService = async (targetId, isVerified = true) => {
    const targetUser = await user_model_1.default.findById(targetId);
    if (!targetUser) {
        throw new ServiceError_1.ServiceError(404, 'User not found');
    }
    if (targetUser.role !== 'doctor' || !targetUser.doctorProfile) {
        throw new ServiceError_1.ServiceError(400, 'Target user is not a doctor with a doctor profile');
    }
    targetUser.doctorProfile.isVerified = isVerified;
    await targetUser.save();
    return targetUser;
};
exports.verifyDoctorService = verifyDoctorService;
const updateUserPermissionsService = async (targetId, role, permissions) => {
    const targetUser = await user_model_1.default.findById(targetId);
    if (!targetUser) {
        throw new ServiceError_1.ServiceError(404, 'User not found');
    }
    if (role !== undefined) {
        if (!user_model_1.USER_ROLES.includes(role)) {
            throw new ServiceError_1.ServiceError(400, `Invalid role. Allowed: ${user_model_1.USER_ROLES.join(', ')}`);
        }
        targetUser.role = role;
        if (permissions === undefined) {
            targetUser.permissions = [...user_model_1.ROLE_PERMISSIONS[role]];
        }
    }
    if (permissions !== undefined) {
        if (!Array.isArray(permissions)) {
            throw new ServiceError_1.ServiceError(400, 'permissions must be an array');
        }
        const invalid = permissions.filter((p) => !user_model_1.PERMISSIONS.includes(p));
        if (invalid.length > 0) {
            throw new ServiceError_1.ServiceError(400, `Invalid permission(s): ${invalid.join(', ')}`);
        }
        targetUser.permissions = permissions;
    }
    await targetUser.save();
    return {
        user: targetUser,
        effectivePermissions: targetUser.getEffectivePermissions(),
    };
};
exports.updateUserPermissionsService = updateUserPermissionsService;
const deleteUserService = async (targetId, softDelete = false) => {
    const targetUser = await user_model_1.default.findById(targetId);
    if (!targetUser) {
        throw new ServiceError_1.ServiceError(404, 'User not found');
    }
    if (softDelete) {
        targetUser.isActive = false;
        await targetUser.save();
        return { softDeleted: true };
    }
    await targetUser.deleteOne();
    return { softDeleted: false };
};
exports.deleteUserService = deleteUserService;

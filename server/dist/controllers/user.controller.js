"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserPermissions = exports.verifyDoctor = exports.updateUser = exports.getUserById = exports.getBloodDonorsByGroup = exports.getDoctors = exports.getAllUsers = exports.createUser = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const user_service_1 = require("../services/user.service");
const doctor_service_1 = require("../services/doctor.service");
const errorHandler_1 = require("../utils/errorHandler");
const registerUser = async (req, res) => {
    try {
        const { user, token } = await (0, user_service_1.registerUserService)(req.body);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to register user');
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token, effectivePermissions } = await (0, user_service_1.loginUserService)(email, password);
        res.status(200).json({
            message: 'Login successful',
            token,
            user,
            effectivePermissions,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to log in');
    }
};
exports.loginUser = loginUser;
const getCurrentUser = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    res.status(200).json({
        user: req.user,
        effectivePermissions: req.user.getEffectivePermissions(),
    });
};
exports.getCurrentUser = getCurrentUser;
const createUser = async (req, res) => {
    try {
        const user = await (0, user_service_1.createUserByAdminService)(req.body);
        res.status(201).json({
            message: 'User created successfully',
            user,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to create user');
    }
};
exports.createUser = createUser;
const getAllUsers = async (req, res) => {
    try {
        const { role, bloodGroup, isBloodDonorAvailable, isActive, search, page, limit } = req.query;
        const result = await (0, user_service_1.listUsersService)({
            role: typeof role === 'string' ? role : undefined,
            bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : undefined,
            isBloodDonorAvailable: typeof isBloodDonorAvailable === 'string' ? isBloodDonorAvailable : undefined,
            isActive: typeof isActive === 'string' ? isActive : undefined,
            search: typeof search === 'string' ? search : undefined,
            page: typeof page === 'string' ? parseInt(page, 10) : undefined,
            limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
        });
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch users');
    }
};
exports.getAllUsers = getAllUsers;
const getDoctors = async (req, res) => {
    try {
        const { specialization, city, department, day, includeUnverified } = req.query;
        const canViewUnverified = req.user?.role === 'admin' && includeUnverified === 'true';
        const doctors = await (0, doctor_service_1.listDoctorsService)({
            department: typeof department === 'string' ? department : undefined,
            day: typeof day === 'string' ? day : undefined,
            specialization: typeof specialization === 'string' ? specialization : undefined,
            city: typeof city === 'string' ? city : undefined,
            includeUnverified: canViewUnverified,
        });
        res.status(200).json({ count: doctors.length, doctors });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch doctors');
    }
};
exports.getDoctors = getDoctors;
const getBloodDonorsByGroup = async (req, res) => {
    try {
        const { bloodGroup, city, state } = req.query;
        const result = await (0, user_service_1.findBloodDonorsService)({
            bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : '',
            city: typeof city === 'string' ? city : undefined,
            state: typeof state === 'string' ? state : undefined,
            excludeUserId: req.user?._id.toString(),
        });
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch blood donors');
    }
};
exports.getBloodDonorsByGroup = getBloodDonorsByGroup;
const getUserById = async (req, res) => {
    try {
        const user = await (0, user_service_1.getUserByIdWithAccessCheckService)(String(req.params.id), req.user);
        res.status(200).json({ user });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to fetch user');
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const canUpdateAll = Boolean(req.user?.hasPermission('user:update_all'));
        const user = await (0, user_service_1.updateUserProfileService)(String(req.params.id), req.body, canUpdateAll);
        res.status(200).json({
            message: 'User updated successfully',
            user,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to update user');
    }
};
exports.updateUser = updateUser;
const verifyDoctor = async (req, res) => {
    try {
        const isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : true;
        const user = await (0, user_service_1.verifyDoctorService)(String(req.params.id), isVerified);
        res.status(200).json({
            message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully`,
            user,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to verify doctor');
    }
};
exports.verifyDoctor = verifyDoctor;
const updateUserPermissions = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        const result = await (0, user_service_1.updateUserPermissionsService)(String(req.params.id), role, permissions);
        res.status(200).json({
            message: 'User role and permissions updated successfully',
            ...result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to update user permissions');
    }
};
exports.updateUserPermissions = updateUserPermissions;
const deleteUser = async (req, res) => {
    try {
        const isSoftDelete = req.query.soft === 'true';
        const { softDeleted } = await (0, user_service_1.deleteUserService)(String(req.params.id), isSoftDelete);
        res.status(200).json({
            message: softDeleted
                ? 'User account deactivated successfully'
                : 'User deleted permanently',
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to delete user');
    }
};
exports.deleteUser = deleteUser;

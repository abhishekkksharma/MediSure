"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public authentication routes
router.post('/register', user_controller_1.registerUser);
router.post('/login', user_controller_1.loginUser);
// Authenticated self & discovery routes
router.get('/me', auth_middleware_1.authenticate, user_controller_1.getCurrentUser);
router.get('/doctors', auth_middleware_1.authenticate, user_controller_1.getDoctors);
router.get('/blood-donors', auth_middleware_1.authenticate, user_controller_1.getBloodDonorsByGroup);
// Admin & permission-protected CRUD routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requirePermission)('user:create'), user_controller_1.createUser);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requirePermission)('user:read_all'), user_controller_1.getAllUsers);
// User-specific routes (self or admin/authorized role)
router.get('/:id', auth_middleware_1.authenticate, user_controller_1.getUserById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireSelfOrPermission)('user:update_all'), user_controller_1.updateUser);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireSelfOrPermission)('user:delete_all'), user_controller_1.deleteUser);
// Admin-only governance routes
router.patch('/:id/verify', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)('admin'), (0, auth_middleware_1.requirePermission)('doctor:verify'), user_controller_1.verifyDoctor);
router.patch('/:id/permissions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)('admin'), (0, auth_middleware_1.requirePermission)('user:update_all'), user_controller_1.updateUserPermissions);
exports.default = router;

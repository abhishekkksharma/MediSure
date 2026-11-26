import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getBloodDonorsByGroup,
  getCurrentUser,
  getDoctors,
  getUserById,
  loginUser,
  registerUser,
  updateUser,
  updateUserPermissions,
  verifyDoctor,
} from '../controllers/user.controller';
import {
  authenticate,
  authorizeRoles,
  requirePermission,
  requireSelfOrPermission,
} from '../middlewares/auth.middleware';

const router = Router();

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Authenticated self & discovery routes
router.get('/me', authenticate, getCurrentUser);
router.get('/doctors', authenticate, getDoctors);
router.get('/blood-donors', authenticate, getBloodDonorsByGroup);

// Admin & permission-protected CRUD routes
router.post('/', authenticate, requirePermission('user:create'), createUser);
router.get('/', authenticate, requirePermission('user:read_all'), getAllUsers);

// User-specific routes (self or admin/authorized role)
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, requireSelfOrPermission('user:update_all'), updateUser);
router.delete('/:id', authenticate, requireSelfOrPermission('user:delete_all'), deleteUser);

// Admin-only governance routes
router.patch(
  '/:id/verify',
  authenticate,
  authorizeRoles('admin'),
  requirePermission('doctor:verify'),
  verifyDoctor
);
router.patch(
  '/:id/permissions',
  authenticate,
  authorizeRoles('admin'),
  requirePermission('user:update_all'),
  updateUserPermissions
);

export default router;


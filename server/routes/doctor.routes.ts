import { Router } from 'express';
import {
  getDepartmentsWithDoctors,
  listDoctors,
  updateDoctorSchedule,
} from '../controllers/doctor.controller';
import { authenticate, requireSelfOrPermission } from '../middlewares/auth.middleware';

const router = Router();

// Public / authenticated discovery routes for AI diagnosis & appointment booking
router.get('/departments', getDepartmentsWithDoctors);
router.get('/', listDoctors);

// Schedule management (doctor self or admin)
router.put(
  '/:id/schedule',
  authenticate,
  requireSelfOrPermission('user:update_all'),
  updateDoctorSchedule
);

export default router;


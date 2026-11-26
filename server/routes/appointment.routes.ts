import { Router } from 'express';
import {
  createAiDiagnosisAppointment,
  createManualAppointment,
  getAppointmentById,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/appointment.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Manual & AI-assisted appointment booking
router.post('/', requirePermission('appointment:create'), createManualAppointment);
router.post('/ai-diagnosis', requirePermission('appointment:create'), createAiDiagnosisAppointment);

// Read & manage appointments
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/status', updateAppointmentStatus);

export default router;


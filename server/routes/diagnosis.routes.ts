import { Router } from 'express';
import {
  completeDiagnosisAndBook,
  getDiagnosisQuestions,
} from '../controllers/diagnosis.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

// Step 1: Ask AI for follow-up triage questions based on symptoms
router.post('/questions', getDiagnosisQuestions);

// Step 2: Finalize AI diagnosis and automatically book a matching doctor appointment
router.post(
  '/complete',
  authenticate,
  requirePermission('diagnosis:create'),
  completeDiagnosisAndBook
);

export default router;


import { Router } from 'express';
import {
  createBloodRequest,
  getBloodRequests,
  getDonorLocations,
  searchDonors,
} from '../controllers/bloodRequest.controller';
import {
  authenticate,
  optionalAuthenticate,
  requirePermission,
} from '../middlewares/auth.middleware';

const router = Router();

// Dynamic donor locations & donor search
router.get('/locations', getDonorLocations);
router.get('/donors', optionalAuthenticate, searchDonors);

// Create a blood request and email all matching donors in the area
router.post(
  '/',
  authenticate,
  requirePermission('blood_request:create'),
  createBloodRequest
);

// List blood requests
router.get('/', authenticate, getBloodRequests);

export default router;


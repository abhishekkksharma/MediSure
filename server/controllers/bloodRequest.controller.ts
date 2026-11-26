import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createAndNotifyBloodRequestService,
  getDonorLocationsService,
  listBloodRequestsService,
  searchAreaDonorsService,
} from '../services/bloodRequest.service';
import { handleControllerError } from '../utils/errorHandler';

/**
 * GET /api/blood-requests/locations
 * Returns distinct states and cities from active blood donors in MongoDB.
 */
export const getDonorLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodGroup } = req.query;
    const result = await getDonorLocationsService(
      typeof bloodGroup === 'string' ? bloodGroup : undefined
    );
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch donor locations');
  }
};

/**
 * GET /api/blood-requests/donors
 * Finds active, available donors matching bloodGroup, city, and state.
 */
export const searchDonors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodGroup, city, state } = req.query;
    const authUser = (req as AuthRequest).user;

    const result = await searchAreaDonorsService({
      bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : '',
      city: typeof city === 'string' ? city : undefined,
      state: typeof state === 'string' ? state : undefined,
      excludeUserId: authUser?._id.toString(),
    });

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to search blood donors');
  }
};

/**
 * POST /api/blood-requests
 * Creates a blood donor request and emails all matching donors in that area.
 */
export const createBloodRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const result = await createAndNotifyBloodRequestService({
      requesterId: req.user._id.toString(),
      bloodGroup: req.body.bloodGroup,
      unitsRequired: req.body.unitsRequired,
      urgency: req.body.urgency,
      city: req.body.city,
      state: req.body.state,
      hospitalName: req.body.hospitalName,
      contactPhone: req.body.contactPhone,
      requirements: req.body.requirements,
    });

    res.status(201).json({
      message: result.emailDelivery.message,
      ...result,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to create blood donor request');
  }
};

/**
 * GET /api/blood-requests
 */
export const getBloodRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const onlyMine = req.query.mine === 'true' && req.user;
    const requests = await listBloodRequestsService(
      onlyMine ? req.user!._id.toString() : undefined
    );
    res.status(200).json({ count: requests.length, requests });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch blood requests');
  }
};


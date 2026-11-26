import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createUserByAdminService,
  deleteUserService,
  findBloodDonorsService,
  getUserByIdWithAccessCheckService,
  listUsersService,
  loginUserService,
  registerUserService,
  updateUserPermissionsService,
  updateUserProfileService,
  verifyDoctorService,
} from '../services/user.service';
import { listDoctorsService } from '../services/doctor.service';
import { handleControllerError } from '../utils/errorHandler';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, token } = await registerUserService(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to register user');
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, token, effectivePermissions } = await loginUserService(email, password);
    res.status(200).json({
      message: 'Login successful',
      token,
      user,
      effectivePermissions,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to log in');
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  res.status(200).json({
    user: req.user,
    effectivePermissions: req.user.getEffectivePermissions(),
  });
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await createUserByAdminService(req.body);
    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to create user');
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, bloodGroup, isBloodDonorAvailable, isActive, search, page, limit } = req.query;
    const result = await listUsersService({
      role: typeof role === 'string' ? role : undefined,
      bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : undefined,
      isBloodDonorAvailable:
        typeof isBloodDonorAvailable === 'string' ? isBloodDonorAvailable : undefined,
      isActive: typeof isActive === 'string' ? isActive : undefined,
      search: typeof search === 'string' ? search : undefined,
      page: typeof page === 'string' ? parseInt(page, 10) : undefined,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch users');
  }
};

export const getDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialization, city, department, day, includeUnverified } = req.query;
    const canViewUnverified = req.user?.role === 'admin' && includeUnverified === 'true';

    const doctors = await listDoctorsService({
      department: typeof department === 'string' ? department : undefined,
      day: typeof day === 'string' ? day : undefined,
      specialization: typeof specialization === 'string' ? specialization : undefined,
      city: typeof city === 'string' ? city : undefined,
      includeUnverified: canViewUnverified,
    });

    res.status(200).json({ count: doctors.length, doctors });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch doctors');
  }
};

export const getBloodDonorsByGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodGroup, city, state } = req.query;
    const result = await findBloodDonorsService({
      bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : '',
      city: typeof city === 'string' ? city : undefined,
      state: typeof state === 'string' ? state : undefined,
      excludeUserId: req.user?._id.toString(),
    });

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch blood donors');
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getUserByIdWithAccessCheckService(
      String(req.params.id),
      req.user
    );
    res.status(200).json({ user });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch user');
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const canUpdateAll = Boolean(req.user?.hasPermission('user:update_all'));
    const user = await updateUserProfileService(
      String(req.params.id),
      req.body,
      canUpdateAll
    );

    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to update user');
  }
};

export const verifyDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : true;
    const user = await verifyDoctorService(String(req.params.id), isVerified);

    res.status(200).json({
      message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully`,
      user,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to verify doctor');
  }
};

export const updateUserPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, permissions } = req.body;
    const result = await updateUserPermissionsService(
      String(req.params.id),
      role,
      permissions
    );

    res.status(200).json({
      message: 'User role and permissions updated successfully',
      ...result,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to update user permissions');
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isSoftDelete = req.query.soft === 'true';
    const { softDeleted } = await deleteUserService(String(req.params.id), isSoftDelete);

    res.status(200).json({
      message: softDeleted
        ? 'User account deactivated successfully'
        : 'User deleted permanently',
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete user');
  }
};

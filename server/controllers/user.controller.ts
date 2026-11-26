import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, {
  BLOOD_GROUPS,
  BloodGroup,
  IUser,
  PERMISSIONS,
  Permission,
  ROLE_PERMISSIONS,
  USER_ROLES,
  UserRole,
} from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

const signToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'dev_medisure_jwt_secret_change_in_prod';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn });
};

const handleControllerError = (res: Response, error: unknown, fallbackMessage: string): void => {
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((e) => e.message);
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  ) {
    res.status(409).json({ message: 'A user with this email already exists' });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ message: fallbackMessage });
};

/**
 * POST /api/users/register
 * Public registration for patients and doctors (admin accounts cannot be self-registered).
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      bloodGroup,
      isBloodDonorAvailable,
      location,
      dateOfBirth,
      gender,
      patientProfile,
      doctorProfile,
    } = req.body;

    if (role === 'admin') {
      res.status(403).json({
        message: 'Admin accounts cannot be self-registered. Contact a system administrator.',
      });
      return;
    }

    if (!USER_ROLES.includes(role)) {
      res.status(400).json({ message: `Invalid role. Allowed roles: ${USER_ROLES.join(', ')}` });
      return;
    }

    if (role === 'doctor' && (!doctorProfile?.specialization || !doctorProfile?.licenseNumber)) {
      res.status(400).json({
        message: 'Doctor registration requires doctorProfile.specialization and doctorProfile.licenseNumber',
      });
      return;
    }

    const sanitizedDoctorProfile =
      role === 'doctor' && doctorProfile
        ? { ...doctorProfile, isVerified: false }
        : undefined;

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      bloodGroup,
      isBloodDonorAvailable: Boolean(isBloodDonorAvailable),
      location,
      dateOfBirth,
      gender,
      patientProfile: role === 'patient' ? patientProfile : undefined,
      doctorProfile: sanitizedDoctorProfile,
      permissions: [...ROLE_PERMISSIONS[role as UserRole]],
    });

    const token = signToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to register user');
  }
};

/**
 * POST /api/users/login
 * Authenticates user credentials and returns a JWT token.
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Account is deactivated. Contact an administrator.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = signToken(user);
    res.status(200).json({
      message: 'Login successful',
      token,
      user,
      effectivePermissions: user.getEffectivePermissions(),
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to log in');
  }
};

/**
 * GET /api/users/me
 * Returns the currently authenticated user's profile and effective permissions.
 */
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

/**
 * POST /api/users
 * Admin-only endpoint to create any user (patient, doctor, or admin) with optional custom permissions.
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      bloodGroup,
      isBloodDonorAvailable,
      location,
      dateOfBirth,
      gender,
      isActive,
      permissions,
      patientProfile,
      doctorProfile,
    } = req.body;

    if (!USER_ROLES.includes(role)) {
      res.status(400).json({ message: `Invalid role. Allowed roles: ${USER_ROLES.join(', ')}` });
      return;
    }

    const userPermissions: Permission[] =
      Array.isArray(permissions) && permissions.length > 0
        ? permissions
        : [...ROLE_PERMISSIONS[role as UserRole]];

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      bloodGroup,
      isBloodDonorAvailable: Boolean(isBloodDonorAvailable),
      location,
      dateOfBirth,
      gender,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      permissions: userPermissions,
      patientProfile,
      doctorProfile,
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to create user');
  }
};

/**
 * GET /api/users
 * Admin-only (or `user:read_all`) endpoint to list users with filtering and pagination.
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      role,
      bloodGroup,
      isBloodDonorAvailable,
      isActive,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (role && USER_ROLES.includes(role as UserRole)) {
      filter.role = role;
    }
    if (bloodGroup && BLOOD_GROUPS.includes(bloodGroup as BloodGroup)) {
      filter.bloodGroup = bloodGroup;
    }
    if (isBloodDonorAvailable !== undefined) {
      filter.isBloodDonorAvailable = isBloodDonorAvailable === 'true';
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch users');
  }
};

/**
 * GET /api/users/doctors
 * Lists active, verified doctors for AI-assisted appointment booking.
 */
export const getDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialization, city, includeUnverified } = req.query;

    const filter: Record<string, unknown> = {
      role: 'doctor',
      isActive: true,
    };

    const canViewUnverified = req.user?.role === 'admin' && includeUnverified === 'true';
    if (!canViewUnverified) {
      filter['doctorProfile.isVerified'] = true;
    }

    if (specialization && typeof specialization === 'string') {
      filter['doctorProfile.specialization'] = new RegExp(specialization.trim(), 'i');
    }

    if (city && typeof city === 'string') {
      filter['location.city'] = new RegExp(city.trim(), 'i');
    }

    const doctors = await User.find(filter)
      .select('name email phone location doctorProfile gender')
      .sort({ 'doctorProfile.experienceYears': -1 });

    res.status(200).json({ count: doctors.length, doctors });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch doctors');
  }
};

/**
 * GET /api/users/blood-donors
 * Finds active users with a matching blood group who are available for emergency donation.
 */
export const getBloodDonorsByGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodGroup, city, state } = req.query;

    if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup as BloodGroup)) {
      res.status(400).json({
        message: `Valid bloodGroup query parameter is required (${BLOOD_GROUPS.join(', ')})`,
      });
      return;
    }

    const filter: Record<string, unknown> = {
      bloodGroup,
      isBloodDonorAvailable: true,
      isActive: true,
    };

    if (req.user) {
      filter._id = { $ne: req.user._id };
    }
    if (city && typeof city === 'string') {
      filter['location.city'] = new RegExp(city.trim(), 'i');
    }
    if (state && typeof state === 'string') {
      filter['location.state'] = new RegExp(state.trim(), 'i');
    }

    const donors = await User.find(filter)
      .select('name phone email bloodGroup location isBloodDonorAvailable')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      bloodGroup,
      count: donors.length,
      donors,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch blood donors');
  }
};

/**
 * GET /api/users/:id
 * Fetches a user by ID. Accessible to self, admins (`user:read_all`), or doctors reading a patient (`user:read_patients`).
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isSelf = req.user?._id.toString() === targetUser._id.toString();
    const canReadAll = req.user?.hasPermission('user:read_all');
    const isDoctorReadingPatient =
      req.user?.hasPermission('user:read_patients') && targetUser.role === 'patient';

    if (!isSelf && !canReadAll && !isDoctorReadingPatient) {
      res.status(403).json({ message: 'Access denied to view this user profile' });
      return;
    }

    res.status(200).json({ user: targetUser });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch user');
  }
};

/**
 * PUT /api/users/:id
 * Updates a user profile. Privileged fields (`role`, `permissions`, `isActive`, `doctorProfile.isVerified`)
 * can only be modified by users with `user:update_all` (admins).
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const canUpdateAll = Boolean(req.user?.hasPermission('user:update_all'));
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
      if (req.body[field] !== undefined) {
        if (field === 'doctorProfile' && !canUpdateAll && targetUser.doctorProfile) {
          // Preserve admin-controlled verification flag when a doctor updates their own profile
          const currentVerified = targetUser.doctorProfile.isVerified;
          targetUser.set('doctorProfile', {
            ...req.body.doctorProfile,
            isVerified: currentVerified,
          });
        } else {
          targetUser.set(field, req.body[field]);
        }
      }
    }

    if (canUpdateAll) {
      if (req.body.role !== undefined) {
        targetUser.role = req.body.role;
      }
      if (req.body.permissions !== undefined) {
        targetUser.permissions = req.body.permissions;
      }
      if (req.body.isActive !== undefined) {
        targetUser.isActive = Boolean(req.body.isActive);
      }
    }

    await targetUser.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: targetUser,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to update user');
  }
};

/**
 * PATCH /api/users/:id/verify
 * Admin-only endpoint to verify or unverify a doctor's profile.
 */
export const verifyDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (targetUser.role !== 'doctor' || !targetUser.doctorProfile) {
      res.status(400).json({ message: 'Target user is not a doctor with a doctor profile' });
      return;
    }

    const isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : true;
    targetUser.doctorProfile.isVerified = isVerified;
    await targetUser.save();

    res.status(200).json({
      message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully`,
      user: targetUser,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to verify doctor');
  }
};

/**
 * PATCH /api/users/:id/permissions
 * Admin-only endpoint to update a user's role and/or explicit permissions.
 */
export const updateUserPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { role, permissions } = req.body;

    if (role !== undefined) {
      if (!USER_ROLES.includes(role)) {
        res.status(400).json({ message: `Invalid role. Allowed: ${USER_ROLES.join(', ')}` });
        return;
      }
      targetUser.role = role;
      if (permissions === undefined) {
        targetUser.permissions = [...ROLE_PERMISSIONS[role as UserRole]];
      }
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        res.status(400).json({ message: 'permissions must be an array' });
        return;
      }
      const invalid = permissions.filter((p) => !PERMISSIONS.includes(p));
      if (invalid.length > 0) {
        res.status(400).json({ message: `Invalid permission(s): ${invalid.join(', ')}` });
        return;
      }
      targetUser.permissions = permissions;
    }

    await targetUser.save();

    res.status(200).json({
      message: 'User role and permissions updated successfully',
      user: targetUser,
      effectivePermissions: targetUser.getEffectivePermissions(),
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to update user permissions');
  }
};

/**
 * DELETE /api/users/:id
 * Deletes (or soft-deactivates with `?soft=true`) a user account.
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isSoftDelete = req.query.soft === 'true';

    if (isSoftDelete) {
      targetUser.isActive = false;
      await targetUser.save();
      res.status(200).json({ message: 'User account deactivated successfully' });
      return;
    }

    await targetUser.deleteOne();
    res.status(200).json({ message: 'User deleted permanently' });
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete user');
  }
};


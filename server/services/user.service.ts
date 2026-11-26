import jwt, { SignOptions } from 'jsonwebtoken';
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
import { ServiceError } from '../utils/ServiceError';

export const signUserToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'dev_medisure_jwt_secret_change_in_prod';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn });
};

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  bloodGroup?: BloodGroup;
  isBloodDonorAvailable?: boolean;
  location?: { address?: string; city?: string; state?: string };
  dateOfBirth?: Date | string;
  gender?: 'male' | 'female' | 'other';
  patientProfile?: IUser['patientProfile'];
  doctorProfile?: IUser['doctorProfile'];
}

export const registerUserService = async (
  input: RegisterUserInput
): Promise<{ user: IUser; token: string }> => {
  const role = input.role || 'patient';

  if (role === 'admin') {
    throw new ServiceError(
      403,
      'Admin accounts cannot be self-registered. Contact a system administrator.'
    );
  }

  if (!USER_ROLES.includes(role)) {
    throw new ServiceError(400, `Invalid role. Allowed roles: ${USER_ROLES.join(', ')}`);
  }

  if (
    role === 'doctor' &&
    (!input.doctorProfile?.specialization || !input.doctorProfile?.licenseNumber)
  ) {
    throw new ServiceError(
      400,
      'Doctor registration requires doctorProfile.specialization and doctorProfile.licenseNumber'
    );
  }

  const sanitizedDoctorProfile =
    role === 'doctor' && input.doctorProfile
      ? { ...input.doctorProfile, isVerified: false }
      : undefined;

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role,
    phone: input.phone,
    bloodGroup: input.bloodGroup,
    isBloodDonorAvailable: Boolean(input.isBloodDonorAvailable),
    location: input.location,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    patientProfile: role === 'patient' ? input.patientProfile : undefined,
    doctorProfile: sanitizedDoctorProfile,
    permissions: [...ROLE_PERMISSIONS[role]],
  });

  const token = signUserToken(user);
  return { user, token };
};

export const loginUserService = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string; effectivePermissions: Permission[] }> => {
  if (!email || !password) {
    throw new ServiceError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new ServiceError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ServiceError(403, 'Account is deactivated. Contact an administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ServiceError(401, 'Invalid email or password');
  }

  const token = signUserToken(user);
  return {
    user,
    token,
    effectivePermissions: user.getEffectivePermissions(),
  };
};

export interface CreateUserByAdminInput extends RegisterUserInput {
  isActive?: boolean;
  permissions?: Permission[];
}

export const createUserByAdminService = async (
  input: CreateUserByAdminInput
): Promise<IUser> => {
  const role = input.role || 'patient';

  if (!USER_ROLES.includes(role)) {
    throw new ServiceError(400, `Invalid role. Allowed roles: ${USER_ROLES.join(', ')}`);
  }

  const userPermissions: Permission[] =
    Array.isArray(input.permissions) && input.permissions.length > 0
      ? input.permissions
      : [...ROLE_PERMISSIONS[role]];

  return User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role,
    phone: input.phone,
    bloodGroup: input.bloodGroup,
    isBloodDonorAvailable: Boolean(input.isBloodDonorAvailable),
    location: input.location,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
    permissions: userPermissions,
    patientProfile: input.patientProfile,
    doctorProfile: input.doctorProfile,
  });
};

export interface ListUsersFilter {
  role?: string;
  bloodGroup?: string;
  isBloodDonorAvailable?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listUsersService = async (query: ListUsersFilter) => {
  const filter: Record<string, unknown> = {};

  if (query.role && USER_ROLES.includes(query.role as UserRole)) {
    filter.role = query.role;
  }
  if (query.bloodGroup && BLOOD_GROUPS.includes(query.bloodGroup as BloodGroup)) {
    filter.bloodGroup = query.bloodGroup;
  }
  if (query.isBloodDonorAvailable !== undefined) {
    filter.isBloodDonorAvailable = query.isBloodDonorAvailable === 'true';
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const pageNum = Math.max(1, query.page || 1);
  const limitNum = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const findBloodDonorsService = async (params: {
  bloodGroup: string;
  city?: string;
  state?: string;
  excludeUserId?: string;
}) => {
  if (!params.bloodGroup || !BLOOD_GROUPS.includes(params.bloodGroup as BloodGroup)) {
    throw new ServiceError(
      400,
      `Valid bloodGroup query parameter is required (${BLOOD_GROUPS.join(', ')})`
    );
  }

  const filter: Record<string, unknown> = {
    bloodGroup: params.bloodGroup,
    isBloodDonorAvailable: true,
    isActive: true,
  };

  if (params.excludeUserId) {
    filter._id = { $ne: params.excludeUserId };
  }
  if (params.city) {
    filter['location.city'] = new RegExp(params.city.trim(), 'i');
  }
  if (params.state) {
    filter['location.state'] = new RegExp(params.state.trim(), 'i');
  }

  const donors = await User.find(filter)
    .select('name phone email bloodGroup location isBloodDonorAvailable')
    .sort({ updatedAt: -1 });

  return {
    bloodGroup: params.bloodGroup,
    count: donors.length,
    donors,
  };
};

export const getUserByIdWithAccessCheckService = async (
  targetId: string,
  requester?: IUser
): Promise<IUser> => {
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new ServiceError(404, 'User not found');
  }

  const isSelf = requester?._id.toString() === targetUser._id.toString();
  const canReadAll = requester?.hasPermission('user:read_all');
  const isDoctorReadingPatient =
    requester?.hasPermission('user:read_patients') && targetUser.role === 'patient';

  if (!isSelf && !canReadAll && !isDoctorReadingPatient) {
    throw new ServiceError(403, 'Access denied to view this user profile');
  }

  return targetUser;
};

export const updateUserProfileService = async (
  targetId: string,
  body: Record<string, unknown>,
  canUpdateAll: boolean
): Promise<IUser> => {
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new ServiceError(404, 'User not found');
  }

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
    if (body[field] !== undefined) {
      if (field === 'doctorProfile' && !canUpdateAll && targetUser.doctorProfile) {
        const currentVerified = targetUser.doctorProfile.isVerified;
        targetUser.set('doctorProfile', {
          ...(body.doctorProfile as Record<string, unknown>),
          isVerified: currentVerified,
        });
      } else {
        targetUser.set(field, body[field]);
      }
    }
  }

  if (canUpdateAll) {
    if (body.role !== undefined) targetUser.role = body.role as UserRole;
    if (body.permissions !== undefined) targetUser.permissions = body.permissions as Permission[];
    if (body.isActive !== undefined) targetUser.isActive = Boolean(body.isActive);
  }

  await targetUser.save();
  return targetUser;
};

export const verifyDoctorService = async (
  targetId: string,
  isVerified = true
): Promise<IUser> => {
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new ServiceError(404, 'User not found');
  }

  if (targetUser.role !== 'doctor' || !targetUser.doctorProfile) {
    throw new ServiceError(400, 'Target user is not a doctor with a doctor profile');
  }

  targetUser.doctorProfile.isVerified = isVerified;
  await targetUser.save();
  return targetUser;
};

export const updateUserPermissionsService = async (
  targetId: string,
  role?: UserRole,
  permissions?: Permission[]
): Promise<{ user: IUser; effectivePermissions: Permission[] }> => {
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new ServiceError(404, 'User not found');
  }

  if (role !== undefined) {
    if (!USER_ROLES.includes(role)) {
      throw new ServiceError(400, `Invalid role. Allowed: ${USER_ROLES.join(', ')}`);
    }
    targetUser.role = role;
    if (permissions === undefined) {
      targetUser.permissions = [...ROLE_PERMISSIONS[role]];
    }
  }

  if (permissions !== undefined) {
    if (!Array.isArray(permissions)) {
      throw new ServiceError(400, 'permissions must be an array');
    }
    const invalid = permissions.filter((p) => !PERMISSIONS.includes(p));
    if (invalid.length > 0) {
      throw new ServiceError(400, `Invalid permission(s): ${invalid.join(', ')}`);
    }
    targetUser.permissions = permissions;
  }

  await targetUser.save();
  return {
    user: targetUser,
    effectivePermissions: targetUser.getEffectivePermissions(),
  };
};

export const deleteUserService = async (
  targetId: string,
  softDelete = false
): Promise<{ softDeleted: boolean }> => {
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new ServiceError(404, 'User not found');
  }

  if (softDelete) {
    targetUser.isActive = false;
    await targetUser.save();
    return { softDeleted: true };
  }

  await targetUser.deleteOne();
  return { softDeleted: false };
};


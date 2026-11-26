import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ['patient', 'doctor', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const PERMISSIONS = [
  'user:read_own',
  'user:update_own',
  'user:delete_own',
  'user:read_all',
  'user:create',
  'user:update_all',
  'user:delete_all',
  'user:read_patients',
  'doctor:verify',
  'diagnosis:create',
  'diagnosis:read_own',
  'diagnosis:read_assigned',
  'appointment:create',
  'appointment:read_own',
  'appointment:read_assigned',
  'appointment:read_all',
  'appointment:update_status',
  'appointment:cancel_own',
  'blood_request:create',
  'blood_request:respond',
  'blood_request:manage_all',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: [
    'user:read_own',
    'user:update_own',
    'user:delete_own',
    'diagnosis:create',
    'diagnosis:read_own',
    'appointment:create',
    'appointment:read_own',
    'appointment:cancel_own',
    'blood_request:create',
    'blood_request:respond',
  ],
  doctor: [
    'user:read_own',
    'user:update_own',
    'user:read_patients',
    'diagnosis:read_assigned',
    'appointment:read_assigned',
    'appointment:update_status',
    'blood_request:create',
    'blood_request:respond',
  ],
  admin: [...PERMISSIONS],
};

export interface ILocation {
  address?: string;
  city?: string;
  state?: string;
}

export interface IPatientProfile {
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
}

export interface IAvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IDoctorProfile {
  specialization: string;
  licenseNumber: string;
  experienceYears?: number;
  qualifications?: string[];
  consultationFee?: number;
  isVerified: boolean;
  availableSlots?: IAvailabilitySlot[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  bloodGroup?: BloodGroup;
  isBloodDonorAvailable: boolean;
  location?: ILocation;
  dateOfBirth?: Date;
  gender?: Gender;
  isActive: boolean;
  permissions: Permission[];
  patientProfile?: IPatientProfile;
  doctorProfile?: IDoctorProfile;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getEffectivePermissions(): Permission[];
  hasPermission(permission: Permission): boolean;
}

const locationSchema = new Schema<ILocation>(
  {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  { _id: false }
);

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    medicalHistory: [{ type: String, trim: true }],
    allergies: [{ type: String, trim: true }],
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
  },
  { _id: false }
);

const availabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    specialization: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    experienceYears: { type: Number, min: 0, default: 0 },
    qualifications: [{ type: String, trim: true }],
    consultationFee: { type: Number, min: 0, default: 0 },
    isVerified: { type: Boolean, default: false },
    availableSlots: [availabilitySlotSchema],
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'patient',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      index: true,
    },
    isBloodDonorAvailable: {
      type: Boolean,
      default: false,
    },
    location: locationSchema,
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: GENDERS,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      enum: PERMISSIONS,
      default: undefined,
    },
    patientProfile: patientProfileSchema,
    doctorProfile: doctorProfileSchema,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ bloodGroup: 1, isBloodDonorAvailable: 1, isActive: 1 });
userSchema.index({ role: 1, 'doctorProfile.specialization': 1, 'doctorProfile.isVerified': 1 });

userSchema.pre('save', async function () {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = [...ROLE_PERMISSIONS[this.role]];
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getEffectivePermissions = function (): Permission[] {
  const roleDefaults = ROLE_PERMISSIONS[this.role as UserRole] || [];
  const custom = (this.permissions as Permission[]) || [];
  return Array.from(new Set([...roleDefaults, ...custom]));
};

userSchema.methods.hasPermission = function (permission: Permission): boolean {
  if (this.role === 'admin') return true;
  return this.getEffectivePermissions().includes(permission);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;


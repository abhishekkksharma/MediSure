import User, { IUser } from '../models/user.model';
import {
  DEPARTMENT_LABELS,
  DEPARTMENT_NAMES,
  DepartmentDoctorSchedule,
  DepartmentName,
  Departments,
  OpdTimings,
  WEEKDAYS,
  Weekday,
} from '../types/doctor.types';
import { ServiceError } from '../utils/ServiceError';

export interface ListDoctorsFilter {
  department?: string;
  day?: string;
  specialization?: string;
  city?: string;
  includeUnverified?: boolean;
}

export const getDepartmentsWithDoctorsService = async (includeUnverified = false) => {
  const filter: Record<string, unknown> = {
    role: 'doctor',
    isActive: true,
  };

  if (!includeUnverified) {
    filter['doctorProfile.isVerified'] = true;
  }

  const doctors = await User.find(filter)
    .select('name email doctorProfile location')
    .sort({ 'doctorProfile.experienceYears': -1 });

  const departments = DEPARTMENT_NAMES.reduce((acc, dept) => {
    acc[dept] = [];
    return acc;
  }, {} as Departments);

  for (const doc of doctors) {
    const profile = doc.doctorProfile;
    if (!profile) continue;

    const deptName: DepartmentName = DEPARTMENT_NAMES.includes(profile.department)
      ? profile.department
      : 'GeneralMedicine';

    const schedule: DepartmentDoctorSchedule = {
      doctorId: doc._id.toString(),
      doctor: doc.name,
      email: doc.email,
      department: deptName,
      opdTimings: profile.opdTimings || {
        start: '09:00',
        end: '17:00',
        label: '9:00 AM - 5:00 PM',
      },
      days: profile.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      qualifications: profile.qualifications,
      experienceYears: profile.experienceYears,
      consultationFee: profile.consultationFee,
      isVerified: profile.isVerified,
    };

    departments[deptName].push(schedule);
  }

  return {
    departmentNames: DEPARTMENT_NAMES,
    departmentLabels: DEPARTMENT_LABELS,
    departments,
  };
};

export const listDoctorsService = async (query: ListDoctorsFilter) => {
  const filter: Record<string, unknown> = {
    role: 'doctor',
    isActive: true,
  };

  if (!query.includeUnverified) {
    filter['doctorProfile.isVerified'] = true;
  }

  if (query.department && DEPARTMENT_NAMES.includes(query.department as DepartmentName)) {
    filter['doctorProfile.department'] = query.department;
  }

  if (query.day && WEEKDAYS.includes(query.day as Weekday)) {
    filter['doctorProfile.days'] = query.day;
  }

  if (query.specialization) {
    filter['doctorProfile.specialization'] = new RegExp(query.specialization.trim(), 'i');
  }

  if (query.city) {
    filter['location.city'] = new RegExp(query.city.trim(), 'i');
  }

  return User.find(filter)
    .select('name email phone location doctorProfile gender')
    .sort({ 'doctorProfile.experienceYears': -1 });
};

/**
 * Reusable helper for AI diagnosis: finds the best active, verified doctor
 * in the recommended department (falling back to GeneralMedicine if none are found).
 */
export const findDoctorForDepartmentService = async (
  department: DepartmentName,
  preferredDay?: Weekday
): Promise<IUser> => {
  const baseFilter: Record<string, unknown> = {
    role: 'doctor',
    isActive: true,
    'doctorProfile.isVerified': true,
    'doctorProfile.department': department,
  };

  if (preferredDay) {
    const dayMatch = await User.findOne({
      ...baseFilter,
      'doctorProfile.days': preferredDay,
    }).sort({ 'doctorProfile.experienceYears': -1 });

    if (dayMatch) return dayMatch;
  }

  const deptMatch = await User.findOne(baseFilter).sort({
    'doctorProfile.experienceYears': -1,
  });
  if (deptMatch) return deptMatch;

  if (department !== 'GeneralMedicine') {
    const fallbackMatch = await User.findOne({
      role: 'doctor',
      isActive: true,
      'doctorProfile.isVerified': true,
      'doctorProfile.department': 'GeneralMedicine',
    }).sort({ 'doctorProfile.experienceYears': -1 });

    if (fallbackMatch) return fallbackMatch;
  }

  throw new ServiceError(
    404,
    `No verified doctor available for department '${department}'`
  );
};

export interface UpdateDoctorScheduleInput {
  department?: DepartmentName;
  opdTimings?: OpdTimings;
  days?: Weekday[];
  consultationFee?: number;
  availableSlots?: Array<{ day: string; startTime: string; endTime: string }>;
}

export const updateDoctorScheduleService = async (
  doctorId: string,
  input: UpdateDoctorScheduleInput
): Promise<IUser> => {
  const targetUser = await User.findById(doctorId);
  if (!targetUser || targetUser.role !== 'doctor' || !targetUser.doctorProfile) {
    throw new ServiceError(404, 'Doctor not found');
  }

  if (input.department !== undefined) {
    if (!DEPARTMENT_NAMES.includes(input.department)) {
      throw new ServiceError(
        400,
        `Invalid department. Allowed: ${DEPARTMENT_NAMES.join(', ')}`
      );
    }
    targetUser.doctorProfile.department = input.department;
  }

  if (input.opdTimings !== undefined) {
    targetUser.doctorProfile.opdTimings = input.opdTimings;
  }

  if (input.days !== undefined) {
    if (!Array.isArray(input.days) || input.days.some((d) => !WEEKDAYS.includes(d))) {
      throw new ServiceError(
        400,
        `Invalid days. Allowed values: ${WEEKDAYS.join(', ')}`
      );
    }
    targetUser.doctorProfile.days = input.days;
  }

  if (input.consultationFee !== undefined) {
    targetUser.doctorProfile.consultationFee = Number(input.consultationFee);
  }

  if (input.availableSlots !== undefined) {
    targetUser.doctorProfile.availableSlots = input.availableSlots;
  }

  await targetUser.save();
  return targetUser;
};


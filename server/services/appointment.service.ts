import Appointment, {
  APPOINTMENT_STATUSES,
  AppointmentBookingType,
  AppointmentStatus,
  IAppointment,
} from '../models/appointment.model';
import User, { UserRole } from '../models/user.model';
import {
  DEPARTMENT_NAMES,
  DepartmentName,
  WEEKDAYS,
  Weekday,
} from '../types/doctor.types';
import { findDoctorForDepartmentService } from './doctor.service';
import { ServiceError } from '../utils/ServiceError';

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  department?: DepartmentName;
  appointmentDate: Date | string;
  timeSlot: string;
  bookingType?: AppointmentBookingType;
  symptoms?: string[];
  aiDiagnosisSummary?: string;
  diagnosisId?: string;
  notes?: string;
}

const getWeekdayFromDate = (date: Date): Weekday => {
  const jsDay = date.getDay(); // 0 = Sun ... 6 = Sat
  const map: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[jsDay] || 'Mon';
};

/**
 * Creates a manual or AI-triggered appointment after validating patient & verified doctor.
 */
export const createAppointmentService = async (
  input: CreateAppointmentInput
): Promise<IAppointment> => {
  if (!input.patientId || !input.doctorId || !input.appointmentDate || !input.timeSlot) {
    throw new ServiceError(
      400,
      'patientId, doctorId, appointmentDate, and timeSlot are required'
    );
  }

  const [patient, doctor] = await Promise.all([
    User.findById(input.patientId),
    User.findById(input.doctorId),
  ]);

  if (!patient || !patient.isActive) {
    throw new ServiceError(404, 'Active patient not found');
  }

  if (!doctor || doctor.role !== 'doctor' || !doctor.isActive || !doctor.doctorProfile) {
    throw new ServiceError(404, 'Active doctor not found');
  }

  if (!doctor.doctorProfile.isVerified) {
    throw new ServiceError(400, 'Selected doctor is not verified yet');
  }

  const resolvedDepartment: DepartmentName =
    input.department && DEPARTMENT_NAMES.includes(input.department)
      ? input.department
      : doctor.doctorProfile.department || 'GeneralMedicine';

  const parsedDate = new Date(input.appointmentDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new ServiceError(400, 'Invalid appointmentDate format');
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctor._id,
    department: resolvedDepartment,
    appointmentDate: parsedDate,
    timeSlot: input.timeSlot.trim(),
    bookingType: input.bookingType || 'manual',
    status: input.bookingType === 'ai_diagnosis' ? 'confirmed' : 'pending',
    symptoms: input.symptoms || [],
    aiDiagnosisSummary: input.aiDiagnosisSummary,
    diagnosisId: input.diagnosisId,
    notes: input.notes,
  });

  return appointment.populate([
    { path: 'patient', select: 'name email phone bloodGroup' },
    { path: 'doctor', select: 'name email phone doctorProfile location' },
  ]);
};

export interface AiDiagnosisAppointmentInput {
  patientId: string;
  recommendedDepartment: DepartmentName;
  preferredDate?: Date | string;
  preferredTimeSlot?: string;
  symptoms: string[];
  aiDiagnosisSummary: string;
  diagnosisId?: string;
  notes?: string;
}

/**
 * Reusable internal service for AI diagnosis flow:
 * picks an available verified doctor in the recommended department and books the appointment.
 */
export const bookAppointmentFromAiDiagnosisService = async (
  input: AiDiagnosisAppointmentInput
): Promise<IAppointment> => {
  if (!DEPARTMENT_NAMES.includes(input.recommendedDepartment)) {
    throw new ServiceError(
      400,
      `Invalid recommendedDepartment. Allowed: ${DEPARTMENT_NAMES.join(', ')}`
    );
  }

  const targetDate = input.preferredDate
    ? new Date(input.preferredDate)
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // default: next day

  if (Number.isNaN(targetDate.getTime())) {
    throw new ServiceError(400, 'Invalid preferredDate format');
  }

  const preferredDay = getWeekdayFromDate(targetDate);
  const doctor = await findDoctorForDepartmentService(
    input.recommendedDepartment,
    WEEKDAYS.includes(preferredDay) ? preferredDay : undefined
  );

  const defaultSlot =
    doctor.doctorProfile?.opdTimings?.label ||
    (doctor.doctorProfile?.opdTimings
      ? `${doctor.doctorProfile.opdTimings.start} - ${doctor.doctorProfile.opdTimings.end}`
      : '10:00 AM');

  return createAppointmentService({
    patientId: input.patientId,
    doctorId: doctor._id.toString(),
    department: doctor.doctorProfile?.department || input.recommendedDepartment,
    appointmentDate: targetDate,
    timeSlot: input.preferredTimeSlot?.trim() || defaultSlot,
    bookingType: 'ai_diagnosis',
    symptoms: input.symptoms,
    aiDiagnosisSummary: input.aiDiagnosisSummary,
    diagnosisId: input.diagnosisId,
    notes: input.notes,
  });
};

export const listAppointmentsService = async (params: {
  userId: string;
  role: UserRole;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: Record<string, unknown> = {};

  if (params.role === 'patient') {
    filter.patient = params.userId;
  } else if (params.role === 'doctor') {
    filter.doctor = params.userId;
  }

  if (
    params.status &&
    APPOINTMENT_STATUSES.includes(params.status as AppointmentStatus)
  ) {
    filter.status = params.status;
  }

  const pageNum = Math.max(1, params.page || 1);
  const limitNum = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (pageNum - 1) * limitNum;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patient', 'name email phone bloodGroup')
      .populate('doctor', 'name email phone doctorProfile location')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Appointment.countDocuments(filter),
  ]);

  return {
    appointments,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getAppointmentByIdService = async (
  appointmentId: string,
  requesterId: string,
  requesterRole: UserRole
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('patient', 'name email phone bloodGroup')
    .populate('doctor', 'name email phone doctorProfile location');

  if (!appointment) {
    throw new ServiceError(404, 'Appointment not found');
  }

  const isPatientOwner = appointment.patient._id.toString() === requesterId;
  const isAssignedDoctor = appointment.doctor._id.toString() === requesterId;

  if (requesterRole !== 'admin' && !isPatientOwner && !isAssignedDoctor) {
    throw new ServiceError(403, 'Access denied to view this appointment');
  }

  return appointment;
};

export const updateAppointmentStatusService = async (params: {
  appointmentId: string;
  requesterId: string;
  requesterRole: UserRole;
  status: AppointmentStatus;
  notes?: string;
}): Promise<IAppointment> => {
  if (!APPOINTMENT_STATUSES.includes(params.status)) {
    throw new ServiceError(
      400,
      `Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(', ')}`
    );
  }

  const appointment = await Appointment.findById(params.appointmentId);
  if (!appointment) {
    throw new ServiceError(404, 'Appointment not found');
  }

  const isPatientOwner = appointment.patient.toString() === params.requesterId;
  const isAssignedDoctor = appointment.doctor.toString() === params.requesterId;

  if (params.requesterRole === 'patient') {
    if (!isPatientOwner || params.status !== 'cancelled') {
      throw new ServiceError(403, 'Patients can only cancel their own appointments');
    }
  } else if (params.requesterRole === 'doctor') {
    if (!isAssignedDoctor) {
      throw new ServiceError(403, 'Doctors can only update their assigned appointments');
    }
  } else if (params.requesterRole !== 'admin') {
    throw new ServiceError(403, 'Access denied');
  }

  appointment.status = params.status;
  if (params.notes !== undefined) {
    appointment.notes = params.notes;
  }

  await appointment.save();

  return appointment.populate([
    { path: 'patient', select: 'name email phone bloodGroup' },
    { path: 'doctor', select: 'name email phone doctorProfile location' },
  ]);
};


import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { DEPARTMENT_NAMES, DepartmentName } from '../types/doctor.types';

export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_BOOKING_TYPES = ['manual', 'ai_diagnosis'] as const;
export type AppointmentBookingType = (typeof APPOINTMENT_BOOKING_TYPES)[number];

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  department: DepartmentName;
  appointmentDate: Date;
  timeSlot: string;
  bookingType: AppointmentBookingType;
  status: AppointmentStatus;
  symptoms: string[];
  aiDiagnosisSummary?: string;
  diagnosisId?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    department: {
      type: String,
      enum: DEPARTMENT_NAMES,
      required: [true, 'Department is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    bookingType: {
      type: String,
      enum: APPOINTMENT_BOOKING_TYPES,
      default: 'manual',
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'pending',
      index: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    aiDiagnosisSummary: {
      type: String,
      trim: true,
    },
    diagnosisId: {
      type: Schema.Types.ObjectId,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

const Appointment: Model<IAppointment> = mongoose.model<IAppointment>(
  'Appointment',
  appointmentSchema
);

export default Appointment;


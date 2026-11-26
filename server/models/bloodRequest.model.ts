import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup } from './user.model';

export const BLOOD_REQUEST_URGENCIES = ['normal', 'urgent', 'critical'] as const;
export type BloodRequestUrgency = (typeof BLOOD_REQUEST_URGENCIES)[number];

export const BLOOD_REQUEST_STATUSES = ['open', 'fulfilled', 'cancelled'] as const;
export type BloodRequestStatus = (typeof BLOOD_REQUEST_STATUSES)[number];

export interface INotifiedDonor {
  donor: Types.ObjectId;
  email: string;
  emailed: boolean;
}

export interface IBloodRequest extends Document {
  requester: Types.ObjectId;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: BloodRequestUrgency;
  city?: string;
  state?: string;
  hospitalName?: string;
  contactPhone?: string;
  requirements?: string;
  notifiedDonors: INotifiedDonor[];
  status: BloodRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const notifiedDonorSchema = new Schema<INotifiedDonor>(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, trim: true },
    emailed: { type: Boolean, default: false },
  },
  { _id: false }
);

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required'],
      index: true,
    },
    unitsRequired: {
      type: Number,
      default: 1,
      min: 1,
    },
    urgency: {
      type: String,
      enum: BLOOD_REQUEST_URGENCIES,
      default: 'urgent',
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    requirements: { type: String, trim: true },
    notifiedDonors: {
      type: [notifiedDonorSchema],
      default: [],
    },
    status: {
      type: String,
      enum: BLOOD_REQUEST_STATUSES,
      default: 'open',
      index: true,
    },
  },
  { timestamps: true }
);

const BloodRequest: Model<IBloodRequest> = mongoose.model<IBloodRequest>(
  'BloodRequest',
  bloodRequestSchema
);

export default BloodRequest;


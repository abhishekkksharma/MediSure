import { DepartmentName, DoctorProfile } from './doctor'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type AppointmentBookingType = 'manual' | 'ai_diagnosis'

export interface AppointmentUserRef {
  _id: string
  name: string
  email: string
  phone?: string
  bloodGroup?: string
  doctorProfile?: DoctorProfile
  location?: {
    city?: string
    state?: string
  }
}

export interface AppointmentItem {
  _id: string
  patient: AppointmentUserRef
  doctor: AppointmentUserRef
  department: DepartmentName
  appointmentDate: string
  timeSlot: string
  bookingType: AppointmentBookingType
  status: AppointmentStatus
  symptoms: string[]
  aiDiagnosisSummary?: string
  notes?: string
  createdAt: string
  updatedAt: string
}


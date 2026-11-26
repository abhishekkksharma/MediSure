import { UserRole } from '@/context/userContext'
import { DepartmentName, DoctorProfile, Weekday } from './doctor'

export interface AdminUserRecord {
  _id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  bloodGroup?: string
  isBloodDonorAvailable?: boolean
  isActive: boolean
  createdAt?: string
  location?: {
    city?: string
    state?: string
  }
  doctorProfile?: DoctorProfile
}

export interface AdminUsersResponse {
  users: AdminUserRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AdminStatsSummary {
  totalUsers: number
  doctors: number
  verifiedDoctors: number
  patients: number
}

export interface CreateDoctorPayload {
  name: string
  email: string
  password: string
  phone?: string
  gender?: string
  location?: {
    city?: string
    state?: string
  }
  doctorProfile: {
    department: DepartmentName
    specialization: string
    licenseNumber: string
    experienceYears?: number
    consultationFee?: number
    qualifications?: string[]
    opdTimings: {
      start: string
      end: string
    }
    days: Weekday[]
    isVerified: boolean
  }
}

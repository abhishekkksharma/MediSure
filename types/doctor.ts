export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export const DEPARTMENT_NAMES = [
  'ENT',
  'GeneralMedicine',
  'Cardiology',
  'Gastroenterology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Gynecology',
  'Ophthalmology',
  'Psychiatry',
  'Pulmonology',
] as const

export type DepartmentName = (typeof DEPARTMENT_NAMES)[number]

export const DEPARTMENT_LABELS: Record<DepartmentName, string> = {
  ENT: 'ENT (Ear, Nose & Throat)',
  GeneralMedicine: 'General Medicine',
  Cardiology: 'Cardiology',
  Gastroenterology: 'Gastroenterology',
  Dermatology: 'Dermatology',
  Orthopedics: 'Orthopedics',
  Pediatrics: 'Pediatrics',
  Neurology: 'Neurology',
  Gynecology: 'Gynecology',
  Ophthalmology: 'Ophthalmology',
  Psychiatry: 'Psychiatry',
  Pulmonology: 'Pulmonology',
}

export interface OpdTimings {
  start: string // e.g. "09:00"
  end: string   // e.g. "17:00"
  label?: string // e.g. "9:00 AM - 5:00 PM"
}

export interface DepartmentDoctorSchedule {
  doctorId?: string
  doctor: string
  email?: string
  department: DepartmentName
  opdTimings: OpdTimings
  days: Weekday[]
  qualifications?: string[]
  experienceYears?: number
  consultationFee?: number
  isVerified?: boolean
}

export type Departments = Record<DepartmentName, DepartmentDoctorSchedule[]>

export interface DoctorProfile {
  department: DepartmentName
  specialization: string
  licenseNumber: string
  opdTimings: OpdTimings
  days: Weekday[]
  experienceYears?: number
  qualifications?: string[]
  consultationFee?: number
  isVerified: boolean
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

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
] as const;

export type DepartmentName = (typeof DEPARTMENT_NAMES)[number];

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
};

export interface OpdTimings {
  start: string;
  end: string;
  label?: string;
}

export interface DepartmentDoctorSchedule {
  doctorId: string;
  doctor: string;
  email: string;
  department: DepartmentName;
  opdTimings: OpdTimings;
  days: Weekday[];
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  isVerified: boolean;
}

export type Departments = Record<DepartmentName, DepartmentDoctorSchedule[]>;


import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import User, { ROLE_PERMISSIONS } from '../models/user.model';
import { DepartmentName, Weekday } from '../types/doctor.types';

interface NewDoctorSeed {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: DepartmentName;
  specialization: string;
  licenseNumber: string;
  experienceYears: number;
  consultationFee: number;
  qualifications: string[];
  opdTimings: { start: string; end: string; label: string };
  days: Weekday[];
  city: string;
  state: string;
}

const NEW_DOCTORS: NewDoctorSeed[] = [
  {
    name: 'Dr. Aarav Sharma',
    email: 'aarav.sharma@medisure.in',
    password: 'AaravDoc@2026',
    phone: '+91 98111 22334',
    department: 'GeneralMedicine',
    specialization: 'Internal Medicine & Primary Care',
    licenseNumber: 'MCI-GM-9001',
    experienceYears: 10,
    consultationFee: 500,
    qualifications: ['MBBS', 'MD (General Medicine)'],
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    city: 'Chandigarh',
    state: 'Punjab',
  },
  {
    name: 'Dr. Ishita Verma',
    email: 'ishita.verma@medisure.in',
    password: 'IshitaDoc@2026',
    phone: '+91 98222 33445',
    department: 'Cardiology',
    specialization: 'Non-Invasive Cardiology',
    licenseNumber: 'MCI-CAR-9002',
    experienceYears: 12,
    consultationFee: 1100,
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    days: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    city: 'Panchkula',
    state: 'Haryana',
  },
  {
    name: 'Dr. Kabir Malhotra',
    email: 'kabir.malhotra@medisure.in',
    password: 'KabirDoc@2026',
    phone: '+91 98333 44556',
    department: 'Dermatology',
    specialization: 'Clinical & Cosmetic Dermatology',
    licenseNumber: 'MCI-DER-9003',
    experienceYears: 8,
    consultationFee: 700,
    qualifications: ['MBBS', 'MD (Dermatology)'],
    days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    opdTimings: { start: '11:00', end: '19:00', label: '11:00 AM - 07:00 PM' },
    city: 'New Delhi',
    state: 'Delhi',
  },
  {
    name: 'Dr. Diya Nair',
    email: 'diya.nair@medisure.in',
    password: 'DiyaDoc@2026',
    phone: '+91 98444 55667',
    department: 'Pediatrics',
    specialization: 'Pediatric & Adolescent Care',
    licenseNumber: 'MCI-PED-9004',
    experienceYears: 9,
    consultationFee: 600,
    qualifications: ['MBBS', 'MD (Pediatrics)'],
    opdTimings: { start: '09:30', end: '17:30', label: '09:30 AM - 05:30 PM' },
    days: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
    city: 'Bengaluru',
    state: 'Karnataka',
  },
];

const escapeCsv = (value: unknown): string => {
  const str = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

async function main(): Promise<void> {
  await connectDB();

  let createdCount = 0;
  for (const doc of NEW_DOCTORS) {
    const existing = await User.findOne({ email: doc.email });
    if (existing) {
      console.log(`Already exists: ${doc.email}`);
      continue;
    }

    await User.create({
      name: doc.name,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      role: 'doctor',
      isActive: true,
      permissions: [...ROLE_PERMISSIONS.doctor],
      location: {
        city: doc.city,
        state: doc.state,
      },
      doctorProfile: {
        department: doc.department,
        specialization: doc.specialization,
        licenseNumber: doc.licenseNumber,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        qualifications: doc.qualifications,
        opdTimings: doc.opdTimings,
        days: doc.days,
        isVerified: true,
      },
    });
    createdCount += 1;
    console.log(`Created doctor: ${doc.email}`);
  }

  const credHeaders = [
    'name',
    'email',
    'password',
    'phone',
    'department',
    'specialization',
    'licenseNumber',
    'city',
    'state',
    'opdTimings',
    'opdDays',
    'consultationFee',
  ];

  const credRows = NEW_DOCTORS.map((d) =>
    [
      d.name,
      d.email,
      d.password,
      d.phone,
      d.department,
      d.specialization,
      d.licenseNumber,
      d.city,
      d.state,
      d.opdTimings.label,
      d.days.join('; '),
      d.consultationFee,
    ]
      .map(escapeCsv)
      .join(',')
  );

  const credPath = path.resolve(__dirname, '..', '..', 'doctor_credentials.csv');
  fs.writeFileSync(credPath, [credHeaders.join(','), ...credRows].join('\n'), 'utf8');
  console.log(`Created ${createdCount} new doctor(s). Credentials saved to ${credPath}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to create doctors:', err);
  process.exit(1);
});

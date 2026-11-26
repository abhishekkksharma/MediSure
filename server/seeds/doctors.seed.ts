import User, { ROLE_PERMISSIONS } from '../models/user.model';
import { DepartmentName, Weekday } from '../types/doctor.types';

interface SeedDoctorSpec {
  name: string;
  email: string;
  department: DepartmentName;
  specialization: string;
  licenseNumber: string;
  experienceYears: number;
  consultationFee: number;
  qualifications: string[];
  days: Weekday[];
  opdTimings: { start: string; end: string; label: string };
  city: string;
  state: string;
}

const SHIFT_A_DAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu'];
const SHIFT_B_DAYS: Weekday[] = ['Thu', 'Fri', 'Sat', 'Sun'];

const SEED_DOCTORS: SeedDoctorSpec[] = [
  // General Medicine
  {
    name: 'Dr. Rajeshwari Kulkarni',
    email: 'rajeshwari.kulkarni@medisure.in',
    department: 'GeneralMedicine',
    specialization: 'Internal & General Medicine',
    licenseNumber: 'MCI-GM-1011',
    experienceYears: 12,
    consultationFee: 500,
    qualifications: ['MBBS', 'MD (General Medicine)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    name: 'Dr. Arvind Deshmukh',
    email: 'arvind.deshmukh@medisure.in',
    department: 'GeneralMedicine',
    specialization: 'Family & General Physician',
    licenseNumber: 'MCI-GM-1012',
    experienceYears: 9,
    consultationFee: 450,
    qualifications: ['MBBS', 'DNB (Medicine)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Pune',
    state: 'Maharashtra',
  },

  // ENT
  {
    name: 'Dr. Amit Shah',
    email: 'amit.shah@medisure.in',
    department: 'ENT',
    specialization: 'ENT & Head-Neck Surgery',
    licenseNumber: 'MCI-ENT-2011',
    experienceYears: 14,
    consultationFee: 700,
    qualifications: ['MBBS', 'MS (ENT)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  {
    name: 'Dr. Sneha Iyer',
    email: 'sneha.iyer@medisure.in',
    department: 'ENT',
    specialization: 'Otolaryngology & Sinus Care',
    licenseNumber: 'MCI-ENT-2012',
    experienceYears: 8,
    consultationFee: 650,
    qualifications: ['MBBS', 'MS (ENT)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '11:00', end: '19:00', label: '11:00 AM - 07:00 PM' },
    city: 'Chennai',
    state: 'Tamil Nadu',
  },

  // Cardiology
  {
    name: 'Dr. Vikramaditya Rao',
    email: 'vikramaditya.rao@medisure.in',
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    licenseNumber: 'MCI-CAR-3011',
    experienceYears: 16,
    consultationFee: 1200,
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '16:00', label: '09:00 AM - 04:00 PM' },
    city: 'Hyderabad',
    state: 'Telangana',
  },
  {
    name: 'Dr. Meenakshi Nair',
    email: 'meenakshi.nair@medisure.in',
    department: 'Cardiology',
    specialization: 'Clinical & Preventive Cardiology',
    licenseNumber: 'MCI-CAR-3012',
    experienceYears: 11,
    consultationFee: 1000,
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '17:00', label: '10:00 AM - 05:00 PM' },
    city: 'Kochi',
    state: 'Kerala',
  },

  // Gastroenterology
  {
    name: 'Dr. Siddharth Verma',
    email: 'siddharth.verma@medisure.in',
    department: 'Gastroenterology',
    specialization: 'Medical Gastroenterology & Hepatology',
    licenseNumber: 'MCI-GAS-4011',
    experienceYears: 13,
    consultationFee: 950,
    qualifications: ['MBBS', 'MD', 'DM (Gastroenterology)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:30', end: '17:30', label: '09:30 AM - 05:30 PM' },
    city: 'New Delhi',
    state: 'Delhi',
  },
  {
    name: 'Dr. Ananya Chatterjee',
    email: 'ananya.chatterjee@medisure.in',
    department: 'Gastroenterology',
    specialization: 'Digestive & Liver Disorders',
    licenseNumber: 'MCI-GAS-4012',
    experienceYears: 10,
    consultationFee: 900,
    qualifications: ['MBBS', 'MD', 'DNB (Gastroenterology)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Kolkata',
    state: 'West Bengal',
  },

  // Dermatology
  {
    name: 'Dr. Kavita Malhotra',
    email: 'kavita.malhotra@medisure.in',
    department: 'Dermatology',
    specialization: 'Clinical Dermatology',
    licenseNumber: 'MCI-DER-5011',
    experienceYears: 11,
    consultationFee: 750,
    qualifications: ['MBBS', 'MD (Dermatology)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Chandigarh',
    state: 'Punjab',
  },
  {
    name: 'Dr. Rohan Joshi',
    email: 'rohan.joshi@medisure.in',
    department: 'Dermatology',
    specialization: 'Dermatology & Allergy Care',
    licenseNumber: 'MCI-DER-5012',
    experienceYears: 7,
    consultationFee: 700,
    qualifications: ['MBBS', 'DDVL'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '11:00', end: '19:00', label: '11:00 AM - 07:00 PM' },
    city: 'Bengaluru',
    state: 'Karnataka',
  },

  // Orthopedics
  {
    name: 'Dr. Arjun Singhania',
    email: 'arjun.singhania@medisure.in',
    department: 'Orthopedics',
    specialization: 'Joint & Spine Orthopedics',
    licenseNumber: 'MCI-ORT-6011',
    experienceYears: 15,
    consultationFee: 900,
    qualifications: ['MBBS', 'MS (Orthopedics)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    city: 'Jaipur',
    state: 'Rajasthan',
  },
  {
    name: 'Dr. Priya Menon',
    email: 'priya.menon@medisure.in',
    department: 'Orthopedics',
    specialization: 'Sports Medicine & Orthopedics',
    licenseNumber: 'MCI-ORT-6012',
    experienceYears: 9,
    consultationFee: 850,
    qualifications: ['MBBS', 'DNB (Orthopedics)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Bengaluru',
    state: 'Karnataka',
  },

  // Pediatrics
  {
    name: 'Dr. Neha Kapoor',
    email: 'neha.kapoor@medisure.in',
    department: 'Pediatrics',
    specialization: 'Pediatrics & Neonatology',
    licenseNumber: 'MCI-PED-7011',
    experienceYears: 12,
    consultationFee: 650,
    qualifications: ['MBBS', 'MD (Pediatrics)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    city: 'Gurugram',
    state: 'Haryana',
  },
  {
    name: 'Dr. Karthik Subramanian',
    email: 'karthik.subramanian@medisure.in',
    department: 'Pediatrics',
    specialization: 'Child Health & Immunization',
    licenseNumber: 'MCI-PED-7012',
    experienceYears: 8,
    consultationFee: 600,
    qualifications: ['MBBS', 'DCH', 'DNB (Pediatrics)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '09:30', end: '17:30', label: '09:30 AM - 05:30 PM' },
    city: 'Coimbatore',
    state: 'Tamil Nadu',
  },

  // Neurology
  {
    name: 'Dr. Pranav Mukherjee',
    email: 'pranav.mukherjee@medisure.in',
    department: 'Neurology',
    specialization: 'Clinical Neurology & Migraine Care',
    licenseNumber: 'MCI-NEU-8011',
    experienceYears: 14,
    consultationFee: 1100,
    qualifications: ['MBBS', 'MD', 'DM (Neurology)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '10:00', end: '17:00', label: '10:00 AM - 05:00 PM' },
    city: 'Kolkata',
    state: 'West Bengal',
  },
  {
    name: 'Dr. Divya Krishnan',
    email: 'divya.krishnan@medisure.in',
    department: 'Neurology',
    specialization: 'Neuro-rehabilitation & Epilepsy',
    licenseNumber: 'MCI-NEU-8012',
    experienceYears: 10,
    consultationFee: 1000,
    qualifications: ['MBBS', 'MD', 'DM (Neurology)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '11:00', end: '18:00', label: '11:00 AM - 06:00 PM' },
    city: 'Chennai',
    state: 'Tamil Nadu',
  },

  // Gynecology
  {
    name: 'Dr. Sunita Patil',
    email: 'sunita.patil@medisure.in',
    department: 'Gynecology',
    specialization: 'Obstetrics & Gynecology',
    licenseNumber: 'MCI-GYN-9011',
    experienceYears: 15,
    consultationFee: 800,
    qualifications: ['MBBS', 'MS (OBG)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    city: 'Pune',
    state: 'Maharashtra',
  },
  {
    name: 'Dr. Pooja Agarwal',
    email: 'pooja.agarwal@medisure.in',
    department: 'Gynecology',
    specialization: 'Women’s Health & Gynecology',
    licenseNumber: 'MCI-GYN-9012',
    experienceYears: 9,
    consultationFee: 750,
    qualifications: ['MBBS', 'DGO', 'DNB'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },

  // Ophthalmology
  {
    name: 'Dr. Vivek Bansal',
    email: 'vivek.bansal@medisure.in',
    department: 'Ophthalmology',
    specialization: 'Cataract & Retina Specialist',
    licenseNumber: 'MCI-OPH-1111',
    experienceYears: 13,
    consultationFee: 700,
    qualifications: ['MBBS', 'MS (Ophthalmology)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:30', end: '17:30', label: '09:30 AM - 05:30 PM' },
    city: 'New Delhi',
    state: 'Delhi',
  },
  {
    name: 'Dr. Nandini Hegde',
    email: 'nandini.hegde@medisure.in',
    department: 'Ophthalmology',
    specialization: 'Cornea & General Ophthalmology',
    licenseNumber: 'MCI-OPH-1112',
    experienceYears: 8,
    consultationFee: 650,
    qualifications: ['MBBS', 'DOMS', 'DNB'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Bengaluru',
    state: 'Karnataka',
  },

  // Psychiatry
  {
    name: 'Dr. Manish Tiwari',
    email: 'manish.tiwari@medisure.in',
    department: 'Psychiatry',
    specialization: 'Adult Psychiatry & Stress Care',
    licenseNumber: 'MCI-PSY-1211',
    experienceYears: 11,
    consultationFee: 900,
    qualifications: ['MBBS', 'MD (Psychiatry)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Bhopal',
    state: 'Madhya Pradesh',
  },
  {
    name: 'Dr. Shreya Sen',
    email: 'shreya.sen@medisure.in',
    department: 'Psychiatry',
    specialization: 'Behavioral & Sleep Medicine',
    licenseNumber: 'MCI-PSY-1212',
    experienceYears: 7,
    consultationFee: 850,
    qualifications: ['MBBS', 'DPM', 'DNB (Psychiatry)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '11:00', end: '19:00', label: '11:00 AM - 07:00 PM' },
    city: 'Mumbai',
    state: 'Maharashtra',
  },

  // Pulmonology
  {
    name: 'Dr. Harshvardhan Mehta',
    email: 'harshvardhan.mehta@medisure.in',
    department: 'Pulmonology',
    specialization: 'Pulmonology & Respiratory Medicine',
    licenseNumber: 'MCI-PUL-1311',
    experienceYears: 14,
    consultationFee: 950,
    qualifications: ['MBBS', 'MD (Pulmonary Medicine)'],
    days: SHIFT_A_DAYS,
    opdTimings: { start: '09:00', end: '17:00', label: '09:00 AM - 05:00 PM' },
    city: 'Surat',
    state: 'Gujarat',
  },
  {
    name: 'Dr. Ritika Saxena',
    email: 'ritika.saxena@medisure.in',
    department: 'Pulmonology',
    specialization: 'Asthma, Allergy & Chest Care',
    licenseNumber: 'MCI-PUL-1312',
    experienceYears: 9,
    consultationFee: 850,
    qualifications: ['MBBS', 'DNB (Respiratory Medicine)'],
    days: SHIFT_B_DAYS,
    opdTimings: { start: '10:00', end: '18:00', label: '10:00 AM - 06:00 PM' },
    city: 'Noida',
    state: 'Uttar Pradesh',
  },
];

/**
 * Idempotently seeds verified Indian doctors across every department
 * so that every department has coverage 7 days a week.
 */
export const seedDefaultDoctors = async (): Promise<void> => {
  try {
    const existingEmails = new Set(
      (
        await User.find({
          email: { $in: SEED_DOCTORS.map((d) => d.email) },
        }).select('email')
      ).map((u) => u.email)
    );

    const missing = SEED_DOCTORS.filter((d) => !existingEmails.has(d.email));
    if (missing.length === 0) return;

    const defaultPassword = process.env.SEED_DOCTOR_PASSWORD || 'Doctor@123';

    for (const doc of missing) {
      await User.create({
        name: doc.name,
        email: doc.email,
        password: defaultPassword,
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
          days: doc.days,
          opdTimings: doc.opdTimings,
          isVerified: true,
        },
      });
    }

    console.log(`Seeded ${missing.length} verified Indian doctors across departments.`);
  } catch (error) {
    console.error('Failed to seed default doctors:', error);
  }
};


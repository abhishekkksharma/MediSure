import User, { BloodGroup, ROLE_PERMISSIONS } from '../models/user.model';

interface SeedPatientSpec {
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  gender: 'male' | 'female' | 'other';
  city: string;
  state: string;
  isBloodDonorAvailable: boolean;
}

const SEED_PATIENTS: SeedPatientSpec[] = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@medisure.in',
    phone: '+91 98201 11223',
    bloodGroup: 'O+',
    gender: 'male',
    city: 'Mumbai',
    state: 'Maharashtra',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Diya Deshpande',
    email: 'diya.deshpande@medisure.in',
    phone: '+91 98202 22334',
    bloodGroup: 'O+',
    gender: 'female',
    city: 'Mumbai',
    state: 'Maharashtra',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Kabir Kulkarni',
    email: 'kabir.kulkarni@medisure.in',
    phone: '+91 98220 33445',
    bloodGroup: 'A+',
    gender: 'male',
    city: 'Pune',
    state: 'Maharashtra',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Anjali Verma',
    email: 'anjali.verma@medisure.in',
    phone: '+91 98111 44556',
    bloodGroup: 'B+',
    gender: 'female',
    city: 'New Delhi',
    state: 'Delhi',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Rohan Malhotra',
    email: 'rohan.malhotra@medisure.in',
    phone: '+91 98112 55667',
    bloodGroup: 'O-',
    gender: 'male',
    city: 'New Delhi',
    state: 'Delhi',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Karthik Reddy',
    email: 'karthik.reddy@medisure.in',
    phone: '+91 98450 66778',
    bloodGroup: 'AB+',
    gender: 'male',
    city: 'Bengaluru',
    state: 'Karnataka',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Meera Krishnan',
    email: 'meera.krishnan@medisure.in',
    phone: '+91 98451 77889',
    bloodGroup: 'A-',
    gender: 'female',
    city: 'Bengaluru',
    state: 'Karnataka',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Suresh Iyer',
    email: 'suresh.iyer@medisure.in',
    phone: '+91 98400 88990',
    bloodGroup: 'B+',
    gender: 'male',
    city: 'Chennai',
    state: 'Tamil Nadu',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Lakshmi Narayanan',
    email: 'lakshmi.narayanan@medisure.in',
    phone: '+91 98401 99001',
    bloodGroup: 'O+',
    gender: 'female',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Devansh Patel',
    email: 'devansh.patel@medisure.in',
    phone: '+91 98250 10112',
    bloodGroup: 'A+',
    gender: 'male',
    city: 'Ahmedabad',
    state: 'Gujarat',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Nisha Desai',
    email: 'nisha.desai@medisure.in',
    phone: '+91 98251 20223',
    bloodGroup: 'B-',
    gender: 'female',
    city: 'Surat',
    state: 'Gujarat',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Sai Kiran',
    email: 'sai.kiran@medisure.in',
    phone: '+91 98490 30334',
    bloodGroup: 'O+',
    gender: 'male',
    city: 'Hyderabad',
    state: 'Telangana',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Riya Chatterjee',
    email: 'riya.chatterjee@medisure.in',
    phone: '+91 98300 40445',
    bloodGroup: 'AB-',
    gender: 'female',
    city: 'Kolkata',
    state: 'West Bengal',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Aditya Rathore',
    email: 'aditya.rathore@medisure.in',
    phone: '+91 98290 50556',
    bloodGroup: 'B+',
    gender: 'male',
    city: 'Jaipur',
    state: 'Rajasthan',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Snehal Nair',
    email: 'snehal.nair@medisure.in',
    phone: '+91 98470 60667',
    bloodGroup: 'A+',
    gender: 'female',
    city: 'Kochi',
    state: 'Kerala',
    isBloodDonorAvailable: true,
  },
  {
    name: 'Vikas Tiwari',
    email: 'vikas.tiwari@medisure.in',
    phone: '+91 98390 70778',
    bloodGroup: 'O-',
    gender: 'male',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    isBloodDonorAvailable: true,
  },
];

/**
 * Idempotently seeds sample patient/blood-donor accounts into MongoDB
 * so real-time donor queries and location dropdowns return live data.
 */
export const seedDefaultUsers = async (): Promise<void> => {
  try {
    const existingEmails = new Set(
      (
        await User.find({
          email: { $in: SEED_PATIENTS.map((p) => p.email) },
        }).select('email')
      ).map((u) => u.email)
    );

    const missing = SEED_PATIENTS.filter((p) => !existingEmails.has(p.email));
    if (missing.length === 0) return;

    const defaultPassword = process.env.SEED_USER_PASSWORD || 'Patient@123';

    for (const patient of missing) {
      await User.create({
        name: patient.name,
        email: patient.email,
        password: defaultPassword,
        role: 'patient',
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        gender: patient.gender,
        isBloodDonorAvailable: patient.isBloodDonorAvailable,
        isActive: true,
        permissions: [...ROLE_PERMISSIONS.patient],
        location: {
          city: patient.city,
          state: patient.state,
        },
      });
    }

    console.log(`Seeded ${missing.length} sample patient/donor accounts.`);
  } catch (error) {
    console.error('Failed to seed default users:', error);
  }
};

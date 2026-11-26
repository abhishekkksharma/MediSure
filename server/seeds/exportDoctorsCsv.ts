import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import User from '../models/user.model';

const escapeCsv = (value: unknown): string => {
  const str = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

async function main(): Promise<void> {
  await connectDB();

  const doctors = await User.find({ role: 'doctor' })
    .sort({ 'doctorProfile.department': 1, name: 1 })
    .lean();

  const headers = [
    'id',
    'name',
    'email',
    'phone',
    'gender',
    'department',
    'specialization',
    'licenseNumber',
    'experienceYears',
    'consultationFee',
    'qualifications',
    'opdStart',
    'opdEnd',
    'opdDays',
    'city',
    'state',
    'address',
    'isVerified',
    'isActive',
    'createdAt',
  ];

  const rows = doctors.map((doc) =>
    [
      doc._id,
      doc.name,
      doc.email,
      doc.phone,
      doc.gender,
      doc.doctorProfile?.department,
      doc.doctorProfile?.specialization,
      doc.doctorProfile?.licenseNumber,
      doc.doctorProfile?.experienceYears,
      doc.doctorProfile?.consultationFee,
      (doc.doctorProfile?.qualifications || []).join('; '),
      doc.doctorProfile?.opdTimings?.start,
      doc.doctorProfile?.opdTimings?.end,
      (doc.doctorProfile?.days || []).join('; '),
      doc.location?.city,
      doc.location?.state,
      doc.location?.address,
      doc.doctorProfile?.isVerified,
      doc.isActive,
      doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    ]
      .map(escapeCsv)
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const outPath = path.resolve(__dirname, '..', '..', 'doctors.csv');
  fs.writeFileSync(outPath, csvContent, 'utf8');

  console.log(`Exported ${doctors.length} doctors to ${outPath}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to export doctors CSV:', err);
  process.exit(1);
});

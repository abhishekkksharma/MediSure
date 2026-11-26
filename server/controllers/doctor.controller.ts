import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  getDepartmentsWithDoctorsService,
  listDoctorsService,
  updateDoctorScheduleService,
} from '../services/doctor.service';
import { handleControllerError } from '../utils/errorHandler';

export const getDepartmentsWithDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeUnverified = req.query.includeUnverified === 'true';
    const result = await getDepartmentsWithDoctorsService(includeUnverified);
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch departments and doctor schedules');
  }
};

export const listDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, day, specialization, city, includeUnverified } = req.query;
    const doctors = await listDoctorsService({
      department: typeof department === 'string' ? department : undefined,
      day: typeof day === 'string' ? day : undefined,
      specialization: typeof specialization === 'string' ? specialization : undefined,
      city: typeof city === 'string' ? city : undefined,
      includeUnverified: includeUnverified === 'true',
    });

    res.status(200).json({ count: doctors.length, doctors });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch doctors');
  }
};

export const updateDoctorSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await updateDoctorScheduleService(String(req.params.id), req.body);
    res.status(200).json({
      message: 'Doctor schedule updated successfully',
      doctor,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to update doctor schedule');
  }
};

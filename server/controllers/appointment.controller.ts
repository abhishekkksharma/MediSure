import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  bookAppointmentFromAiDiagnosisService,
  createAppointmentService,
  getAppointmentByIdService,
  listAppointmentsService,
  updateAppointmentStatusService,
} from '../services/appointment.service';
import { handleControllerError } from '../utils/errorHandler';

/**
 * POST /api/appointments
 * Creates a manual appointment for the authenticated patient (or specified patientId for admins).
 */
export const createManualAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const patientId =
      req.user.role === 'admin' && req.body.patientId
        ? req.body.patientId
        : req.user._id.toString();

    const appointment = await createAppointmentService({
      patientId,
      doctorId: req.body.doctorId,
      department: req.body.department,
      appointmentDate: req.body.appointmentDate,
      timeSlot: req.body.timeSlot,
      bookingType: 'manual',
      symptoms: req.body.symptoms,
      notes: req.body.notes,
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to book appointment');
  }
};

/**
 * POST /api/appointments/ai-diagnosis
 * Books an appointment automatically based on AI diagnosis output.
 */
export const createAiDiagnosisAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const patientId =
      req.user.role === 'admin' && req.body.patientId
        ? req.body.patientId
        : req.user._id.toString();

    const appointment = await bookAppointmentFromAiDiagnosisService({
      patientId,
      recommendedDepartment: req.body.recommendedDepartment,
      preferredDate: req.body.preferredDate,
      preferredTimeSlot: req.body.preferredTimeSlot,
      symptoms: req.body.symptoms || [],
      aiDiagnosisSummary: req.body.aiDiagnosisSummary || '',
      diagnosisId: req.body.diagnosisId,
      notes: req.body.notes,
    });

    res.status(201).json({
      message: 'AI-assisted appointment booked successfully',
      appointment,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to book AI-assisted appointment');
  }
};

/**
 * GET /api/appointments
 * Lists appointments scoped to the authenticated user's role (patient, doctor, or admin).
 */
export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { status, page, limit } = req.query;
    const result = await listAppointmentsService({
      userId: req.user._id.toString(),
      role: req.user.role,
      status: typeof status === 'string' ? status : undefined,
      page: typeof page === 'string' ? parseInt(page, 10) : undefined,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch appointments');
  }
};

/**
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const appointment = await getAppointmentByIdService(
      String(req.params.id),
      req.user._id.toString(),
      req.user.role
    );

    res.status(200).json({ appointment });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch appointment');
  }
};

/**
 * PATCH /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const appointment = await updateAppointmentStatusService({
      appointmentId: String(req.params.id),
      requesterId: req.user._id.toString(),
      requesterRole: req.user.role,
      status: req.body.status,
      notes: req.body.notes,
    });

    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to update appointment status');
  }
};


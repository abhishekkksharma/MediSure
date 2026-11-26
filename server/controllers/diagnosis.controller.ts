import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { bookAppointmentFromAiDiagnosisService } from '../services/appointment.service';
import { geminiService } from '../services/gemini.service';
import { handleControllerError } from '../utils/errorHandler';
import { ServiceError } from '../utils/ServiceError';

/**
 * POST /api/diagnosis/questions
 * Evaluates initial symptoms and returns targeted follow-up triage questions.
 */
export const getDiagnosisQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { symptoms, history } = req.body;
    const result = await geminiService.getDiagnosis(symptoms, history || []);
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to generate diagnosis questions');
  }
};

/**
 * POST /api/diagnosis/complete
 * Produces final AI diagnosis and optionally books an appointment with a matching doctor.
 */
export const completeDiagnosisAndBook = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const {
      symptoms,
      qaHistory = [],
      autoBook = true,
      preferredDate,
      preferredTimeSlot,
    } = req.body;

    const diagnosis = await geminiService.getFinalDiagnosis(symptoms, qaHistory);

    let appointment = null;
    let bookingNote: string | undefined;

    if (autoBook) {
      try {
        appointment = await bookAppointmentFromAiDiagnosisService({
          patientId: req.user._id.toString(),
          recommendedDepartment: diagnosis.department,
          preferredDate,
          preferredTimeSlot,
          symptoms: diagnosis.extractedSymptoms,
          aiDiagnosisSummary: diagnosis.summary,
        });
      } catch (bookingError) {
        if (bookingError instanceof ServiceError && bookingError.statusCode === 404) {
          bookingNote = bookingError.message;
        } else {
          throw bookingError;
        }
      }
    }

    res.status(200).json({
      diagnosis,
      appointment,
      bookingNote,
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to complete AI diagnosis');
  }
};


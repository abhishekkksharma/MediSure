"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeDiagnosisAndBook = exports.getDiagnosisQuestions = void 0;
const appointment_service_1 = require("../services/appointment.service");
const gemini_service_1 = require("../services/gemini.service");
const errorHandler_1 = require("../utils/errorHandler");
const ServiceError_1 = require("../utils/ServiceError");
/**
 * POST /api/diagnosis/questions
 * Evaluates initial symptoms and returns targeted follow-up triage questions.
 */
const getDiagnosisQuestions = async (req, res) => {
    try {
        const { symptoms, history } = req.body;
        const result = await gemini_service_1.geminiService.getDiagnosis(symptoms, history || []);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to generate diagnosis questions');
    }
};
exports.getDiagnosisQuestions = getDiagnosisQuestions;
/**
 * POST /api/diagnosis/complete
 * Produces final AI diagnosis and optionally books an appointment with a matching doctor.
 */
const completeDiagnosisAndBook = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const { symptoms, qaHistory = [], autoBook = true, preferredDate, preferredTimeSlot, } = req.body;
        const diagnosis = await gemini_service_1.geminiService.getFinalDiagnosis(symptoms, qaHistory);
        let appointment = null;
        let bookingNote;
        if (autoBook) {
            try {
                appointment = await (0, appointment_service_1.bookAppointmentFromAiDiagnosisService)({
                    patientId: req.user._id.toString(),
                    recommendedDepartment: diagnosis.department,
                    preferredDate,
                    preferredTimeSlot,
                    symptoms: diagnosis.extractedSymptoms,
                    aiDiagnosisSummary: diagnosis.summary,
                });
            }
            catch (bookingError) {
                if (bookingError instanceof ServiceError_1.ServiceError && bookingError.statusCode === 404) {
                    bookingNote = bookingError.message;
                }
                else {
                    throw bookingError;
                }
            }
        }
        res.status(200).json({
            diagnosis,
            appointment,
            bookingNote,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleControllerError)(res, error, 'Failed to complete AI diagnosis');
    }
};
exports.completeDiagnosisAndBook = completeDiagnosisAndBook;

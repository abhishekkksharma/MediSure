import { Response } from 'express';
import mongoose from 'mongoose';
import { ServiceError } from './ServiceError';

export const handleControllerError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
): void => {
  if (error instanceof ServiceError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((e) => e.message);
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  ) {
    res.status(409).json({ message: 'A record with this unique value already exists' });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ message: fallbackMessage });
};


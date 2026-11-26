import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using the configured MONGO_URI.
 */
export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medisure';
  const dbName = process.env.MONGO_DB_NAME || 'medisure';

  try {
    const conn = await mongoose.connect(mongoUri, { dbName });
    console.log(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};


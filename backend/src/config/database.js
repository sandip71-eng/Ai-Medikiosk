import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    isConnected = conn.connection.readyState === 1;
    logger.info({ host: conn.connection.host, name: conn.connection.name }, 'MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error({ err: err.message }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('connected', () => {
      isConnected = true;
    });

    return conn;
  } catch (error) {
    logger.error({ error: error.message }, 'MongoDB connection failed');
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly');
  }
};

export const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Returns true only when MongoDB is actively connected and ready
 */
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;

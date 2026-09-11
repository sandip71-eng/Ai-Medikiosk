import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import Consultation from '../models/Consultation.js';
import { AppError } from '../middleware/errorMiddleware.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '24h',
  });
};

/**
 * Register a new clinician or admin
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400, 'USER_ALREADY_EXISTS'));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'doctor',
    });

    const token = signToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clinician / Admin Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    if (!user.isActive) {
      return next(new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED'));
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get aggregated kiosk statistics
 */
export const getStatistics = async (req, res, next) => {
  try {
    const [totalConsultations, statusCounts, urgencyCounts, languageCounts] = await Promise.all([
      Consultation.countDocuments(),
      Consultation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Consultation.aggregate([{ $group: { _id: '$urgency', count: { $sum: 1 } } }]),
      Consultation.aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }]),
    ]);

    const formattedStatus = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const formattedUrgency = urgencyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const formattedLanguages = languageCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalConsultations,
        statusBreakdown: formattedStatus,
        urgencyBreakdown: formattedUrgency,
        languageBreakdown: formattedLanguages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List consultations (paginated)
 */
export const listConsultations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.urgency) query.urgency = req.query.urgency;
    if (req.query.language) query.language = req.query.language;

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-messages -__v'),
      Consultation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        consultations,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single consultation by ID with complete clinical detail
 */
export const getAdminConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findOne({ consultationId: id });

    if (!consultation) {
      return next(new AppError('Consultation not found', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: {
        consultation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  getStatistics,
  listConsultations,
  getAdminConsultation,
};

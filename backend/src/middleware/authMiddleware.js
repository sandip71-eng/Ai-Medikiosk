import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';

/**
 * Protect routes requiring JWT authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED'));
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select('+password');
    if (!user || !user.isActive) {
      return next(
        new AppError('The user belonging to this token is inactive or no longer exists.', 401, 'USER_NOT_FOUND')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict routes to specific roles (e.g. ['admin'], ['doctor', 'admin'])
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN')
      );
    }
    next();
  };
};

export default {
  authenticate,
  authorize,
};

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.utils';
import { AppError } from './error.middleware';
import User from '../models/User';

// Extend Express Request type to include user
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { _id: string };
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Attach user info to request
    req.user = {
      ...decoded,
      _id: decoded.userId,
    };

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to access this resource', 403)
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize('super_admin');

/**
 * Middleware to check if user is contractor
 */
export const isContractor = authorize('contractor');

/**
 * Middleware to check if user is regular user
 */
export const isUser = authorize('user');

/**
 * Middleware to check if user is contractor or admin
 */
export const isContractorOrAdmin = authorize('contractor', 'super_admin');

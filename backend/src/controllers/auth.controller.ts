import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Contractor from '../models/Contractor';
import { generateToken } from '../utils/jwt.utils';
import { AppError, catchAsync } from '../middleware/error.middleware';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aamanojkumar190@gmail.com';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, name, role, phone, location } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return next(new AppError('All fields are required', 400));
    }

    // Prevent registration with admin email
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && role !== 'super_admin') {
      return next(new AppError('This email is reserved for admin access', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Validate role
    if (!['user', 'contractor', 'super_admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    // Create user
    const user: IUser = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
      phone,
      location,
      isVerified: role === 'super_admin', // Auto-verify admin
    });

    // If contractor, create contractor profile
    if (role === 'contractor') {
      await Contractor.create({
        userId: user._id,
        specialties: [],
        experience: 0,
        rating: 0,
        totalProjects: 0,
        completionRate: 0,
      });
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role === 'super_admin' ? 'super_admin' : user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  }
);

/**
 * Login user
 * POST /api/auth/login
 */
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    // Find user with password field
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
          phone: user.phone,
          location: user.location,
        },
        token,
      },
    });
  }
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
          phone: user.phone,
          location: user.location,
        },
      },
    });
  }
);

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
);

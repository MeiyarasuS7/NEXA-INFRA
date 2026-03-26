import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Contractor from '../models/Contractor';
import Project from '../models/Project';
import Payment from '../models/Payment';
import Dispute from '../models/Dispute';
import Review from '../models/Review';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Get platform analytics
 * GET /api/admin/analytics
 */
export const getPlatformAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    // User stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalContractors = await User.countDocuments({ role: 'contractor' });
    const verifiedContractors = await Contractor.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Project stats
    const totalProjects = await Project.countDocuments();
    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Payment stats
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Dispute stats
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });

    // Review stats
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    // Recent activity
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type status budget createdAt')
      .populate('userId', 'name');

    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount status createdAt')
      .populate('projectId', 'title');

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers + totalContractors,
          users: totalUsers,
          contractors: totalContractors,
          verifiedContractors,
          activeUsers,
        },
        projects: {
          total: totalProjects,
          byStatus: projectsByStatus.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
        payments: {
          byStatus: paymentStats.reduce((acc: any, item: any) => {
            acc[item._id] = { count: item.count, amount: item.totalAmount };
            return acc;
          }, {}),
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        disputes: {
          total: totalDisputes,
          open: openDisputes,
          resolved: resolvedDisputes,
        },
        reviews: {
          total: totalReviews,
          averageRating: averageRating[0]?.avgRating || 0,
        },
        recentActivity: {
          projects: recentProjects,
          payments: recentPayments,
        },
      },
    });
  }
);

/**
 * Get all users
 * GET /api/admin/users
 */
export const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { role, isActive, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get additional data if contractor
    let contractorData = null;
    let contractorProfileId: mongoose.Types.ObjectId | null = null;
    if (user.role === 'contractor') {
      contractorData = await Contractor.findOne({ userId: id });
      contractorProfileId = contractorData?._id || null;
    }

    // Get user statistics
    const projectsCount = await Project.countDocuments({
      $or: [{ userId: id }, ...(contractorProfileId ? [{ contractorId: contractorProfileId }] : [])],
    });

    const paymentsCount = await Payment.countDocuments({
      $or: [{ userId: id }, ...(contractorProfileId ? [{ contractorId: contractorProfileId }] : [])],
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        contractorData,
        statistics: {
          projects: projectsCount,
          payments: paymentsCount,
        },
      },
    });
  }
);

/**
 * Update user status
 * PUT /api/admin/users/:id/status
 */
export const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid user ID', 400));
    }

    if (isActive === undefined) {
      return next(new AppError('isActive status is required', 400));
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user },
    });
  }
);

/**
 * Verify contractor
 * PUT /api/admin/contractors/:id/verify
 */
export const verifyContractor = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { id } = req.params;
    const { isVerified, verificationNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    if (isVerified === undefined) {
      return next(new AppError('isVerified status is required', 400));
    }

    const contractor = await Contractor.findByIdAndUpdate(
      id,
      {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verificationNotes,
      },
      { new: true, runValidators: true }
    );

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    res.status(200).json({
      success: true,
      message: `Contractor ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { contractor },
    });
  }
);

/**
 * Get all contractors (admin view)
 * GET /api/admin/contractors
 */
export const getContractors = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { isVerified, specialty, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    if (specialty) {
      query.specialties = specialty;
    }

    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const contractors = await Contractor.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Contractor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        contractors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get all projects (admin view)
 * GET /api/admin/projects
 */
export const getProjects = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { status, type } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const projects = await Project.find(query)
      .populate('userId', 'name email')
      .populate('contractorId', 'company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get all payments (admin view)
 * GET /api/admin/payments
 */
export const getPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('projectId', 'title approvalStatus status')
      .populate('userId', 'name email')
      .populate('contractorId', 'company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get all disputes (admin view)
 * GET /api/admin/disputes
 */
export const getDisputes = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { status, category } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const disputes = await Dispute.find(query)
      .populate('projectId', 'title type userId contractorId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Dispute.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        disputes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get all reviews (admin view)
 * GET /api/admin/reviews
 */
export const getReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { reviewType, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    if (reviewType) {
      query.reviewType = reviewType;
    }

    const reviews = await Review.find(query)
      .populate('userId', 'name email avatar')
      .populate({
        path: 'contractorId',
        select: 'company userId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('projectId', 'title type status')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const filteredReviews = search
      ? reviews.filter((review: any) => {
          const term = String(search).toLowerCase();
          const reviewerName = review.userId?.name?.toLowerCase?.() || '';
          const contractorName =
            review.contractorId?.company?.toLowerCase?.() ||
            review.contractorId?.userId?.name?.toLowerCase?.() ||
            '';
          const projectTitle = review.projectId?.title?.toLowerCase?.() || '';
          const comment = review.comment?.toLowerCase?.() || '';

          return (
            reviewerName.includes(term) ||
            contractorName.includes(term) ||
            projectTitle.includes(term) ||
            comment.includes(term)
          );
        })
      : reviews;

    const total = search ? filteredReviews.length : await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews: filteredReviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Delete user (admin only)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'super_admin') {
      return next(new AppError('Admin access required', 403));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // If contractor, also delete contractor profile
    if (user.role === 'contractor') {
      await Contractor.findOneAndDelete({ userId: id });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  }
);

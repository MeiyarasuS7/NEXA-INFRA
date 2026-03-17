import { Request, Response, NextFunction } from 'express';
import Dispute from '../models/Dispute';
import Project from '../models/Project';
import Notification from '../models/Notification';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Create dispute
 * POST /api/disputes
 */
export const createDispute = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { projectId, subject, description, category, evidence } = req.body;

    if (!projectId || !subject || !description || !category) {
      return next(new AppError('All required fields must be provided', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError('Invalid project ID', 400));
    }

    // Validate project
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission - only project participants can create disputes
    const isOwner = project.userId.toString() === req.user.userId;
    const isContractor = project.contractorId?.toString() === req.user.userId;

    if (!isOwner && !isContractor) {
      return next(new AppError('Only project participants can create disputes', 403));
    }

    // Determine parties
    const raisedBy = new mongoose.Types.ObjectId(req.user.userId);
    const raisedAgainst = isOwner ? project.contractorId : project.userId;

    // Create dispute
    const dispute = await Dispute.create({
      projectId,
      raisedBy,
      raisedAgainst,
      subject,
      description,
      category,
      status: 'open',
      evidence: evidence || [],
    });

    // Create notification for the other party
    const notifyUserId = isOwner ? project.contractorId : project.userId;
    if (notifyUserId) {
      await Notification.create({
        userId: notifyUserId,
        type: 'dispute',
        title: 'New Dispute Raised',
        message: `A dispute has been raised regarding project: ${project.title}`,
        priority: 'high',
        data: {
          disputeId: dispute._id,
          projectId: project._id,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: { dispute },
    });
  }
);

/**
 * Get disputes
 * GET /api/disputes
 */
export const getDisputes = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { status, category, projectId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    // Filter by role - users and contractors see only their disputes, admins see all
    if (req.user.role !== 'super_admin') {
      const projects = await Project.find({
        $or: [{ userId: req.user.userId }, { contractorId: req.user.userId }],
      }).select('_id');

      query.projectId = { $in: projects.map((p) => p._id) };
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
        return next(new AppError('Invalid project ID', 400));
      }
      query.projectId = projectId;
    }

    const disputes = await Dispute.find(query)
      .populate('projectId', 'title type budget status')
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
 * Get single dispute
 * GET /api/disputes/:id
 */
export const getDispute = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid dispute ID', 400));
    }

    const dispute = await Dispute.findById(id).populate('projectId', 'title type budget userId contractorId');

    if (!dispute) {
      return next(new AppError('Dispute not found', 404));
    }

    // Check permission
    const project = dispute.projectId as any;
    const isOwner = project.userId.toString() === req.user.userId;
    const isContractor = project.contractorId?.toString() === req.user.userId;
    const isAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isContractor && !isAdmin) {
      return next(new AppError('You do not have permission to view this dispute', 403));
    }

    res.status(200).json({
      success: true,
      data: { dispute },
    });
  }
);

/**
 * Update dispute
 * PUT /api/disputes/:id
 */
export const updateDispute = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { description, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid dispute ID', 400));
    }

    const dispute = await Dispute.findById(id).populate('projectId', 'userId contractorId');

    if (!dispute) {
      return next(new AppError('Dispute not found', 404));
    }

    // Check permission - only dispute creator can update
    const isAdmin = req.user.role === 'super_admin';

    if (dispute.raisedBy.toString() !== req.user.userId && !isAdmin) {
      return next(new AppError('You do not have permission to update this dispute', 403));
    }

    // Can only update if dispute is still open
    if (dispute.status !== 'open' && !isAdmin) {
      return next(new AppError('You can only update open disputes', 400));
    }

    // Update fields
    if (description) dispute.description = description;
    if (category) dispute.category = category;

    await dispute.save();

    res.status(200).json({
      success: true,
      message: 'Dispute updated successfully',
      data: { dispute },
    });
  }
);

/**
 * Add evidence to dispute
 * POST /api/disputes/:id/evidence
 */
export const addEvidence = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { type, url, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid dispute ID', 400));
    }

    if (!type || !url) {
      return next(new AppError('Evidence type and URL are required', 400));
    }

    const dispute = await Dispute.findById(id).populate('projectId', 'userId contractorId');

    if (!dispute) {
      return next(new AppError('Dispute not found', 404));
    }

    // Check permission
    const project = dispute.projectId as any;
    const isOwner = project.userId.toString() === req.user.userId;
    const isContractor = project.contractorId?.toString() === req.user.userId;
    const isAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isContractor && !isAdmin) {
      return next(new AppError('You do not have permission to add evidence to this dispute', 403));
    }

    // Add evidence
    dispute.evidence.push({
      type,
      url,
      description,
      uploadedAt: new Date(),
    });

    await dispute.save();

    res.status(200).json({
      success: true,
      message: 'Evidence added successfully',
      data: { dispute },
    });
  }
);

/**
 * Resolve dispute (admin only)
 * POST /api/disputes/:id/resolve
 */
export const resolveDispute = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'super_admin') {
      return next(new AppError('Only admins can resolve disputes', 403));
    }

    const { id } = req.params;
    const { resolution, favoredParty, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid dispute ID', 400));
    }

    if (!resolution || !favoredParty) {
      return next(new AppError('Resolution and favored party are required', 400));
    }

    const dispute = await Dispute.findById(id).populate('projectId', 'title userId contractorId');

    if (!dispute) {
      return next(new AppError('Dispute not found', 404));
    }

    if (dispute.status !== 'under_review') {
      return next(new AppError('Only disputes under review can be resolved', 400));
    }

    // Resolve dispute
    dispute.status = 'resolved';
    dispute.resolution = {
      resolvedBy: new mongoose.Types.ObjectId(req.user.userId),
      resolution,
      resolvedAt: new Date(),
    };
    if (adminNotes) {
      dispute.adminNotes = adminNotes;
    }

    await dispute.save();

    // Notify both parties
    const project = dispute.projectId as any;
    const userIds = [project.userId, project.contractorId].filter(Boolean);

    for (const userId of userIds) {
      await Notification.create({
        userId,
        type: 'dispute',
        title: 'Dispute Resolved',
        message: `The dispute regarding ${project.title} has been resolved`,
        priority: 'high',
        data: {
          disputeId: dispute._id,
          projectId: project._id,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      data: { dispute },
    });
  }
);

/**
 * Change dispute status
 * PUT /api/disputes/:id/status
 */
export const updateDisputeStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'super_admin') {
      return next(new AppError('Only admins can update dispute status', 403));
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid dispute ID', 400));
    }

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const validStatuses = ['open', 'under_review', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const dispute = await Dispute.findById(id);

    if (!dispute) {
      return next(new AppError('Dispute not found', 404));
    }

    dispute.status = status;
    await dispute.save();

    res.status(200).json({
      success: true,
      message: 'Dispute status updated successfully',
      data: { dispute },
    });
  }
);

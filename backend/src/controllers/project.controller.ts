import { Request, Response, NextFunction } from 'express';
import Project, { ProjectStatus } from '../models/Project';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const {
      title,
      description,
      type,
      budget,
      estimatedDuration,
      location,
      requirements,
      timeline,
      notes,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !budget || !estimatedDuration || !location || !timeline) {
      return next(new AppError('All required fields must be provided', 400));
    }

    const project = await Project.create({
      userId: req.user.userId,
      title,
      description,
      type,
      budget,
      estimatedDuration,
      location,
      requirements: requirements || [],
      timeline,
      notes,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  }
);

/**
 * Get all projects (filtered by user role)
 * GET /api/projects
 */
export const getProjects = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { status, contractorId } = req.query;
    const filter: any = {};

    // Filter by user role
    if (req.user.role === 'user') {
      filter.userId = req.user.userId;
    } else if (req.user.role === 'contractor') {
      filter.contractorId = req.user.userId;
    }
    // Admin can see all projects (no filter)

    // Additional filters
    if (status) {
      filter.status = status;
    }
    if (contractorId) {
      filter.contractorId = contractorId;
    }

    const projects = await Project.find(filter)
      .populate('userId', 'name email avatar')
      .populate('contractorId', 'company specialties rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length,
      },
    });
  }
);

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
export const getProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid project ID', 400));
    }

    const project = await Project.findById(id)
      .populate('userId', 'name email phone avatar location')
      .populate('contractorId', 'company specialties rating experience hourlyRate');

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check access permission
    if (
      req.user.role !== 'super_admin' &&
      project.userId._id.toString() !== req.user.userId &&
      project.contractorId?._id.toString() !== req.user.userId
    ) {
      return next(new AppError('You do not have permission to view this project', 403));
    }

    res.status(200).json({
      success: true,
      data: { project },
    });
  }
);

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid project ID', 400));
    }

    const project = await Project.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission (only project owner or admin can update)
    if (req.user.role !== 'super_admin' && project.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to update this project', 403));
    }

    const allowedUpdates = [
      'title',
      'description',
      'type',
      'budget',
      'estimatedDuration',
      'location',
      'requirements',
      'timeline',
      'notes',
      'attachments',
    ];

    const updates: any = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedProject = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email').populate('contractorId', 'company specialties');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject },
    });
  }
);

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid project ID', 400));
    }

    const project = await Project.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission
    if (req.user.role !== 'super_admin' && project.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to delete this project', 403));
    }

    // Don't allow deletion of in-progress or completed projects
    if (['in_progress', 'completed'].includes(project.status)) {
      return next(new AppError('Cannot delete projects that are in progress or completed', 400));
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  }
);

/**
 * Update project status
 * PUT /api/projects/:id/status
 */
export const updateProjectStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid project ID', 400));
    }

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const validStatuses: ProjectStatus[] = [
      'pending',
      'approved',
      'in_progress',
      'completed',
      'disputed',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const project = await Project.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission
    const isOwner = project.userId.toString() === req.user.userId;
    const isContractor = project.contractorId?.toString() === req.user.userId;
    const isAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isContractor && !isAdmin) {
      return next(new AppError('You do not have permission to update this project status', 403));
    }

    // Update status
    project.status = status;

    // Set dates based on status
    if (status === 'in_progress' && !project.startDate) {
      project.startDate = new Date();
    } else if (status === 'completed' && !project.endDate) {
      project.endDate = new Date();
      project.progress = 100;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: { project },
    });
  }
);

/**
 * Assign contractor to project
 * POST /api/projects/:id/assign
 */
export const assignContractor = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { contractorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(contractorId)) {
      return next(new AppError('Invalid ID', 400));
    }

    const project = await Project.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission (only project owner or admin)
    if (req.user.role !== 'super_admin' && project.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to assign a contractor', 403));
    }

    project.contractorId = new mongoose.Types.ObjectId(contractorId);
    project.status = 'approved';
    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('userId', 'name email')
      .populate('contractorId', 'company specialties rating');

    res.status(200).json({
      success: true,
      message: 'Contractor assigned successfully',
      data: { project: updatedProject },
    });
  }
);

/**
 * Add milestone to project
 * POST /api/projects/:id/milestones
 */
export const addMilestone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid project ID', 400));
    }

    if (!title || !dueDate) {
      return next(new AppError('Title and due date are required', 400));
    }

    const project = await Project.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission
    const isOwner = project.userId.toString() === req.user.userId;
    const isContractor = project.contractorId?.toString() === req.user.userId;

    if (!isOwner && !isContractor && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to add milestones', 403));
    }

    project.milestones.push({
      title,
      description,
      dueDate: new Date(dueDate),
      isCompleted: false,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Milestone added successfully',
      data: { project },
    });
  }
);

/**
 * Update milestone
 * PUT /api/projects/:id/milestones/:milestoneIndex
 */
export const updateMilestone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id, milestoneIndex } = req.params;
    const { isCompleted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid project ID', 400));
    }

    const project = await Project.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    const index = parseInt(milestoneIndex);
    if (isNaN(index) || index < 0 || index >= project.milestones.length) {
      return next(new AppError('Invalid milestone index', 400));
    }

    // Check permission
    const isContractor = project.contractorId?.toString() === req.user.userId;

    if (!isContractor && req.user.role !== 'super_admin') {
      return next(new AppError('Only assigned contractor can update milestones', 403));
    }

    if (isCompleted !== undefined) {
      project.milestones[index].isCompleted = isCompleted;
      if (isCompleted) {
        project.milestones[index].completedDate = new Date();
      }
    }

    // Calculate progress based on completed milestones
    const completedCount = project.milestones.filter((m) => m.isCompleted).length;
    project.progress = Math.round((completedCount / project.milestones.length) * 100);

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: { project },
    });
  }
);

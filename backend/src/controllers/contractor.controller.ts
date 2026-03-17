import { Request, Response, NextFunction } from 'express';
import Contractor from '../models/Contractor';
import UserContractorMapping from '../models/UserContractorMapping';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Browse/Search contractors
 * GET /api/contractors
 */
export const getContractors = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { specialty, minRating, availability, search, page = 1, limit = 10 } = req.query;

    const filter: any = { isActive: true };

    // Filter by specialty
    if (specialty) {
      filter.specialties = { $in: [specialty] };
    }

    // Filter by minimum rating
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating as string) };
    }

    // Filter by availability
    if (availability) {
      filter.availability = availability;
    }

    // Search in company name or bio
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const contractors = await Contractor.find(filter)
      .populate('userId', 'name email avatar location phone')
      .sort({ rating: -1, totalProjects: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Contractor.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        contractors,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  }
);

/**
 * Get contractor profile by ID
 * GET /api/contractors/:id
 */
export const getContractor = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    const contractor = await Contractor.findById(id).populate(
      'userId',
      'name email avatar location phone'
    );

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { contractor },
    });
  }
);

/**
 * Update contractor profile
 * PUT /api/contractors/:id
 */
export const updateContractor = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    const contractor = await Contractor.findById(id);

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    // Check permission (only contractor owner or admin can update)
    if (req.user.role !== 'super_admin' && contractor.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to update this profile', 403));
    }

    const allowedUpdates = [
      'company',
      'specialties',
      'bio',
      'experience',
      'availability',
      'hourlyRate',
    ];

    const updates: any = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedContractor = await Contractor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Contractor profile updated successfully',
      data: { contractor: updatedContractor },
    });
  }
);

/**
 * Add portfolio item
 * POST /api/contractors/:id/portfolio
 */
export const addPortfolioItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { title, description, image, completedDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    if (!title || !description) {
      return next(new AppError('Title and description are required', 400));
    }

    const contractor = await Contractor.findById(id);

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    // Check permission
    if (contractor.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to add portfolio items', 403));
    }

    contractor.portfolio.push({
      title,
      description,
      image: image || '',
      completedDate: completedDate ? new Date(completedDate) : new Date(),
    });

    await contractor.save();

    res.status(201).json({
      success: true,
      message: 'Portfolio item added successfully',
      data: { contractor },
    });
  }
);

/**
 * Add certification
 * POST /api/contractors/:id/certifications
 */
export const addCertification = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { name, issuer, date, document } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    if (!name || !issuer) {
      return next(new AppError('Name and issuer are required', 400));
    }

    const contractor = await Contractor.findById(id);

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    // Check permission
    if (contractor.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to add certifications', 403));
    }

    contractor.certifications.push({
      name,
      issuer,
      date: date ? new Date(date) : new Date(),
      document,
    });

    await contractor.save();

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      data: { contractor },
    });
  }
);

/**
 * Favorite a contractor
 * POST /api/contractors/:id/favorite
 */
export const favoriteContractor = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    const contractor = await Contractor.findById(id);

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    // Check if mapping already exists
    let mapping = await UserContractorMapping.findOne({
      userId: req.user.userId,
      contractorId: id,
    });

    if (!mapping) {
      // Create new mapping
      mapping = await UserContractorMapping.create({
        userId: req.user.userId,
        contractorId: id,
        isFavorite: true,
      });
    } else {
      // Toggle favorite
      mapping.isFavorite = !mapping.isFavorite;
      await mapping.save();
    }

    res.status(200).json({
      success: true,
      message: mapping.isFavorite
        ? 'Contractor added to favorites'
        : 'Contractor removed from favorites',
      data: { isFavorite: mapping.isFavorite },
    });
  }
);

/**
 * Block a contractor
 * POST /api/contractors/:id/block
 */
export const blockContractor = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    const contractor = await Contractor.findById(id);

    if (!contractor) {
      return next(new AppError('Contractor not found', 404));
    }

    // Check if mapping already exists
    let mapping = await UserContractorMapping.findOne({
      userId: req.user.userId,
      contractorId: id,
    });

    if (!mapping) {
      // Create new mapping
      mapping = await UserContractorMapping.create({
        userId: req.user.userId,
        contractorId: id,
        isBlocked: true,
      });
    } else {
      // Toggle block
      mapping.isBlocked = !mapping.isBlocked;
      await mapping.save();
    }

    res.status(200).json({
      success: true,
      message: mapping.isBlocked ? 'Contractor blocked' : 'Contractor unblocked',
      data: { isBlocked: mapping.isBlocked },
    });
  }
);

/**
 * Get user's favorite contractors
 * GET /api/contractors/favorites
 */
export const getFavoriteContractors = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const mappings = await UserContractorMapping.find({
      userId: req.user.userId,
      isFavorite: true,
    }).populate({
      path: 'contractorId',
      populate: { path: 'userId', select: 'name email avatar location' },
    });

    const contractors = mappings.map((m) => m.contractorId);

    res.status(200).json({
      success: true,
      data: { contractors },
    });
  }
);

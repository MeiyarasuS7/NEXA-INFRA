import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Contractor from '../models/Contractor';
import Project from '../models/Project';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Create a review
 * POST /api/reviews
 */
export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { projectId, contractorId, rating, comment, aspects, reviewType } = req.body;

    // Validate required fields
    if (!projectId || !contractorId || !rating || !comment || !reviewType) {
      return next(new AppError('All required fields must be provided', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(contractorId)) {
      return next(new AppError('Invalid project or contractor ID', 400));
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // Check if project exists and is completed
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.status !== 'completed') {
      return next(new AppError('You can only review completed projects', 400));
    }

    // Check if user is authorized to review
    if (reviewType === 'user_to_contractor' && project.userId.toString() !== req.user.userId) {
      return next(new AppError('Only project owner can review the contractor', 403));
    }

    if (reviewType === 'contractor_to_user' && project.contractorId?.toString() !== req.user.userId) {
      return next(new AppError('Only assigned contractor can review the user', 403));
    }

    // Create review
    const review = await Review.create({
      projectId,
      userId: reviewType === 'user_to_contractor' ? req.user.userId : project.userId,
      contractorId,
      rating,
      comment,
      reviewType,
      aspects,
      isVerified: true, // Set to true if from completed project
    });

    // Update contractor rating
    if (reviewType === 'user_to_contractor') {
      const allReviews = await Review.find({ contractorId, reviewType: 'user_to_contractor' });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await Contractor.findByIdAndUpdate(contractorId, {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  }
);

/**
 * Get reviews for a contractor
 * GET /api/reviews/contractor/:contractorId
 */
export const getContractorReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { contractorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contractorId)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    const reviews = await Review.find({
      contractorId,
      reviewType: 'user_to_contractor',
      isPublic: true,
    })
      .populate('userId', 'name avatar')
      .populate('projectId', 'title type')
      .sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      averageRating: 0,
      totalReviews: reviews.length,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      aspectAverages: {
        quality: 0,
        communication: 0,
        timeliness: 0,
        professionalism: 0,
      },
    };

    if (reviews.length > 0) {
      stats.averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      reviews.forEach((review) => {
        stats.ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
        
        if (review.aspects) {
          stats.aspectAverages.quality += review.aspects.quality || 0;
          stats.aspectAverages.communication += review.aspects.communication || 0;
          stats.aspectAverages.timeliness += review.aspects.timeliness || 0;
          stats.aspectAverages.professionalism += review.aspects.professionalism || 0;
        }
      });

      // Calculate aspect averages
      stats.aspectAverages.quality = Math.round((stats.aspectAverages.quality / reviews.length) * 10) / 10;
      stats.aspectAverages.communication = Math.round((stats.aspectAverages.communication / reviews.length) * 10) / 10;
      stats.aspectAverages.timeliness = Math.round((stats.aspectAverages.timeliness / reviews.length) * 10) / 10;
      stats.aspectAverages.professionalism = Math.round((stats.aspectAverages.professionalism / reviews.length) * 10) / 10;
    }

    res.status(200).json({
      success: true,
      data: { reviews, stats },
    });
  }
);

/**
 * Get single review
 * GET /api/reviews/:id
 */
export const getReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid review ID', 400));
    }

    const review = await Review.findById(id)
      .populate('userId', 'name avatar')
      .populate('contractorId', 'company specialties')
      .populate('projectId', 'title type status');

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { review },
    });
  }
);

/**
 * Update review
 * PUT /api/reviews/:id
 */
export const updateReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { rating, comment, aspects } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid review ID', 400));
    }

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check permission
    if (review.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to update this review', 403));
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (aspects) review.aspects = { ...review.aspects, ...aspects };

    await review.save();

    // Update contractor rating
    const allReviews = await Review.find({
      contractorId: review.contractorId,
      reviewType: 'user_to_contractor',
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Contractor.findByIdAndUpdate(review.contractorId, {
      rating: Math.round(avgRating * 10) / 10,
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review },
    });
  }
);

/**
 * Respond to a review (contractor only)
 * POST /api/reviews/:id/response
 */
export const respondToReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid review ID', 400));
    }

    if (!message || message.trim().length === 0) {
      return next(new AppError('Response message is required', 400));
    }

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check permission (only contractor being reviewed can respond)
    if (review.contractorId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('Only the reviewed contractor can respond', 403));
    }

    review.response = {
      message: message.trim(),
      respondedAt: new Date(),
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: { review },
    });
  }
);

/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
export const markHelpful = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid review ID', 400));
    }

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const hasVoted = review.helpful.users.some((u) => u.toString() === req.user!.userId);

    if (hasVoted) {
      // Remove vote
      review.helpful.users = review.helpful.users.filter((u) => u.toString() !== req.user!.userId);
      review.helpful.count -= 1;
    } else {
      // Add vote
      review.helpful.users.push(userId);
      review.helpful.count += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: hasVoted ? 'Vote removed' : 'Marked as helpful',
      data: { helpfulCount: review.helpful.count, hasVoted: !hasVoted },
    });
  }
);

/**
 * Delete review
 * DELETE /api/reviews/:id
 */
export const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid review ID', 400));
    }

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check permission
    if (review.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to delete this review', 403));
    }

    await Review.findByIdAndDelete(id);

    // Update contractor rating
    const allReviews = await Review.find({
      contractorId: review.contractorId,
      reviewType: 'user_to_contractor',
    });
    
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Contractor.findByIdAndUpdate(review.contractorId, {
        rating: Math.round(avgRating * 10) / 10,
      });
    } else {
      await Contractor.findByIdAndUpdate(review.contractorId, { rating: 0 });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  }
);

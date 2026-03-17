import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Get notifications for current user
 * GET /api/notifications
 */
export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { type, priority, isRead } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const query: any = {
      userId: req.user.userId,
      isArchived: false,
    };

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
      isArchived: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
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
 * Get single notification
 * GET /api/notifications/:id
 */
export const getNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid notification ID', 400));
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Check permission
    if (notification.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to view this notification', 403));
    }

    // Mark as read
    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  }
);

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid notification ID', 400));
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Check permission
    if (notification.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to update this notification', 403));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  }
);

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    await Notification.updateMany(
      {
        userId: req.user.userId,
        isRead: false,
        isArchived: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
);

/**
 * Archive notification
 * DELETE /api/notifications/:id
 */
export const archiveNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid notification ID', 400));
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Check permission
    if (notification.userId.toString() !== req.user.userId) {
      return next(new AppError('You do not have permission to archive this notification', 403));
    }

    notification.isArchived = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification archived successfully',
    });
  }
);

/**
 * Archive all read notifications
 * DELETE /api/notifications/archive-all
 */
export const archiveAllRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    await Notification.updateMany(
      {
        userId: req.user.userId,
        isRead: true,
        isArchived: false,
      },
      {
        isArchived: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'All read notifications archived successfully',
    });
  }
);

/**
 * Create notification (internal use / admin)
 * POST /api/notifications
 */
export const createNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'super_admin') {
      return next(new AppError('Only admins can create notifications', 403));
    }

    const { userId, type, title, message, priority, data, actionUrl } = req.body;

    if (!userId || !type || !title || !message) {
      return next(new AppError('All required fields must be provided', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority: priority || 'normal',
      data,
      actionUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification },
    });
  }
);

/**
 * Get notification settings
 * GET /api/notifications/settings
 */
export const getNotificationSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // In a real implementation, you would fetch this from a UserSettings collection
    // For now, return default settings
    const settings = {
      email: {
        projectUpdates: true,
        newMessages: true,
        paymentNotifications: true,
        disputeAlerts: true,
        systemNotifications: true,
      },
      push: {
        projectUpdates: true,
        newMessages: true,
        paymentNotifications: true,
        disputeAlerts: true,
        systemNotifications: false,
      },
    };

    res.status(200).json({
      success: true,
      data: { settings },
    });
  }
);

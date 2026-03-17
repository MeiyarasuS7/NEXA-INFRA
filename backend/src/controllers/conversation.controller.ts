import { Request, Response, NextFunction } from 'express';
import Conversation from '../models/Conversation';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Get all conversations for the current user
 * GET /api/conversations
 */
export const getConversations = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const filter: any = { isActive: true };

    // Find conversations where user is either the user or contractor
    filter.$or = [{ userId: req.user.userId }, { contractorId: req.user.userId }];

    const conversations = await Conversation.find(filter)
      .populate('userId', 'name email avatar')
      .populate('contractorId', 'company specialties rating')
      .populate('projectId', 'title status')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      data: { conversations },
    });
  }
);

/**
 * Get single conversation with messages
 * GET /api/conversations/:id
 */
export const getConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await Conversation.findById(id)
      .populate('userId', 'name email avatar phone')
      .populate('contractorId', 'company specialties rating hourlyRate')
      .populate('projectId', 'title status budget');

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    if (
      conversation.userId._id.toString() !== req.user.userId &&
      conversation.contractorId._id.toString() !== req.user.userId
    ) {
      return next(new AppError('You do not have permission to view this conversation', 403));
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  }
);

/**
 * Create new conversation
 * POST /api/conversations
 */
export const createConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { contractorId, projectId, message } = req.body;

    if (!contractorId) {
      return next(new AppError('Contractor ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(contractorId)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      userId: req.user.userId,
      contractorId,
    });

    if (existingConversation) {
      res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: { conversation: existingConversation },
      });
      return;
    }

    // Create new conversation
    const conversation = await Conversation.create({
      userId: req.user.userId,
      contractorId,
      projectId: projectId || null,
      messages: message
        ? [
            {
              senderId: req.user.userId,
              message,
              timestamp: new Date(),
              isRead: false,
            },
          ]
        : [],
      lastMessage: message || null,
      lastMessageTime: message ? new Date() : null,
      unreadCount: {
        user: 0,
        contractor: message ? 1 : 0,
      },
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('userId', 'name email avatar')
      .populate('contractorId', 'company specialties rating');

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation: populatedConversation },
    });
  }
);

/**
 * Send message in conversation
 * POST /api/conversations/:id/messages
 */
export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { message, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    if (!message || message.trim().length === 0) {
      return next(new AppError('Message content is required', 400));
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    const isUser = conversation.userId.toString() === req.user.userId;
    const isContractor = conversation.contractorId.toString() === req.user.userId;

    if (!isUser && !isContractor) {
      return next(new AppError('You do not have permission to send messages in this conversation', 403));
    }

    // Add message
    conversation.messages.push({
      senderId: new mongoose.Types.ObjectId(req.user.userId),
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
      attachments: attachments || [],
    });

    // Update conversation metadata
    conversation.lastMessage = message.trim();
    conversation.lastMessageTime = new Date();

    // Update unread count
    if (isUser) {
      conversation.unreadCount.contractor += 1;
    } else {
      conversation.unreadCount.user += 1;
    }

    await conversation.save();

    const populatedConversation = await Conversation.findById(id)
      .populate('userId', 'name email avatar')
      .populate('contractorId', 'company specialties rating');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { conversation: populatedConversation },
    });
  }
);

/**
 * Mark messages as read
 * PUT /api/conversations/:id/read
 */
export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    const isUser = conversation.userId.toString() === req.user.userId;
    const isContractor = conversation.contractorId.toString() === req.user.userId;

    if (!isUser && !isContractor) {
      return next(new AppError('You do not have permission to update this conversation', 403));
    }

    // Mark messages as read
    conversation.messages.forEach((msg) => {
      if (msg.senderId.toString() !== req.user!.userId) {
        msg.isRead = true;
      }
    });

    // Reset unread count
    if (isUser) {
      conversation.unreadCount.user = 0;
    } else {
      conversation.unreadCount.contractor = 0;
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: { conversation },
    });
  }
);

/**
 * Delete/Archive conversation
 * DELETE /api/conversations/:id
 */
export const deleteConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    if (
      conversation.userId.toString() !== req.user.userId &&
      conversation.contractorId.toString() !== req.user.userId &&
      req.user.role !== 'super_admin'
    ) {
      return next(new AppError('You do not have permission to delete this conversation', 403));
    }

    // Soft delete by marking as inactive
    conversation.isActive = false;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation archived successfully',
    });
  }
);

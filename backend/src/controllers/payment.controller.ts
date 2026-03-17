import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import Project from '../models/Project';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

/**
 * Create payment intent
 * POST /api/payments/create-intent
 */
export const createPaymentIntent = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { projectId, amount, description, milestoneId } = req.body;

    if (!projectId || !amount) {
      return next(new AppError('Project ID and amount are required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError('Invalid project ID', 400));
    }

    // Validate project
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permission
    if (project.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('Only project owner can create payments', 403));
    }

    // Create payment record
    const payment = await Payment.create({
      projectId,
      userId: req.user.userId,
      contractorId: project.contractorId,
      amount,
      status: 'pending',
      paymentMethod: 'stripe',
      description: description || `Payment for ${project.title}`,
      milestoneId,
      invoice: {
        invoiceNumber: `INV-${Date.now()}`,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // In a real implementation, you would create a Stripe PaymentIntent here
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100, // Convert to cents
    //   currency: 'usd',
    //   metadata: { paymentId: payment._id.toString() },
    // });

    // For now, just return the payment with a mock client secret
    const mockClientSecret = `pi_${payment._id}_secret_${Date.now()}`;

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        payment,
        clientSecret: mockClientSecret,
      },
    });
  }
);

/**
 * Confirm payment
 * POST /api/payments/:id/confirm
 */
export const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { transactionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid payment ID', 400));
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Check permission
    if (payment.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to confirm this payment', 403));
    }

    // Update payment status
    payment.status = 'completed';
    payment.stripeChargeId = transactionId || `txn_${Date.now()}`;
    payment.paidAt = new Date();

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { payment },
    });
  }
);

/**
 * Get payments
 * GET /api/payments
 */
export const getPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { status, projectId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};

    // Filter by role
    if (req.user.role === 'user') {
      query.userId = req.user.userId;
    } else if (req.user.role === 'contractor') {
      query.contractorId = req.user.userId;
    }
    // Admin can see all

    if (status) {
      query.status = status;
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
        return next(new AppError('Invalid project ID', 400));
      }
      query.projectId = projectId;
    }

    const payments = await Payment.find(query)
      .populate('projectId', 'title type budget')
      .populate('userId', 'name email')
      .populate('contractorId', 'company email')
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
 * Get single payment
 * GET /api/payments/:id
 */
export const getPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid payment ID', 400));
    }

    const payment = await Payment.findById(id)
      .populate('projectId', 'title type budget status')
      .populate('userId', 'name email phone')
      .populate('contractorId', 'company email phone');

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Check permission
    const isOwner = payment.userId._id.toString() === req.user.userId;
    const isContractor = payment.contractorId?._id.toString() === req.user.userId;
    const isAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isContractor && !isAdmin) {
      return next(new AppError('You do not have permission to view this payment', 403));
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  }
);

/**
 * Request refund
 * POST /api/payments/:id/refund
 */
export const requestRefund = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid payment ID', 400));
    }

    if (!reason || reason.trim().length === 0) {
      return next(new AppError('Refund reason is required', 400));
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Check permission
    if (payment.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('You do not have permission to request refund for this payment', 403));
    }

    // Check if payment can be refunded
    if (payment.status !== 'completed') {
      return next(new AppError('Only completed payments can be refunded', 400));
    }

    // Update refund info
    payment.status = 'pending';
    payment.refundReason = reason.trim();

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: { payment },
    });
  }
);

/**
 * Process refund (admin only)
 * POST /api/payments/:id/process-refund
 */
export const processRefund = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'super_admin') {
      return next(new AppError('Only admins can process refunds', 403));
    }

    const { id } = req.params;
    const { approved, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid payment ID', 400));
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    if (!payment.refundReason) {
      return next(new AppError('No pending refund request for this payment', 400));
    }

    // Update refund status
    if (approved) {
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.refundAmount = payment.amount;
      // In real implementation, process Stripe refund here
      // await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
    } else {
      payment.status = 'completed';
      payment.refundReason = `Rejected: ${adminNotes || 'No reason provided'}`;
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: `Refund ${approved ? 'approved' : 'rejected'} successfully`,
      data: { payment },
    });
  }
);

/**
 * Handle Stripe webhook
 * POST /api/payments/webhook
 */
export const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return next(new AppError('Missing stripe signature', 400));
    }

    // In real implementation, verify webhook signature
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });
  }
);

/**
 * Get payment analytics
 * GET /api/payments/analytics
 */
export const getPaymentAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const query: any = {};

    // Filter by role
    if (req.user.role === 'user') {
      query.userId = req.user.userId;
    } else if (req.user.role === 'contractor') {
      query.contractorId = req.user.userId;
    }

    const payments = await Payment.find(query);

    const analytics = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: payments.filter((p) => p.status === 'completed').length,
      completedAmount: payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: payments.filter((p) => p.status === 'pending').length,
      pendingAmount: payments
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      refundedPayments: payments.filter((p) => p.status === 'refunded').length,
      refundedAmount: payments
        .filter((p) => p.status === 'refunded')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  }
);

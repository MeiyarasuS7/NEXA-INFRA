import { Request, Response, NextFunction } from 'express';
import Payment, { PaymentMethod } from '../models/Payment';
import Project from '../models/Project';
import Contractor from '../models/Contractor';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

const getContractorProfileIdForUser = async (userId: string) => {
  const contractor = await Contractor.findOne({ userId }).select('_id');
  return contractor?._id || null;
};

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

    if (!project.contractorId) {
      return next(new AppError('A contractor must be assigned before creating payments', 400));
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
      metadata: {
        milestone: milestoneId,
        notes: description,
      },
      transactionFee: 0,
      netAmount: amount,
      invoiceNumber: `INV-${Date.now()}`,
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
 * Submit offline payment proof
 * POST /api/payments/offline
 */
export const submitOfflinePayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { projectId, amount, paymentMethod, referenceNumber, notes, proofUrl, paidAt } = req.body;

    if (!projectId || !referenceNumber || !paymentMethod) {
      return next(new AppError('Project ID, payment method, and reference number are required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError('Invalid project ID', 400));
    }

    const allowedOfflineMethods: PaymentMethod[] = ['bank_transfer', 'check', 'cash', 'other'];
    if (!allowedOfflineMethods.includes(paymentMethod)) {
      return next(new AppError('Invalid offline payment method', 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.userId.toString() !== req.user.userId && req.user.role !== 'super_admin') {
      return next(new AppError('Only the project owner can submit offline payment proof', 403));
    }

    const paymentAmount = Number(amount || project.budget);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return next(new AppError('A valid payment amount is required', 400));
    }

    let payment = await Payment.findOne({
      projectId,
      userId: project.userId,
      status: { $in: ['pending', 'verification_pending', 'rejected'] },
    }).sort({ createdAt: -1 });

    if (!payment) {
      const completedPayment = await Payment.findOne({ projectId, userId: project.userId, status: 'completed' });
      if (completedPayment) {
        return next(new AppError('This project already has a verified payment', 400));
      }

      payment = await Payment.create({
        projectId,
        userId: project.userId,
        contractorId: project.contractorId || null,
        amount: paymentAmount,
        status: 'verification_pending',
        paymentMethod,
        description: `Offline payment for ${project.title}`,
        metadata: {
          notes,
        },
        offlineVerification: {
          referenceNumber: String(referenceNumber).trim(),
          notes,
          proofUrl,
          submittedAt: new Date(),
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        },
        transactionFee: 0,
        netAmount: paymentAmount,
        invoiceNumber: `OFF-${Date.now()}`,
      });
    } else {
      payment.amount = paymentAmount;
      payment.paymentMethod = paymentMethod;
      payment.contractorId = project.contractorId || null;
      payment.status = 'verification_pending';
      payment.description = `Offline payment for ${project.title}`;
      payment.metadata = {
        ...payment.metadata,
        notes,
      };
      payment.offlineVerification = {
        referenceNumber: String(referenceNumber).trim(),
        notes,
        proofUrl,
        submittedAt: new Date(),
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        verifiedBy: null as any,
        verifiedAt: undefined,
        verificationNotes: undefined,
        rejectionReason: undefined,
      };
      payment.refundReason = undefined;
      payment.refundedAt = undefined;
      payment.refundAmount = 0;
      payment.paidAt = undefined;
      await payment.save();
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('projectId', 'title type budget status')
      .populate('userId', 'name email phone')
      .populate('contractorId', 'company');

    res.status(201).json({
      success: true,
      message: 'Offline payment proof submitted successfully',
      data: { payment: populatedPayment },
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
      const contractorProfileId = await getContractorProfileIdForUser(req.user.userId);

      if (!contractorProfileId) {
        res.status(200).json({
          success: true,
          data: {
            payments: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
            },
          },
        });
        return;
      }

      query.contractorId = contractorProfileId;
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
 * Get latest payment by project
 * GET /api/payments/project/:projectId
 */
export const getPaymentByProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError('Invalid project ID', 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    const contractorProfileId =
      req.user.role === 'contractor' ? await getContractorProfileIdForUser(req.user.userId) : null;

    const isOwner = project.userId.toString() === req.user.userId;
    const isContractor = project.contractorId?.toString() === contractorProfileId?.toString();
    const isAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isContractor && !isAdmin) {
      return next(new AppError('You do not have permission to view this payment', 403));
    }

    const payment = await Payment.findOne({ projectId })
      .populate('projectId', 'title type budget status')
      .populate('userId', 'name email phone')
      .populate('contractorId', 'company email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { payment },
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
    const contractorProfileId =
      req.user.role === 'contractor' ? await getContractorProfileIdForUser(req.user.userId) : null;
    const isOwner = payment.userId._id.toString() === req.user.userId;
    const isContractor = payment.contractorId?._id.toString() === contractorProfileId?.toString();
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
 * Verify offline payment (admin only)
 * POST /api/payments/:id/verify-offline
 */
export const verifyOfflinePayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'super_admin') {
      return next(new AppError('Only admins can verify offline payments', 403));
    }

    const { id } = req.params;
    const { approved, verificationNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid payment ID', 400));
    }

    if (typeof approved !== 'boolean') {
      return next(new AppError('approved must be provided', 400));
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    if (!payment.offlineVerification) {
      return next(new AppError('This payment was not submitted for offline verification', 400));
    }

    if (payment.status !== 'verification_pending' && payment.status !== 'rejected') {
      return next(new AppError('This payment is not waiting for offline verification', 400));
    }

    payment.offlineVerification.verifiedBy = new mongoose.Types.ObjectId(req.user.userId);
    payment.offlineVerification.verifiedAt = new Date();
    payment.offlineVerification.verificationNotes = verificationNotes?.trim() || undefined;

    if (approved) {
      payment.status = 'completed';
      payment.paidAt = payment.offlineVerification.paidAt || new Date();
      payment.offlineVerification.rejectionReason = undefined;
    } else {
      if (!verificationNotes || !String(verificationNotes).trim()) {
        return next(new AppError('A rejection reason is required', 400));
      }

      payment.status = 'rejected';
      payment.paidAt = undefined;
      payment.offlineVerification.rejectionReason = String(verificationNotes).trim();
    }

    await payment.save();

    const populatedPayment = await Payment.findById(id)
      .populate('projectId', 'title type budget status')
      .populate('userId', 'name email phone')
      .populate('contractorId', 'company');

    res.status(200).json({
      success: true,
      message: approved ? 'Offline payment approved successfully' : 'Offline payment rejected successfully',
      data: { payment: populatedPayment },
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
      const contractorProfileId = await getContractorProfileIdForUser(req.user.userId);

      if (!contractorProfileId) {
        res.status(200).json({
          success: true,
          data: {
            analytics: {
              totalPayments: 0,
              totalAmount: 0,
              completedPayments: 0,
              completedAmount: 0,
              pendingPayments: 0,
              pendingAmount: 0,
              refundedPayments: 0,
              refundedAmount: 0,
            },
          },
        });
        return;
      }

      query.contractorId = contractorProfileId;
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

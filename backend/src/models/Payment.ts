import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 
  | 'pending'
  | 'verification_pending'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed';

export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'stripe' | 'check' | 'cash' | 'other';

export interface IOfflineVerification {
  referenceNumber: string;
  notes?: string;
  proofUrl?: string;
  submittedAt: Date;
  paidAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  rejectionReason?: string;
}

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contractorId?: mongoose.Types.ObjectId | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  description: string;
  metadata?: {
    milestone?: string;
    phase?: string;
    notes?: string;
  };
  offlineVerification?: IOfflineVerification | null;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  transactionFee: number;
  netAmount: number;
  receiptUrl?: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: 'Contractor',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verification_pending', 'rejected', 'processing', 'completed', 'failed', 'refunded', 'disputed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet', 'stripe', 'check', 'cash', 'other'],
      required: [true, 'Payment method is required'],
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeChargeId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Payment description is required'],
      trim: true,
    },
    metadata: {
      milestone: { type: String },
      phase: { type: String },
      notes: { type: String },
    },
    offlineVerification: {
      referenceNumber: { type: String, trim: true },
      notes: { type: String, trim: true },
      proofUrl: { type: String, trim: true },
      submittedAt: { type: Date },
      paidAt: { type: Date },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      verifiedAt: { type: Date, default: null },
      verificationNotes: { type: String, trim: true },
      rejectionReason: { type: String, trim: true },
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    transactionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate net amount
paymentSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('transactionFee')) {
    this.netAmount = this.amount - this.transactionFee;
  }
  next();
});

// Indexes for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ contractorId: 1, status: 1 });
paymentSchema.index({ projectId: 1 });
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;

import mongoose, { Schema, Document } from 'mongoose';

export interface IContractor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  company?: string;
  specialties: string[];
  bio?: string;
  experience: number; // years
  rating: number;
  totalProjects: number;
  completionRate: number;
  portfolio: Array<{
    title: string;
    description: string;
    image: string;
    completedDate: Date;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: Date;
    document?: string;
  }>;
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate?: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contractorSchema = new Schema<IContractor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    specialties: {
      type: [String],
      required: [true, 'At least one specialty is required'],
      validate: {
        validator: (v: string[]) => v && v.length > 0,
        message: 'At least one specialty is required',
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalProjects: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        completedDate: { type: Date },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String },
        date: { type: Date },
        document: { type: String },
      },
    ],
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Indexes
contractorSchema.index({ userId: 1 });
contractorSchema.index({ specialties: 1 });
contractorSchema.index({ rating: -1 });
contractorSchema.index({ isVerified: 1, isActive: 1 });

const Contractor = mongoose.model<IContractor>('Contractor', contractorSchema);

export default Contractor;

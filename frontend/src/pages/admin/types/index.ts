// ============================= ADMIN TYPES =============================

import type { Project, Contractor, User, Review } from "@/types";

// Admin Dashboard Stats
export interface AdminStats {
  totalContractors: number;
  activeProjects: number;
  monthlyRevenue: number;
  completionRate: number;
  totalUsers: number;
  disputes: number;
  pendingApprovals: number;
}

// Payment Management
export interface PaymentRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  status: PaymentVerificationStatus;
  date: string;
  proofUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export type PaymentVerificationStatus = 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'DISPUTED' 
  | 'REFUNDED'
  | 'REJECTED';

// Dispute Management
export interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  contractorId: string;
  contractorName: string;
  reason: string;
  description: string;
  filedDate: string;
  status: DisputeManagementStatus;
  budget: number;
  evidence?: DisputeEvidence[];
  resolution?: DisputeResolution;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export type DisputeManagementStatus = 
  | 'OPEN' 
  | 'UNDER_REVIEW' 
  | 'RESOLVED'
  | 'ESCALATED'
  | 'CLOSED';

export interface DisputeEvidence {
  id: string;
  type: 'image' | 'document' | 'video';
  url: string;
  uploadedBy: 'user' | 'contractor';
  uploadedAt: string;
  description?: string;
}

export interface DisputeResolution {
  resolvedBy: string;
  resolvedAt: string;
  resolution: 'favor_user' | 'favor_contractor' | 'split' | 'other';
  notes: string;
  refundAmount?: number;
}

// Review Management
export interface ReviewModeration {
  review: Review;
  reportCount: number;
  reportReasons: string[];
  status: 'approved' | 'pending' | 'flagged' | 'removed';
  moderatedBy?: string;
  moderatedAt?: string;
}

// Analytics
export interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue[];
  projectStats: ProjectStats[];
  statusDistribution: StatusDistribution[];
  topContractors: TopContractor[];
  userGrowth: UserGrowth[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  projectCount: number;
}

export interface ProjectStats {
  month: string;
  completed: number;
  started: number;
  disputed: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TopContractor {
  id: string;
  name: string;
  projects: number;
  revenue: string;
  rating: number;
  avatar?: string;
}

export interface UserGrowth {
  month: string;
  users: number;
  contractors: number;
}

// Settings
export interface PlatformSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  payment: PaymentSettings;
  features: FeatureFlags;
}

export interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  supportPhone?: string;
  maintenanceMode: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  emailVerification: boolean;
  autoApproveContractors: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface NotificationSettings {
  newContractorAlerts: boolean;
  disputeAlerts: boolean;
  paymentAlerts: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
}

export interface PaymentSettings {
  platformFee: number;
  minAdvancePercentage: number;
  paymentVerificationDelay: number;
  refundProcessingDays: number;
}

export interface FeatureFlags {
  aiChatbot: boolean;
  realTimeChat: boolean;
  videoCallsEnabled: boolean;
  autoAssignContractors: boolean;
  disputeAutoResolution: boolean;
}

// Filters and Search
export interface AdminFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Actions
export interface ContractorAction {
  contractorId: string;
  action: 'approve' | 'reject' | 'suspend' | 'activate';
  reason?: string;
  adminId: string;
}

export interface ProjectAction {
  projectId: string;
  action: 'approve' | 'cancel' | 'reassign' | 'resolve_dispute';
  reason?: string;
  adminId: string;
  newContractorId?: string;
}

export interface ReviewAction {
  reviewId: string;
  action: 'approve' | 'flag' | 'remove';
  reason?: string;
  adminId: string;
}

export interface PaymentAction {
  paymentId: string;
  action: 'verify' | 'reject' | 'refund';
  reason?: string;
  adminId: string;
}

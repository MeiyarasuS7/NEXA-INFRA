// ============================= CORE TYPES =============================

export type UserRole = 'super_admin' | 'contractor' | 'user';

export type ProjectStatus = 
  | 'pending' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed';

export type ContractorStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';

export type NotificationType = 
  | 'payment_approved'
  | 'contractor_assigned'
  | 'project_updated'
  | 'message_received'
  | 'dispute_created'
  | 'review_submitted'
  | 'system_alert';

// ============================= USER MANAGEMENT =============================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Profile specific fields
  address?: Address;
  preferences?: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  language: string;
  timezone: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  project_updates: boolean;
  payment_updates: boolean;
  marketing_emails: boolean;
}

// ============================= CONTRACTOR MANAGEMENT =============================

export interface Contractor {
  id: string;
  user_id: string;
  user: User; // Populated user data
  company_name: string;
  business_license: string;
  expertise_areas: string[];
  location: string;
  description: string;
  hourly_rate?: number;
  
  // Status & Verification
  status: ContractorStatus;
  verified: boolean;
  verification_date?: string;
  approved_by?: string; // Super Admin ID
  
  // Performance Metrics
  rating: number;
  review_count: number;
  completed_projects: number;
  active_projects: number;
  total_earnings: number;
  
  // Professional Info
  years_experience: number;
  certifications: Certification[];
  portfolio: PortfolioItem[];
  availability: ContractorAvailability;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Additional
  avatar?: string;
  cover_image?: string;
  social_links?: SocialLinks;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  verified: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  completion_date: string;
  project_value?: number;
  client_testimonial?: string;
}

export interface ContractorAvailability {
  is_available: boolean;
  max_concurrent_projects: number;
  preferred_project_size: 'small' | 'medium' | 'large' | 'any';
  travel_radius_km: number;
}

export interface SocialLinks {
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

// ============================= PROJECT MANAGEMENT =============================

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  
  // Status & Progress
  status: ProjectStatus;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Parties
  user_id: string;
  user: User; // Populated user data
  contractor_id?: string;
  contractor?: Contractor; // Populated contractor data
  assigned_by?: string; // Super Admin ID who assigned contractor
  
  // Financial
  budget: number;
  estimated_cost?: number;
  final_cost?: number;
  
  // Timeline
  start_date?: string;
  estimated_completion?: string;
  actual_completion?: string;
  
  // Location & Requirements
  location: Address;
  requirements: ProjectRequirements;
  
  // Project Details
  milestones: Milestone[];
  images: ProjectImage[];
  documents: ProjectDocument[];
  
  // Communication
  last_update?: string;
  update_message?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Related Records
  payment?: Payment;
  reviews?: Review[];
  disputes?: Dispute[];
}

export interface ProjectRequirements {
  materials_provided: boolean;
  equipment_needed: string[];
  special_requirements?: string;
  access_restrictions?: string;
  timeline_flexibility: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  completion_date?: string;
  verified_by?: string;
  payment_percentage?: number;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption?: string;
  uploaded_by: string;
  upload_date: string;
  image_type: 'before' | 'progress' | 'after' | 'issue' | 'other';
}

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  upload_date: string;
  document_type: 'contract' | 'permit' | 'invoice' | 'receipt' | 'other';
}

// ============================= PAYMENT SYSTEM =============================

export interface Payment {
  id: string;
  project_id: string;
  user_id: string;
  contractor_id?: string;
  
  // Payment Details
  total_amount: number;
  advance_amount: number;
  remaining_amount: number;
  currency: string;
  
  // Status & Workflow
  payment_status: PaymentStatus;
  payment_method: 'bank_transfer' | 'check' | 'cash' | 'other';
  
  // Verification
  payment_proof?: PaymentProof;
  verified_by?: string; // Super Admin ID
  verification_date?: string;
  verification_notes?: string;
  
  // Timeline
  initiated_at: string;
  due_date?: string;
  paid_date?: string;
  
  // Additional
  transaction_reference?: string;
  bank_details?: BankDetails;
  receipts: PaymentReceipt[];
}

export interface PaymentProof {
  id: string;
  payment_screenshot?: string;
  transaction_id?: string;
  bank_reference?: string;
  uploaded_at: string;
  notes?: string;
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  routing_number?: string;
  account_holder_name: string;
}

export interface PaymentReceipt {
  id: string;
  receipt_url: string;
  amount: number;
  receipt_date: string;
  receipt_type: 'advance' | 'milestone' | 'final' | 'refund';
}

// ============================= REVIEW & RATING SYSTEM =============================

export interface Review {
  id: string;
  project_id: string;
  contractor_id: string;
  user_id: string;
  
  // Review Content
  rating: number; // 1-5
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  
  // Moderation
  status: ReviewStatus;
  moderated_by?: string; // Super Admin ID
  moderation_notes?: string;
  moderated_at?: string;
  
  // Metadata
  project_title?: string;
  contractor_name?: string;
  user_name?: string;
  
  // Engagement
  helpful_votes: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Response
  contractor_response?: ContractorResponse;
}

export interface ContractorResponse {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================= DISPUTE RESOLUTION =============================

export interface Dispute {
  id: string;
  project_id: string;
  user_id: string;
  contractor_id: string;
  
  // Dispute Details
  title: string;
  description: string;
  dispute_reason: DisputeReason;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Status & Resolution
  status: DisputeStatus;
  resolution_type?: 'refund' | 'contractor_change' | 'project_continue' | 'other';
  resolution_notes?: string;
  resolved_by?: string; // Super Admin ID
  
  // Evidence
  evidence: DisputeEvidence[];
  
  // Timeline
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Communication
  conversation_id?: string;
}

export type DisputeReason = 
  | 'poor_quality_work'
  | 'missed_deadline'
  | 'cost_overrun'
  | 'safety_concerns'
  | 'communication_issues'
  | 'contract_violation'
  | 'payment_issues'
  | 'other';

export interface DisputeEvidence {
  id: string;
  evidence_type: 'image' | 'document' | 'video' | 'audio';
  file_url: string;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

// ============================= NOTIFICATION SYSTEM =============================

export interface Notification {
  id: string;
  user_id: string;
  
  // Notification Content
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  
  // Status
  read: boolean;
  read_at?: string;
  
  // Metadata
  priority: 'low' | 'normal' | 'high' | 'urgent';
  related_entity?: {
    type: 'project' | 'payment' | 'dispute' | 'review' | 'contractor';
    id: string;
  };
  
  // Actions
  action_url?: string;
  action_text?: string;
  
  // Timestamps
  created_at: string;
  expires_at?: string;
}

// ============================= CHAT SYSTEM =============================

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: UserRole;
  
  // Message Content
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  
  // Attachments
  attachments?: MessageAttachment[];
  
  // Status
  read: boolean;
  read_at?: string;
  
  // Metadata
  reply_to?: string; // Message ID for replies
  edited: boolean;
  edited_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  
  // Conversation Type
  conversation_type: 'project' | 'dispute' | 'support';
  related_entity_id?: string; // Project ID, Dispute ID, etc.
  
  // Status
  status: 'active' | 'archived' | 'closed';
  
  // Metadata
  title?: string;
  last_message?: ChatMessage;
  unread_count: Record<string, number>; // user_id -> count
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  user_id: string;
  user: User;
  joined_at: string;
  role: 'admin' | 'participant';
}

// ============================= ANALYTICS & REPORTING =============================

export interface DashboardMetrics {
  // Super Admin Metrics
  total_users: number;
  total_contractors: number;
  total_projects: number;
  total_revenue: number;
  pending_payments: number;
  active_disputes: number;
  
  // Growth Metrics
  monthly_growth: {
    users: number;
    contractors: number;
    projects: number;
    revenue: number;
  };
  
  // Status Breakdowns
  project_status_breakdown: Record<ProjectStatus, number>;
  payment_status_breakdown: Record<PaymentStatus, number>;
  contractor_status_breakdown: Record<ContractorStatus, number>;
}

export interface ContractorMetrics {
  total_projects: number;
  completed_projects: number;
  in_progress_projects: number;
  total_earnings: number;
  average_rating: number;
  response_rate: number;
  completion_rate: number;
  on_time_delivery: number;
}

export interface UserMetrics {
  total_projects: number;
  completed_projects: number;
  total_spent: number;
  average_project_value: number;
  satisfaction_score: number;
}

// ============================= AUDIT & SYSTEM =============================

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  
  // Action Details
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  
  // Changes
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  
  // Context
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  
  // Metadata
  description?: string;
  
  // Timestamp
  created_at: string;
}

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'transfer_ownership'
  | 'verify_payment'
  | 'resolve_dispute';

export interface SystemSettings {
  id: string;
  
  // Platform Settings
  platform_name: string;
  platform_description: string;
  contact_email: string;
  support_phone?: string;
  
  // Business Rules
  max_projects_per_contractor: number;
  min_advance_percentage: number;
  review_moderation_required: boolean;
  auto_assign_contractors: boolean;
  
  // Notification Settings
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  
  // File Upload
  max_file_size_mb: number;
  allowed_file_types: string[];
  
  // Feature Flags
  features: {
    google_oauth: boolean;
    ai_chatbot: boolean;
    payment_gateway: boolean;
    video_calls: boolean;
  };
  
  // Timestamps
  updated_at: string;
  updated_by: string;
}

// ============================= API RESPONSE TYPES =============================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

export interface StatusCount {
  status: string;
  count: number;
  label?: string;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// ============================= FORM TYPES =============================

export interface ProjectRequest {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: Address;
  requirements: ProjectRequirements;
  preferred_start_date?: string;
  images?: File[];
  documents?: File[];
}

export interface PaymentVerification {
  payment_id: string;
  verification_notes?: string;
  approved: boolean;
}

export interface DisputeSubmission {
  project_id: string;
  title: string;
  description: string;
  dispute_reason: DisputeReason;
  evidence_files?: File[];
}

// ============================= ADMIN CONSTANTS =============================

import type { ProjectStatus, ContractorStatus } from "@/types";

// Status Filters
export const PROJECT_STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Disputed", value: "DISPUTED" },
] as const;

export const CONTRACTOR_STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
] as const;

export const PAYMENT_STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Disputed", value: "DISPUTED" },
  { label: "Refunded", value: "REFUNDED" },
] as const;

export const DISPUTE_STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
] as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  low: { label: "Low", color: "hsl(205, 80%, 50%)" },
  medium: { label: "Medium", color: "hsl(38, 92%, 50%)" },
  high: { label: "High", color: "hsl(24, 85%, 52%)" },
  urgent: { label: "Urgent", color: "hsl(0, 72%, 51%)" },
} as const;

// Status Colors
export const STATUS_COLORS: Record<string, string> = {
  PENDING: "hsl(38, 92%, 50%)",
  APPROVED: "hsl(152, 60%, 40%)",
  ACTIVE: "hsl(152, 60%, 40%)",
  REJECTED: "hsl(0, 72%, 51%)",
  SUSPENDED: "hsl(0, 72%, 51%)",
  IN_PROGRESS: "hsl(205, 80%, 50%)",
  COMPLETED: "hsl(152, 60%, 40%)",
  DISPUTED: "hsl(0, 72%, 51%)",
  VERIFIED: "hsl(152, 60%, 40%)",
  REFUNDED: "hsl(38, 92%, 50%)",
  OPEN: "hsl(0, 72%, 51%)",
  UNDER_REVIEW: "hsl(38, 92%, 50%)",
  RESOLVED: "hsl(152, 60%, 40%)",
  CLOSED: "hsl(215, 12%, 48%)",
};

// Date Ranges
export const DATE_RANGES = {
  today: { label: "Today", days: 0 },
  week: { label: "Last 7 Days", days: 7 },
  month: { label: "Last 30 Days", days: 30 },
  quarter: { label: "Last 90 Days", days: 90 },
  year: { label: "Last Year", days: 365 },
} as const;

// Pagination
export const PAGINATION_LIMITS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

// Admin Navigation
export const ADMIN_NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/admin/contractors", label: "Contractors", icon: "Users" },
  { path: "/admin/projects", label: "Projects", icon: "FolderKanban" },
  { path: "/admin/payments", label: "Payments", icon: "DollarSign" },
  { path: "/admin/disputes", label: "Disputes", icon: "AlertTriangle" },
  { path: "/admin/reviews", label: "Reviews", icon: "Star" },
  { path: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { path: "/admin/settings", label: "Settings", icon: "Settings" },
] as const;

// Chart Colors
export const CHART_COLORS = {
  primary: "hsl(24, 85%, 52%)",
  secondary: "hsl(42, 95%, 55%)",
  success: "hsl(152, 60%, 40%)",
  danger: "hsl(0, 72%, 51%)",
  warning: "hsl(38, 92%, 50%)",
  info: "hsl(205, 80%, 50%)",
  muted: "hsl(215, 12%, 48%)",
} as const;

// Export Formats
export const EXPORT_FORMATS = [
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "xlsx" },
  { label: "PDF", value: "pdf" },
  { label: "JSON", value: "json" },
] as const;

// Time Formats
export const TIME_FORMAT = "hh:mm A";
export const DATE_FORMAT = "MMM DD, YYYY";
export const DATETIME_FORMAT = "MMM DD, YYYY hh:mm A";

// Validation
export const VALIDATION_RULES = {
  minPasswordLength: 8,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedDocumentTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  maxImagesPerProject: 10,
  maxDocumentsPerProject: 5,
} as const;

// API Endpoints (relative to base URL)
export const API_ENDPOINTS = {
  STATS: "/admin/stats",
  CONTRACTORS: "/admin/contractors",
  PROJECTS: "/admin/projects",
  PAYMENTS: "/admin/payments",
  DISPUTES: "/admin/disputes",
  REVIEWS: "/admin/reviews",
  ANALYTICS: "/admin/analytics",
  SETTINGS: "/admin/settings",
  USERS: "/admin/users",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

// Action Confirmation Messages
export const CONFIRMATION_MESSAGES = {
  APPROVE_CONTRACTOR: "Are you sure you want to approve this contractor?",
  REJECT_CONTRACTOR: "Are you sure you want to reject this contractor?",
  SUSPEND_CONTRACTOR: "Are you sure you want to suspend this contractor?",
  DELETE_REVIEW: "Are you sure you want to delete this review?",
  RESOLVE_DISPUTE: "Are you sure you want to resolve this dispute?",
  VERIFY_PAYMENT: "Are you sure you want to verify this payment?",
  REJECT_PAYMENT: "Are you sure you want to reject this payment?",
} as const;

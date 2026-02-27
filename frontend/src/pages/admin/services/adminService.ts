// ============================= ADMIN API SERVICE =============================

import { apiClient } from "@/services/api";
import type {
  AdminStats,
  PaymentRecord,
  Dispute,
  AnalyticsData,
  PlatformSettings,
  ContractorAction,
  ProjectAction,
  ReviewAction,
  PaymentAction,
  AdminFilters
} from "../types";
import type { Contractor, Project, Review, User } from "@/types";

// ============================= DASHBOARD =============================

export const adminDashboardService = {
  getStats: async (): Promise<AdminStats> => {
    return await apiClient.get("/admin/stats");
  },
  
  getRecentActivity: async () => {
    return await apiClient.get("/admin/recent-activity");
  },
};

// ============================= CONTRACTORS =============================

export const adminContractorService = {
  getAll: async (filters?: AdminFilters): Promise<Contractor[]> => {
    return await apiClient.get("/admin/contractors", { params: filters });
  },
  
  getById: async (id: string): Promise<Contractor> => {
    return await apiClient.get(`/admin/contractors/${id}`);
  },
  
  performAction: async (action: ContractorAction): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post(`/admin/contractors/${action.contractorId}/action`, action);
  },
  
  getPendingApprovals: async (): Promise<Contractor[]> => {
    return await apiClient.get("/admin/contractors/pending");
  },
};

// ============================= PROJECTS =============================

export const adminProjectService = {
  getAll: async (filters?: AdminFilters): Promise<Project[]> => {
    return await apiClient.get("/admin/projects", { params: filters });
  },
  
  getById: async (id: string): Promise<Project> => {
    return await apiClient.get(`/admin/projects/${id}`);
  },
  
  performAction: async (action: ProjectAction): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post(`/admin/projects/${action.projectId}/action`, action);
  },
  
  assignContractor: async (projectId: string, contractorId: string): Promise<{ success: boolean }> => {
    return await apiClient.post(`/admin/projects/${projectId}/assign`, { contractorId });
  },
};

// ============================= PAYMENTS =============================

export const adminPaymentService = {
  getAll: async (filters?: AdminFilters): Promise<PaymentRecord[]> => {
    return await apiClient.get("/admin/payments", { params: filters });
  },
  
  getById: async (id: string): Promise<PaymentRecord> => {
    return await apiClient.get(`/admin/payments/${id}`);
  },
  
  performAction: async (action: PaymentAction): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post(`/admin/payments/${action.paymentId}/action`, action);
  },
  
  getPending: async (): Promise<PaymentRecord[]> => {
    return await apiClient.get("/admin/payments/pending");
  },
};

// ============================= DISPUTES =============================

export const adminDisputeService = {
  getAll: async (filters?: AdminFilters): Promise<Dispute[]> => {
    return await apiClient.get("/admin/disputes", { params: filters });
  },
  
  getById: async (id: string): Promise<Dispute> => {
    return await apiClient.get(`/admin/disputes/${id}`);
  },
  
  resolve: async (
    disputeId: string, 
    resolution: 'favor_user' | 'favor_contractor' | 'split', 
    notes: string
  ): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post(`/admin/disputes/${disputeId}/resolve`, { resolution, notes });
  },
  
  escalate: async (disputeId: string, reason: string): Promise<{ success: boolean }> => {
    return await apiClient.post(`/admin/disputes/${disputeId}/escalate`, { reason });
  },
  
  getActive: async (): Promise<Dispute[]> => {
    return await apiClient.get("/admin/disputes/active");
  },
};

// ============================= REVIEWS =============================

export const adminReviewService = {
  getAll: async (filters?: AdminFilters): Promise<Review[]> => {
    return await apiClient.get("/admin/reviews", { params: filters });
  },
  
  getById: async (id: string): Promise<Review> => {
    return await apiClient.get(`/admin/reviews/${id}`);
  },
  
  performAction: async (action: ReviewAction): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post(`/admin/reviews/${action.reviewId}/action`, action);
  },
  
  getFlagged: async (): Promise<Review[]> => {
    return await apiClient.get("/admin/reviews/flagged");
  },
};

// ============================= ANALYTICS =============================

export const adminAnalyticsService = {
  getOverview: async (): Promise<AnalyticsData> => {
    return await apiClient.get("/admin/analytics/overview");
  },
  
  getRevenue: async (startDate: string, endDate: string) => {
    return await apiClient.get("/admin/analytics/revenue", {
      params: { startDate, endDate }
    });
  },
  
  getProjectMetrics: async () => {
    return await apiClient.get("/admin/analytics/projects");
  },
  
  getContractorPerformance: async () => {
    return await apiClient.get("/admin/analytics/contractors");
  },
};

// ============================= SETTINGS =============================

export const adminSettingsService = {
  get: async (): Promise<PlatformSettings> => {
    return await apiClient.get("/admin/settings");
  },
  
  update: async (settings: Partial<PlatformSettings>): Promise<{ success: boolean; message: string }> => {
    return await apiClient.put("/admin/settings", settings);
  },
  
  updateGeneral: async (settings: Partial<PlatformSettings['general']>) => {
    return await apiClient.put("/admin/settings/general", settings);
  },
  
  updateSecurity: async (settings: Partial<PlatformSettings['security']>) => {
    return await apiClient.put("/admin/settings/security", settings);
  },
  
  updatePayment: async (settings: Partial<PlatformSettings['payment']>) => {
    return await apiClient.put("/admin/settings/payment", settings);
  },
};

// ============================= USERS =============================

export const adminUserService = {
  getAll: async (filters?: AdminFilters): Promise<User[]> => {
    return await apiClient.get("/admin/users", { params: filters });
  },
  
  getById: async (id: string): Promise<User> => {
    return await apiClient.get(`/admin/users/${id}`);
  },
  
  suspend: async (userId: string, reason: string) => {
    return await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  },
  
  activate: async (userId: string) => {
    return await apiClient.post(`/admin/users/${userId}/activate`);
  },
};

// ============================= EXPORT ALL SERVICES =============================

export const adminService = {
  dashboard: adminDashboardService,
  contractors: adminContractorService,
  projects: adminProjectService,
  payments: adminPaymentService,
  disputes: adminDisputeService,
  reviews: adminReviewService,
  analytics: adminAnalyticsService,
  settings: adminSettingsService,
  users: adminUserService,
};

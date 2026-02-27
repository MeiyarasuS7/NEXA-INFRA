// ============================= ADMIN HOOKS =============================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services";
import type {
  AdminFilters,
  ContractorAction,
  ProjectAction,
  ReviewAction,
  PaymentAction
} from "../types";

// ============================= DASHBOARD =============================

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.dashboard.getStats(),
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["admin", "recentActivity"],
    queryFn: () => adminService.dashboard.getRecentActivity(),
  });
};

// ============================= CONTRACTORS =============================

export const useAdminContractors = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admin", "contractors", filters],
    queryFn: () => adminService.contractors.getAll(filters),
  });
};

export const useAdminContractor = (id: string) => {
  return useQuery({
    queryKey: ["admin", "contractor", id],
    queryFn: () => adminService.contractors.getById(id),
    enabled: !!id,
  });
};

export const usePendingContractors = () => {
  return useQuery({
    queryKey: ["admin", "contractors", "pending"],
    queryFn: () => adminService.contractors.getPendingApprovals(),
  });
};

export const useContractorAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: ContractorAction) => adminService.contractors.performAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contractors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

// ============================= PROJECTS =============================

export const useAdminProjects = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admin", "projects", filters],
    queryFn: () => adminService.projects.getAll(filters),
  });
};

export const useAdminProject = (id: string) => {
  return useQuery({
    queryKey: ["admin", "project", id],
    queryFn: () => adminService.projects.getById(id),
    enabled: !!id,
  });
};

export const useProjectAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: ProjectAction) => adminService.projects.performAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

export const useAssignContractor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, contractorId }: { projectId: string; contractorId: string }) =>
      adminService.projects.assignContractor(projectId, contractorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
};

// ============================= PAYMENTS =============================

export const useAdminPayments = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admin", "payments", filters],
    queryFn: () => adminService.payments.getAll(filters),
  });
};

export const useAdminPayment = (id: string) => {
  return useQuery({
    queryKey: ["admin", "payment", id],
    queryFn: () => adminService.payments.getById(id),
    enabled: !!id,
  });
};

export const usePendingPayments = () => {
  return useQuery({
    queryKey: ["admin", "payments", "pending"],
    queryFn: () => adminService.payments.getPending(),
  });
};

export const usePaymentAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: PaymentAction) => adminService.payments.performAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

// ============================= DISPUTES =============================

export const useAdminDisputes = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admin", "disputes", filters],
    queryFn: () => adminService.disputes.getAll(filters),
  });
};

export const useAdminDispute = (id: string) => {
  return useQuery({
    queryKey: ["admin", "dispute", id],
    queryFn: () => adminService.disputes.getById(id),
    enabled: !!id,
  });
};

export const useActiveDisputes = () => {
  return useQuery({
    queryKey: ["admin", "disputes", "active"],
    queryFn: () => adminService.disputes.getActive(),
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      disputeId, 
      resolution, 
      notes 
    }: { 
      disputeId: string; 
      resolution: 'favor_user' | 'favor_contractor' | 'split'; 
      notes: string 
    }) => adminService.disputes.resolve(disputeId, resolution, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

export const useEscalateDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ disputeId, reason }: { disputeId: string; reason: string }) =>
      adminService.disputes.escalate(disputeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });
};

// ============================= REVIEWS =============================

export const useAdminReviews = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admin", "reviews", filters],
    queryFn: () => adminService.reviews.getAll(filters),
  });
};

export const useAdminReview = (id: string) => {
  return useQuery({
    queryKey: ["admin", "review", id],
    queryFn: () => adminService.reviews.getById(id),
    enabled: !!id,
  });
};

export const useFlaggedReviews = () => {
  return useQuery({
    queryKey: ["admin", "reviews", "flagged"],
    queryFn: () => adminService.reviews.getFlagged(),
  });
};

export const useReviewAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: ReviewAction) => adminService.reviews.performAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
};

// ============================= ANALYTICS =============================

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: () => adminService.analytics.getOverview(),
  });
};

export const useRevenueAnalytics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["admin", "analytics", "revenue", startDate, endDate],
    queryFn: () => adminService.analytics.getRevenue(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useProjectMetrics = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "projects"],
    queryFn: () => adminService.analytics.getProjectMetrics(),
  });
};

export const useContractorPerformance = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "contractors"],
    queryFn: () => adminService.analytics.getContractorPerformance(),
  });
};

// ============================= SETTINGS =============================

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminService.settings.get(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Parameters<typeof adminService.settings.update>[0]) =>
      adminService.settings.update(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
};

// ============================= USERS =============================

export const useAdminUsers = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => adminService.users.getAll(filters),
  });
};

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => adminService.users.getById(id),
    enabled: !!id,
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.users.suspend(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminService.users.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

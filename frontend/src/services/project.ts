import { apiClient } from './api';
import { Project, ProjectStatus, ProjectRequest, Milestone, ProjectImage, ProjectDocument } from '../types';
import { formatInr } from '../lib/currency';

// ============================= PROJECT SERVICE =============================

class ProjectService {
  // ============================= USER PROJECT METHODS =============================

  // Submit new project request
  async submitProject(projectData: ProjectRequest): Promise<Project> {
    try {
      const formData = new FormData();
      
      // Add basic project data
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('category', projectData.category);
      formData.append('budget', projectData.budget.toString());
      formData.append('location', JSON.stringify(projectData.location));
      formData.append('requirements', JSON.stringify(projectData.requirements));
      
      if (projectData.preferred_start_date) {
        formData.append('preferred_start_date', projectData.preferred_start_date);
      }
      
      // Add images
      if (projectData.images) {
        projectData.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }
      
      // Add documents
      if (projectData.documents) {
        projectData.documents.forEach((doc, index) => {
          formData.append(`documents[${index}]`, doc);
        });
      }

      const response = await apiClient.client.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to submit project');
    }
  }

  // Get user's projects
  async getUserProjects(userId?: string): Promise<Project[]> {
    try {
      const url = userId ? `/projects/user/${userId}` : '/projects/my-projects';
      return await apiClient.get(url);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get user projects');
    }
  }

  // Get project by ID
  async getProjectById(projectId: string): Promise<Project> {
    try {
      return await apiClient.get(`/projects/${projectId}`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get project');
    }
  }

  // Update project progress (User can add notes/images)
  async updateProject(projectId: string, updates: {
    update_message?: string;
    images?: File[];
  }): Promise<Project> {
    try {
      const formData = new FormData();
      
      if (updates.update_message) {
        formData.append('update_message', updates.update_message);
      }
      
      if (updates.images) {
        updates.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await apiClient.client.patch(
        `/projects/${projectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to update project');
    }
  }

  // ============================= CONTRACTOR PROJECT METHODS =============================

  // Get contractor's assigned projects
  async getContractorProjects(contractorId?: string): Promise<Project[]> {
    try {
      const url = contractorId ? `/projects/contractor/${contractorId}` : '/projects/my-assignments';
      return await apiClient.get(url);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get contractor projects');
    }
  }

  // Update project progress (Contractor)
  async updateProjectProgress(projectId: string, updates: {
    progress?: number;
    update_message?: string;
    images?: File[];
    milestone_id?: string;
    milestone_completed?: boolean;
  }): Promise<Project> {
    try {
      const formData = new FormData();
      
      if (updates.progress !== undefined) {
        formData.append('progress', updates.progress.toString());
      }
      
      if (updates.update_message) {
        formData.append('update_message', updates.update_message);
      }
      
      if (updates.milestone_id) {
        formData.append('milestone_id', updates.milestone_id);
        formData.append('milestone_completed', updates.milestone_completed?.toString() || 'false');
      }
      
      if (updates.images) {
        updates.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await apiClient.client.patch(
        `/projects/${projectId}/progress`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to update project progress');
    }
  }

  // Mark project as completed (Contractor)
  async markProjectCompleted(projectId: string, completionData: {
    completion_notes?: string;
    final_images?: File[];
  }): Promise<Project> {
    try {
      const formData = new FormData();
      
      if (completionData.completion_notes) {
        formData.append('completion_notes', completionData.completion_notes);
      }
      
      if (completionData.final_images) {
        completionData.final_images.forEach((image, index) => {
          formData.append(`final_images[${index}]`, image);
        });
      }

      const response = await apiClient.client.post(
        `/projects/${projectId}/complete`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to mark project as completed');
    }
  }

  // ============================= SUPER ADMIN PROJECT METHODS =============================

  // Get all projects (Super Admin only)
  async getAllProjects(filters?: {
    status?: ProjectStatus;
    contractor_id?: string;
    user_id?: string;
    page?: number;
    size?: number;
    search?: string;
  }): Promise<{
    items: Project[];
    total: number;
    page: number;
    size: number;
    pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.contractor_id) params.append('contractor_id', filters.contractor_id);
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());
      if (filters?.search) params.append('search', filters.search);
      
      return await apiClient.get(`/admin/projects?${params.toString()}`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get all projects');
    }
  }

  // Assign contractor to project (Super Admin only)
  async assignContractor(projectId: string, contractorId: string, notes?: string): Promise<Project> {
    try {
      return await apiClient.post(`/admin/projects/${projectId}/assign-contractor`, {
        contractor_id: contractorId,
        assignment_notes: notes,
      });
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to assign contractor');
    }
  }

  // Reassign contractor (Super Admin only - for disputes)
  async reassignContractor(projectId: string, newContractorId: string, reason: string): Promise<Project> {
    try {
      return await apiClient.post(`/admin/projects/${projectId}/reassign-contractor`, {
        new_contractor_id: newContractorId,
        reassignment_reason: reason,
      });
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to reassign contractor');
    }
  }

  // Update project status (Super Admin only)
  async updateProjectStatus(projectId: string, status: ProjectStatus, notes?: string): Promise<Project> {
    try {
      return await apiClient.patch(`/admin/projects/${projectId}/status`, {
        status,
        status_notes: notes,
      });
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to update project status');
    }
  }

  // Get projects pending assignment (Super Admin only)
  async getProjectsPendingAssignment(): Promise<Project[]> {
    try {
      return await apiClient.get('/admin/projects/pending-assignment');
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get projects pending assignment');
    }
  }

  // ============================= PROJECT ANALYTICS =============================

  // Get project analytics (Super Admin only)
  async getProjectAnalytics(period?: '7d' | '30d' | '90d' | '1y'): Promise<{
    total_projects: number;
    completed_projects: number;
    in_progress_projects: number;
    disputed_projects: number;
    status_breakdown: Record<ProjectStatus, number>;
    completion_rate: number;
    average_completion_time_days: number;
    monthly_trend: Array<{ month: string; count: number }>;
  }> {
    try {
      const params = period ? `?period=${period}` : '';
      return await apiClient.get(`/admin/analytics/projects${params}`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get project analytics');
    }
  }

  // ============================= PROJECT STATE MACHINE UTILITIES =============================

  // Check if status transition is valid
  isValidStatusTransition(currentStatus: ProjectStatus, newStatus: ProjectStatus): boolean {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      'REQUESTED': ['PAYMENT_PENDING'],
      'PAYMENT_PENDING': ['ADVANCE_CONFIRMED', 'REQUESTED'], // Can go back if payment fails
      'ADVANCE_CONFIRMED': ['CONTRACTOR_ASSIGNED'],
      'CONTRACTOR_ASSIGNED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['COMPLETED', 'DISPUTED'],
      'COMPLETED': ['REVIEW_PENDING'],
      'REVIEW_PENDING': ['CLOSED'],
      'DISPUTED': ['IN_PROGRESS', 'CLOSED'], // Can continue or close after resolution
      'CLOSED': [], // Terminal state
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  // Get allowed next statuses
  getAllowedNextStatuses(currentStatus: ProjectStatus): ProjectStatus[] {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      'REQUESTED': ['PAYMENT_PENDING'],
      'PAYMENT_PENDING': ['ADVANCE_CONFIRMED'],
      'ADVANCE_CONFIRMED': ['CONTRACTOR_ASSIGNED'],
      'CONTRACTOR_ASSIGNED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['COMPLETED', 'DISPUTED'],
      'COMPLETED': ['REVIEW_PENDING'],
      'REVIEW_PENDING': ['CLOSED'],
      'DISPUTED': ['IN_PROGRESS', 'CLOSED'],
      'CLOSED': [],
    };

    return validTransitions[currentStatus] || [];
  }

  // Check if project can be assigned to contractor
  canAssignContractor(project: Project): boolean {
    return project.status === 'ADVANCE_CONFIRMED' && 
           project.payment?.payment_status === 'ADVANCE_CONFIRMED';
  }

  // Get project status color
  getProjectStatusColor(status: ProjectStatus): string {
    switch (status) {
      case 'REQUESTED':
        return 'text-blue-600';
      case 'PAYMENT_PENDING':
        return 'text-yellow-600';
      case 'ADVANCE_CONFIRMED':
        return 'text-green-600';
      case 'CONTRACTOR_ASSIGNED':
        return 'text-indigo-600';
      case 'IN_PROGRESS':
        return 'text-purple-600';
      case 'COMPLETED':
        return 'text-emerald-600';
      case 'REVIEW_PENDING':
        return 'text-amber-600';
      case 'CLOSED':
        return 'text-gray-600';
      case 'DISPUTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  // Get project status badge variant
  getProjectStatusVariant(status: ProjectStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'COMPLETED':
      case 'CLOSED':
        return 'default';
      case 'IN_PROGRESS':
      case 'CONTRACTOR_ASSIGNED':
        return 'secondary';
      case 'DISPUTED':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  // Calculate project timeline progress
  calculateTimelineProgress(project: Project): number {
    if (!project.start_date || !project.estimated_completion) return 0;
    
    const start = new Date(project.start_date);
    const end = new Date(project.estimated_completion);
    const now = new Date();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  }

  // Get project priority color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  // Check if project is overdue
  isProjectOverdue(project: Project): boolean {
    if (!project.estimated_completion) return false;
    return new Date() > new Date(project.estimated_completion) && 
           !['COMPLETED', 'CLOSED'].includes(project.status);
  }

  // Get project completion percentage
  getCompletionPercentage(project: Project): number {
    if (project.status === 'COMPLETED' || project.status === 'CLOSED') return 100;
    return project.progress || 0;
  }

  // Format project budget
  formatProjectBudget(budget: number): string {
    return formatInr(budget);
  }

  // Get milestone completion percentage
  getMilestoneCompletionRate(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  }
}

// Create singleton instance
export const projectService = new ProjectService();

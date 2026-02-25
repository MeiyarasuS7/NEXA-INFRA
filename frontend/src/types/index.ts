export type UserRole = 'SUPER_ADMIN' | 'CONTRACTOR' | 'USER';

export type ProjectStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Contractor {
  id: string;
  userId: string;
  businessName: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  completedProjects: number;
  yearsExperience: number;
  location: string;
  bio: string;
  avatar: string;
  verified: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hourlyRate?: number;
  certifications?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  startDate: string;
  endDate?: string;
  userId: string;
  contractorId?: string;
  contractorName?: string;
  userName?: string;
  images?: string[];
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Review {
  id: string;
  contractorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  projectTitle?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
}

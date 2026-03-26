import { API_BASE_URL } from "../config/env";
import { authStorage } from "../lib/authStorage";

type JsonRecord = Record<string, unknown>;

export interface WorkflowUserSummary {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

export interface WorkflowContractorSummary {
  _id: string;
  company?: string;
  specialties: string[];
  rating?: number;
  experience?: number;
  hourlyRate?: number;
  isActive?: boolean;
  isVerified?: boolean;
  userId?: WorkflowUserSummary;
}

export interface WorkflowProject {
  _id: string;
  title: string;
  description: string;
  type: string;
  budget: number;
  estimatedDuration: number;
  location: string;
  requirements: string[];
  timeline: string;
  notes?: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "disputed" | "cancelled";
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  userId: WorkflowUserSummary;
  contractorId?: WorkflowContractorSummary | null;
  conversationId?: string | null;
  payment?: WorkflowPaymentSummary | null;
}

export interface WorkflowPaymentSummary {
  _id: string;
  amount: number;
  status: "pending" | "verification_pending" | "rejected" | "processing" | "completed" | "failed" | "refunded" | "disputed";
  paymentMethod: "card" | "bank_transfer" | "wallet" | "stripe" | "check" | "cash" | "other";
  createdAt: string;
  paidAt?: string | null;
  offlineVerification?: {
    referenceNumber?: string;
    notes?: string;
    proofUrl?: string;
    submittedAt?: string;
    paidAt?: string;
    verificationNotes?: string;
    rejectionReason?: string;
    verifiedAt?: string;
  } | null;
}

export interface WorkflowConversationMessage {
  senderId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface WorkflowConversation {
  _id: string;
  userId: WorkflowUserSummary;
  contractorId: WorkflowContractorSummary;
  projectId?: {
    _id: string;
    title: string;
    status: string;
    budget?: number;
  } | null;
  messages: WorkflowConversationMessage[];
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  unreadCount: {
    user: number;
    contractor: number;
  };
}

const getToken = () => authStorage.getToken();

const getErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "Something went wrong";
  }

  const record = payload as JsonRecord;
  if (typeof record.message === "string") {
    return record.message;
  }

  if (typeof record.detail === "string") {
    return record.detail;
  }

  return "Something went wrong";
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload?.data as T;
}

export const workflowApi = {
  getProjects: async () => {
    const data = await request<{ projects: WorkflowProject[] }>("/projects");
    return data.projects || [];
  },

  createProject: async (input: {
    title: string;
    description: string;
    type: string;
    budget: number;
    estimatedDuration: number;
    location: string;
    timeline: string;
    requirements: string[];
    notes?: string;
  }) => {
    const data = await request<{ project: WorkflowProject }>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.project;
  },

  getPendingProjects: async () => {
    const data = await request<{ projects: WorkflowProject[] }>("/projects/admin/pending");
    return data.projects || [];
  },

  getApprovedContractors: async () => {
    const data = await request<{
      contractors: WorkflowContractorSummary[];
      pagination?: unknown;
    }>("/contractors");

    return (data.contractors || []).filter(
      (contractor) => contractor.isActive !== false && contractor.isVerified !== false
    );
  },

  approveProject: async (projectId: string, contractorId: string) => {
    const data = await request<{ project: WorkflowProject }>(`/projects/${projectId}/approve`, {
      method: "POST",
      body: JSON.stringify({ contractorId }),
    });
    return data.project;
  },

  rejectProject: async (projectId: string, rejectionReason: string) => {
    const data = await request<{ project: WorkflowProject }>(`/projects/${projectId}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason }),
    });
    return data.project;
  },

  getConversations: async () => {
    const data = await request<{ conversations: WorkflowConversation[] }>("/conversations");
    return data.conversations || [];
  },

  getConversation: async (conversationId: string) => {
    const data = await request<{ conversation: WorkflowConversation }>(`/conversations/${conversationId}`);
    return data.conversation;
  },

  markConversationRead: async (conversationId: string) => {
    const data = await request<{ conversation: WorkflowConversation }>(`/conversations/${conversationId}/read`, {
      method: "PUT",
    });
    return data.conversation;
  },

  sendMessage: async (conversationId: string, message: string) => {
    const data = await request<{ conversation: WorkflowConversation }>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return data.conversation;
  },

  updateProjectStatus: async (
    projectId: string,
    status: WorkflowProject["status"]
  ) => {
    const data = await request<{ project: WorkflowProject }>(`/projects/${projectId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return data.project;
  },
};

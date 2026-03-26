import { apiClient } from './api';
import type { WorkflowPaymentSummary } from './workflowApi';

export interface OfflinePaymentInput {
  projectId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'other';
  referenceNumber: string;
  notes?: string;
  proofUrl?: string;
  paidAt?: string;
}

class PaymentService {
  async getPaymentByProject(projectId: string): Promise<WorkflowPaymentSummary | null> {
    try {
      const data = await apiClient.get<{ payment: WorkflowPaymentSummary | null }>(`/payments/project/${projectId}`);
      return data.payment ?? null;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      throw new Error(apiError.response?.data?.detail || 'Failed to get payment information');
    }
  }

  async submitOfflinePayment(input: OfflinePaymentInput): Promise<WorkflowPaymentSummary> {
    try {
      const data = await apiClient.post<{ payment: WorkflowPaymentSummary }>('/payments/offline', input);
      return data.payment;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      throw new Error(apiError.response?.data?.detail || 'Failed to submit offline payment proof');
    }
  }

  async getAllPayments(status?: string): Promise<WorkflowPaymentSummary[]> {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const data = await apiClient.get<{ payments: WorkflowPaymentSummary[] }>(`/admin/payments${query}`);
      return Array.isArray(data.payments) ? data.payments : [];
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      throw new Error(apiError.response?.data?.detail || 'Failed to load payments');
    }
  }

  async verifyOfflinePayment(
    paymentId: string,
    approved: boolean,
    verificationNotes?: string
  ): Promise<WorkflowPaymentSummary> {
    try {
      const data = await apiClient.post<{ payment: WorkflowPaymentSummary }>(`/payments/${paymentId}/verify-offline`, {
        approved,
        verificationNotes,
      });
      return data.payment;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      throw new Error(apiError.response?.data?.detail || 'Failed to verify payment');
    }
  }
}

export const paymentService = new PaymentService();

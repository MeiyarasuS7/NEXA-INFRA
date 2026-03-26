import { apiClient, AuthTokens, TokenManager } from './api';
import { authStorage } from '../lib/authStorage';
import { UserRole, User } from '../types';

// ============================= ERROR HANDLING TYPE =========================== ===

interface ApiErrorType {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

// ============================= TYPES =============================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: 'USER' | 'CONTRACTOR';
}

export interface ContractorRegisterRequest extends RegisterRequest {
  company_name: string;
  business_license: string;
  expertise_areas: string[];
  location: string;
  description: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: 'email_verification' | 'password_reset' | 'ownership_transfer';
}

export interface GoogleAuthRequest {
  google_token: string;
}

export interface OwnershipTransferRequest {
  new_super_admin_email: string;
  current_admin_otp: string;
  new_admin_otp: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

// ============================= AUTHENTICATION SERVICE =============================

class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store tokens and user
      TokenManager.setTokens(response.tokens);
      this.setUser(response.user);
      
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Login failed');
    }
  }

  // Register User
  async registerUser(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/register', userData);
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Registration failed');
    }
  }

  // Register Contractor
  async registerContractor(contractorData: ContractorRegisterRequest): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/register/contractor', contractorData);
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Contractor registration failed');
    }
  }

  // Google OAuth
  async googleAuth(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/google', { google_token: googleToken });
      
      TokenManager.setTokens(response.tokens);
      this.setUser(response.user);
      
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Google authentication failed');
    }
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/forgot-password', { email });
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Password reset request failed');
    }
  }

  // Reset Password
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/reset-password', resetData);
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Password reset failed');
    }
  }

  // Verify OTP
  async verifyOtp(otpData: VerifyOtpRequest): Promise<{ message: string; verified: boolean }> {
    try {
      return await apiClient.post('/auth/verify-otp', otpData);
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'OTP verification failed');
    }
  }

  // Resend OTP
  async resendOtp(email: string, purpose: string): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/resend-otp', { email, purpose });
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Failed to resend OTP');
    }
  }

  // Get Current User
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get('/auth/me');
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Failed to get user information');
    }
  }

  // Refresh User Data
  async refreshUser(): Promise<User> {
    try {
      const user = await this.getCurrentUser();
      this.setUser(user);
      return user;
    } catch (error: unknown) {
      this.logout();
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const tokens = TokenManager.getTokens();
      if (tokens?.refresh_token) {
        await apiClient.post('/auth/logout', { refresh_token: tokens.refresh_token });
      }
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearUserData();
    }
  }

  // Super Admin Ownership Transfer
  async transferOwnership(transferData: OwnershipTransferRequest): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/transfer-ownership', transferData);
    } catch (error: unknown) {
      const apiError = error as ApiErrorType;
      throw new Error(apiError.response?.data?.detail || 'Ownership transfer failed');
    }
  }

  // User Management
  getUser(): User | null {
    try {
      const stored = authStorage.getUser();
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    authStorage.setUser(JSON.stringify(user));
  }

  clearUserData(): void {
    TokenManager.setTokens(null);
    authStorage.removeUser();
  }

  // Auth State
  isAuthenticated(): boolean {
    const tokens = TokenManager.getTokens();
    return !!tokens && !TokenManager.isTokenExpired();
  }

  hasRole(role: UserRole): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  isContractor(): boolean {
    return this.hasRole('CONTRACTOR');
  }

  isUser(): boolean {
    return this.hasRole('USER');
  }

  // Get redirect path based on role
  getRedirectPath(role?: UserRole): string {
    const userRole = role || this.getUser()?.role;
    switch (userRole) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'CONTRACTOR':
        return '/contractor/dashboard';
      case 'USER':
        return '/dashboard';
      default:
        return '/login';
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

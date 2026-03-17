import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from '../hooks/use-toast';

// Types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'nexa_auth_tokens';
const USER_STORAGE_KEY = 'nexa_user';

// Token Management
class TokenManager {
  private static tokens: AuthTokens | null = null;

  static getTokens(): AuthTokens | null {
    if (!this.tokens) {
      try {
        const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
        this.tokens = stored ? JSON.parse(stored) : null;
      } catch {
        this.tokens = null;
      }
    }
    return this.tokens;
  }

  static setTokens(tokens: AuthTokens | null): void {
    this.tokens = tokens;
    if (tokens) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  static getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.access_token || null;
  }

  static isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;

    const expiryTime = JSON.parse(atob(tokens.access_token.split('.')[1])).exp * 1000;
    return Date.now() >= expiryTime - 60000; // 1 minute buffer
  }
}

// API Client
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenManager.getAccessToken();
        if (token && !config.url?.includes('/auth/')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            const token = TokenManager.getAccessToken();
            this.processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<void> {
    const tokens = TokenManager.getTokens();
    if (!tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: tokens.refresh_token },
      { timeout: 10000 }
    );

    TokenManager.setTokens(response.data);
  }

  private handleApiError(error: unknown): void {
    const axiosError = error as { code?: string; response?: { status?: number; data?: ApiErrorResponse } };
    
    if (axiosError.code === 'NETWORK_ERROR' || axiosError.code === 'ECONNABORTED') {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection.',
        variant: 'destructive',
      });
    } else if (axiosError.response?.status && axiosError.response.status >= 500) {
      toast({
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again.',
        variant: 'destructive',
      });
    } else if (axiosError.response?.data?.detail) {
      // Don't show toast for 401 errors (handled by auth)
      if (axiosError.response.status !== 401) {
        toast({
          title: 'Error',
          description: axiosError.response.data.detail,
          variant: 'destructive',
        });
      }
    }
  }

  private logout(): void {
    TokenManager.setTokens(null);
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // File upload
  async upload<T = unknown>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(url, formData, config);
    return response.data.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export token manager for auth context
export { TokenManager };
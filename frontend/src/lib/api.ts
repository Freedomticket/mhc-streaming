/**
 * Axios API Client with JWT Authentication
 * Handles token refresh, error handling, and request/response interceptors
 *
 * Usage:
 * import { api } from '@/lib/api';
 * const { data } = await api.get('/videos');
 * const { data } = await api.post('/videos/upload', formData);
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: Function; reject: Function }> = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor: Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();

            if (!refreshToken) {
              this.logout();
              return Promise.reject(error);
            }

            const { data } = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh`,
              { refresh: refreshToken }
            );

            this.saveTokens(data.access, refreshToken);

            // Retry failed requests
            this.failedQueue.forEach(({ resolve }) => resolve(data.access));
            this.failedQueue = [];

            // Retry original request
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${data.access}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get methods
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  /**
   * Post methods
   */
  post<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  /**
   * Put methods
   */
  put<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  /**
   * Patch methods
   */
  patch<T = any>(
    url: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  /**
   * Delete methods
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  /**
   * Token management
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  saveTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  logout() {
    this.clearTokens();
    // Redirect to login if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * File upload with progress
   */
  uploadFile<T = any>(
    url: string,
    file: File,
    metadata?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }

    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress?.(Math.round(progress));
        }
      },
    });
  }
}

// Initialize API client
const apiBaseUrl = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  : 'http://localhost:3000';

export const api = new ApiClient(apiBaseUrl);

// Export for convenience
export const getAccessToken = () => api.getAccessToken();
export const getRefreshToken = () => api.getRefreshToken();
export const saveTokens = (access: string, refresh: string) => api.saveTokens(access, refresh);
export const logout = () => api.logout();
export const isAuthenticated = () => api.isAuthenticated();

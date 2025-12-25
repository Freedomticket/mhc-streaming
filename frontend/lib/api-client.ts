import axios, { AxiosInstance, AxiosError } from 'axios';

// API base URLs - update these based on your deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
const MEDIA_SERVICE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:3002';
const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_URL || 'http://localhost:3004';

// Token storage keys
const ACCESS_TOKEN_KEY = 'mhc_access_token';
const REFRESH_TOKEN_KEY = 'mhc_refresh_token';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Get tokens from localStorage
 */
export function getTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

/**
 * Save tokens to localStorage
 */
export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Create axios instance with auth interceptors
 */
function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      const { accessToken } = getTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
      const originalRequest: any = error.config;

      // If 401 and we haven't retried yet, try to refresh token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshToken } = getTokens();
          if (!refreshToken) {
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Call refresh endpoint
          const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          setTokens(newAccessToken, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Create service clients
export const authClient = createApiClient(AUTH_SERVICE_URL);
export const mediaClient = createApiClient(MEDIA_SERVICE_URL);
export const paymentClient = createApiClient(PAYMENT_SERVICE_URL);
export const apiClient = createApiClient(API_BASE_URL);

/**
 * Auth API
 */
export const authApi = {
  register: async (data: { email: string; username: string; password: string; displayName?: string }) => {
    const response = await authClient.post<ApiResponse>('/api/auth/register', data);
    if (response.data.success && response.data.data) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await authClient.post<ApiResponse>('/api/auth/login', data);
    if (response.data.success && response.data.data) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  },

  logout: () => {
    clearTokens();
  },

  getCurrentUser: async () => {
    const response = await authClient.get<ApiResponse>('/api/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const { refreshToken } = getTokens();
    const response = await authClient.post<ApiResponse>('/api/auth/refresh', { refreshToken });
    if (response.data.success && response.data.data) {
      setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  },
};

/**
 * Media API
 */
export const mediaApi = {
  uploadFile: async (file: File, metadata: { title: string; description?: string; type: 'audio' | 'video' }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    formData.append('type', metadata.type);

    const response = await mediaClient.post<ApiResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMediaInfo: async (id: string, type: 'audio' | 'video') => {
    const response = await mediaClient.get<ApiResponse>(`/info/${id}`, { params: { type } });
    return response.data;
  },
};

/**
 * Payment API
 */
export const paymentApi = {
  createCheckoutSession: async (data: { tier: string; priceId: string }) => {
    const response = await paymentClient.post<ApiResponse>('/api/payment/create-checkout-session', data);
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await paymentClient.get<ApiResponse>('/api/payment/subscription/status');
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await paymentClient.post<ApiResponse>('/api/payment/subscription/cancel');
    return response.data;
  },
};

/**
 * Generic error handler
 */
export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (apiError) {
      return apiError.message || 'An error occurred';
    }
    return error.message || 'Network error';
  }
  return 'An unexpected error occurred';
}

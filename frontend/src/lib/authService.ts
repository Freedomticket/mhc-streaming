/**
 * Authentication Service
 * Handles all auth-related API calls and token management
 */

import { api, saveTokens, clearTokens } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  createdAt: string;
  subscription?: {
    tier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  };
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private readonly baseUrl: string;

  constructor() {
    // Use API Gateway URL from env or default
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-gateway.onrender.com';
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data: AuthResponse }>('/api/auth/register', data);
      
      // Save tokens
      saveTokens(response.data.data.accessToken, response.data.data.refreshToken);
      
      // Save user to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Login existing user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data: AuthResponse }>('/api/auth/login', data);
      
      // Save tokens
      saveTokens(response.data.data.accessToken, response.data.data.refreshToken);
      
      // Save user to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Clear local storage first
      clearTokens();
      
      // Optionally call backend logout endpoint if it exists
      // await api.post('/api/auth/logout');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      // Even if backend call fails, still clear local tokens
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{ data: User }>('/api/auth/me');
      
      // Update cached user
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get cached user from localStorage
   */
  getCachedUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return api.isAuthenticated();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await api.post<{ data: { accessToken: string; refreshToken: string } }>(
        '/api/auth/refresh',
        { refreshToken }
      );
      
      // Save new tokens
      saveTokens(response.data.data.accessToken, response.data.data.refreshToken);
      
      return response.data.data;
    } catch (error: any) {
      // If refresh fails, logout user
      this.logout();
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await api.patch<{ data: User }>('/api/auth/profile', data);
      
      // Update cached user
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/api/auth/forgot-password', { email });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error.message || 'An error occurred');
    }
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export convenience methods
export const register = (data: RegisterData) => authService.register(data);
export const login = (data: LoginData) => authService.login(data);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const getCachedUser = () => authService.getCachedUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const updateProfile = (data: Partial<User>) => authService.updateProfile(data);
export const changePassword = (current: string, newPass: string) => authService.changePassword(current, newPass);
export const requestPasswordReset = (email: string) => authService.requestPasswordReset(email);
export const resetPassword = (token: string, newPass: string) => authService.resetPassword(token, newPass);

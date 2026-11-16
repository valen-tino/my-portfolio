import apiService from '../services/api';
import { parseCMSError } from './utils/errorUtils';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export class AuthService {
  static async loginWithDetails(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        return { success: true };
      }
      return {
        success: false,
        error: response.message || 'Invalid email or password',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      const parsed = parseCMSError(error, 'Invalid email or password');
      if (parsed.status === 401 && !parsed.isNetworkError) {
        return {
          success: false,
          error: parsed.message || 'Invalid email or password',
        };
      }
      return {
        success: false,
        error: parsed.message,
      };
    }
  }

  static async login(email: string, password: string): Promise<boolean> {
    const result = await this.loginWithDetails(email, password);
    return result.success;
  }

  static async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('cms-auth-token');
    return !!token;
  }

  static getSession(): { email: string; loginTime?: string } | null {
    try {
      const userStr = localStorage.getItem('cms-user');
      if (!userStr) {
        return null;
      }

      const user = JSON.parse(userStr);
      return {
        email: user.email,
        loginTime: new Date().toISOString() // Placeholder since we don't store login time
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  static clearInvalidTokens(): void {
    try {
      // Clear all authentication-related items from localStorage
      localStorage.removeItem('cms-auth-token');
      localStorage.removeItem('cms-user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
}

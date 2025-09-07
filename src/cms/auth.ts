import apiService from '../services/api';

export interface User {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiService.login(email, password);
      return response.success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
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
      const response = await apiService.api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }
}

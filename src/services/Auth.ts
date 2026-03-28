import { UserData } from '@/hooks/useAuth';

const AUTH_URL = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=ActantAuth';

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  id?: number;
  omekaUserId?: number;
  type?: 'student' | 'actant';
  role?: string;
  firstname?: string;
  lastname?: string;
  picture?: string | null;
  error?: string; // Backend sometimes uses 'error' instead of 'message'
  expires_in?: number;
  user?: UserData;
}

export const AuthService = {
  /**
   * Helper to map flat response to nested user object
   */
  mapResponseToUser(data: any): UserData | undefined {
    if (!data.success) return undefined;
    return {
      id: data.id || data.actantItemId,
      omekaUserId: data.omekaUserId,
      type: data.type || 'actant',
      role: data.role || 'author',
      firstname: data.firstname,
      lastname: data.lastname,
      picture: data.picture,
      email: data.email
    };
  },

  /**
   * Authenticate a user (Student or Actant)
   */
  async login(email: string, password: string, type: 'student' | 'actant' | string): Promise<LoginResponse> {
    const action = type === 'student' ? 'loginStudent' : 'login';
    const params = new URLSearchParams();
    params.append('email', email);
    if (type === 'student') {
      params.append('studentNumber', password);
    } else {
      params.append('password', password);
    }

    try {
      const response = await fetch(`${AUTH_URL}&action=${action}&json=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        data.user = this.mapResponseToUser({ ...data, email });
      } else {
        data.message = data.error || data.message || 'Identifiants invalides';
      }
      return data;
    } catch (error) {
      console.error('AuthService.login failure:', error);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },

  /**
   * Check if an email exists as an actant and/or user
   */
  async checkEmail(email: string): Promise<{ success: boolean; exists: boolean; hasUser: boolean; actantItemId?: number; error?: string }> {
    try {
      const response = await fetch(`${AUTH_URL}&action=checkEmail&email=${encodeURIComponent(email)}&json=1`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      console.log('AuthService.checkEmail data:', data);
      return data;
    } catch (error) {
      console.error('AuthService.checkEmail failure:', error);
      return { success: false, exists: false, hasUser: false };
    }
  },

  /**
   * Register a new user account for an existing actant
   */
  async register(email: string, password: string, confirmPassword: string): Promise<LoginResponse> {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('confirmPassword', confirmPassword);

    try {
      const response = await fetch(`${AUTH_URL}&action=register&json=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        data.user = this.mapResponseToUser({ ...data, email });
      } else {
        data.message = data.error || data.message;
      }
      return data;
    } catch (error) {
      console.error('AuthService.register failure:', error);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },

  /**
   * Get current user data from session
   */
  async me(): Promise<LoginResponse> {
    try {
      const response = await fetch(`${AUTH_URL}&action=me&json=1`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        data.user = this.mapResponseToUser(data);
      }
      return data;
    } catch (error) {
      return { success: false };
    }
  }
};

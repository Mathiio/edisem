import { useState, useEffect, useCallback } from 'react';

export interface UserData {
  id: number;
  firstname?: string;
  lastname?: string;
  picture?: string;
  type?: 'actant' | 'student' | string;
  role?: string;
  omekaUserId?: number | null;
  email?: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      const authenticated = !!(user && user !== 'null' && token);

      setIsAuthenticated(authenticated);

      if (user && user !== 'null') {
        try {
          setUserData(JSON.parse(user));
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('omekaUserId');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserData(null);
  }, []);

  const login = useCallback((user: UserData, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userType', user.type || '');
    localStorage.setItem('token', token);
    
    if (user.omekaUserId) {
      localStorage.setItem('omekaUserId', String(user.omekaUserId));
    }
    
    setIsAuthenticated(true);
    setUserData(user);
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  return {
    isAuthenticated,
    userData,
    isLoading,
    login,
    logout,
    checkAuth,
  };
};
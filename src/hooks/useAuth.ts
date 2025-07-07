import { useState, useEffect, useCallback } from 'react';

interface UserData {
  firstname?: string;
  lastname?: string;
  picture?: string;
  type?: 'actant' | 'etudiant' | string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const user = localStorage.getItem('user');
      const userId = localStorage.getItem('userId');
      
      setIsAuthenticated(!!user || !!userId);
      
      if (user) {
        setUserData(JSON.parse(user));
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
    setIsAuthenticated(false);
    setUserData(null);
  }, []);

  const login = useCallback((user: UserData, userId: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
    setUserData(user);
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'userId') {
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
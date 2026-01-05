import { useState, useEffect, useCallback } from 'react';

export interface UserData {
  id: number;
  firstname?: string;
  lastname?: string;
  picture?: string;
  type?: 'actant' | 'student'  | string;
  omekaUserId?: number | null;  // ID utilisateur Omeka S (table user) pour o:owner
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const user = localStorage.getItem('user');
      const userId = localStorage.getItem('userId');

      

      const authenticated = !!(user && user !== 'null' && user !== 'undefined') || !!(userId && userId !== 'null' && userId !== 'undefined');

     

      setIsAuthenticated(authenticated);

      if (user && user !== 'null' && user !== 'undefined') {
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
    setIsAuthenticated(false);
    setUserData(null);
  }, []);

  const login = useCallback((user: UserData, userId: string, omekaUserId?: number | null) => {
    // Stocker l'omekaUserId dans l'objet user
    const userWithOmekaId = { ...user, omekaUserId };
    localStorage.setItem('user', JSON.stringify(userWithOmekaId));
    localStorage.setItem('userId', userId);
    // Stocker l'omekaUserId séparément pour un accès rapide
    if (omekaUserId) {
      localStorage.setItem('omekaUserId', String(omekaUserId));
    }
    setIsAuthenticated(true);
    setUserData(userWithOmekaId);
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
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthOptions = {
  requiredRole?: 'Actant' | 'Student' | 'any';
};

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: AuthOptions = { requiredRole: 'any' }
) {
  return function WithAuth(props: P) {
    const navigate = useNavigate();

    useEffect(() => {
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');

      console.log(userId)
      console.log(userType)

      // Vérifier si l'utilisateur est authentifié
      if (!userId || !userType) {
        navigate('/login');
        return;
      }

      // Vérifier les droits d'accès
      if (options.requiredRole && options.requiredRole !== 'any') {
        if (options.requiredRole !== userType) {
          // Rediriger vers une page d'erreur ou la page d'accueil
          navigate('/');
          alert('Vous n\'avez pas les droits nécessaires pour accéder à cette page');
        }
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
}
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthOptions = {
  requiredRole?: 'Actant' | 'Student' | 'any';
};

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: AuthOptions = { requiredRole: 'any' },
) {
  return function WithAuth(props: P) {
    const navigate = useNavigate();

    useEffect(() => {
      const userString = localStorage.getItem('user');
      const user: any | null = userString ? JSON.parse(userString) : null;

      // Vérifier si l'utilisateur est authentifié
      if (!user) {
        navigate('/login');
        return;
      }

      // Vérifier les droits d'accès
      if (options.requiredRole && options.requiredRole !== 'any') {
        const userRole = user.type === 'actant' ? 'Actant' : 'Student';

        if (options.requiredRole !== userRole) {
          // Rediriger vers une page d'erreur ou la page d'accueil
          navigate('/');
          alert("Vous n'avez pas les droits nécessaires pour accéder à cette page");
          return;
        }
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
}

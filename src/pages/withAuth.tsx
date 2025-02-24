import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthOptions = {
  requiredRole?: 'actant' | 'student' | 'any';
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

      if (!user) {
        navigate('/login');
        return;
      }

      if (options.requiredRole && options.requiredRole !== 'any') {
        const userRole = user.type === 'actant' ? 'actant' : 'student';

        if (options.requiredRole !== userRole) {
          navigate('/');
          alert("Vous n'avez pas les droits nécessaires pour accéder à cette page");
          return;
        }
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
}

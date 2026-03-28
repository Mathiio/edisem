import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal } from '@/components/ui/AlertModal';

type AuthOptions = {
  requiredRole?: 'actant' | 'student' | 'any';
};

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: AuthOptions = { requiredRole: 'any' },
) {
  return function WithAuth(props: P) {
    const navigate = useNavigate();
    
    const user = React.useMemo(() => {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    }, []);

    const [showError, setShowError] = React.useState(false);

    const isAuthorized = React.useMemo(() => {
      if (!user) return false;
      if (options.requiredRole && options.requiredRole !== 'any') {
        const userRole = user.type === 'actant' ? 'actant' : 'student';
        return options.requiredRole === userRole;
      }
      return true;
    }, [user]);

    useEffect(() => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (!isAuthorized) {
        setShowError(true);
      }
    }, [user, isAuthorized, navigate]);

    const handleConfirm = () => {
      setShowError(false);
      navigate('/');
    };

    // Si on n'est pas autorisé, on ne rend SURTOUT PAS le composant protégé
    if (!isAuthorized && user) {
      return (
        <div className="min-h-screen bg-c1 flex items-center justify-center">
          <AlertModal
            isOpen={showError}
            onClose={handleConfirm}
            title="Accès refusé"
            description="Vous n'avez pas les droits nécessaires pour accéder à cette page"
            type="forbidden"
            confirmLabel="Retour à l'accueil"
            onConfirm={handleConfirm}
          />
        </div>
      );
    }

    // Si pas de user du tout, on attend la redirection du useEffect
    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const navigate = useNavigate();

    useEffect(() => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated) {
        navigate('/login');
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
}

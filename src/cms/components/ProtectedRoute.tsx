import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthService } from '../auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/cms/login');
    }
  }, [navigate]);

  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/cms/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

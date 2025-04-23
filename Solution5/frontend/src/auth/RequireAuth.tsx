import React, { ReactNode } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { Navigate } from 'react-router-dom';

const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? (
    <>{children}</>
    
  ) : (
    <Navigate to="/login" replace />
  );
};

export default RequireAuth;
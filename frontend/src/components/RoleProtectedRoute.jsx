import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const RoleProtectedRoute = ({
  children,
  requiredRoles,
  fallbackPath = '/admin',
}) => {
  const userRole = getUserRole();

  if (!userRole || !requiredRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleProtectedRoute;

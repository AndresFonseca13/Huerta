import React from 'react';
import { Navigate } from 'react-router-dom';

// Función para obtener el rol del usuario desde localStorage
const getUserRole = () => {
  return localStorage.getItem('role') || 'admin';
};

// Función para verificar si un rol tiene acceso a una ruta específica
const hasAccess = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

const RoleProtectedRoute = ({
  children,
  requiredRoles,
  fallbackPath = '/admin',
}) => {
  const userRole = getUserRole();

  if (!hasAccess(userRole, requiredRoles)) {
    // Redirigir a dashboard si no tiene acceso
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleProtectedRoute;

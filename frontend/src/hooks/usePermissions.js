import { useMemo, useState, useEffect, useCallback } from 'react';
import { checkAuth } from '../services/authService';

// Caché a nivel módulo: se comparte entre todas las instancias del hook
let cachedUser = null;
let fetchPromise = null;
const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

async function fetchUserOnce() {
  if (cachedUser) return cachedUser;
  if (fetchPromise) return fetchPromise;

  fetchPromise = checkAuth().then((user) => {
    cachedUser = user || null;
    fetchPromise = null;
    notifySubscribers();
    return cachedUser;
  });

  return fetchPromise;
}

// Permite invalidar el caché (útil después de login/logout)
export function clearPermissionsCache() {
  cachedUser = null;
  fetchPromise = null;
  notifySubscribers();
}

// Hook para verificar permisos del usuario
export const usePermissions = () => {
  const [userInfo, setUserInfo] = useState(() => {
    if (cachedUser) {
      return {
        username: cachedUser.username || 'Usuario',
        role: cachedUser.role || 'admin',
        userId: cachedUser.id,
      };
    }
    return { username: 'Usuario', role: null, userId: null };
  });
  const [loading, setLoading] = useState(!cachedUser);

  const updateFromCache = useCallback(() => {
    if (cachedUser) {
      setUserInfo({
        username: cachedUser.username || 'Usuario',
        role: cachedUser.role || 'admin',
        userId: cachedUser.id,
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    subscribers.add(updateFromCache);

    if (!cachedUser) {
      fetchUserOnce().then(() => updateFromCache());
    }

    return () => {
      subscribers.delete(updateFromCache);
    };
  }, [updateFromCache]);

  const userRole = userInfo.role;

  const permissions = useMemo(() => {
    if (!userRole) return {};
    return {
      canAccessDashboard: true,

      canAccessBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),
      canCreateBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),
      canEditBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),
      canDeleteBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),

      canAccessFood: ['admin', 'ventas', 'chef'].includes(userRole),
      canCreateFood: ['admin', 'ventas', 'chef'].includes(userRole),
      canEditFood: ['admin', 'ventas', 'chef'].includes(userRole),
      canDeleteFood: ['admin', 'ventas', 'chef'].includes(userRole),

      canAccessCategories: true,
      canCreateCategories: ['admin', 'ventas', 'chef', 'barmanager'].includes(userRole),
      canEditCategories: ['admin', 'ventas', 'chef', 'barmanager'].includes(userRole),
      canDeleteCategories: ['admin', 'ventas', 'chef', 'barmanager'].includes(userRole),

      canAccessUsers: ['admin', 'ventas'].includes(userRole),
      canCreateUsers: ['admin', 'ventas'].includes(userRole),
      canEditUsers: ['admin', 'ventas'].includes(userRole),
      canDeleteUsers: ['admin', 'ventas'].includes(userRole),

      canAccessPromotions: true,
      canCreatePromotions: ['admin', 'ventas'].includes(userRole),
      canEditPromotions: ['admin', 'ventas'].includes(userRole),
      canDeletePromotions: ['admin', 'ventas'].includes(userRole),

      canUploadImages: ['admin', 'ventas', 'chef', 'barmanager'].includes(userRole),
    };
  }, [userRole]);

  return {
    userRole,
    username: userInfo.username,
    userId: userInfo.userId,
    loading,
    permissions,
    hasPermission: (permission) => permissions[permission] || false,
  };
};

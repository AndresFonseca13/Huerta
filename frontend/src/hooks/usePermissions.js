import { useMemo, useState, useEffect } from 'react';
import { checkAuth } from '../services/authService';

// Hook para verificar permisos del usuario
export const usePermissions = () => {
  const [userInfo, setUserInfo] = useState({ username: 'Usuario', role: null, userId: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await checkAuth();
      if (user) {
        setUserInfo({
          username: user.username || 'Usuario',
          role: user.role || 'admin',
          userId: user.id,
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const userRole = userInfo.role;

  const permissions = useMemo(() => {
    if (!userRole) return {};
    return {
      // Dashboard - Todos los roles tienen acceso
      canAccessDashboard: true,

      // Bebidas - Solo admin, ventas y barmanager
      canAccessBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),
      canCreateBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),
      canEditBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),
      canDeleteBeverages: ['admin', 'ventas', 'barmanager'].includes(userRole),

      // Comida - Solo admin, ventas y chef
      canAccessFood: ['admin', 'ventas', 'chef'].includes(userRole),
      canCreateFood: ['admin', 'ventas', 'chef'].includes(userRole),
      canEditFood: ['admin', 'ventas', 'chef'].includes(userRole),
      canDeleteFood: ['admin', 'ventas', 'chef'].includes(userRole),

      // Categorías - Todos los roles pueden hacer CRUD completo
      canAccessCategories: true,
      canCreateCategories: ['admin', 'ventas', 'chef', 'barmanager'].includes(
        userRole,
      ),
      canEditCategories: ['admin', 'ventas', 'chef', 'barmanager'].includes(
        userRole,
      ),
      canDeleteCategories: ['admin', 'ventas', 'chef', 'barmanager'].includes(
        userRole,
      ),

      // Usuarios - Solo admin y ventas
      canAccessUsers: ['admin', 'ventas'].includes(userRole),
      canCreateUsers: ['admin', 'ventas'].includes(userRole),
      canEditUsers: ['admin', 'ventas'].includes(userRole),
      canDeleteUsers: ['admin', 'ventas'].includes(userRole),

      // Promociones - Todos los roles pueden ver, solo admin y ventas pueden editar
      canAccessPromotions: true,
      canCreatePromotions: ['admin', 'ventas'].includes(userRole),
      canEditPromotions: ['admin', 'ventas'].includes(userRole),
      canDeletePromotions: ['admin', 'ventas'].includes(userRole),

      // Upload de imágenes - Admin, ventas, chef y barmanager pueden subir
      canUploadImages: ['admin', 'ventas', 'chef', 'barmanager'].includes(
        userRole,
      ),
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

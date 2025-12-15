import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FiHome, FiCoffee, FiTag, FiUsers, FiVolume2 } from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';

// Función para obtener las opciones del menú móvil según los permisos
const getMobileMenuOptions = (permissions) => {
  const options = [];

  // Dashboard - Todos los roles tienen acceso
  options.push({
    path: '/admin',
    label: 'Dashboard',
    icon: FiHome,
    roles: ['admin', 'ventas', 'chef', 'barmanager'],
  });

  // Comida - Solo si tiene permiso
  if (permissions.canAccessFood) {
    options.push({
      path: '/admin/food',
      label: 'Comida',
      icon: FiTag,
      roles: ['admin', 'ventas', 'chef'],
    });
  }

  // Usuarios - Solo si tiene permiso
  if (permissions.canAccessUsers) {
    options.push({
      path: '/admin/users',
      label: 'Users',
      icon: FiUsers,
      roles: ['admin', 'ventas'],
    });
  }

  // Bebidas - Solo si tiene permiso
  if (permissions.canAccessBeverages) {
    options.push({
      path: '/admin/beverages',
      label: 'Bebidas',
      icon: FiCoffee,
      roles: ['admin', 'ventas', 'barmanager'],
    });
  }

  // Promociones - Solo si tiene permiso
  if (permissions.canAccessPromotions) {
    options.push({
      path: '/admin/promotions',
      label: 'Promos',
      icon: FiVolume2,
      roles: ['admin', 'ventas', 'chef', 'barmanager'],
    });
  }

  // Categorías - Todos los roles pueden ver
  options.push({
    path: '/admin/categories',
    label: 'Categorías',
    icon: FiTag,
    roles: ['admin', 'ventas', 'chef', 'barmanager'],
  });

  return options;
};

const NavItem = ({ active, label, icon: Icon, onClick, disabled }) => (
  <div className="relative flex-1">
    {active && (
      <Motion.div
        layoutId="bottomActive"
        className="absolute -top-1 left-2 right-2 h-[3px] rounded-full"
        style={{ backgroundColor: '#e9cc9e' }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      />
    )}
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center w-full py-2 ${
        active ? 'font-semibold' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ 
        color: active ? '#e9cc9e' : '#b8b8b8',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {Icon && <Icon size={18} />}
      <span className="text-[11px] mt-1">{label}</span>
    </button>
  </div>
);

const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions } = usePermissions();
  const [isMobile, setIsMobile] = useState(true);
  const [menuOptions, setMenuOptions] = useState([]);

  useEffect(() => {
    setMenuOptions(getMobileMenuOptions(permissions));
  }, [permissions]);

  useEffect(() => {
    const update = () =>
      setIsMobile(
        typeof window !== 'undefined' ? window.innerWidth < 1024 : true,
      );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const is = (path) => location.pathname === path;

  if (!isMobile) return null;

  const nav = (
    <Motion.nav
      initial={{ y: 40, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-x-0 bottom-0 z-[100] lg:hidden pb-2 h-16"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#121212',
        borderTop: '1px solid #3a3a3a',
      }}
    >
      <div className="max-w-5xl mx-auto px-2 flex">
        {menuOptions.map((option) => (
          <NavItem
            key={option.path}
            active={is(option.path)}
            label={option.label}
            icon={option.icon}
            onClick={() => navigate(option.path)}
          />
        ))}
      </div>
    </Motion.nav>
  );

  // Renderizar como portal para evitar contextos de apilamiento que puedan ocultarlo
  const target = typeof document !== 'undefined' ? document.body : null;
  return target ? createPortal(nav, target) : nav;
};

export default AdminBottomNav;

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import PromotionEntryModal from './PromotionEntryModal.jsx';
import { getEligiblePromotionNow } from '../services/promotionService';

const SESSION_FLAG = 'promoShownThisSession';

const ConditionalNavbar = () => {
  const location = useLocation();
  const [promotions, setPromotions] = useState([]);
  const [showPromo, setShowPromo] = useState(false);

  // Rutas donde NO queremos mostrar el navbar
  const adminRoutes = ['/admin', '/admin/login', '/admin/create'];

  // Verificar si la ruta actual es una ruta de admin
  const isAdminRoute = adminRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route),
  );

  useEffect(() => {
    // Si es ruta de admin, no cargar promociones
    if (isAdminRoute) return;

    const isPublic =
			location.pathname === '/' ||
			location.pathname === '/bebidas' ||
			location.pathname.startsWith('/bebidas/') ||
			location.pathname === '/comida' ||
			location.pathname.startsWith('/comida/');
    if (!isPublic) return;

    const alreadyShown = sessionStorage.getItem(SESSION_FLAG) === '1';
    if (alreadyShown) return;

    let cancelled = false;
    (async () => {
      try {
        const promos = await getEligiblePromotionNow();
        if (!cancelled && Array.isArray(promos) && promos.length > 0) {
          setPromotions(promos.slice(0, 2));
          setShowPromo(true);
          sessionStorage.setItem(SESSION_FLAG, '1');
        }
      } catch (_e) {
        // noop
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, isAdminRoute]);

  // Solo mostrar navbar si NO es una ruta de admin
  if (isAdminRoute) {
    return null;
  }

  const current = promotions[0] || null;
  const handleClose = () => {
    if (promotions.length > 1) {
      setPromotions((prev) => prev.slice(1));
      setShowPromo(true);
    } else {
      setShowPromo(false);
    }
  };

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        {showPromo && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[49]"
          >
            <PromotionEntryModal promotion={current} onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConditionalNavbar;

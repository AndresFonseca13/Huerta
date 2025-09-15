import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import PromotionEntryModal from "./PromotionEntryModal.jsx";
import { getEligiblePromotionNow } from "../services/promotionService";

const ConditionalNavbar = () => {
	const location = useLocation();
	const [promotions, setPromotions] = useState([]);
	const [showPromo, setShowPromo] = useState(false);

	// Rutas donde NO queremos mostrar el navbar
	const adminRoutes = ["/admin", "/admin/login", "/admin/create"];

	// Verificar si la ruta actual es una ruta de admin
	const isAdminRoute = adminRoutes.some(
		(route) =>
			location.pathname === route || location.pathname.startsWith(route)
	);

	// Solo mostrar navbar si NO es una ruta de admin
	if (isAdminRoute) {
		return null;
	}

	useEffect(() => {
		const isPublic =
			location.pathname === "/" ||
			location.pathname === "/bebidas" ||
			location.pathname.startsWith("/bebidas/") ||
			location.pathname === "/comida" ||
			location.pathname.startsWith("/comida/");
		console.log("[Promo] Path:", location.pathname, "isPublic:", isPublic);
		if (!isPublic) return;
		let cancelled = false;
		(async () => {
			try {
				const promos = await getEligiblePromotionNow();
				console.log("[Promo] elegible-now result:", promos);
				if (!cancelled && Array.isArray(promos) && promos.length > 0) {
					setPromotions(promos.slice(0, 2));
					setShowPromo(true);
				}
			} catch (_e) {
				console.warn("[Promo] error fetching elegible-now:", _e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [location.pathname]);

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
			<AnimatePresence>
				{showPromo && current && (
					<motion.div
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

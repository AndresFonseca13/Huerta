import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
	FaCocktail,
	FaUtensils,
	FaWineBottle,
	FaBars,
	FaTimes,
} from "react-icons/fa";

const FloatingTypeSwitcher = () => {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const containerRef = useRef(null);

	// Cerrar al hacer clic fuera
	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setOpen(false);
			}
		};

		// Usar setTimeout para evitar que el mismo click que abre cierre el menú
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 100);

		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	// Determinar cuál está activo basado en la ruta
	const activeMenu = location.pathname.startsWith("/comida")
		? "comida"
		: location.pathname.startsWith("/otras-bebidas")
		? "otras-bebidas"
		: "cocteles";

	const menuOptions = [
		{
			key: "cocteles",
			label: "Cócteles",
			icon: FaCocktail,
			bgColor: "#e9cc9e",
			textColor: "#191919",
			path: "/bebidas",
		},
		{
			key: "comida",
			label: "Comida",
			icon: FaUtensils,
			bgColor: "#e9cc9e",
			textColor: "#191919",
			path: "/comida",
		},
		{
			key: "otras-bebidas",
			label: "Otras Bebidas",
			icon: FaWineBottle,
			bgColor: "#e9cc9e",
			textColor: "#191919",
			path: "/otras-bebidas",
		},
	];

	const handleNavigate = (path) => {
		navigate(path);
		setOpen(false);
	};

	const content = (
		<div
			ref={containerRef}
			className="fixed z-[2000] pointer-events-auto"
			style={{
				right: "1.5rem",
				top: "50%",
				transform: "translateY(-50%)",
			}}
		>
			{/* Botón principal */}
			<motion.button
				type="button"
				aria-label="Menú de navegación"
				onClick={(e) => {
					e.stopPropagation();
					setOpen(!open);
				}}
				className="flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:scale-110 transition-all duration-200 focus:outline-none"
				style={{
					backgroundColor: open ? "#3a3a3a" : "#e9cc9e",
					color: open ? "#e9cc9e" : "#191919",
					WebkitAppearance: "none",
					WebkitTapHighlightColor: "transparent",
				}}
				whileTap={{ scale: 0.95 }}
			>
				<AnimatePresence mode="wait">
					{open ? (
						<motion.div
							key="close"
							initial={{ rotate: -90, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							exit={{ rotate: 90, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<FaTimes size={20} />
						</motion.div>
					) : (
						<motion.div
							key="menu"
							initial={{ rotate: 90, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							exit={{ rotate: -90, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<FaBars size={20} />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>

			{/* Burbujas expandidas */}
			<AnimatePresence>
				{open && (
					<motion.div
						className="absolute top-1/2 right-0 -translate-y-1/2 flex flex-col gap-3 pr-20"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{menuOptions.map((option, index) => {
							const Icon = option.icon;
							const isActive = activeMenu === option.key;

							return (
								<motion.button
									key={option.key}
									type="button"
									onClick={() => handleNavigate(option.path)}
									className={`flex items-center gap-3 rounded-full shadow-lg pl-4 pr-5 py-3 transition-all ${
										isActive ? "ring-2 ring-offset-2" : ""
									}`}
									style={{
										backgroundColor: option.bgColor,
										color: option.textColor,
										ringColor: isActive ? "#e9cc9e" : "transparent",
										WebkitAppearance: "none",
										WebkitTapHighlightColor: "transparent",
									}}
									initial={{
										x: 80,
										opacity: 0,
									}}
									animate={{
										x: 0,
										opacity: 1,
									}}
									exit={{
										x: 80,
										opacity: 0,
									}}
									transition={{
										delay: index * 0.08,
										duration: 0.3,
										ease: [0.4, 0, 0.2, 1],
									}}
									whileHover={{ scale: 1.05, x: -8 }}
									whileTap={{ scale: 0.95 }}
								>
									<Icon size={18} />
									<span className="text-sm font-medium whitespace-nowrap">
										{option.label}
									</span>
									{isActive && (
										<motion.div
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: "#191919" }}
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ duration: 0.2 }}
										/>
									)}
								</motion.button>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);

	const root = typeof document !== "undefined" ? document.body : null;
	return root ? createPortal(content, root) : content;
};

export default FloatingTypeSwitcher;

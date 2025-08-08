import { useEffect, useState, useRef } from "react";
import { getAllCategories } from "../services/categoryService.js";
import { useNavigate } from "react-router-dom";
import { BiDownArrow } from "react-icons/bi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import logo from "../assets/Logo mejorado.png";

// --- Componente Ayudante para el Acordeón del Menú Móvil ---
const AccordionSection = ({ title, isOpen, onToggle, items, onSelect }) => {
	const accordionVariants = {
		collapsed: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
		open: {
			opacity: 1,
			height: "auto",
			marginTop: "1rem",
			marginBottom: "0.5rem",
		},
	};

	return (
		<div className="border-b border-green-800 last:border-b-0">
			<button
				onClick={onToggle}
				className="w-full flex justify-between items-center text-2xl font-semibold text-white py-4"
			>
				<span>{title}</span>
				<BiDownArrow
					className={`transition-transform duration-300 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			<AnimatePresence>
				{isOpen && (
					<Motion.div
						initial="collapsed"
						animate="open"
						exit="collapsed"
						variants={accordionVariants}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="pl-4 flex flex-col items-start space-y-2 overflow-hidden"
					>
						{items.map((cat) => (
							<button
								key={cat.id}
								onClick={() => onSelect(cat.name)}
								className="text-lg text-green-200 hover:text-white capitalize py-1"
							>
								{cat.name}
							</button>
						))}
					</Motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

// --- Componente Principal de la Barra de Navegación ---
const Navbar = () => {
	const [destilados, setDestilados] = useState([]);
	const [clasificaciones, setClasificaciones] = useState([]);

	// Estados para los dropdowns del ESCRITORIO
	const [isDesktopDestiladosOpen, setIsDesktopDestiladosOpen] = useState(false);
	const [isDesktopClasificacionesOpen, setIsDesktopClasificacionesOpen] =
		useState(false);

	// Eliminado menú móvil

	const destiladosRef = useRef(null);
	const clasificacionesRef = useRef(null);
	const navigate = useNavigate();

	// --- Lógica de Efectos ---

	// Carga las categorías
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await getAllCategories();
				setDestilados(data.filter((cat) => cat.type === "destilado"));
				setClasificaciones(data.filter((cat) => cat.type === "clasificacion"));
			} catch (error) {
				console.error("Error fetching categories:", error);
			}
		};
		fetchCategories();
	}, []);

	// LÓGICA CORREGIDA: Exclusión mutua de los dropdowns de ESCRITORIO
	useEffect(() => {
		if (isDesktopDestiladosOpen) setIsDesktopClasificacionesOpen(false);
	}, [isDesktopDestiladosOpen]);

	useEffect(() => {
		if (isDesktopClasificacionesOpen) setIsDesktopDestiladosOpen(false);
	}, [isDesktopClasificacionesOpen]);

	// Cierra los dropdowns de escritorio si se hace clic afuera
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				destiladosRef.current &&
				!destiladosRef.current.contains(event.target)
			) {
				setIsDesktopDestiladosOpen(false);
			}
			if (
				clasificacionesRef.current &&
				!clasificacionesRef.current.contains(event.target)
			) {
				setIsDesktopClasificacionesOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Eliminado manejo de scroll por menú móvil

	// --- Manejadores de Eventos ---

	const handleCategorySelect = (categoryName, type) => {
		navigate(
			type === "destilado"
				? `/cocteles/${categoryName}`
				: `/comida/${categoryName}`
		);
	};

	// --- Variantes de Animación ---

	const dropdownVariants = {
		hidden: { opacity: 0, y: -10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.2, ease: "easeOut" },
		},
		exit: {
			opacity: 0,
			y: -10,
			transition: { duration: 0.15, ease: "easeIn" },
		},
	};

	// Variantes del menú móvil eliminadas

	// --- JSX del Componente ---

	return (
		<header className="bg-green-900 text-white shadow-lg sticky top-0 z-40">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
				{/* Logo */}
				<Motion.div
					whileHover={{ scale: 1.05 }}
					className="cursor-pointer flex items-center gap-x-2"
					onClick={() => navigate("/")}
				>
					<img
						src={logo}
						alt="Logo Huerta"
						className="h-25 w-auto object-contain"
						style={{
							marginTop: "15px",
							marginBottom: "0px",
							marginRight: "-20px",
						}}
					/>
					<h1
						className="text-4xl font-bold tracking-wider flex items-center"
						style={{ fontFamily: "'Playfair Display', serif" }}
					>
						Huerta
					</h1>
				</Motion.div>

				{/* Menú de Escritorio */}
				<div className="hidden md:flex items-center space-x-8">
					<div className="relative" ref={destiladosRef}>
						<Motion.button
							whileHover={{ y: -2 }}
							className="flex items-center text-lg font-medium hover:text-green-200 transition-colors"
							onClick={() => setIsDesktopDestiladosOpen((prev) => !prev)}
						>
							Cocteles
							<BiDownArrow
								className={`ml-2 transition-transform duration-300 ${
									isDesktopDestiladosOpen ? "rotate-180" : ""
								}`}
							/>
						</Motion.button>
						<AnimatePresence>
							{isDesktopDestiladosOpen && (
								<Motion.div
									variants={dropdownVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
									className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-lg shadow-xl border border-green-200 min-w-[200px] z-50 overflow-hidden"
								>
									<div className="py-2">
										{destilados.map((cat) => (
											<button
												key={cat.id}
												onClick={() =>
													handleCategorySelect(cat.name, "destilado")
												}
												className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-150 capitalize font-medium"
											>
												{cat.name}
											</button>
										))}
									</div>
								</Motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className="relative" ref={clasificacionesRef}>
						<Motion.button
							whileHover={{ y: -2 }}
							className="flex items-center text-lg font-medium hover:text-green-200 transition-colors"
							onClick={() => setIsDesktopClasificacionesOpen((prev) => !prev)}
						>
							Comida
							<BiDownArrow
								className={`ml-2 transition-transform duration-300 ${
									isDesktopClasificacionesOpen ? "rotate-180" : ""
								}`}
							/>
						</Motion.button>
						<AnimatePresence>
							{isDesktopClasificacionesOpen && (
								<Motion.div
									variants={dropdownVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
									className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-lg shadow-xl border border-green-200 min-w-[200px] z-50 overflow-hidden"
								>
									<div className="py-2">
										{clasificaciones.map((cat) => (
											<button
												key={cat.id}
												onClick={() =>
													handleCategorySelect(cat.name, "clasificacion")
												}
												className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-150 capitalize font-medium"
											>
												{cat.name}
											</button>
										))}
									</div>
								</Motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* Sin menú móvil */}
			</div>

			{/* Sin panel de menú móvil */}
		</header>
	);
};

export default Navbar;

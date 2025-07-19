import { useEffect, useState, useRef } from "react";
import { getAllCategories } from "../services/categoryService.js";
import { useNavigate } from "react-router-dom";
import { BiDownArrow } from "react-icons/bi";
import { FiMenu, FiX } from "react-icons/fi";
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

	// Estados para los acordeones del MÓVIL
	const [isMobileDestiladosOpen, setIsMobileDestiladosOpen] = useState(false);
	const [isMobileClasificacionesOpen, setIsMobileClasificacionesOpen] =
		useState(false);

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

	// Bloquea el scroll del body cuando el menú MÓVIL está abierto
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
			// Resetea los acordeones al cerrar
			setIsMobileDestiladosOpen(false);
			setIsMobileClasificacionesOpen(false);
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isMobileMenuOpen]);

	// --- Manejadores de Eventos ---

	const handleCategorySelect = (categoryName, type) => {
		setIsMobileMenuOpen(false); // Cierra el menú móvil al seleccionar
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

	const mobileMenuVariants = {
		hidden: { x: "100%", transition: { ease: "easeIn", duration: 0.3 } },
		visible: { x: 0, transition: { ease: "easeOut", duration: 0.3 } },
	};

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

				{/* Botón de Menú Móvil */}
				<div className="md:hidden">
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 -mr-2"
					>
						<FiMenu size={28} />
					</button>
				</div>
			</div>

			{/* Panel del Menú Móvil */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<Motion.div
						key="mobile-menu-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-60 z-50"
						onClick={() => setIsMobileMenuOpen(false)}
					>
						<Motion.div
							key="mobile-menu-panel"
							variants={mobileMenuVariants}
							initial="hidden"
							animate="visible"
							exit="hidden"
							className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-green-900 shadow-xl"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center p-6 border-b border-green-800">
								<h2
									className="text-2xl font-bold"
									style={{ fontFamily: "'Playfair Display', serif" }}
								>
									Menú
								</h2>
								<button
									onClick={() => setIsMobileMenuOpen(false)}
									className="p-2"
								>
									<FiX size={28} className="text-white" />
								</button>
							</div>
							<nav className="p-6">
								<AccordionSection
									title="Cocteles"
									isOpen={isMobileDestiladosOpen}
									onToggle={() => setIsMobileDestiladosOpen((prev) => !prev)}
									items={destilados}
									onSelect={(name) => handleCategorySelect(name, "destilado")}
								/>
								<AccordionSection
									title="Comida"
									isOpen={isMobileClasificacionesOpen}
									onToggle={() =>
										setIsMobileClasificacionesOpen((prev) => !prev)
									}
									items={clasificaciones}
									onSelect={(name) =>
										handleCategorySelect(name, "clasificacion")
									}
								/>
							</nav>
											</Motion.div>
				</Motion.div>
				)}
			</AnimatePresence>
		</header>
	);
};

export default Navbar;

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import logo from "../assets/Logo mejorado.png";

// --- Componente Principal de la Barra de Navegación ---
const Navbar = () => {
	const navigate = useNavigate();

	// Eliminado manejo de scroll por menú móvil

	// --- Navegación simple ---

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

				{/* Sin menú de escritorio: navegación por botón flotante y píldoras */}

				{/* Sin menú móvil */}
			</div>

			{/* Sin panel de menú móvil */}
		</header>
	);
};

export default Navbar;

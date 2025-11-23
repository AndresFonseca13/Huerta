import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import logo from "../assets/logo huerta .png";
import LanguageSwitcher from "./LanguageSwitcher";

// --- Componente Principal de la Barra de Navegación ---
const Navbar = () => {
	const navigate = useNavigate();

	// Eliminado manejo de scroll por menú móvil

	// --- Navegación simple ---

	// Variantes del menú móvil eliminadas

	// --- JSX del Componente ---

	return (
		<header
			className="shadow-lg sticky top-0 z-40"
			style={{ backgroundColor: "#121212", borderBottom: "1px solid #3a3a3a" }}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
				{/* Logo */}
				<Motion.div
					whileHover={{ scale: 1.05 }}
					className="cursor-pointer flex items-center gap-x-4"
					onClick={() => navigate("/")}
				>
					<img
						src={logo}
						alt="Logo Huerta"
						className="h-20 sm:h-24 w-auto object-contain block"
						style={{ objectPosition: "center" }}
					/>
					<h1
						className="text-3xl sm:text-4xl font-bold tracking-wider flex items-center"
						style={{
							fontFamily: "'Playfair Display', serif",
							color: "#e9cc9e",
						}}
					>
						Huerta
					</h1>
				</Motion.div>

				{/* Selector de idioma */}
				<LanguageSwitcher />
			</div>

			{/* Sin panel de menú móvil */}
		</header>
	);
};

export default Navbar;

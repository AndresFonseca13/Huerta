import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { motion } from "framer-motion";
import FloatingTypeSwitcher from "./FloatingTypeSwitcher.jsx";
import {
	getAllCategories,
	getFoodCategories,
} from "../services/categoryService.js";

const CategoryFilterBar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { categoria } = useParams();

	// Determinar el tipo basado en la ruta actual
	const initialTipo = useMemo(() => {
		if (location.pathname.startsWith("/bebidas")) return "destilado";
		if (location.pathname.startsWith("/comida")) return "clasificacion";
		return "destilado"; // predeterminado
	}, [location.pathname]);

	const [tipo, setTipo] = useState(initialTipo);
	const [allCategories, setAllCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	// Estado eliminado por no uso para evitar warning de lint
	// const [isFabOpen, setIsFabOpen] = useState(false);

	useEffect(() => {
		setTipo(initialTipo);
	}, [initialTipo]);

	// Cargar categorías al montar y cuando cambie 'tipo'
	useEffect(() => {
		const fetchCategories = async () => {
			setLoading(true);
			setError("");
			try {
				let data;
				if (tipo === "clasificacion") {
					data = await getFoodCategories();
					// Fallback por si el backend devuelve incompleto
					if (!Array.isArray(data) || data.length < 2) {
						const all = await getAllCategories(false);
						data = (Array.isArray(all) ? all : []).filter(
							(c) => c.type === "clasificacion comida"
						);
					}
				} else {
					data = await getAllCategories(false);
				}
				setAllCategories(Array.isArray(data) ? data : []);
			} catch (_err) {
				setError("No se pudieron cargar las categorías");
			} finally {
				setLoading(false);
			}
		};
		fetchCategories();
	}, [tipo]);

	const categoriasFiltradas = useMemo(() => {
		// Si el backend ya devuelve solo las válidas para comida, no filtramos por type
		if (tipo === "clasificacion") return allCategories;
		return allCategories.filter((c) => c.type === tipo);
	}, [allCategories, tipo]);

	const handleSelectCategoria = (nombreCategoria) => {
		if (!nombreCategoria) {
			navigate(tipo === "destilado" ? "/bebidas" : "/comida");
			try {
				requestAnimationFrame(() => {
					if (document?.scrollingElement) {
						document.scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
					} else {
						window.scrollTo({ top: 0, behavior: "smooth" });
					}
				});
			} catch (_err) {
				/* noop */
			}
			return;
		}
		navigate(
			tipo === "destilado"
				? `/bebidas/${nombreCategoria}`
				: `/comida/${nombreCategoria}`
		);
		try {
			requestAnimationFrame(() => {
				if (document?.scrollingElement) {
					document.scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
				} else {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}
			});
		} catch (_err) {
			/* noop */
		}
	};

	const isSelected = (name) => {
		return Boolean(categoria) && categoria === name;
	};

	return (
		<div className="w-full flex flex-col gap-3 md:gap-4 items-center mb-4">
			{/* Botón flotante - ahora maneja su propia navegación */}
			<FloatingTypeSwitcher />

			{/* Botones de categorías - scroll horizontal */}
			<div className="w-full max-w-7xl px-4">
				<div
					className="flex flex-nowrap items-center gap-2 md:gap-3 overflow-x-auto scroll-smooth no-scrollbar"
					role="tablist"
					aria-label="Filtros por categoría"
				>
					<button
						className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base transition-all shadow-sm ${
							!categoria &&
							(location.pathname === "/bebidas" ||
								location.pathname === "/comida")
								? "border-[#e9cc9e] text-[#191919]"
								: "bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]"
						}`}
						style={
							!categoria &&
							(location.pathname === "/bebidas" ||
								location.pathname === "/comida")
								? { backgroundColor: "#e9cc9e" }
								: {}
						}
						onClick={() => handleSelectCategoria(null)}
					>
						{tipo === "destilado" ? "Todas las bebidas" : "Toda la comida"}
					</button>

					{loading && (
						<span
							className="flex-shrink-0 text-sm"
							style={{ color: "#b8b8b8" }}
						>
							Cargando...
						</span>
					)}
					{error && (
						<span className="flex-shrink-0 text-sm text-red-400">{error}</span>
					)}

					{!loading &&
						!error &&
						categoriasFiltradas.map((cat) => (
							<button
								key={cat.id}
								className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base capitalize transition-all shadow-sm ${
									isSelected(cat.name)
										? "border-[#e9cc9e] text-[#191919]"
										: "bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]"
								}`}
								style={
									isSelected(cat.name) ? { backgroundColor: "#e9cc9e" } : {}
								}
								onClick={() => handleSelectCategoria(cat.name)}
							>
								{cat.name}
							</button>
						))}
				</div>
			</div>
		</div>
	);
};

export default CategoryFilterBar;

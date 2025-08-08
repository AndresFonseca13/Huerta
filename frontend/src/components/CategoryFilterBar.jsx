import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCocktail, FaUtensils, FaTimes } from "react-icons/fa";
import { getAllCategories } from "../services/categoryService.js";

const CategoryFilterBar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { categoria } = useParams();

	// Determinar el tipo basado en la ruta actual
	const initialTipo = useMemo(() => {
		if (location.pathname.startsWith("/cocteles")) return "destilado";
		if (location.pathname.startsWith("/comida")) return "clasificacion";
		return "destilado"; // predeterminado
	}, [location.pathname]);

	const [tipo, setTipo] = useState(initialTipo);
	const [allCategories, setAllCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isFabOpen, setIsFabOpen] = useState(false);

	useEffect(() => {
		setTipo(initialTipo);
	}, [initialTipo]);

	useEffect(() => {
		const fetchCategories = async () => {
			setLoading(true);
			setError("");
			try {
				const data = await getAllCategories(false);
				setAllCategories(Array.isArray(data) ? data : []);
			} catch (err) {
				setError("No se pudieron cargar las categorías");
			} finally {
				setLoading(false);
			}
		};
		fetchCategories();
	}, []);

	const categoriasFiltradas = useMemo(
		() => allCategories.filter((c) => c.type === tipo),
		[allCategories, tipo]
	);

	const handleTipoChange = (nuevoTipo) => {
		setTipo(nuevoTipo);
		// Ir a la ruta base del tipo seleccionado
		if (nuevoTipo === "destilado") {
			navigate("/cocteles");
		} else {
			navigate("/comida");
		}
		setIsFabOpen(false);
	};

	const handleSelectCategoria = (nombreCategoria) => {
		if (!nombreCategoria) {
			// "Todos"
			navigate(tipo === "destilado" ? "/cocteles" : "/comida");
			return;
		}
		navigate(
			tipo === "destilado"
				? `/cocteles/${nombreCategoria}`
				: `/comida/${nombreCategoria}`
		);
	};

	const isSelected = (name) => {
		return Boolean(categoria) && categoria === name;
	};

	return (
		<div className="w-full flex flex-col gap-3 md:gap-4 items-center mb-4">
			{/* Botón flotante fijo para cambiar tipo */}
			<div className="fixed right-4 md:right-6 bottom-16 md:bottom-24 z-50">
				<button
					type="button"
					aria-label="Cambiar tipo"
					onClick={() => setIsFabOpen((v) => !v)}
					className="flex items-center justify-center w-12 h-12 rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 focus:outline-none"
				>
					{tipo === "destilado" ? (
						<FaCocktail size={18} />
					) : (
						<FaUtensils size={18} />
					)}
				</button>

				<AnimatePresence>
					{isFabOpen && (
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.98 }}
							transition={{ duration: 0.2 }}
							className="absolute bottom-14 right-0 w-44 bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden"
						>
							<div className="flex items-center justify-between px-3 py-2 border-b">
								<span className="text-sm font-medium text-gray-700">
									Seleccionar
								</span>
								<button
									className="p-1 text-gray-500 hover:text-gray-700"
									onClick={() => setIsFabOpen(false)}
									aria-label="Cerrar"
								>
									<FaTimes size={14} />
								</button>
							</div>
							<button
								className={`w-full flex items-center gap-2 px-3 py-3 text-left text-sm transition-colors ${
									tipo === "destilado"
										? "bg-green-50 text-green-800"
										: "hover:bg-gray-50"
								}`}
								onClick={() => handleTipoChange("destilado")}
							>
								<FaCocktail /> Bebidas
							</button>
							<button
								className={`w-full flex items-center gap-2 px-3 py-3 text-left text-sm transition-colors ${
									tipo === "clasificacion"
										? "bg-green-50 text-green-800"
										: "hover:bg-gray-50"
								}`}
								onClick={() => handleTipoChange("clasificacion")}
							>
								<FaUtensils /> Comida
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Botones de categorías - scroll horizontal */}
			<div className="w-full max-w-7xl px-4">
				<div
					className="flex flex-nowrap items-center gap-2 md:gap-3 overflow-x-auto scroll-smooth no-scrollbar"
					role="tablist"
					aria-label="Filtros por categoría"
				>
					<button
						className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base transition-colors shadow-sm ${
							!categoria &&
							(location.pathname === "/cocteles" ||
								location.pathname === "/comida")
								? "bg-green-900 text-white border-green-900"
								: "bg-white text-gray-800 border-gray-200 hover:bg-green-50"
						}`}
						onClick={() => handleSelectCategoria(null)}
					>
						{tipo === "destilado" ? "Todas las bebidas" : "Toda la comida"}
					</button>

					{loading && (
						<span className="flex-shrink-0 text-sm text-gray-500">
							Cargando...
						</span>
					)}
					{error && (
						<span className="flex-shrink-0 text-sm text-red-500">{error}</span>
					)}

					{!loading &&
						!error &&
						categoriasFiltradas.map((cat) => (
							<button
								key={cat.id}
								className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base capitalize transition-colors shadow-sm ${
									isSelected(cat.name)
										? "bg-green-900 text-white border-green-900"
										: "bg-white text-gray-800 border-gray-200 hover:bg-green-50"
								}`}
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

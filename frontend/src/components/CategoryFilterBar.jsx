import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
			} catch (err) {
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
			{/* Botón flotante movido a Portal para evitar stacking context */}
			<FloatingTypeSwitcher tipo={tipo} onChange={handleTipoChange} />

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

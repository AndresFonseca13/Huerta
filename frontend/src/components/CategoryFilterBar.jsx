import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { motion } from "framer-motion";
import FloatingTypeSwitcher from "./FloatingTypeSwitcher.jsx";
import {
	getAllCategories,
	getFoodCategories,
} from "../services/categoryService.js";
import { getProducts } from "../services/productService.js";
import { useTranslation } from "react-i18next";

const CategoryFilterBar = () => {
	const { t } = useTranslation();
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
	const [categoriesWithProducts, setCategoriesWithProducts] = useState(new Set());
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
				setError(t("categoryFilter.error"));
			} finally {
				setLoading(false);
			}
		};
		fetchCategories();
	}, [tipo, t]);

	// Verificar qué categorías tienen productos asociados
	useEffect(() => {
		const checkCategoriesWithProducts = async () => {
			if (allCategories.length === 0) {
				setCategoriesWithProducts(new Set());
				return;
			}

			try {
				// Filtrar categorías por tipo primero
				const filteredByType = tipo === "clasificacion" 
					? allCategories.filter((c) => c.type === "clasificacion comida")
					: allCategories.filter((c) => c.type === tipo);

				if (filteredByType.length === 0) {
					setCategoriesWithProducts(new Set());
					return;
				}

				const productType = tipo === "clasificacion" ? "clasificacion" : tipo;
				const categoriesSet = new Set();

				// Verificar cada categoría individualmente
				// Hacemos llamadas paralelas para ser más eficientes
				const checkPromises = filteredByType.map(async (category) => {
					try {
						// Hacer una llamada con límite 1 para verificar si hay productos
						const data = await getProducts(1, 1, category.name, productType);
						const products = Array.isArray(data.cocteles) ? data.cocteles : [];
						const totalRecords = data.paginacion?.totalRecords || 0;
						
						// Si hay al menos 1 producto, agregar la categoría
						if (totalRecords > 0 || products.length > 0) {
							return { name: category.name, hasProducts: true };
						}
						return { name: category.name, hasProducts: false };
					} catch (err) {
						// Si hay error al verificar una categoría, no la incluimos
						return { name: category.name, hasProducts: false, error: true };
					}
				});

				// Esperar todas las verificaciones
				const results = await Promise.all(checkPromises);
				
				// Agregar solo las categorías que tienen productos
				results.forEach((result) => {
					if (result.hasProducts) {
						categoriesSet.add(result.name);
					}
				});

				setCategoriesWithProducts(categoriesSet);
			} catch (_err) {
				// Si hay error general, no mostrar ninguna categoría (más seguro)
				setCategoriesWithProducts(new Set());
			}
		};

		checkCategoriesWithProducts();
	}, [allCategories, tipo]);

	const categoriasFiltradas = useMemo(() => {
		// Primero filtrar por tipo
		let filtered = tipo === "clasificacion" 
			? allCategories.filter((c) => c.type === "clasificacion comida")
			: allCategories.filter((c) => c.type === tipo);
		
		// Luego filtrar solo las que tienen productos asociados
		// Si categoriesWithProducts está vacío y ya cargamos las categorías, no mostrar ninguna
		// (esperando a que se verifiquen)
		if (allCategories.length > 0 && categoriesWithProducts.size === 0) {
			// Aún verificando, no mostrar ninguna categoría temporalmente
			return [];
		}
		
		// Filtrar solo las que tienen productos
		const finalFiltered = filtered.filter((c) => categoriesWithProducts.has(c.name));
		
		return finalFiltered;
	}, [allCategories, tipo, categoriesWithProducts]);

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
								? {
										backgroundColor: "#e9cc9e",
										WebkitAppearance: "none",
										WebkitTapHighlightColor: "transparent",
								  }
								: {
										WebkitAppearance: "none",
										WebkitTapHighlightColor: "transparent",
								  }
						}
						onClick={() => handleSelectCategoria(null)}
					>
						{tipo === "destilado"
							? t("categoryFilter.allBeverages")
							: t("categoryFilter.allFood")}
					</button>

					{loading && (
						<span
							className="flex-shrink-0 text-sm"
							style={{ color: "#b8b8b8" }}
						>
							{t("categoryFilter.loading")}
						</span>
					)}
					{error && (
						<span className="flex-shrink-0 text-sm text-red-400">{error}</span>
					)}

					{!loading &&
						!error &&
						categoriasFiltradas.map((cat) => {
							// Traducir categorías de comida (entrada, fuerte, postre, adiciones)
							const getCategoryLabel = (categoryName) => {
								if (tipo === "clasificacion") {
									// Normalizar el nombre removiendo espacios y convirtiendo a minúsculas
									const normalizedName = categoryName
										.toLowerCase()
										.trim()
										.replace(/\s+/g, "");

									// Mapear variaciones comunes de categorías
									const categoryMap = {
										entrada: "entrada",
										entradas: "entrada",
										fuerte: "fuerte",
										fuertes: "fuerte",
										platofuerte: "fuerte",
										platosfuertes: "fuerte",
										postre: "postre",
										postres: "postre",
										adiciones: "adiciones",
										adicion: "adiciones",
										acompañamientos: "adiciones",
										acompañamiento: "adiciones",
									};

									const mappedName =
										categoryMap[normalizedName] || normalizedName;
									const translationKey = `foodCategory.${mappedName}`;
									const translated = t(translationKey);

									// Si la traducción es igual a la clave, significa que no existe, usar nombre original
									return translated !== translationKey
										? translated
										: categoryName;
								}
								return categoryName;
							};

							return (
								<button
									key={cat.id}
									className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base capitalize transition-all shadow-sm ${
										isSelected(cat.name)
											? "border-[#e9cc9e] text-[#191919]"
											: "bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]"
									}`}
									style={
										isSelected(cat.name)
											? {
													backgroundColor: "#e9cc9e",
													WebkitAppearance: "none",
													WebkitTapHighlightColor: "transparent",
											  }
											: {
													WebkitAppearance: "none",
													WebkitTapHighlightColor: "transparent",
											  }
									}
									onClick={() => handleSelectCategoria(cat.name)}
								>
									{getCategoryLabel(cat.name)}
								</button>
							);
						})}
				</div>
			</div>
		</div>
	);
};

export default CategoryFilterBar;

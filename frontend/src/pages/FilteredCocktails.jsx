import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import { getProducts } from "../services/productService";
import CardCocktail from "../components/CardCocktail";
import CocktailDetailModal from "../components/CocktailDetailModal";
import CategoryFilterBar from "../components/CategoryFilterBar.jsx";
import { useTranslation } from "react-i18next";

const FilteredCocktails = () => {
	const { t } = useTranslation();
	const { categoria } = useParams();
	const location = useLocation();
	const [cocktails, setCocktails] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalRecords, setTotalRecords] = useState(0);
	const [selectedCocktail, setSelectedCocktail] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const topRef = useRef(null);

	// Determinar el tipo basado en la ruta (soporta "/bebidas" y "/comida")
	const tipo = location.pathname.startsWith("/bebidas")
		? "destilado"
		: "clasificacion";

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getProducts(currentPage, pageSize, categoria, tipo);
				const items = Array.isArray(data.cocteles) ? data.cocteles : [];
				const totalPages = data.paginacion?.totalPages || 0;
				const totalRecords = data.paginacion?.totalRecords || 0;
				setCocktails(items);
				setTotalPages(totalPages);
				setTotalRecords(totalRecords);
			} catch (_error) {
				// noop
			}
		};

		fetchData();
	}, [currentPage, pageSize, categoria, tipo]);

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		// Scroll suave hacia arriba con animación
		topRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	const handleCardClick = (cocktail) => {
		setSelectedCocktail(cocktail);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedCocktail(null);
	};

	const getFilterTitle = () => {
		if (!categoria) {
			return tipo === "destilado"
				? t("pageTitle.allCocktails")
				: t("pageTitle.allFood");
		}

		// Traducir categorías de comida
		if (tipo === "clasificacion") {
			// Normalizar el nombre removiendo espacios y convirtiendo a minúsculas
			const normalizedName = categoria.toLowerCase().trim().replace(/\s+/g, "");

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

			const mappedName = categoryMap[normalizedName] || normalizedName;
			const translationKey = `foodCategory.${mappedName}`;
			const translated = t(translationKey);

			// Si la traducción es igual a la clave, significa que no existe, usar nombre original
			return translated !== translationKey ? translated : categoria;
		}

		return categoria;
	};

	return (
		<div
			className="py-8"
			style={{ backgroundColor: "#191919", minHeight: "100vh" }}
		>
			<div ref={topRef} />
			<CategoryFilterBar />
			<motion.div
				className="text-center mb-6 px-4"
				initial={{ opacity: 1, y: 0 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1
					className="text-3xl md:text-4xl font-bold mb-2 capitalize"
					style={{ color: "#e9cc9e" }}
				>
					{getFilterTitle()}
				</h1>
				<p className="text-gray-400">
					{totalRecords > 0
						? tipo === "destilado"
							? t("pageTitle.foundBeverages", { count: totalRecords })
							: t("pageTitle.foundDishes", { count: totalRecords })
						: t("pageTitle.noResults")}
				</p>
			</motion.div>

			<div className="flex flex-wrap gap-4 justify-center p-6">
				{cocktails.map((cocktail, index) => (
					<div
						key={cocktail.id}
						className="animate-fade-in"
						style={{
							opacity: 1,
							animationDelay: `${index * 0.05}s`,
						}}
					>
						<CardCocktail cocktail={cocktail} onClick={handleCardClick} />
					</div>
				))}
			</div>

			{totalPages > 0 && (
				<motion.div
					className="flex flex-col items-center mt-4 space-y-2 mb-4 px-4"
					initial={{ opacity: 1, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<div className="text-sm" style={{ color: "#b8b8b8" }}>
						Mostrando {cocktails.length} de {totalRecords}{" "}
						{tipo === "destilado" ? "bebidas" : "platos"} (Página {currentPage}{" "}
						de {totalPages})
					</div>
					<div className="flex justify-center space-x-2 overflow-x-auto">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={currentPage === 1}
							onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
							className="px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
							style={{
								color: "#e9cc9e",
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							‹ Anterior
						</motion.button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<motion.button
								key={page}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => handlePageChange(page)}
								className={`px-3 py-2 rounded-lg transition-all ${
									page === currentPage ? "font-bold" : ""
								}`}
								style={
									page === currentPage
										? { backgroundColor: "#e9cc9e", color: "#191919" }
										: {
												backgroundColor: "#2a2a2a",
												color: "#e9cc9e",
												border: "1px solid #3a3a3a",
										  }
								}
							>
								{page}
							</motion.button>
						))}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={currentPage === totalPages}
							onClick={() =>
								handlePageChange(Math.min(currentPage + 1, totalPages))
							}
							className="px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
							style={{
								color: "#e9cc9e",
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							Siguiente ›
						</motion.button>
					</div>
				</motion.div>
			)}

			{/* Modal de detalles del cóctel */}
			<CocktailDetailModal
				cocktail={selectedCocktail}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</div>
	);
};

export default FilteredCocktails;

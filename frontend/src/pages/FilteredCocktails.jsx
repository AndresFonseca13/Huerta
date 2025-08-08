import React, { useEffect, useState, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import { getCocktails } from "../services/cocktailService";
import CardCocktail from "../components/CardCocktail";
import CocktailDetailModal from "../components/CocktailDetailModal";
import CategoryFilterBar from "../components/CategoryFilterBar.jsx";

const FilteredCocktails = () => {
	const { categoria } = useParams();
	const location = useLocation();
	const [cocktails, setCocktails] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalRecords, setTotalRecords] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedCocktail, setSelectedCocktail] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const topRef = useRef(null);

	// Determinar el tipo basado en la ruta (soporta "/cocteles" y "/cocteles/:categoria")
	const tipo = location.pathname.startsWith("/cocteles")
		? "destilado"
		: "clasificacion";

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				console.log("[DEBUG] FilteredCocktails - Iniciando fetchData con:", {
					currentPage,
					pageSize,
					categoria,
					tipo,
				});

				const data = await getCocktails(currentPage, pageSize, categoria, tipo);

				// El backend devuelve 'cocteles' y 'paginacion'
				const items = Array.isArray(data.cocteles) ? data.cocteles : [];
				const totalPages = data.paginacion?.totalPages || 0;
				const totalRecords = data.paginacion?.totalRecords || 0;

				console.log("[DEBUG] FilteredCocktails - Datos recibidos:", {
					items,
					totalPages,
					totalRecords,
				});

				setCocktails(items);
				setTotalPages(totalPages);
				setTotalRecords(totalRecords);

				console.log("[DEBUG] FilteredCocktails - Estado actualizado:", {
					cocktailsCount: items.length,
					totalPages,
					totalRecords,
				});
			} catch (error) {
				console.error("[DEBUG] FilteredCocktails - Error:", error);
			} finally {
				setIsLoading(false);
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

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: {
			opacity: 0,
			y: 20,
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.3,
				ease: "easeOut",
			},
		},
	};

	const getFilterTitle = () => {
		if (!categoria) {
			return tipo === "destilado" ? "Todos los cocteles" : "Toda la comida";
		}
		if (tipo === "destilado") {
			return `Cocteles de ${categoria}`;
		} else if (tipo === "clasificacion") {
			return `Comida de ${categoria}`;
		}
		return `Filtro: ${categoria}`;
	};

	return (
		<div className="py-8">
			<div ref={topRef} />
			<CategoryFilterBar />
			<motion.div
				className="text-center mb-6 px-4"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className="text-3xl font-bold text-green-900 mb-2 capitalize">
					{getFilterTitle()}
				</h1>
				<p className="text-gray-600">
					{totalRecords > 0
						? `Encontramos ${totalRecords} ${
								tipo === "destilado" ? "cocteles" : "platos"
						  }`
						: "No se encontraron resultados"}
				</p>
			</motion.div>

			<motion.div
				className="flex flex-wrap gap-4 justify-center p-6"
				variants={containerVariants}
				initial="hidden"
				animate={isLoading ? "hidden" : "visible"}
				key={`${categoria}-${tipo}-${currentPage}`}
			>
				{cocktails.map((cocktail) => (
					<motion.div key={cocktail.id} variants={itemVariants} layout>
						<CardCocktail cocktail={cocktail} onClick={handleCardClick} />
					</motion.div>
				))}
			</motion.div>

			{totalPages > 0 && (
				<motion.div
					className="flex flex-col items-center mt-4 space-y-2 mb-4 px-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<div className="text-sm text-gray-600">
						Mostrando {cocktails.length} de {totalRecords}{" "}
						{tipo === "destilado" ? "cocteles" : "platos"} (Página {currentPage}{" "}
						de {totalPages})
					</div>
					<div className="flex justify-center space-x-2 overflow-x-auto">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={currentPage === 1}
							onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
							className="px-3 py-1 rounded disabled:opacity-50 text-black transition-colors"
						>
							‹ Anterior
						</motion.button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<motion.button
								key={page}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => handlePageChange(page)}
								className={`px-3 py-1 rounded transition-colors ${
									page === currentPage ? "bg-green-700 text-white" : ""
								}`}
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
							className="px-3 py-1 rounded disabled:opacity-50 text-black transition-colors"
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

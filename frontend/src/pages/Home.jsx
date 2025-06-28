import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCocktails } from "../services/cocktailService";
import CardCocktail from "../components/CardCocktail";
import CocktailDetailModal from "../components/CocktailDetailModal";

const Home = () => {
	const [cocktails, setCocktails] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalRecords, setTotalRecords] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedCocktail, setSelectedCocktail] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const topRef = useRef(null);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const { cocktails, pagination } = await getCocktails(
					currentPage,
					pageSize
				);
				setCocktails(cocktails);
				setTotalPages(pagination.totalPages);
				setTotalRecords(pagination.totalRecords);
			} catch (error) {
				console.error("Error fetching cocktails:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [currentPage, pageSize]);

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

	console.log("Cocktails en Home:", cocktails);

	return (
		<>
			<div ref={topRef} />
			<motion.div
				className="flex flex-wrap gap-4 justify-center p-6"
				variants={containerVariants}
				initial="hidden"
				animate={isLoading ? "hidden" : "visible"}
				key={currentPage} // Esto fuerza la re-animación en cada cambio de página
			>
				{cocktails.map((cocktail) => (
					<motion.div key={cocktail.id} variants={itemVariants} layout>
						<CardCocktail cocktail={cocktail} onClick={handleCardClick} />
					</motion.div>
				))}
			</motion.div>

			<motion.div
				className="flex flex-col items-center mt-4 space-y-2 mb-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
			>
				<div className="text-sm text-gray-600">
					Mostrando {cocktails.length} de {totalRecords} cocteles (Página{" "}
					{currentPage} de {totalPages})
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

			{/* Modal de detalles del cóctel */}
			<CocktailDetailModal
				cocktail={selectedCocktail}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</>
	);
};

export default Home;

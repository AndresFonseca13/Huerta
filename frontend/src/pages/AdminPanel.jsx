import React, { useState, useEffect } from "react";
import { getCocktails } from "../services/cocktailService";
import {
	FiEye,
	FiEdit,
	FiTrash2,
	FiPlus,
	FiX,
	FiChevronDown,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PreviewCardCocktail from "../components/PreviewCardCocktail";
import EditCocktailModal from "../components/EditCocktailModal";
import ManageCocktailModal from "../components/ManageCocktailModal";

const AdminPanel = () => {
	const [cocktails, setCocktails] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCocktail, setSelectedCocktail] = useState(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [editingCocktail, setEditingCocktail] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [managingCocktail, setManagingCocktail] = useState(null);
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const [expandedRowId, setExpandedRowId] = useState(null);

	useEffect(() => {
		const fetchCocktails = async () => {
			try {
				const { items } = await getCocktails(1, 50); // Traemos hasta 50 items
				setCocktails(items);
			} catch (err) {
				setError("No se pudieron cargar los cócteles.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchCocktails();
	}, []);

	const handleViewClick = (cocktail) => {
		setSelectedCocktail(cocktail);
		setIsViewModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsViewModalOpen(false);
		setSelectedCocktail(null);
	};

	const handleEditClick = (cocktail) => {
		setEditingCocktail(cocktail);
		setIsEditModalOpen(true);
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setEditingCocktail(null);
	};

	const handleUpdateSuccess = (updatedCocktail) => {
		setCocktails((prevCocktails) =>
			prevCocktails.map((c) =>
				c.id === updatedCocktail.id ? updatedCocktail : c
			)
		);
		handleCloseEditModal();
	};

	const handleManageClick = (cocktail) => {
		setManagingCocktail(cocktail);
		setIsManageModalOpen(true);
	};

	const handleCloseManageModal = () => {
		setIsManageModalOpen(false);
		setManagingCocktail(null);
	};

	const handleManageSuccess = (updatedCocktail) => {
		if (updatedCocktail === null) {
			// El cóctel fue eliminado físicamente
			setCocktails((prevCocktails) =>
				prevCocktails.filter((c) => c.id !== managingCocktail.id)
			);
		} else {
			// El estado del cóctel fue actualizado
			setCocktails((prevCocktails) =>
				prevCocktails.map((c) =>
					c.id === updatedCocktail.id ? updatedCocktail : c
				)
			);
		}
		handleCloseManageModal();
	};

	const toggleRow = (id) => {
		setExpandedRowId((prevId) => (prevId === id ? null : id));
	};

	const formatCategories = (categories) => {
		if (!categories || categories.length === 0) {
			return <span className="text-gray-400">Sin categorías</span>;
		}
		return categories.map((cat, index) => {
			// Manejar tanto strings como objetos {name, type}
			const categoryName = typeof cat === "string" ? cat : cat.name;
			return (
				<span
					key={index}
					className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
				>
					{categoryName}
				</span>
			);
		});
	};

	if (loading) {
		return <div className="p-8 text-center text-lg">Cargando cócteles...</div>;
	}

	if (error) {
		return <div className="p-8 text-center text-red-500">{error}</div>;
	}

	return (
		<div className="p-4 md:p-8 bg-gray-50 min-h-screen">
			<header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
				<div className="text-center md:text-left mb-4 md:mb-0">
					<h1 className="text-2xl md:text-4xl font-bold text-gray-800">
						Panel de Administración
					</h1>
					<p className="text-gray-600">Gestión de Cócteles</p>
				</div>
				<button className="w-full md:w-auto flex items-center justify-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors">
					<FiPlus className="mr-2" />
					Crear Nuevo
				</button>
			</header>

			<main>
				<div className="bg-white rounded-lg shadow-md overflow-x-auto">
					<table className="w-full text-left">
						<thead className="border-b bg-gray-100">
							<tr>
								<th className="p-4 font-semibold text-gray-600">Nombre</th>
								<th className="p-4 font-semibold text-gray-600">Precio</th>
								<th className="p-4 font-semibold text-black hidden sm:table-cell">
									Categorías
								</th>
								<th className="p-4 font-semibold text-gray-600 text-center hidden md:table-cell">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{cocktails.map((cocktail) => (
								<React.Fragment key={cocktail.id}>
									<tr
										className="border-b hover:bg-gray-50 transition-colors md:cursor-default cursor-pointer"
										onClick={() =>
											window.innerWidth < 768 && toggleRow(cocktail.id)
										}
									>
										<td className="p-4 font-medium text-gray-800 capitalize">
											{cocktail.name}
										</td>
										<td className="p-4 text-gray-700">
											${Number(cocktail.price).toLocaleString("es-CO")}
										</td>
										<td className="p-4 hidden sm:table-cell">
											{formatCategories(cocktail.categories)}
										</td>
										<td className="p-4 hidden md:table-cell">
											<div className="flex items-center justify-center space-x-2">
												<button
													onClick={() => handleViewClick(cocktail)}
													className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
													title="Ver"
												>
													<FiEye size={18} />
												</button>
												<button
													onClick={() => handleEditClick(cocktail)}
													className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors"
													title="Editar"
												>
													<FiEdit size={18} />
												</button>
												<button
													onClick={() => handleManageClick(cocktail)}
													className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
													title="Gestionar"
												>
													<FiTrash2 size={18} />
												</button>
											</div>
										</td>
									</tr>
									<AnimatePresence>
										{expandedRowId === cocktail.id && (
											<motion.tr
												className="md:hidden"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.2 }}
											>
												<td colSpan={3} className="p-4 bg-gray-50">
													<div className="sm:hidden mb-2">
														<h4 className="font-semibold text-sm mb-1 text-black">
															Categorías
														</h4>
														{formatCategories(cocktail.categories)}
													</div>
													<div className="flex items-center justify-start space-x-4">
														<button
															onClick={() => handleViewClick(cocktail)}
															className="flex items-center text-sm text-blue-600 font-semibold p-2 rounded-md hover:bg-blue-100 transition-colors"
														>
															<FiEye className="mr-2" /> Ver
														</button>
														<button
															onClick={() => handleEditClick(cocktail)}
															className="flex items-center text-sm text-green-600 font-semibold p-2 rounded-md hover:bg-green-100 transition-colors"
														>
															<FiEdit className="mr-2" /> Editar
														</button>
														<button
															onClick={() => handleManageClick(cocktail)}
															className="flex items-center text-sm text-red-600 font-semibold p-2 rounded-md hover:bg-red-100 transition-colors"
														>
															<FiTrash2 className="mr-2" /> Gestionar
														</button>
													</div>
												</td>
											</motion.tr>
										)}
									</AnimatePresence>
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			</main>

			<AnimatePresence>
				{isViewModalOpen && selectedCocktail && (
					<motion.div
						className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleCloseModal}
					>
						<motion.div
							className="relative"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							onClick={(e) => e.stopPropagation()}
						>
							<h3 className="text-xl font-semibold text-white text-center mb-4">
								Vista Previa de la Card
							</h3>
							<PreviewCardCocktail cocktail={selectedCocktail} />
							<button
								onClick={handleCloseModal}
								className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
								aria-label="Cerrar modal"
							>
								<FiX size={20} />
							</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isEditModalOpen && editingCocktail && (
					<EditCocktailModal
						cocktail={editingCocktail}
						isOpen={isEditModalOpen}
						onClose={handleCloseEditModal}
						onUpdateSuccess={handleUpdateSuccess}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isManageModalOpen && managingCocktail && (
					<ManageCocktailModal
						cocktail={managingCocktail}
						isOpen={isManageModalOpen}
						onClose={handleCloseManageModal}
						onUpdateSuccess={handleManageSuccess}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default AdminPanel;

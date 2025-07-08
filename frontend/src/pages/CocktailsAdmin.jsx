import React, { useState, useEffect } from "react";
import { getCocktailsAdmin } from "../services/cocktailService.js";
import BackButton from "../components/BackButton";
import EditCocktailModal from "../components/EditCocktailModal";
import ManageCocktailModal from "../components/ManageCocktailModal";
import CocktailDetailModal from "../components/CocktailDetailModal";
import PreviewCardCocktail from "../components/PreviewCardCocktail";
import {
	FiEdit,
	FiTrash2,
	FiEye,
	FiEyeOff,
	FiMoreVertical,
	FiSearch,
	FiX,
} from "react-icons/fi";

const CocktailsAdmin = () => {
	const [cocktails, setCocktails] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCocktail, setSelectedCocktail] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [expandedRowId, setExpandedRowId] = useState(null);
	const [showActionsDropdown, setShowActionsDropdown] = useState(null);

	useEffect(() => {
		const fetchCocktails = async () => {
			try {
				const response = await getCocktailsAdmin(1, 50);
				setCocktails(response.cocteles || []);
			} catch (err) {
				setError("No se pudieron cargar los cócteles.");
			} finally {
				setLoading(false);
			}
		};
		fetchCocktails();
	}, []);

	const refreshCocktails = async () => {
		setLoading(true);
		try {
			const response = await getCocktailsAdmin(1, 50);
			setCocktails(response.cocteles || []);
		} catch (err) {
			setError("No se pudieron cargar los cócteles.");
		} finally {
			setLoading(false);
		}
	};

	const openEditModal = (cocktail) => {
		setSelectedCocktail(cocktail);
		setIsEditModalOpen(true);
	};
	const closeEditModal = () => {
		setIsEditModalOpen(false);
		setSelectedCocktail(null);
	};
	const openManageModal = (cocktail) => {
		setSelectedCocktail(cocktail);
		setIsManageModalOpen(true);
	};
	const closeManageModal = () => {
		setIsManageModalOpen(false);
		setSelectedCocktail(null);
	};
	const openDetailModal = (cocktail) => {
		setSelectedCocktail(cocktail);
		setIsDetailModalOpen(true);
	};
	const closeDetailModal = () => {
		setIsDetailModalOpen(false);
		setSelectedCocktail(null);
	};
	const handleUpdateSuccess = (updatedCocktail) => {
		closeEditModal();
		closeManageModal();
		refreshCocktails();
	};
	const toggleRow = (id) => {
		setExpandedRowId((prevId) => (prevId === id ? null : id));
	};

	if (loading) {
		return <div className="p-8 text-center text-lg">Cargando cócteles...</div>;
	}

	if (error) {
		return <div className="p-8 text-center text-red-500">{error}</div>;
	}

	const formatCategories = (categories) => {
		if (!categories || categories.length === 0) {
			return <span className="text-gray-400">Sin categorías</span>;
		}
		return categories.map((cat, index) => {
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

	return (
		<div className="p-4 md:p-8 bg-gray-50 min-h-screen">
			<header className="mb-8 flex flex-col md:flex-row md:items-center w-full">
				<div className="mb-4 md:mb-0 md:mr-6">
					<BackButton />
				</div>
				<div>
					<h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
						Gestión de Cócteles
					</h1>
					<p className="text-gray-600">Administra los cócteles del sistema</p>
				</div>
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
							{cocktails.length === 0 ? (
								<tr>
									<td colSpan={4} className="p-8 text-center text-gray-400">
										No hay cócteles para mostrar.
									</td>
								</tr>
							) : (
								cocktails.map((cocktail) => (
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
											{/* Acciones en desktop */}
											<td className="p-4 text-center hidden md:table-cell">
												<button
													onClick={(e) => {
														e.stopPropagation();
														openDetailModal(cocktail);
													}}
													className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors mr-2"
													title="Ver Detalle"
												>
													<FiSearch size={18} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														openEditModal(cocktail);
													}}
													className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors mr-2"
													title="Editar"
												>
													<FiEdit size={18} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														openManageModal(cocktail);
													}}
													className={`p-2 rounded-full transition-colors ${
														cocktail.is_active
															? "text-red-500 hover:text-red-700 hover:bg-red-100"
															: "text-green-600 hover:text-green-800 hover:bg-green-100"
													}`}
													title={
														cocktail.is_active
															? "Desactivar/Borrar"
															: "Activar/Borrar"
													}
												>
													{cocktail.is_active ? (
														<FiEyeOff size={18} />
													) : (
														<FiEye size={18} />
													)}
												</button>
											</td>
										</tr>
										{/* Acciones en mobile (responsive) */}
										{expandedRowId === cocktail.id && (
											<tr className="md:hidden">
												<td colSpan={4} className="p-4 bg-gray-50">
													<div className="flex items-center justify-start space-x-4">
														<button
															onClick={() => openDetailModal(cocktail)}
															className="flex items-center text-sm text-blue-600 font-semibold p-2 rounded-md hover:bg-blue-100 transition-colors"
														>
															<FiSearch className="mr-2" /> Ver
														</button>
														<button
															onClick={() => openEditModal(cocktail)}
															className="flex items-center text-sm text-green-600 font-semibold p-2 rounded-md hover:bg-green-100 transition-colors"
														>
															<FiEdit className="mr-2" /> Editar
														</button>
														<button
															onClick={() => openManageModal(cocktail)}
															className={`flex items-center text-sm font-semibold p-2 rounded-md transition-colors ${
																cocktail.is_active
																	? "text-red-600 hover:bg-red-100"
																	: "text-green-800 hover:bg-green-100"
															}`}
														>
															{cocktail.is_active ? (
																<FiEyeOff className="mr-2" />
															) : (
																<FiEye className="mr-2" />
															)}
															{cocktail.is_active
																? "Desactivar/Borrar"
																: "Activar/Borrar"}
														</button>
													</div>
												</td>
											</tr>
										)}
									</React.Fragment>
								))
							)}
						</tbody>
					</table>
				</div>
			</main>
			{/* Modales */}
			<EditCocktailModal
				cocktail={selectedCocktail}
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				onUpdateSuccess={handleUpdateSuccess}
			/>
			<ManageCocktailModal
				cocktail={selectedCocktail}
				isOpen={isManageModalOpen}
				onClose={closeManageModal}
				onUpdateSuccess={handleUpdateSuccess}
			/>
			<CocktailDetailModal
				cocktail={selectedCocktail}
				isOpen={isDetailModalOpen}
				onClose={closeDetailModal}
			/>
			{/* Modal de vista previa usando PreviewCardCocktail */}
			{isDetailModalOpen && selectedCocktail && (
				<PreviewCardCocktail
					cocktail={selectedCocktail}
					isModal={true}
					onClose={closeDetailModal}
				/>
			)}
		</div>
	);
};

export default CocktailsAdmin;

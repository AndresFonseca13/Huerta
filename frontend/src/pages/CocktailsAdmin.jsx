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
	FiChevronUp,
	FiChevronDown,
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
	const [sortBy, setSortBy] = useState(null);
	const [sortOrder, setSortOrder] = useState("asc");
	const [categoryFilter, setCategoryFilter] = useState(null);
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

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

	// Obtener categorías únicas
	const uniqueCategories = Array.from(
		new Set(
			cocktails.flatMap((c) =>
				(c.categories || []).map((cat) =>
					typeof cat === "string" ? cat : cat.name
				)
			)
		)
	);

	// Función para filtrar por letras en cualquier orden
	function matchesAllLetters(name, search) {
		if (!search) return true;
		const nameLower = name.toLowerCase();
		return search
			.toLowerCase()
			.split("")
			.every((char) => nameLower.includes(char));
	}

	// Lógica de filtrado y ordenamiento
	let filtered = [...cocktails];
	if (categoryFilter)
		filtered = filtered.filter((cocktail) =>
			(cocktail.categories || []).some(
				(cat) => (typeof cat === "string" ? cat : cat.name) === categoryFilter
			)
		);
	if (searchTerm)
		filtered = filtered.filter((cocktail) =>
			matchesAllLetters(cocktail.name, searchTerm)
		);
	if (sortBy === "name") {
		filtered.sort((a, b) => {
			if (a.name.toLowerCase() < b.name.toLowerCase())
				return sortOrder === "asc" ? -1 : 1;
			if (a.name.toLowerCase() > b.name.toLowerCase())
				return sortOrder === "asc" ? 1 : -1;
			return 0;
		});
	}
	if (sortBy === "price") {
		filtered.sort((a, b) => {
			if (a.price < b.price) return sortOrder === "asc" ? -1 : 1;
			if (a.price > b.price) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});
	}

	// Handlers de encabezados
	const handleSortByName = () => {
		if (sortBy !== "name") {
			setSortBy("name");
			setSortOrder("asc");
		} else {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		}
	};
	const handleSortByPrice = () => {
		if (sortBy !== "price") {
			setSortBy("price");
			setSortOrder("asc");
		} else {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		}
	};
	const handleCategoryDropdown = () => setShowCategoryDropdown((prev) => !prev);
	const handleCategorySelect = (cat) => {
		setCategoryFilter(cat);
		setShowCategoryDropdown(false);
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
					{/* Filtro de categorías solo en mobile, debajo del título */}
					<div className="sm:hidden mt-4">
						<div className="relative w-full">
							<button
								className="flex items-center w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 justify-between"
								onClick={handleCategoryDropdown}
							>
								{categoryFilter ? categoryFilter : "Filtrar por categoría"}
								<FiChevronDown className="ml-2" />
							</button>
							{showCategoryDropdown && (
								<div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50 min-w-[120px] max-h-60 overflow-y-auto w-full">
									<button
										className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
											categoryFilter === null ? "font-bold" : ""
										}`}
										onClick={() => handleCategorySelect(null)}
									>
										Todas
									</button>
									{uniqueCategories.map((cat) => (
										<button
											key={cat}
											className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
												categoryFilter === cat ? "font-bold" : ""
											}`}
											onClick={() => handleCategorySelect(cat)}
										>
											{cat}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</header>
			<main>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
					<div className="relative w-full sm:w-64">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar cóctel..."
							className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200"
						/>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-md overflow-x-auto">
					<table className="w-full text-left">
						<thead className="border-b bg-gray-100">
							<tr>
								<th
									className="p-4 font-semibold text-gray-600 cursor-pointer select-none relative"
									onClick={handleSortByName}
								>
									Nombre
									{sortBy === "name" &&
										(sortOrder === "asc" ? (
											<FiChevronUp className="inline ml-1" />
										) : (
											<FiChevronDown className="inline ml-1" />
										))}
								</th>
								<th
									className="p-4 font-semibold text-gray-600 cursor-pointer select-none relative"
									onClick={handleSortByPrice}
								>
									Precio
									{sortBy === "price" &&
										(sortOrder === "asc" ? (
											<FiChevronUp className="inline ml-1" />
										) : (
											<FiChevronDown className="inline ml-1" />
										))}
								</th>
								<th
									className="p-4 font-semibold text-black cursor-pointer select-none relative hidden sm:table-cell"
									style={{ minWidth: 120 }}
									onClick={handleCategoryDropdown}
								>
									<div className="flex items-center">
										Categorías
										<FiChevronDown className="ml-1" />
									</div>
									{showCategoryDropdown && (
										<div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50 min-w-[120px] max-h-60 overflow-y-auto">
											<button
												className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
													categoryFilter === null ? "font-bold" : ""
												}`}
												onClick={() => handleCategorySelect(null)}
											>
												Todas
											</button>
											{uniqueCategories.map((cat) => (
												<button
													key={cat}
													className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
														categoryFilter === cat ? "font-bold" : ""
													}`}
													onClick={() => handleCategorySelect(cat)}
												>
													{cat}
												</button>
											))}
										</div>
									)}
								</th>
								<th className="p-4 font-semibold text-gray-600 text-center hidden md:table-cell">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length === 0 ? (
								<tr>
									<td colSpan={4} className="p-8 text-center text-gray-400">
										No hay cócteles para mostrar.
									</td>
								</tr>
							) : (
								filtered.map((cocktail) => (
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
													<div className="flex flex-col gap-2">
														<div>
															<span className="block text-xs font-semibold text-gray-500 mb-1">
																Categorías:
															</span>
															<div className="flex flex-wrap gap-2">
																{formatCategories(cocktail.categories)}
															</div>
														</div>
														<div className="flex items-center justify-start space-x-4 mt-2">
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

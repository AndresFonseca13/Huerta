import React, { useEffect, useState } from "react";
import {
	FiEdit,
	FiTrash2,
	FiPlus,
	FiCheckCircle,
	FiXCircle,
	FiChevronDown,
	FiChevronUp,
	FiChevronRight,
	FiChevronLeft,
	FiSearch,
} from "react-icons/fi";
import { getAllCategories } from "../services/categoryService";
import { AnimatePresence, motion as Motion } from "framer-motion";
import CategoryModal from "../components/CategoryModal";
import {
	createCategory,
	updateCategory,
	toggleCategoryActive,
	deleteCategory,
} from "../services/categoryService";
import ConfirmModal from "../components/ErrorModal";

const CategoriesAdmin = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [expandedRowId, setExpandedRowId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalEditData, setModalEditData] = useState(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState(null);
	const [sortOrder, setSortOrder] = useState("asc");
	const [sortBy, setSortBy] = useState(null);
	const [typeFilter, setTypeFilter] = useState(null);
	const [showTypeDropdown, setShowTypeDropdown] = useState(false);
	const [statusFilter, setStatusFilter] = useState("all");
	const [showStatusDropdown, setShowStatusDropdown] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await getAllCategories(true); // showAll=true
				setCategories(data);
			} catch {
				setError("No se pudieron cargar las categorías.");
			} finally {
				setLoading(false);
			}
		};
		fetchCategories();
	}, []);

	const handleToggleActive = async (category) => {
		try {
			await toggleCategoryActive(category.id, !category.is_active);
			const updated = await getAllCategories(true);
			setCategories(updated);
		} catch (err) {
			alert(err.message || "Error al cambiar el estado de la categoría");
		}
	};

	const handleDelete = (category) => {
		setCategoryToDelete(category);
		setConfirmOpen(true);
	};

	const confirmDelete = async () => {
		if (!categoryToDelete) return;
		try {
			await deleteCategory(categoryToDelete.id);
			const updated = await getAllCategories(true);
			setCategories(updated);
		} catch (err) {
			alert(err.message || "Error al borrar la categoría");
		} finally {
			setConfirmOpen(false);
			setCategoryToDelete(null);
		}
	};

	const cancelDelete = () => {
		setConfirmOpen(false);
		setCategoryToDelete(null);
	};

	const openCreateModal = () => {
		setIsEditMode(false);
		setModalEditData(null);
		setIsModalOpen(true);
	};

	const openEditModal = (category) => {
		setIsEditMode(true);
		setModalEditData(category);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalEditData(null);
		setIsEditMode(false);
	};

	const handleSaveCategory = async (data) => {
		try {
			if (isEditMode && modalEditData) {
				await updateCategory(modalEditData.id, data);
			} else {
				await createCategory(data);
			}
			// Refrescar lista
			const updated = await getAllCategories(true);
			setCategories(updated);
			closeModal();
		} catch (err) {
			alert(err.message || "Error al guardar la categoría");
		}
	};

	const toggleRow = (id) => {
		setExpandedRowId((prevId) => (prevId === id ? null : id));
	};

	// Obtener types únicos
	const uniqueTypes = Array.from(new Set(categories.map((cat) => cat.type)));

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
	let filtered = [...categories];
	if (typeFilter) filtered = filtered.filter((cat) => cat.type === typeFilter);
	if (statusFilter === "active")
		filtered = filtered.filter((cat) => cat.is_active);
	if (statusFilter === "inactive")
		filtered = filtered.filter((cat) => !cat.is_active);
	if (searchTerm)
		filtered = filtered.filter((cat) =>
			matchesAllLetters(cat.name, searchTerm)
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

	// Handlers de encabezados
	const handleSortByName = () => {
		if (sortBy !== "name") {
			setSortBy("name");
			setSortOrder("asc");
		} else {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		}
	};
	const handleTypeDropdown = () => setShowTypeDropdown((prev) => !prev);
	const handleStatusDropdown = () => setShowStatusDropdown((prev) => !prev);
	const handleTypeSelect = (type) => {
		setTypeFilter(type);
		setShowTypeDropdown(false);
	};
	const handleStatusSelect = (status) => {
		setStatusFilter(status);
		setShowStatusDropdown(false);
	};

	if (loading)
		return <div className="p-8 text-center">Cargando categorías...</div>;
	if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

	return (
		<div className="p-4 md:p-8 bg-gray-50 min-h-screen">
			<header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
				<div className="text-center md:text-left mb-4 md:mb-0">
					<h1 className="text-2xl md:text-4xl font-bold text-gray-800">
						Gestión de Categorías
					</h1>
					<p className="text-gray-600">Administra las categorías del sistema</p>
				</div>
				<div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
					<div className="relative w-full md:w-64">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar categoría..."
							className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200"
						/>
					</div>
					<button
						onClick={openCreateModal}
						className="flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
					>
						<FiPlus className="mr-2" /> Crear Nueva Categoría
					</button>
				</div>
			</header>
			<main>
				<div
					className="bg-white rounded-lg shadow-md overflow-x-auto"
					style={{ overflowY: "visible" }}
				>
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
									style={{ minWidth: 120 }}
								>
									<div
										className="flex items-center"
										onClick={handleTypeDropdown}
									>
										Tipo
										<FiChevronDown className="ml-1" />
									</div>
									{showTypeDropdown && (
										<div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50 min-w-[120px] max-h-60 overflow-y-auto">
											<button
												className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
													typeFilter === null ? "font-bold" : ""
												}`}
												onClick={() => handleTypeSelect(null)}
											>
												Todos
											</button>
											{uniqueTypes.map((type) => (
												<button
													key={type}
													className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
														typeFilter === type ? "font-bold" : ""
													}`}
													onClick={() => handleTypeSelect(type)}
												>
													{type}
												</button>
											))}
										</div>
									)}
								</th>
								<th
									className="p-4 font-semibold text-gray-600 cursor-pointer select-none relative"
									style={{ minWidth: 120 }}
								>
									<div
										className="flex items-center"
										onClick={handleStatusDropdown}
									>
										Estado
										<FiChevronDown className="ml-1" />
									</div>
									{showStatusDropdown && (
										<div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50 min-w-[120px] max-h-60 overflow-y-auto">
											<button
												className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
													statusFilter === "all" ? "font-bold" : ""
												}`}
												onClick={() => handleStatusSelect("all")}
											>
												Todos
											</button>
											<button
												className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
													statusFilter === "active" ? "font-bold" : ""
												}`}
												onClick={() => handleStatusSelect("active")}
											>
												Activos
											</button>
											<button
												className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
													statusFilter === "inactive" ? "font-bold" : ""
												}`}
												onClick={() => handleStatusSelect("inactive")}
											>
												Inactivos
											</button>
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
									<td colSpan={5} className="p-8 text-center text-gray-400">
										No hay categorías para mostrar.
									</td>
								</tr>
							) : (
								filtered.map((cat) => (
									<React.Fragment key={cat.id}>
										<tr
											className="border-b hover:bg-gray-50 transition-colors md:cursor-default cursor-pointer"
											onClick={() =>
												window.innerWidth < 768 && toggleRow(cat.id)
											}
										>
											<td className="p-4 font-medium text-gray-800 capitalize">
												{cat.name}
											</td>
											<td className="p-4 text-gray-700 capitalize">
												{cat.type}
											</td>
											<td className="p-4">
												{cat.is_active ? (
													<span className="inline-flex items-center text-green-600 font-semibold">
														<FiCheckCircle className="mr-1" /> Activa
													</span>
												) : (
													<span className="inline-flex items-center text-red-500 font-semibold">
														<FiXCircle className="mr-1" /> Inactiva
													</span>
												)}
											</td>
											{/* Acciones en desktop */}
											<td className="p-4 text-center hidden md:table-cell">
												<button
													onClick={(e) => {
														e.stopPropagation();
														openEditModal(cat);
													}}
													className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors mr-2"
													title="Editar"
												>
													<FiEdit size={18} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleToggleActive(cat);
													}}
													className={`p-2 rounded-full transition-colors ${
														cat.is_active
															? "text-red-500 hover:text-red-700 hover:bg-red-100"
															: "text-green-600 hover:text-green-800 hover:bg-green-100"
													}`}
													title={cat.is_active ? "Desactivar" : "Activar"}
												>
													{cat.is_active ? (
														<FiTrash2 size={18} />
													) : (
														<FiCheckCircle size={18} />
													)}
												</button>
												{!cat.is_active && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleDelete(cat);
														}}
														className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-full transition-colors ml-2"
														title="Borrar definitivamente"
													>
														<FiTrash2 size={18} />
													</button>
												)}
											</td>
										</tr>
										<AnimatePresence>
											{expandedRowId === cat.id && (
												<tr className="md:hidden">
													<td colSpan={4} className="p-4 bg-gray-50">
														<Motion.div
															initial={{ opacity: 0, y: -10 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -10 }}
															transition={{ duration: 0.2 }}
															className="flex items-center justify-start space-x-4"
														>
															<button
																onClick={() => openEditModal(cat)}
																className="flex items-center text-sm text-green-600 font-semibold p-2 rounded-md hover:bg-green-100 transition-colors"
															>
																<FiEdit className="mr-2" /> Editar
															</button>
															<button
																onClick={() => handleToggleActive(cat)}
																className={`flex items-center text-sm font-semibold p-2 rounded-md transition-colors ${
																	cat.is_active
																		? "text-red-600 hover:bg-red-100"
																		: "text-green-800 hover:bg-green-100"
																}`}
															>
																{cat.is_active ? (
																	<FiTrash2 className="mr-2" />
																) : (
																	<FiCheckCircle className="mr-2" />
																)}{" "}
																{cat.is_active ? "Desactivar" : "Activar"}
															</button>
															{!cat.is_active && (
																<button
																	onClick={() => handleDelete(cat)}
																	className="flex items-center text-sm text-red-600 font-semibold p-2 rounded-md hover:bg-red-100 transition-colors"
																>
																	<FiTrash2 className="mr-2" /> Borrar
																</button>
															)}
														</Motion.div>
													</td>
												</tr>
											)}
										</AnimatePresence>
									</React.Fragment>
								))
							)}
						</tbody>
					</table>
				</div>
			</main>
			<CategoryModal
				isOpen={isModalOpen}
				onClose={closeModal}
				onSave={handleSaveCategory}
				initialData={modalEditData}
				modoEdicion={isEditMode}
			/>
			<ConfirmModal
				isOpen={confirmOpen}
				onClose={cancelDelete}
				onConfirm={confirmDelete}
				message={
					categoryToDelete
						? `¿Seguro que deseas borrar la categoría "${categoryToDelete.name}"? Esta acción es irreversible.`
						: ""
				}
			/>
		</div>
	);
};

export default CategoriesAdmin;

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
	FiEdit,
	FiTrash2,
	FiPlus,
	FiCheckCircle,
	FiXCircle,
	FiSearch,
} from "react-icons/fi";
import { getAllCategories } from "../services/categoryService";
import { motion as Motion } from "framer-motion";
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
	// Ya no usamos filas expandibles en el rediseño tipo cards, se conserva por si se requiere en mobile.
	// const [expandedRowId, setExpandedRowId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalEditData, setModalEditData] = useState(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState(null);
	const [sortOrder] = useState("asc");
	const [sortBy] = useState(null);
	const [typeFilter, setTypeFilter] = useState(null);
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 12;
	const listTopRef = useRef(null);

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

	// const toggleRow = (id) => {
	//   setExpandedRowId((prevId) => (prevId === id ? null : id));
	// };

	// Obtener types únicos
	const uniqueTypes = useMemo(
		() => Array.from(new Set(categories.map((cat) => cat.type))),
		[categories]
	);

	// Contadores
	const total = categories.length;
	const activos = useMemo(
		() => categories.filter((c) => c.is_active).length,
		[categories]
	);
	const inactivos = total - activos;
	const typeCounts = useMemo(() => {
		const map = new Map();
		categories.forEach((c) => {
			const t = c.type || "";
			map.set(t, (map.get(t) || 0) + 1);
		});
		return map;
	}, [categories]);

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

	// Handlers simples
	const handleTypeSelect = (type) => {
		setTypeFilter(type);
		setCurrentPage(1);
	};
	// Estado se cambia ahora desde los KPIs clicables

	// Paginación en cliente
	const totalItems = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const startIdx = (safeCurrentPage - 1) * pageSize;
	const endIdx = startIdx + pageSize;
	const paginated = filtered.slice(startIdx, endIdx);

	// Al cambiar de página, hacer scroll suave al inicio de la lista
	useEffect(() => {
		if (listTopRef.current) {
			try {
				listTopRef.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			} catch (_) {
				// fallback sin smooth si el navegador no soporta
				listTopRef.current.scrollIntoView();
			}
		}
	}, [safeCurrentPage]);

	if (loading)
		return (
			<div className="p-6 md:p-10 min-h-screen bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
					<div className="h-5 w-72 bg-gray-200 rounded animate-pulse mb-6" />
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="h-20 bg-white rounded-xl shadow-sm p-4">
								<div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
								<div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
							</div>
						))}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-40 bg-white rounded-xl shadow-sm p-4">
								<div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3" />
								<div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
								<div className="h-8 w-full bg-gray-100 rounded animate-pulse" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

	return (
		<div className="p-4 md:p-8 bg-gray-50 min-h-screen">
			<header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center w-full">
				<div className="flex-1">
					<Motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
					>
						<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
							Gestión de Categorías
						</h1>
						<p className="text-gray-600">
							Administra las categorías del sistema
						</p>
					</Motion.div>
				</div>
				<div className="mt-4 md:mt-0">
					<button
						onClick={openCreateModal}
						className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
					>
						<FiPlus className="mr-2" /> Crear Categoría
					</button>
				</div>
			</header>
			<main>
				{/* Buscador y filtros */}
				<div className="flex flex-col gap-4 mb-4">
					<div className="relative w-full sm:w-80">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar categoría..."
							className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200"
						/>
					</div>
					{/* KPIs: ocupar ancho completo en desktop para evitar estrechamiento */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-2 w-full">
						<Motion.div
							className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "all" ? "ring-2 ring-green-200" : ""
							}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							onClick={() => setStatusFilter("all")}
						>
							<div className="text-sm text-gray-500">Total</div>
							<div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
								<span className="font-semibold text-base">{total}</span>
							</div>
						</Motion.div>
						<Motion.div
							className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "active" ? "ring-2 ring-blue-200" : ""
							}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							onClick={() => setStatusFilter("active")}
						>
							<div className="text-sm text-gray-500">Activas</div>
							<div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
								<span className="font-semibold text-base">{activos}</span>
							</div>
						</Motion.div>
						<Motion.div
							className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "inactive" ? "ring-2 ring-yellow-200" : ""
							}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							onClick={() => setStatusFilter("inactive")}
						>
							<div className="text-sm text-gray-500">Inactivas</div>
							<div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
								<span className="font-semibold text-base">{inactivos}</span>
							</div>
						</Motion.div>
					</div>

					{/* Píldoras de tipo */}
					<div className="w-full">
						<div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
							<button
								onClick={() => handleTypeSelect(null)}
								className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${
									typeFilter === null
										? "bg-green-600 text-white border-green-600"
										: "bg-white text-gray-700 border-gray-200 hover:bg-green-50"
								}`}
							>
								Todos
							</button>
							{uniqueTypes.map((type) => (
								<button
									key={type}
									onClick={() => handleTypeSelect(type)}
									className={`px-3 py-1.5 rounded-full border text-sm capitalize whitespace-nowrap ${
										typeFilter === type
											? "bg-green-600 text-white border-green-600"
											: "bg-white text-gray-700 border-gray-200 hover:bg-green-50"
									}`}
								>
									{type}{" "}
									{typeCounts.get(type) ? `(${typeCounts.get(type)})` : ""}
								</button>
							))}
						</div>
					</div>
					{/* Quitamos las píldoras de estado; usamos los KPIs clicables */}
					{/* Ancla para scroll al top de la lista al paginar */}
					<div ref={listTopRef} />
				</div>

				{/* Grid de mini-cards */}
				{paginated.length === 0 ? (
					<div className="p-10 text-center text-gray-400 bg-white rounded-xl">
						No hay categorías para mostrar.
					</div>
				) : (
					<Motion.div
						key={safeCurrentPage}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
					>
						{paginated.map((cat) => (
							<div
								key={cat.id}
								className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start justify-between gap-2">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 capitalize">
											{cat.name}
										</h3>
										<span className="inline-flex text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize mt-1">
											{cat.type}
										</span>
									</div>
									<span
										className={`text-xs px-2 py-1 rounded-full ${
											cat.is_active
												? "bg-green-100 text-green-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{cat.is_active ? "Activa" : "Inactiva"}
									</span>
								</div>
								<div className="flex items-center justify-end gap-2 mt-4">
									<button
										onClick={() => openEditModal(cat)}
										className="inline-flex items-center text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
									>
										<FiEdit className="mr-1" /> Editar
									</button>
									<button
										onClick={() => handleToggleActive(cat)}
										className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${
											cat.is_active
												? "text-red-700 bg-red-50 hover:bg-red-100"
												: "text-green-800 bg-green-50 hover:bg-green-100"
										}`}
									>
										{cat.is_active ? (
											<FiTrash2 className="mr-1" />
										) : (
											<FiCheckCircle className="mr-1" />
										)}
										{cat.is_active ? "Desactivar" : "Activar"}
									</button>
									{!cat.is_active && (
										<button
											onClick={() => handleDelete(cat)}
											className="inline-flex items-center text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium px-3 py-1.5 rounded-full"
										>
											<FiTrash2 className="mr-1" /> Borrar
										</button>
									)}
								</div>
							</div>
						))}
					</Motion.div>
				)}

				{/* Paginación */}
				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-2 mt-6">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
							disabled={safeCurrentPage === 1}
						>
							Anterior
						</button>
						<div className="text-sm text-gray-600">
							Página <span className="font-semibold">{safeCurrentPage}</span> de{" "}
							{totalPages}
						</div>
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
							disabled={safeCurrentPage === totalPages}
						>
							Siguiente
						</button>
					</div>
				)}
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

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
	FiEdit,
	FiTrash2,
	FiPlus,
	FiCheckCircle,
	FiXCircle,
	FiSearch,
	FiStar,
} from "react-icons/fi";
import { getAllCategories } from "../services/categoryService";
import { motion as Motion } from "framer-motion";
import CategoryModal from "../components/CategoryModal";
import {
	createCategory,
	updateCategory,
	toggleCategoryActive,
	toggleCategoryPriority,
	deleteCategory,
} from "../services/categoryService";
import ConfirmModal from "../components/ConfirmModal";

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
	const [loadingPriorityId, setLoadingPriorityId] = useState(null);
	const [loadingActiveId, setLoadingActiveId] = useState(null);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await getAllCategories(true); // showAll=true
				console.log("CategoriesAdmin - Categorías cargadas:", data);
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
			setLoadingActiveId(category.id);
			await toggleCategoryActive(category.id, !category.is_active);
			const updated = await getAllCategories(true);
			setCategories(updated);
		} catch (err) {
			alert(err.message || "Error al cambiar el estado de la categoría");
		} finally {
			setLoadingActiveId(null);
		}
	};

	const handleTogglePriority = async (category) => {
		try {
			setLoadingPriorityId(category.id);
			await toggleCategoryPriority(category.id, !category.is_priority);
			const updated = await getAllCategories(true);
			setCategories(updated);
		} catch (err) {
			alert(err.message || "Error al cambiar la prioridad de la categoría");
		} finally {
			setLoadingPriorityId(null);
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
			<div
				className="p-6 md:p-10 min-h-screen"
				style={{ backgroundColor: "#191919" }}
			>
				<div className="max-w-6xl mx-auto">
					<div
						className="h-8 w-48 rounded animate-pulse mb-4"
						style={{ backgroundColor: "#2a2a2a" }}
					/>
					<div
						className="h-5 w-72 rounded animate-pulse mb-6"
						style={{ backgroundColor: "#2a2a2a" }}
					/>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-20 rounded-xl shadow-sm p-4"
								style={{
									backgroundColor: "#2a2a2a",
									border: "1px solid #3a3a3a",
								}}
							>
								<div
									className="h-4 w-24 rounded animate-pulse mb-2"
									style={{ backgroundColor: "#3a3a3a" }}
								/>
								<div
									className="h-6 w-16 rounded animate-pulse"
									style={{ backgroundColor: "#3a3a3a" }}
								/>
							</div>
						))}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="h-40 rounded-xl shadow-sm p-4"
								style={{
									backgroundColor: "#2a2a2a",
									border: "1px solid #3a3a3a",
								}}
							>
								<div
									className="h-5 w-32 rounded animate-pulse mb-3"
									style={{ backgroundColor: "#3a3a3a" }}
								/>
								<div
									className="h-4 w-20 rounded animate-pulse mb-2"
									style={{ backgroundColor: "#3a3a3a" }}
								/>
								<div
									className="h-8 w-full rounded animate-pulse"
									style={{ backgroundColor: "#3a3a3a" }}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

	return (
		<div
			className="p-4 md:p-8 min-h-screen"
			style={{ backgroundColor: "#191919" }}
		>
			<header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center w-full">
				<div className="flex-1">
					<Motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
					>
						<h1
							className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight"
							style={{ color: "#e9cc9e" }}
						>
							Gestión de Categorías
						</h1>
						<p style={{ color: "#b8b8b8" }}>
							Administra las categorías del sistema
						</p>
					</Motion.div>
				</div>
				<div className="mt-4 md:mt-0">
					<button
						onClick={openCreateModal}
						className="flex items-center px-4 py-2 text-white rounded-lg transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
						style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
					>
						<FiPlus className="mr-2" /> Crear Categoría
					</button>
				</div>
			</header>
			<main>
				{/* Buscador y filtros */}
				<div className="flex flex-col gap-4 mb-4">
					<div className="relative w-full sm:w-80">
						<FiSearch
							className="absolute left-3 top-1/2 -translate-y-1/2"
							style={{ color: "#b8b8b8" }}
						/>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar categoría..."
							className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
							style={{
								backgroundColor: "#2a2a2a",
								color: "#e9cc9e",
								border: "1px solid #3a3a3a",
							}}
						/>
					</div>
					{/* KPIs: ocupar ancho completo en desktop para evitar estrechamiento */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-2 w-full">
						<Motion.div
							className={`rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "all" ? "ring-2" : ""
							}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
							onClick={() => setStatusFilter("all")}
						>
							<div className="text-sm" style={{ color: "#b8b8b8" }}>
								Total
							</div>
							<div
								className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
								style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
							>
								<span className="font-semibold text-base">{total}</span>
							</div>
						</Motion.div>
						<Motion.div
							className={`rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "active" ? "ring-2" : ""
							}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
							onClick={() => setStatusFilter("active")}
						>
							<div className="text-sm" style={{ color: "#b8b8b8" }}>
								Activas
							</div>
							<div
								className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
								style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
							>
								<span className="font-semibold text-base">{activos}</span>
							</div>
						</Motion.div>
						<Motion.div
							className={`rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "inactive" ? "ring-2" : ""
							}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
							onClick={() => setStatusFilter("inactive")}
						>
							<div className="text-sm" style={{ color: "#b8b8b8" }}>
								Inactivas
							</div>
							<div
								className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
								style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
							>
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
										? "border-[#e9cc9e] text-[#191919]"
										: "bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]"
								}`}
								style={
									typeFilter === null ? { backgroundColor: "#e9cc9e" } : {}
								}
							>
								Todos
							</button>
							{uniqueTypes.map((type) => (
								<button
									key={type}
									onClick={() => handleTypeSelect(type)}
									className={`px-3 py-1.5 rounded-full border text-sm capitalize whitespace-nowrap ${
										typeFilter === type
											? "border-[#e9cc9e] text-[#191919]"
											: "bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]"
									}`}
									style={
										typeFilter === type ? { backgroundColor: "#e9cc9e" } : {}
									}
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
					<div
						className="p-10 text-center rounded-xl"
						style={{
							backgroundColor: "#2a2a2a",
							color: "#b8b8b8",
							border: "1px solid #3a3a3a",
						}}
					>
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
								className="rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow overflow-hidden"
								style={{
									backgroundColor: "#2a2a2a",
									border: "1px solid #3a3a3a",
								}}
							>
								<div className="flex flex-col gap-3 h-full">
									{/* Cabecera: nombre + estado/prioridad */}
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<h3
												className="text-lg font-semibold capitalize truncate"
												style={{ color: "#e9cc9e" }}
											>
												{cat.name}
											</h3>
											<div className="flex flex-wrap items-center gap-2 mt-2">
												<span
													className="inline-flex text-xs px-2 py-1 rounded-full capitalize"
													style={{
														backgroundColor: "#3a3a3a",
														color: "#e9cc9e",
													}}
												>
													{cat.type}
												</span>
												<span
													className="inline-flex text-xs px-2 py-1 rounded-full"
													style={{
														backgroundColor: "#3a3a3a",
														color: "#e9cc9e",
													}}
												>
													{cat.product_count || 0} productos
												</span>
											</div>
										</div>
										<div className="flex flex-col items-end gap-2 shrink-0">
											<span
												className="text-xs px-2 py-1 rounded-full"
												style={{
													backgroundColor: "#3a3a3a",
													color: "#e9cc9e",
												}}
											>
												{cat.is_active ? "Activa" : "Inactiva"}
											</span>
											{cat.is_priority && (
												<span
													className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
													style={{
														backgroundColor: "#e9cc9e",
														color: "#191919",
													}}
												>
													<FiStar className="fill-current" size={12} />
													Prioritaria
												</span>
											)}
										</div>
									</div>

									{/* Acciones */}
									<div className="flex flex-wrap items-center gap-2 mt-1">
										<button
											onClick={() => openEditModal(cat)}
											className="inline-flex items-center justify-center shrink-0 w-full sm:w-auto text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150"
											style={{
												backgroundColor: "#2a2a2a",
												color: "#e9cc9e",
												border: "1px solid #3a3a3a",
											}}
										>
											<FiEdit className="mr-1" /> Editar
										</button>
										<button
											onClick={() => handleTogglePriority(cat)}
											className={`inline-flex items-center justify-center shrink-0 w-full sm:w-auto text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-150 ${
												cat.is_priority ? "ring-2 ring-[#e9cc9e]" : ""
											}`}
											style={{
												backgroundColor: cat.is_priority ? "#e9cc9e" : "#2a2a2a",
												color: cat.is_priority ? "#191919" : "#e9cc9e",
												border: "1px solid #3a3a3a",
											}}
											title={
												cat.is_priority
													? "Quitar prioridad (los productos aparecerán después)"
													: "Marcar como prioritaria (los productos aparecerán primero)"
											}
											disabled={loadingPriorityId === cat.id}
										>
											{loadingPriorityId === cat.id ? (
												<span className="flex items-center gap-2">
													<span className="w-4 h-4 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
													<span>
														{cat.is_priority
															? "Actualizando..."
															: "Priorizando..."}
													</span>
												</span>
											) : (
												<>
													<FiStar
														className={`mr-1 ${
															cat.is_priority ? "fill-current" : ""
														}`}
													/>
													{cat.is_priority ? "Prioritaria" : "Priorizar"}
												</>
											)}
										</button>
										<button
											onClick={() => handleToggleActive(cat)}
											className="inline-flex items-center justify-center shrink-0 w-full sm:w-auto text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150"
											style={{
												backgroundColor: "#2a2a2a",
												color: "#e9cc9e",
												border: "1px solid #3a3a3a",
											}}
											disabled={loadingActiveId === cat.id}
										>
											{loadingActiveId === cat.id ? (
												<span className="flex items-center gap-2">
													<span className="w-4 h-4 border-2 border-[#e9cc9e] border-t-transparent rounded-full animate-spin" />
													<span>Aplicando...</span>
												</span>
											) : (
												<>
													{cat.is_active ? (
														<FiXCircle className="mr-1" />
													) : (
														<FiCheckCircle className="mr-1" />
													)}
													{cat.is_active ? "Desactivar" : "Activar"}
												</>
											)}
										</button>
										<button
											onClick={() => handleDelete(cat)}
											className="inline-flex items-center justify-center shrink-0 w-full sm:w-auto text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150"
											style={{
												backgroundColor: "#2a2a2a",
												color: "#e9cc9e",
												border: "1px solid #3a3a3a",
											}}
										>
											<FiTrash2 className="mr-1" /> Borrar
										</button>
									</div>
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
							className="px-3 py-1.5 rounded-lg"
							style={{
								backgroundColor: "#2a2a2a",
								color: "#e9cc9e",
								border: "1px solid #3a3a3a",
							}}
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
							className="px-3 py-1.5 rounded-lg"
							style={{
								backgroundColor: "#2a2a2a",
								color: "#e9cc9e",
								border: "1px solid #3a3a3a",
							}}
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
				title="Eliminar categoría"
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

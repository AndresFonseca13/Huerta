import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsAdmin } from "../services/productService.js";
// Quitamos BackButton: navegación persiste en el layout
import EditCocktailModal from "../components/EditCocktailModal";
import ManageCocktailModal from "../components/ManageCocktailModal";
import CocktailDetailModal from "../components/CocktailDetailModal";
import PreviewCardCocktail from "../components/PreviewCardCocktail";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
	FiPlus,
} from "react-icons/fi";

const CocktailsAdmin = () => {
	const navigate = useNavigate();
	const [cocktails, setCocktails] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCocktail, setSelectedCocktail] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	// const [expandedRowId, setExpandedRowId] = useState(null);
	const [sortBy] = useState(null);
	const [sortOrder] = useState("asc");
	const [categoryFilter, setCategoryFilter] = useState(null);
	const [statusFilter, setStatusFilter] = useState(null); // 'active' | 'inactive' | null
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 12;
	const listTopRef = useRef(null);

	useEffect(() => {
		const fetchCocktails = async () => {
			try {
				const response = await getProductsAdmin(1, 50, null, "destilado");
				setCocktails(response.cocteles || []);
			} catch {
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
			const response = await getProductsAdmin(1, 50, null, "destilado");
			setCocktails(response.cocteles || []);
		} catch {
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
	const handleUpdateSuccess = () => {
		closeEditModal();
		closeManageModal();
		refreshCocktails();
	};
	// const toggleRow = (id) => {
	//     setExpandedRowId((prevId) => (prevId === id ? null : id));
	// };

	// Siempre calcular hooks antes de cualquier return condicional
	// Obtener categorías únicas (solo destilado)
	const uniqueCategories = useMemo(() => {
		return Array.from(
			new Set(
				cocktails.flatMap((c) =>
					(c.categories || []).map((cat) =>
						typeof cat === "string" ? cat : cat.name
					)
				)
			)
		);
	}, [cocktails]);

	// const formatCategories = (categories) => {
	//     if (!categories || categories.length === 0) {
	//         return <span className="text-gray-400">Sin categorías</span>;
	//     }
	//     return categories.map((cat, index) => {
	//         const categoryName = typeof cat === "string" ? cat : cat.name;
	//         return (
	//             <span
	//                 key={index}
	//                 className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
	//             >
	//                 {categoryName}
	//             </span>
	//         );
	//     });
	// };

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
	if (statusFilter === "active") {
		filtered = filtered.filter((c) => c.is_active);
	} else if (statusFilter === "inactive") {
		filtered = filtered.filter((c) => !c.is_active);
	}
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

	// Paginación cliente
	const totalItems = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const startIdx = (safeCurrentPage - 1) * pageSize;
	const endIdx = startIdx + pageSize;
	const paginated = filtered.slice(startIdx, endIdx);

	// Scroll al top al cambiar página
	useEffect(() => {
		if (listTopRef.current) {
			try {
				listTopRef.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			} catch (_) {
				listTopRef.current.scrollIntoView();
			}
		}
	}, [safeCurrentPage]);

	if (loading) {
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
					<div className="h-10 bg-white rounded-t-xl shadow-sm" />
					<div className="h-64 bg-white rounded-b-xl shadow-sm mt-2" />
				</div>
			</div>
		);
	}

	if (error) {
		return <div className="p-8 text-center text-red-500">{error}</div>;
	}

	// Handlers de encabezados
	// const handleSortByName = () => {
	//     if (sortBy !== "name") {
	//         setSortBy("name");
	//         setSortOrder("asc");
	//     } else {
	//         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
	//     }
	// };
	// const handleSortByPrice = () => {
	//     if (sortBy !== "price") {
	//         setSortBy("price");
	//         setSortOrder("asc");
	//     } else {
	//         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
	//     }
	// };

	// KPIs simples
	const total = cocktails.length;
	const activos = cocktails.filter((c) => c.is_active).length;
	const inactivos = total - activos;

	return (
		<div className="p-4 md:p-8 bg-gray-50 min-h-screen">
			<header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center w-full">
				<div className="flex-1">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<Motion.div
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35 }}
						>
							<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
								Gestión de Bebidas
							</h1>
							<p className="text-gray-600">
								Administra las bebidas del sistema
							</p>
						</Motion.div>
						<div className="mt-4 md:mt-0">
							<button
								onClick={() => navigate("/admin/create")}
								className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
							>
								<FiPlus className="mr-2" />
								Crear Bebida
							</button>
						</div>
					</div>
					{/* KPIs */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
						<Motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.0 }}
							className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === null ? "ring-2 ring-green-200" : ""
							}`}
							onClick={() => setStatusFilter(null)}
						>
							<div className="text-sm text-gray-500">Total</div>
							<div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
								<span className="font-semibold text-base">{total}</span>
							</div>
						</Motion.div>
						<Motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.05 }}
							className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "active" ? "ring-2 ring-blue-200" : ""
							}`}
							onClick={() => setStatusFilter("active")}
						>
							<div className="text-sm text-gray-500">Activos</div>
							<div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
								<span className="font-semibold text-base">{activos}</span>
							</div>
						</Motion.div>
						<Motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer ${
								statusFilter === "inactive" ? "ring-2 ring-yellow-200" : ""
							}`}
							onClick={() => setStatusFilter("inactive")}
						>
							<div className="text-sm text-gray-500">Inactivos</div>
							<div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
								<span className="font-semibold text-base">{inactivos}</span>
							</div>
						</Motion.div>
					</div>
					{/* Eliminamos dropdown móvil; ahora usamos píldoras con scroll arriba */}
				</div>
			</header>
			<main>
				{/* Buscador y filtros */}
				<div className="flex flex-col gap-4 mb-4">
					<div className="relative w-full max-w-xl">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar bebida..."
							className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200"
						/>
					</div>
					{/* Píldoras de categorías (desktop y mobile) */}
					<div className="w-full">
						<div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
							<button
								onClick={() => setCategoryFilter(null)}
								className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${
									categoryFilter === null
										? "bg-green-600 text-white border-green-600"
										: "bg-white text-gray-700 border-gray-200 hover:bg-green-50"
								}`}
							>
								Todas
							</button>
							{uniqueCategories.map((cat) => (
								<button
									key={cat}
									onClick={() => setCategoryFilter(cat)}
									className={`px-3 py-1.5 rounded-full border text-sm capitalize whitespace-nowrap ${
										categoryFilter === cat
											? "bg-green-600 text-white border-green-600"
											: "bg-white text-gray-700 border-gray-200 hover:bg-green-50"
									}`}
								>
									{cat}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Ancla para scroll al top de la lista */}
				<div ref={listTopRef} />

				{/* Grid de mini-cards estilo admin con paginación */}
				{filtered.length === 0 ? (
					<div className="p-10 text-center text-gray-400 bg-white rounded-xl">
						No hay bebidas para mostrar.
					</div>
				) : (
					<Motion.div
						key={safeCurrentPage}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
					>
						{paginated.map((cocktail) => (
							<div
								key={cocktail.id}
								className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start justify-between gap-2">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 capitalize">
											{cocktail.name}
										</h3>
										<p className="text-sm text-gray-600 line-clamp-2 mt-1">
											{cocktail.description}
										</p>
									</div>
									<span
										className={`text-xs px-2 py-1 rounded-full ${
											cocktail.is_active
												? "bg-green-100 text-green-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{cocktail.is_active ? "Activo" : "Inactivo"}
									</span>
								</div>

								<div className="flex items-center gap-2 mt-3">
									{cocktail.destilado_name && (
										<span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
											{cocktail.destilado_name}
										</span>
									)}
									{Array.isArray(cocktail.categories) &&
										(() => {
											const dest = (
												cocktail.destilado_name || ""
											).toLowerCase();
											const names = (cocktail.categories || [])
												.map((c) => (typeof c === "string" ? c : c.name))
												.filter(Boolean);
											const dedup = Array.from(new Set(names))
												.filter((n) => n.toLowerCase() !== dest)
												.slice(0, 2);
											return dedup.map((name, idx) => (
												<span
													key={idx}
													className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full capitalize"
												>
													{name}
												</span>
											));
										})()}
								</div>

								<div className="flex items-center justify-between mt-3">
									<div className="text-sm text-gray-800 font-semibold">
										${Number(cocktail.price).toLocaleString("es-CO")}
									</div>
									{cocktail.alcohol_percentage != null && (
										<div className="text-xs text-orange-600 font-medium">
											{cocktail.alcohol_percentage}%
										</div>
									)}
								</div>

								{Array.isArray(cocktail.ingredients) &&
									cocktail.ingredients.length > 0 && (
										<div className="mt-3">
											<div className="text-xs text-gray-500 mb-1">
												Ingredientes:
											</div>
											<div className="flex flex-wrap gap-1">
												{cocktail.ingredients.slice(0, 3).map((ing, idx) => (
													<span
														key={idx}
														className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize"
													>
														{typeof ing === "string" ? ing : ing.name}
													</span>
												))}
												{cocktail.ingredients.length > 3 && (
													<span className="text-[11px] text-gray-500">
														+{cocktail.ingredients.length - 3} más
													</span>
												)}
											</div>
										</div>
									)}

								<div className="flex items-center justify-between mt-4">
									<button
										onClick={() => openDetailModal(cocktail)}
										className="inline-flex items-center text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-full"
									>
										<FiSearch className="mr-1" /> Ver
									</button>
									<div className="flex items-center gap-2">
										<button
											onClick={() => openEditModal(cocktail)}
											className="inline-flex items-center text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
										>
											<FiEdit className="mr-1" /> Editar
										</button>
										<button
											onClick={() => openManageModal(cocktail)}
											className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${
												cocktail.is_active
													? "text-red-700 bg-red-50 hover:bg-red-100"
													: "text-green-800 bg-green-50 hover:bg-green-100"
											}`}
										>
											{cocktail.is_active ? (
												<FiEyeOff className="mr-1" />
											) : (
												<FiEye className="mr-1" />
											)}{" "}
											{cocktail.is_active ? "Desactivar" : "Activar"}
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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
	FiEdit,
	FiSearch,
	FiTrash2,
	FiCheckCircle,
	FiEye,
	FiEyeOff,
	FiPlus,
} from "react-icons/fi";
import { getProductsAdmin } from "../services/productService";
import EditFoodModal from "../components/EditFoodModal";
import ManageFoodModal from "../components/ManageFoodModal";
import CocktailDetailModal from "../components/CocktailDetailModal";

const FoodAdmin = () => {
	const navigate = useNavigate();

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selected, setSelected] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

	const [categoryFilter, setCategoryFilter] = useState(null);
	const [statusFilter, setStatusFilter] = useState(null); // 'active' | 'inactive' | null
	const [searchTerm, setSearchTerm] = useState("");

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 12;
	const listTopRef = useRef(null);

	useEffect(() => {
		const fetchFood = async () => {
			try {
				const response = await getProductsAdmin(1, 100, null, "clasificacion");
				setItems(response.cocteles || []); // backend mantiene clave 'cocteles'
			} catch {
				setError("No se pudieron cargar los productos de comida.");
			} finally {
				setLoading(false);
			}
		};
		fetchFood();
	}, []);

	const refresh = async () => {
		setLoading(true);
		try {
			const response = await getProductsAdmin(1, 100, null, "clasificacion");
			setItems(response.cocteles || []);
		} catch {
			setError("No se pudieron cargar los productos de comida.");
		} finally {
			setLoading(false);
		}
	};

	const openEditModal = (it) => {
		setSelected(it);
		setIsEditModalOpen(true);
	};
	const closeEditModal = () => {
		setIsEditModalOpen(false);
		setSelected(null);
	};
	const openManageModal = (it) => {
		setSelected(it);
		setIsManageModalOpen(true);
	};
	const closeManageModal = () => {
		setIsManageModalOpen(false);
		setSelected(null);
	};
	const openDetailModal = (it) => {
		setSelected(it);
		setIsDetailModalOpen(true);
	};
	const closeDetailModal = () => {
		setIsDetailModalOpen(false);
		setSelected(null);
	};
	const handleUpdateSuccess = () => {
		closeEditModal();
		closeManageModal();
		refresh();
	};

	// Clasificaciones únicas (Entrada, Postre, Fuerte, ...)
	const uniqueClassifications = useMemo(() => {
		return Array.from(
			new Set(
				items
					.map((c) => c.food_classification_name)
					.filter((v) => typeof v === "string" && v.trim().length > 0)
			)
		);
	}, [items]);

	// KPIs
	const total = items.length;
	const activos = items.filter((c) => c.is_active).length;
	const inactivos = total - activos;

	// Filtrado
	const matchesAllLetters = (name, search) => {
		if (!search) return true;
		const nameLower = (name || "").toLowerCase();
		return search
			.toLowerCase()
			.split("")
			.every((ch) => nameLower.includes(ch));
	};

	let filtered = [...items];
	if (categoryFilter)
		filtered = filtered.filter((it) => {
			const byClassification =
				(it.food_classification_name || "").toLowerCase() ===
				String(categoryFilter).toLowerCase();
			const byCategory = (it.categories || []).some(
				(cat) => (typeof cat === "string" ? cat : cat.name) === categoryFilter
			);
			return byClassification || byCategory;
		});
	if (statusFilter === "active") filtered = filtered.filter((c) => c.is_active);
	else if (statusFilter === "inactive")
		filtered = filtered.filter((c) => !c.is_active);
	if (searchTerm)
		filtered = filtered.filter((it) => matchesAllLetters(it.name, searchTerm));

	// Paginación
	const totalItems = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const startIdx = (safeCurrentPage - 1) * pageSize;
	const endIdx = startIdx + pageSize;
	const paginated = filtered.slice(startIdx, endIdx);

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

	if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
								Gestión de Comida
							</h1>
							<p className="text-gray-600">
								Administra los productos de comida
							</p>
						</Motion.div>
						<div className="mt-4 md:mt-0">
							<button
								onClick={() => navigate("/admin/food/create")}
								className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
							>
								<FiPlus className="mr-2" /> Crear Plato
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
				</div>
			</header>

			<main>
				{/* Buscador y filtros */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
					<div className="relative w-full sm:w-80">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar producto..."
							className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200"
						/>
					</div>
					{/* Píldoras de clasificación/categorías */}
					<div className="w-full sm:flex-1">
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
							{uniqueClassifications.map((cat) => (
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

				{/* ancla lista */}
				<div ref={listTopRef} />

				{/* Grid de cards */}
				{filtered.length === 0 ? (
					<div className="p-10 text-center text-gray-400 bg-white rounded-xl">
						No hay productos para mostrar.
					</div>
				) : (
					<Motion.div
						key={safeCurrentPage}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
					>
						{paginated.map((it) => {
							const classification =
								it.food_classification_name ||
								it.clasificacion_name ||
								it.classification ||
								it.food_classification ||
								"";
							const rawCats = Array.isArray(it.categories)
								? it.categories.map((c) => (typeof c === "string" ? c : c.name))
								: [];
							const filteredCats = rawCats.filter(
								(n) =>
									n && n.toLowerCase() !== String(classification).toLowerCase()
							);
							const visibleCats = filteredCats.slice(0, 2);
							const remainingCats = Math.max(
								0,
								filteredCats.length - visibleCats.length
							);

							return (
								<div
									key={it.id}
									className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
								>
									<div className="flex items-start justify-between gap-2">
										<div>
											<h3 className="text-lg font-semibold text-gray-900 capitalize">
												{it.name}
											</h3>
											{classification && (
												<span className="inline-flex text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full capitalize mt-1 mr-2">
													{classification}
												</span>
											)}
											{visibleCats.length > 0 && (
												<span className="inline-flex flex-wrap gap-1 mt-1">
													{visibleCats.map((c) => (
														<span
															key={c}
															className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize"
														>
															{c}
														</span>
													))}
													{remainingCats > 0 && (
														<span className="text-[11px] text-gray-500">
															+{remainingCats} más
														</span>
													)}
												</span>
											)}
										</div>
										<span
											className={`text-xs px-2 py-1 rounded-full ${
												it.is_active
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}
										>
											{it.is_active ? "Activo" : "Inactivo"}
										</span>
									</div>

									<div className="flex items-center justify-between mt-3">
										<div className="text-base text-gray-900 font-semibold">
											${Number(it.price).toLocaleString("es-CO")}
										</div>
									</div>
									{Array.isArray(it.ingredients) &&
										it.ingredients.length > 0 && (
											<div className="mt-3">
												<div className="text-xs text-gray-500 mb-1">
													Ingredientes:
												</div>
												<div className="flex flex-wrap gap-1">
													{it.ingredients.slice(0, 3).map((ing, idx) => (
														<span
															key={idx}
															className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize"
														>
															{typeof ing === "string" ? ing : ing.name}
														</span>
													))}
													{it.ingredients.length > 3 && (
														<span className="text-[11px] text-gray-500">
															+{it.ingredients.length - 3} más
														</span>
													)}
												</div>
											</div>
										)}

									<div className="flex items-center justify-between mt-4">
										<button
											onClick={() => openDetailModal(it)}
											className="inline-flex items-center text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-full"
										>
											<FiSearch className="mr-1" /> Ver
										</button>
										<div className="flex items-center gap-2">
											<button
												onClick={() => openEditModal(it)}
												className="inline-flex items-center text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
											>
												<FiEdit className="mr-1" /> Editar
											</button>
											<button
												onClick={() => openManageModal(it)}
												className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${
													it.is_active
														? "text-red-700 bg-red-50 hover:bg-red-100"
														: "text-green-800 bg-green-50 hover:bg-green-100"
												}`}
											>
												{it.is_active ? (
													<FiEyeOff className="mr-1" />
												) : (
													<FiEye className="mr-1" />
												)}{" "}
												{it.is_active ? "Desactivar" : "Activar"}
											</button>
										</div>
									</div>
								</div>
							);
						})}
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

			{/* Modales de comida */}
			<EditFoodModal
				item={selected}
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				onUpdateSuccess={handleUpdateSuccess}
			/>
			<ManageFoodModal
				item={selected}
				isOpen={isManageModalOpen}
				onClose={closeManageModal}
				onUpdateSuccess={handleUpdateSuccess}
			/>
			<CocktailDetailModal
				cocktail={selected}
				isOpen={isDetailModalOpen}
				onClose={closeDetailModal}
			/>
		</div>
	);
};

export default FoodAdmin;

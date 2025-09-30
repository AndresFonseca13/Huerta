import React, { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { getProducts } from "../services/productService";
import {
	getBeverageCategories,
	getAllCategories,
} from "../services/categoryService";
import FloatingTypeSwitcher from "../components/FloatingTypeSwitcher";

const normalize = (s) =>
	String(s || "")
		.toLowerCase()
		.trim();

const currency = (n) =>
	new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(Number(n || 0));

const OtherDrinks = () => {
	const [items, setItems] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalRecords, setTotalRecords] = useState(0);
	const [filter, setFilter] = useState("todos");
	const [subFilter, setSubFilter] = useState(null);
	const [beverageCategories, setBeverageCategories] = useState([]);
	const [wineSubcategories, setWineSubcategories] = useState([]);
	const [destiladoSubcategories, setDestiladoSubcategories] = useState([]);
	const topRef = useRef(null);

	// Cargar categorías de bebidas al montar
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const cats = await getBeverageCategories();
				setBeverageCategories(Array.isArray(cats) ? cats : []);

				// Cargar todas las categorías para subfiltros
				const allCats = await getAllCategories(false);

				// Subcategorías de vino (type = 'vino')
				const wineSubs = (Array.isArray(allCats) ? allCats : []).filter(
					(c) => normalize(c.type) === "vino"
				);
				setWineSubcategories(wineSubs);

				// Subcategorías de destilados (type = 'destilado')
				const destiladoSubs = (Array.isArray(allCats) ? allCats : []).filter(
					(c) => normalize(c.type) === "destilado"
				);
				setDestiladoSubcategories(destiladoSubs);
			} catch (_e) {
				setBeverageCategories([]);
				setWineSubcategories([]);
				setDestiladoSubcategories([]);
			}
		};
		fetchCategories();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Si hay subfiltro activo, usar ese; si no, usar el filtro principal
				const categoria = subFilter || (filter !== "todos" ? filter : null);

				// Traemos más registros para poder filtrar correctamente las "otras bebidas"
				// ya que necesitamos excluir comida y cócteles
				const fetchSize = categoria ? pageSize : 100;
				const data = await getProducts(1, fetchSize, categoria, null);
				const list = Array.isArray(data.cocteles) ? data.cocteles : [];

				// Excluir comida (clasificacion comida) y cocteles (clasificacion 'cocktail')
				const others = list.filter((p) => {
					const hasFood = p.categories?.some(
						(c) => normalize(c.type) === "clasificacion comida"
					);
					const isCocktail = p.categories?.some(
						(c) =>
							normalize(c.name) === "cocktail" &&
							normalize(c.type) === "clasificacion"
					);
					return !hasFood && !isCocktail;
				});

				// Paginación en cliente
				const totalFiltered = others.length;
				const totalPgs = Math.max(1, Math.ceil(totalFiltered / pageSize));
				const startIdx = (currentPage - 1) * pageSize;
				const endIdx = startIdx + pageSize;
				const paginated = others.slice(startIdx, endIdx);

				setItems(paginated);
				setTotalRecords(totalFiltered);
				setTotalPages(totalPgs);
			} catch (_e) {
				setItems([]);
				setTotalPages(0);
				setTotalRecords(0);
			}
		};
		fetchData();
	}, [currentPage, pageSize, filter, subFilter]);

	// Los items ya vienen filtrados del backend, no necesitamos filtrar en frontend
	const filteredItems = items;

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		try {
			topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		} catch (_e) {
			/* noop */
		}
	};

	return (
		<div className="py-8">
			{/* Botón flotante de navegación */}
			<FloatingTypeSwitcher />

			<div ref={topRef} />
			<motion.div
				className="text-center mb-6 px-4"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className="text-3xl font-bold text-green-900 mb-2">
					Otras bebidas
				</h1>
				<p className="text-gray-600">
					{totalRecords > 0
						? `Encontramos ${totalRecords} bebidas`
						: "No se encontraron resultados"}
				</p>
			</motion.div>

			{/* Filtros principales */}
			<div className="w-full max-w-7xl mx-auto px-4 mb-4">
				<div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
					{/* Filtro "Todos" siempre presente */}
					<button
						className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base transition-colors shadow-sm ${
							filter === "todos"
								? "bg-green-900 text-white border-green-900"
								: "bg-white text-gray-800 border-gray-200 hover:bg-green-50"
						}`}
						onClick={() => {
							setFilter("todos");
							setSubFilter(null);
							setCurrentPage(1);
						}}
					>
						Todos
					</button>
					{/* Filtros dinámicos desde categorías de clasificacion bebida */}
					{beverageCategories.map((cat) => (
						<button
							key={cat.id}
							className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base transition-colors shadow-sm capitalize ${
								filter === normalize(cat.name)
									? "bg-green-900 text-white border-green-900"
									: "bg-white text-gray-800 border-gray-200 hover:bg-green-50"
							}`}
							onClick={() => {
								setFilter(normalize(cat.name));
								setSubFilter(null);
								setCurrentPage(1);
							}}
						>
							{cat.name}
						</button>
					))}
				</div>
			</div>

			{/* Subfiltros de vino */}
			{filter === "vino" && wineSubcategories.length > 0 && (
				<div className="w-full max-w-7xl mx-auto px-4 mb-4">
					<p className="text-xs text-gray-500 mb-2 px-1">Tipos de vino:</p>
					<div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
						<button
							className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-colors ${
								!subFilter
									? "bg-green-700 text-white border-green-700"
									: "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
							}`}
							onClick={() => {
								setSubFilter(null);
								setCurrentPage(1);
							}}
						>
							Todos los vinos
						</button>
						{wineSubcategories.map((cat) => (
							<button
								key={cat.id}
								className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-colors capitalize ${
									subFilter === normalize(cat.name)
										? "bg-green-700 text-white border-green-700"
										: "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
								}`}
								onClick={() => {
									setSubFilter(normalize(cat.name));
									setCurrentPage(1);
								}}
							>
								{cat.name}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Subfiltros de botellas - mostrar destilados */}
			{filter === "botellas" && destiladoSubcategories.length > 0 && (
				<div className="w-full max-w-7xl mx-auto px-4 mb-4">
					<p className="text-xs text-gray-500 mb-2 px-1">Tipo de destilado:</p>
					<div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
						<button
							className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-colors ${
								!subFilter
									? "bg-green-700 text-white border-green-700"
									: "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
							}`}
							onClick={() => {
								setSubFilter(null);
								setCurrentPage(1);
							}}
						>
							Todas las botellas
						</button>
						{destiladoSubcategories.map((cat) => (
							<button
								key={cat.id}
								className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-colors capitalize ${
									subFilter === normalize(cat.name)
										? "bg-green-700 text-white border-green-700"
										: "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
								}`}
								onClick={() => {
									setSubFilter(normalize(cat.name));
									setCurrentPage(1);
								}}
							>
								{cat.name}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Subfiltros de tragos - mostrar destilados */}
			{filter === "tragos" && destiladoSubcategories.length > 0 && (
				<div className="w-full max-w-7xl mx-auto px-4 mb-4">
					<p className="text-xs text-gray-500 mb-2 px-1">Tipo de destilado:</p>
					<div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
						<button
							className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-colors ${
								!subFilter
									? "bg-green-700 text-white border-green-700"
									: "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
							}`}
							onClick={() => {
								setSubFilter(null);
								setCurrentPage(1);
							}}
						>
							Todos los tragos
						</button>
						{destiladoSubcategories.map((cat) => (
							<button
								key={cat.id}
								className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-colors capitalize ${
									subFilter === normalize(cat.name)
										? "bg-green-700 text-white border-green-700"
										: "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
								}`}
								onClick={() => {
									setSubFilter(normalize(cat.name));
									setCurrentPage(1);
								}}
							>
								{cat.name}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Listado */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 max-w-6xl mx-auto">
				{filteredItems.map((p) => (
					<div
						key={p.id}
						className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 md:p-5"
					>
						{/* Sección superior: Imagen horizontal + Info */}
						<div className="flex gap-4">
							{/* Imagen - object-contain para no cortar botellas */}
							{p.images?.[0] && (
								<div className="flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center">
									<img
										src={p.images[0]}
										alt={p.name}
										className="w-24 h-32 md:w-28 md:h-36 object-contain"
										loading="lazy"
									/>
								</div>
							)}

							{/* Info principal: Nombre y Precio */}
							<div className="flex-1 min-w-0 flex flex-col justify-center">
								<h3 className="text-lg md:text-xl font-bold text-gray-900 capitalize mb-2">
									{p.name}
								</h3>
								<div className="text-xl md:text-2xl font-bold text-green-700 mb-2">
									{currency(p.price)}
								</div>

								{/* Porcentaje de alcohol si existe */}
								{p.alcohol_percentage && (
									<span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded w-fit">
										{p.alcohol_percentage}% Vol.
									</span>
								)}
							</div>
						</div>

						{/* Descripción */}
						{p.description && (
							<p className="text-sm text-gray-600 line-clamp-2 mt-3 mb-3">
								{p.description}
							</p>
						)}

						{/* Categorías */}
						{p.categories && p.categories.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-3">
								{p.categories
									.filter((cat) => cat.type === "clasificacion bebida")
									.slice(0, 4)
									.map((cat, idx) => (
										<span
											key={idx}
											className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 capitalize"
										>
											{cat.name}
										</span>
									))}
								{p.categories.filter(
									(cat) => cat.type === "clasificacion bebida"
								).length > 4 && (
									<span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
										+
										{p.categories.filter(
											(cat) => cat.type === "clasificacion bebida"
										).length - 4}
									</span>
								)}
							</div>
						)}
					</div>
				))}
			</div>

			{/* Paginación */}
			{totalPages > 0 && (
				<div className="flex justify-center items-center space-x-2 mt-6 mb-8">
					<button
						disabled={currentPage === 1}
						onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
						className="px-3 py-1 rounded disabled:opacity-50 text-black"
					>
						‹ Anterior
					</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<button
							key={page}
							onClick={() => handlePageChange(page)}
							className={`px-3 py-1 rounded ${
								page === currentPage ? "bg-green-700 text-white" : ""
							}`}
						>
							{page}
						</button>
					))}
					<button
						disabled={currentPage === totalPages}
						onClick={() =>
							handlePageChange(Math.min(currentPage + 1, totalPages))
						}
						className="px-3 py-1 rounded disabled:opacity-50 text-black"
					>
						Siguiente ›
					</button>
				</div>
			)}
		</div>
	);
};

export default OtherDrinks;

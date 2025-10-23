import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsAdmin, createProduct } from "../services/productService.js";
import { FiCopy, FiPlus } from "react-icons/fi";

const normalize = (s) =>
	String(s || "")
		.toLowerCase()
		.trim();

const slugify = (s) =>
	normalize(s)
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

const OtherDrinksAdmin = () => {
	const navigate = useNavigate();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState(null);
	const pageSize = 12;
	const topRef = useRef(null);

	useEffect(() => {
		const fetchAll = async () => {
			setLoading(true);
			try {
				// Trae todos y luego filtramos para "otras bebidas" (no comida, no cóctel)
				const res = await getProductsAdmin(1, 500, null, null);
				const list = Array.isArray(res.cocteles) ? res.cocteles : [];
				const filtered = list.filter((p) => {
					const isFood = p.categories?.some(
						(c) => normalize(c.type) === "clasificacion comida"
					);
					const isCocktail = p.categories?.some(
						(c) =>
							normalize(c.name) === "cocktail" &&
							normalize(c.type) === "clasificacion"
					);
					return !isFood && !isCocktail;
				});
				setItems(filtered);
			} catch (_e) {
				setError("No se pudieron cargar las bebidas.");
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
	}, []);

	const filtered = useMemo(() => {
		let data = [...items];
		if (statusFilter === "active") data = data.filter((i) => i.is_active);
		if (statusFilter === "inactive") data = data.filter((i) => !i.is_active);
		if (searchTerm) {
			const st = normalize(searchTerm);
			data = data.filter((i) => normalize(i.name).includes(st));
		}
		return data;
	}, [items, statusFilter, searchTerm]);

	const total = items.length;
	const activos = items.filter((c) => c.is_active).length;
	const inactivos = total - activos;

	const paginated = useMemo(() => {
		const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
		const safePage = 1; // Siempre página 1 ya que no hay paginación activa
		const start = (safePage - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered]);

	const duplicateAs = async (product, asTag) => {
		// asTag: 'botella' | 'trago'
		try {
			const baseName = product.name;
			const group = slugify(baseName);
			const categories = [
				// Copiar todas las categorías no conflictivas
				...(product.categories || [])
					.map((c) => ({ name: c.name, type: c.type }))
					// Evitar duplicar clasificaciones de comida
					.filter((c) => normalize(c.type) !== "clasificacion comida"),
				{ name: asTag, type: "destilado" },
				{ name: `grupo:${group}`, type: "destilado" },
			];
			const payload = {
				name: baseName,
				price: product.price,
				description: product.description,
				ingredients: product.ingredients || [],
				images: product.images || [],
				categories,
				alcohol_percentage: product.alcohol_percentage ?? null,
			};
			await createProduct(payload);
			// Recargar
			window.location.reload();
		} catch (_e) {
			alert("No se pudo duplicar el producto.");
		}
	};

	if (loading)
		return (
			<div
				className="p-6"
				style={{ backgroundColor: "#191919", color: "#e9cc9e" }}
			>
				Cargando...
			</div>
		);
	if (error)
		return (
			<div
				className="p-6"
				style={{ backgroundColor: "#191919", color: "#e9cc9e" }}
			>
				{error}
			</div>
		);

	return (
		<div
			className="p-4 md:p-8 min-h-screen"
			style={{ backgroundColor: "#191919" }}
		>
			<header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center w-full">
				<div className="flex-1">
					<h1
						className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight"
						style={{ color: "#e9cc9e" }}
					>
						Otras bebidas (admin)
					</h1>
					<p style={{ color: "#b8b8b8" }}>
						Gestiona botellas, tragos, cervezas, vinos y más
					</p>
				</div>
				<div className="mt-4 md:mt-0">
					<button
						onClick={() => navigate("/admin/create")}
						className="flex items-center px-4 py-2 rounded-lg transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
						style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
					>
						<FiPlus className="mr-2" /> Crear producto
					</button>
				</div>
			</header>

			{/* KPIs */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
				<div
					className={`rounded-xl shadow-sm p-4 cursor-pointer ${
						statusFilter === null ? "ring-2" : ""
					}`}
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					onClick={() => setStatusFilter(null)}
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
				</div>
				<div
					className={`rounded-xl shadow-sm p-4 cursor-pointer ${
						statusFilter === "active" ? "ring-2" : ""
					}`}
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					onClick={() => setStatusFilter("active")}
				>
					<div className="text-sm" style={{ color: "#b8b8b8" }}>
						Activos
					</div>
					<div
						className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
						style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
					>
						<span className="font-semibold text-base">{activos}</span>
					</div>
				</div>
				<div
					className={`rounded-xl shadow-sm p-4 cursor-pointer ${
						statusFilter === "inactive" ? "ring-2" : ""
					}`}
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					onClick={() => setStatusFilter("inactive")}
				>
					<div className="text-sm" style={{ color: "#b8b8b8" }}>
						Inactivos
					</div>
					<div
						className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
						style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
					>
						<span className="font-semibold text-base">{inactivos}</span>
					</div>
				</div>
			</div>

			{/* Buscador */}
			<div className="relative w-full max-w-xl mb-4">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Buscar..."
					className="pl-4 pr-4 py-2 w-full rounded-lg focus:outline-none"
					style={{
						backgroundColor: "#2a2a2a",
						color: "#e9cc9e",
						border: "1px solid #3a3a3a",
					}}
				/>
			</div>

			{/* Grid */}
			<div
				ref={topRef}
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
			>
				{paginated.map((p) => (
					<div
						key={p.id}
						className="rounded-xl shadow-sm p-4"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<div className="flex items-start justify-between gap-2">
							<div>
								<h3
									className="text-lg font-semibold capitalize"
									style={{ color: "#e9cc9e" }}
								>
									{p.name}
								</h3>
								<p
									className="text-sm line-clamp-2 mt-1"
									style={{ color: "#b8b8b8" }}
								>
									{p.description}
								</p>
							</div>
						</div>
						<div className="flex items-center justify-between mt-3">
							<div
								className="text-sm font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								${Number(p.price || 0).toLocaleString("es-CO")}
							</div>
						</div>
						<div className="flex items-center gap-2 mt-4">
							<button
								onClick={() => duplicateAs(p, "botella")}
								className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
							>
								<FiCopy className="mr-1" /> Duplicar como botella
							</button>
							<button
								onClick={() => duplicateAs(p, "trago")}
								className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
							>
								<FiCopy className="mr-1" /> Duplicar como trago
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default OtherDrinksAdmin;

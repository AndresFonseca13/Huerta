import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// icons y logout ya no se usan aquí; sidebar vive en AdminLayout
import { getProductsAdmin } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import { FiPlus, FiTag, FiUserPlus, FiGift, FiCoffee } from "react-icons/fi";
// Bottom nav vive en el layout; no lo dupliquemos aquí

const AdminPanel = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [totalCocktails, setTotalCocktails] = useState(0);
	const [activeCocktails, setActiveCocktails] = useState(0);
	const [totalFood, setTotalFood] = useState(0);
	const [activeFood, setActiveFood] = useState(0);
	const [totalCategoriesDash, setTotalCategoriesDash] = useState(0);
	const [activeCategoriesDash, setActiveCategoriesDash] = useState(0);

	useEffect(() => {
		const fetch = async () => {
			try {
				const [resCocktails, resFood, resCats] = await Promise.all([
					getProductsAdmin(1, 200, null, "destilado"),
					getProductsAdmin(1, 200, null, "clasificacion"),
					getAllCategories(true),
				]);
				const cocktails = resCocktails.cocteles || [];
				setTotalCocktails(cocktails.length);
				setActiveCocktails(cocktails.filter((c) => c.is_active).length);

				const food = resFood.cocteles || [];
				setTotalFood(food.length);
				setActiveFood(food.filter((c) => c.is_active).length);
				// No mostramos clasificaciones en dashboard; solo disponibles e inhabilitados

				// Categorías (dashboard)
				const catsApi = Array.isArray(resCats) ? resCats : [];
				setTotalCategoriesDash(catsApi.length);
				setActiveCategoriesDash(catsApi.filter((c) => c.is_active).length);
			} catch (_e) {
				// silent, we can add a toast later
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, []);

	return (
		<>
			{/* Main solo contenido - la navegación vive en AdminLayout */}
			<main>
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						¡Bienvenido de nuevo! 👋
					</h2>
					<p className="text-gray-600 mt-1">
						Resumen del estado de tu restaurante
					</p>
				</div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Comida */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Comida</h3>
							<span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
								Activa
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow
								loading={loading}
								label="Total de platos"
								value={totalFood}
							/>
							<SkeletonRow
								loading={loading}
								label="Disponibles"
								value={activeFood}
							/>
							<SkeletonRow
								loading={loading}
								label="No disponibles"
								value={Math.max(0, totalFood - activeFood)}
							/>
						</div>
						<div className="mt-4">
							<button
								onClick={() => navigate("/admin/food")}
								className="text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
							>
								Ir a Comida
							</button>
						</div>
					</div>

					{/* Usuarios */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Usuarios</h3>
							<span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
								+3%
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow loading={true} label="Total usuarios" value="3" />
							<SkeletonRow loading={true} label="Activos" value="2" />
							<SkeletonRow loading={true} label="Admins" value="1" />
						</div>
					</div>

					{/* Bebidas */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Bebidas</h3>
							<span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
								+8%
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow
								loading={loading}
								label="Total bebidas"
								value={totalCocktails}
							/>
							<SkeletonRow
								loading={loading}
								label="Disponibles"
								value={activeCocktails}
							/>
							<SkeletonRow
								loading={loading}
								label="No disponibles"
								value={Math.max(0, totalCocktails - activeCocktails)}
							/>
						</div>
						<div className="mt-4">
							<button
								onClick={() => navigate("/admin/beverages")}
								className="text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
							>
								Ir a Bebidas
							</button>
						</div>
					</div>

					{/* Categorías */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Categorías</h3>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow
								loading={loading}
								label="Total categorías"
								value={totalCategoriesDash}
							/>
							<SkeletonRow
								loading={loading}
								label="Activas"
								value={activeCategoriesDash}
							/>
						</div>
						<div className="mt-4">
							<button
								onClick={() => navigate("/admin/categories")}
								className="text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
							>
								Ir a Categorías
							</button>
						</div>
					</div>

					{/* Promociones (solo diseño por ahora) */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Promociones</h3>
							<span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">
								Pronto
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow loading={true} label="Total promos" value="3" />
							<SkeletonRow loading={true} label="Activas" value="2" />
							<SkeletonRow loading={true} label="Usos totales" value="338" />
						</div>
					</div>
				</div>
			</main>
			<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">
				<div className="flex items-center gap-2 mb-4">
					<FiPlus className="text-gray-500" />
					<h3 className="font-semibold text-gray-900">Atajos rápidos</h3>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					<button
						onClick={() => navigate("/admin/food/create")}
						className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 hover:bg-green-50 transition-colors"
					>
						<FiPlus className="text-red-500" />
						<span className="text-sm font-medium text-gray-800">
							Nuevo plato
						</span>
					</button>
					<button
						onClick={() => navigate("/admin/create")}
						className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 hover:bg-green-50 transition-colors"
					>
						<FiCoffee className="text-amber-600" />
						<span className="text-sm font-medium text-gray-800">
							Nueva bebida
						</span>
					</button>
					<button
						onClick={() => {}}
						disabled
						className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 opacity-60 cursor-not-allowed"
					>
						<FiUserPlus className="text-emerald-600" />
						<span className="text-sm font-medium text-gray-800">
							Nuevo usuario
						</span>
					</button>
					<button
						onClick={() => navigate("/admin/categories")}
						className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 hover:bg-green-50 transition-colors"
					>
						<FiTag className="text-purple-600" />
						<span className="text-sm font-medium text-gray-800">
							Nueva categoría
						</span>
					</button>
					<button
						onClick={() => {}}
						disabled
						className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 opacity-60 cursor-not-allowed"
					>
						<FiGift className="text-pink-600" />
						<span className="text-sm font-medium text-gray-800">
							Nueva promoción
						</span>
					</button>
				</div>
			</section>
		</>
	);
};

const SkeletonRow = ({ loading, label, value }) => {
	return (
		<div className="flex items-center justify-between">
			<span>{label}</span>
			{loading ? (
				<Motion.div
					initial={{ opacity: 0.6 }}
					animate={{ opacity: [0.4, 1, 0.4] }}
					transition={{ repeat: Infinity, duration: 1.2 }}
					className="h-4 w-10 rounded bg-gray-200"
				/>
			) : (
				<span className="font-semibold">{value}</span>
			)}
		</div>
	);
};

export default AdminPanel;

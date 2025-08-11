import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// icons y logout ya no se usan aquí; sidebar vive en AdminLayout
import { getProductsAdmin } from "../services/productService";
// Bottom nav vive en el layout; no lo dupliquemos aquí

const AdminPanel = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [totalCocktails, setTotalCocktails] = useState(0);
	const [activeCocktails, setActiveCocktails] = useState(0);
	const [categoriesCount, setCategoriesCount] = useState(0);
	const [totalFood, setTotalFood] = useState(0);
	const [activeFood, setActiveFood] = useState(0);
	const [foodClassifications, setFoodClassifications] = useState(0);

	useEffect(() => {
		const fetch = async () => {
			try {
				const [resCocktails, resFood] = await Promise.all([
					getProductsAdmin(1, 200, null, "destilado"),
					getProductsAdmin(1, 200, null, "clasificacion"),
				]);
				const cocktails = resCocktails.cocteles || [];
				setTotalCocktails(cocktails.length);
				setActiveCocktails(cocktails.filter((c) => c.is_active).length);
				const cats = new Set(
					cocktails.flatMap((c) =>
						(c.categories || []).map((cat) =>
							typeof cat === "string" ? cat : cat.name
						)
					)
				);
				setCategoriesCount(cats.size);

				const food = resFood.cocteles || [];
				setTotalFood(food.length);
				setActiveFood(food.filter((c) => c.is_active).length);
				const classifs = new Set(
					food
						.map((f) => f.food_classification_name)
						.filter((v) => typeof v === "string" && v.trim().length > 0)
				);
				setFoodClassifications(classifs.size);
			} catch (e) {
				// silent, we can add a toast later
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, []);

	return (
		<>
			{/* Main sólo contenido - la navegación vive en AdminLayout */}
			<main>
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						Welcome back, Admin! 👋
					</h2>
					<p className="text-gray-600 mt-1">
						Here's what's happening with your restaurant today
					</p>
				</div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Food */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Food Items</h3>
							<span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
								Live
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow
								loading={loading}
								label="Total Items"
								value={totalFood}
							/>
							<SkeletonRow
								loading={loading}
								label="Available"
								value={activeFood}
							/>
							<SkeletonRow
								loading={loading}
								label="Classifications"
								value={foodClassifications}
							/>
						</div>
						<div className="mt-4">
							<button
								onClick={() => navigate("/admin/food")}
								className="text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
							>
								Go to Food
							</button>
						</div>
					</div>

					{/* Users */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Users</h3>
							<span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
								+3%
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow loading={true} label="Total Users" value="3" />
							<SkeletonRow loading={true} label="Active" value="2" />
							<SkeletonRow loading={true} label="Admins" value="1" />
						</div>
					</div>

					{/* Cocktails */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Cocktails</h3>
							<span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
								+8%
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow
								loading={loading}
								label="Total Cocktails"
								value={totalCocktails}
							/>
							<SkeletonRow
								loading={loading}
								label="Available"
								value={activeCocktails}
							/>
							<SkeletonRow
								loading={loading}
								label="Categories"
								value={categoriesCount}
							/>
						</div>
						<div className="mt-4">
							<button
								onClick={() => navigate("/admin/cocktails")}
								className="text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
							>
								Go to Cocktails
							</button>
						</div>
					</div>

					{/* Promotions (design only) */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">Promotions</h3>
							<span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">
								Soon
							</span>
						</div>
						<div className="mt-4 space-y-2 text-sm text-gray-700">
							<SkeletonRow loading={true} label="Total Promos" value="3" />
							<SkeletonRow loading={true} label="Active" value="2" />
							<SkeletonRow loading={true} label="Total Usage" value="338" />
						</div>
					</div>
				</div>
			</main>
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

import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// icons y logout ya no se usan aquí; sidebar vive en AdminLayout
import { getProductsAdmin } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import { FiPlus, FiTag, FiUserPlus, FiGift, FiCoffee } from "react-icons/fi";
import { usePermissions } from "../hooks/usePermissions";
// Bottom nav vive en el layout; no lo dupliquemos aquí

// Función para obtener las tarjetas permitidas según los permisos
const getDashboardCards = (permissions, stats) => {
	const cards = [];

	// Categorías - Solo si tiene permiso de acceso
	if (permissions.canAccessCategories) {
		cards.push({
			id: "categories",
			title: "Categorías",
			stats: [
				{ label: "Total categorías", value: stats.totalCategories },
				{ label: "Activas", value: stats.activeCategories },
			],
			navigate: "/admin/categories",
			roles: ["admin", "ventas", "chef", "barmanager"],
		});
	}

	// Comida - Solo si tiene permiso
	if (permissions.canAccessFood) {
		cards.push({
			id: "food",
			title: "Comida",
			stats: [
				{ label: "Total de platos", value: stats.totalFood },
				{ label: "Disponibles", value: stats.activeFood },
				{
					label: "No disponibles",
					value: Math.max(0, stats.totalFood - stats.activeFood),
				},
			],
			navigate: "/admin/food",
			roles: ["admin", "ventas", "chef"],
		});
	}

	// Usuarios - Solo si tiene permiso
	if (permissions.canAccessUsers) {
		cards.push({
			id: "users",
			title: "Usuarios",
			stats: [
				{ label: "Total usuarios", value: "3" },
				{ label: "Activos", value: "2" },
				{ label: "Admins", value: "1" },
			],
			navigate: "/admin/users",
			roles: ["admin", "ventas"],
		});
	}

	// Bebidas - Solo si tiene permiso
	if (permissions.canAccessBeverages) {
		cards.push({
			id: "beverages",
			title: "Bebidas",
			stats: [
				{ label: "Total bebidas", value: stats.totalCocktails },
				{ label: "Disponibles", value: stats.activeCocktails },
				{
					label: "No disponibles",
					value: Math.max(0, stats.totalCocktails - stats.activeCocktails),
				},
			],
			navigate: "/admin/beverages",
			roles: ["admin", "ventas", "barmanager"],
		});
	}

	// Promociones - Solo si tiene permiso
	if (permissions.canAccessPromotions) {
		cards.push({
			id: "promotions",
			title: "Promociones",
			stats: [
				{ label: "Total promos", value: "3" },
				{ label: "Activas", value: "2" },
				{ label: "Usos totales", value: "338" },
			],
			navigate: "/admin/promotions",
			roles: ["admin", "ventas", "chef", "barmanager"],
		});
	}

	return cards;
};

// Función para obtener los atajos rápidos permitidos según los permisos
const getQuickAccessButtons = (permissions) => {
	const buttons = [];

	// Nueva categoría - Solo si puede crear categorías
	if (permissions.canCreateCategories) {
		buttons.push({
			id: "newCategory",
			icon: FiTag,
			label: "Nueva categoría",
			navigate: "/admin/categories",
			iconColor: "text-purple-600",
			roles: ["admin", "ventas", "chef", "barmanager"],
		});
	}

	// Nuevo plato - Solo si puede acceder a comida
	if (permissions.canCreateFood) {
		buttons.push({
			id: "newFood",
			icon: FiPlus,
			label: "Nuevo plato",
			navigate: "/admin/food/create",
			iconColor: "text-red-500",
			roles: ["admin", "ventas", "chef"],
		});
	}

	// Nueva bebida - Solo si puede acceder a bebidas
	if (permissions.canCreateBeverages) {
		buttons.push({
			id: "newBeverage",
			icon: FiCoffee,
			label: "Nueva bebida",
			navigate: "/admin/create",
			iconColor: "text-amber-600",
			roles: ["admin", "ventas", "barmanager"],
		});
	}

	// Nuevo usuario - Solo si puede acceder a usuarios
	if (permissions.canCreateUsers) {
		buttons.push({
			id: "newUser",
			icon: FiUserPlus,
			label: "Nuevo usuario",
			navigate: "/admin/users",
			iconColor: "text-emerald-600",
			roles: ["admin", "ventas"],
		});
	}

	// Nueva promoción - Solo si puede acceder a promociones
	if (permissions.canCreatePromotions) {
		buttons.push({
			id: "newPromotion",
			icon: FiGift,
			label: "Nueva promoción",
			navigate: "/admin/promotions",
			iconColor: "text-pink-600",
			roles: ["admin", "ventas", "chef", "barmanager"],
		});
	}

	return buttons;
};

const AdminPanel = () => {
	console.log("AdminPanel - Componente renderizándose...");

	const navigate = useNavigate();
	const { permissions } = usePermissions();
	console.log("AdminPanel - Permisos recibidos del hook:", permissions);

	const [loading, setLoading] = useState(true);
	const [dashboardCards, setDashboardCards] = useState([]);
	const [quickAccessButtons, setQuickAccessButtons] = useState([]);
	const [stats, setStats] = useState({
		totalCocktails: 0,
		activeCocktails: 0,
		totalFood: 0,
		activeFood: 0,
		totalCategories: 0,
		activeCategories: 0,
	});

	useEffect(() => {
		console.log("AdminPanel - useEffect 1 ejecutado (tarjetas y botones)");
		console.log("AdminPanel - useEffect 1 - Permisos:", permissions);
		console.log("AdminPanel - useEffect 1 - Stats:", stats);

		setDashboardCards(getDashboardCards(permissions, stats));
		setQuickAccessButtons(getQuickAccessButtons(permissions));
	}, [permissions, stats]);

	useEffect(() => {
		console.log("AdminPanel - useEffect 2 ejecutado (carga de datos)");
		console.log(
			"AdminPanel - useEffect de carga ejecutado con permisos:",
			permissions
		);

		// Verificar que los permisos estén completamente disponibles
		if (
			!permissions ||
			typeof permissions.canAccessBeverages === "undefined" ||
			typeof permissions.canAccessFood === "undefined" ||
			typeof permissions.canAccessCategories === "undefined"
		) {
			console.log("AdminPanel - Permisos incompletos, esperando...");
			return;
		}

		console.log("AdminPanel - Permisos completos, procediendo con la carga...");
		console.log("AdminPanel - canAccessFood:", permissions.canAccessFood);
		console.log(
			"AdminPanel - canAccessBeverages:",
			permissions.canAccessBeverages
		);
		console.log(
			"AdminPanel - canAccessCategories:",
			permissions.canAccessCategories
		);

		const fetch = async () => {
			try {
				console.log("AdminPanel - Permisos del usuario:", permissions);
				console.log(
					"AdminPanel - Permisos disponibles:",
					Object.keys(permissions)
				);

				// Solo cargar datos si el usuario tiene permisos para esas secciones
				const promises = [];

				// Cargar categorías (todos los roles pueden acceder)
				console.log("AdminPanel - Agregando promesa para categorías...");
				promises.push(getAllCategories(true));

				// Cargar bebidas solo si tiene permisos
				if (permissions.canAccessBeverages) {
					console.log("AdminPanel - Cargando bebidas...");
					promises.push(getProductsAdmin(1, 200, null, "destilado"));
				} else {
					console.log("AdminPanel - No tiene permisos para bebidas");
				}

				// Cargar comida solo si tiene permisos
				if (permissions.canAccessFood) {
					console.log("AdminPanel - Cargando comida...");
					promises.push(getProductsAdmin(1, 200, null, "clasificacion"));
				} else {
					console.log("AdminPanel - No tiene permisos para comida");
				}

				console.log("AdminPanel - Promesas a ejecutar:", promises.length);
				const results = await Promise.all(promises);
				console.log("AdminPanel - Resultados obtenidos:", results.length);
				console.log("AdminPanel - Resultados:", results);

				// Procesar resultados según los permisos
				let cocktails = [];
				let food = [];
				let catsApi = [];

				// El primer resultado siempre son las categorías
				catsApi = Array.isArray(results[0]) ? results[0] : [];
				console.log("AdminPanel - Categorías cargadas:", catsApi.length);
				console.log("AdminPanel - Datos de categorías:", results[0]);

				// Procesar bebidas si se cargaron
				if (permissions.canAccessBeverages && results.length > 1) {
					const resCocktails = results[1];
					cocktails = resCocktails.cocteles || [];
					console.log("AdminPanel - Bebidas cargadas:", cocktails.length);
				}

				// Procesar comida si se cargó
				if (
					permissions.canAccessFood &&
					results.length > (permissions.canAccessBeverages ? 2 : 1)
				) {
					const resFood = results[permissions.canAccessBeverages ? 2 : 1];
					food = resFood.cocteles || [];
					console.log("AdminPanel - Comida cargada:", food.length);
					console.log("AdminPanel - Datos de comida:", resFood);
				}

				const newStats = {
					totalCocktails: cocktails.length,
					activeCocktails: cocktails.filter((c) => c.is_active).length,
					totalFood: food.length,
					activeFood: food.filter((c) => c.is_active).length,
					totalCategories: catsApi.length,
					activeCategories: catsApi.filter((c) => c.is_active).length,
				};

				console.log("AdminPanel - Stats finales:", newStats);
				setStats(newStats);
			} catch (error) {
				console.error("AdminPanel - Error al cargar datos:", error);
				console.error("AdminPanel - Stack trace:", error.stack);
				// silent, we can add a toast later
			} finally {
				setLoading(false);
			}
		};

		fetch();
	}, [permissions]);

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
					{dashboardCards.map((card) => (
						<div
							key={card.id}
							className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
						>
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-gray-900">{card.title}</h3>
								<span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
									Activa
								</span>
							</div>
							<div className="mt-4 space-y-2 text-sm text-gray-700">
								{card.stats.map((stat, index) => (
									<SkeletonRow
										key={index}
										loading={loading}
										label={stat.label}
										value={stat.value}
									/>
								))}
							</div>
							<div className="mt-4">
								<button
									onClick={() => navigate(card.navigate)}
									className="text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium px-3 py-1.5 rounded-full"
								>
									Ir a {card.title}
								</button>
							</div>
						</div>
					))}
				</div>
			</main>
			<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">
				<div className="flex items-center gap-2 mb-4">
					<FiPlus className="text-gray-500" />
					<h3 className="font-semibold text-gray-900">Atajos rápidos</h3>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{quickAccessButtons.map((button) => (
						<button
							key={button.id}
							onClick={() => navigate(button.navigate)}
							className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 hover:bg-green-50 transition-colors"
						>
							<button.icon className={button.iconColor} />
							<span className="text-sm font-medium text-gray-800">
								{button.label}
							</span>
						</button>
					))}
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

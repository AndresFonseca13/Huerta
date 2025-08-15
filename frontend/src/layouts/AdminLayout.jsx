import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FiGrid, FiCoffee, FiTag, FiUsers, FiTrendingUp } from "react-icons/fi";
import AdminBottomNav from "../components/AdminBottomNav";
import { logout } from "../services/authService";
import { usePermissions } from "../hooks/usePermissions";
import logo from "../assets/Logo-naranja.png";

// Función para obtener las opciones del menú según los permisos
const getMenuOptions = (permissions) => {
	const options = [];

	// Dashboard - Todos los roles tienen acceso
	options.push({
		path: "/admin",
		icon: FiGrid,
		label: "Dashboard",
		roles: ["admin", "ventas", "chef", "barmanager"],
	});

	// Bebidas - Solo si tiene permiso
	if (permissions.canAccessBeverages) {
		options.push({
			path: "/admin/beverages",
			icon: FiCoffee,
			label: "Bebidas",
			roles: ["admin", "ventas", "barmanager"],
		});
	}

	// Comida - Solo si tiene permiso
	if (permissions.canAccessFood) {
		options.push({
			path: "/admin/food",
			icon: FiTag,
			label: "Food",
			roles: ["admin", "ventas", "chef"],
		});
	}

	// Categorías - Todos los roles pueden ver
	options.push({
		path: "/admin/categories",
		icon: FiTag,
		label: "Categorías",
		roles: ["admin", "ventas", "chef", "barmanager"],
	});

	// Usuarios - Solo si tiene permiso
	if (permissions.canAccessUsers) {
		options.push({
			path: "/admin/users",
			icon: FiUsers,
			label: "Users",
			roles: ["admin", "ventas"],
		});
	}

	// Promociones - Solo si tiene permiso
	if (permissions.canAccessPromotions) {
		options.push({
			path: "/admin/promotions",
			icon: FiTrendingUp,
			label: "Promotions",
			roles: ["admin", "ventas", "chef", "barmanager"],
		});
	}

	return options;
};

const SidebarItem = ({ active, icon: Icon, label, onClick }) => (
	<div className="relative">
		{active && (
			<Motion.div
				layoutId="sidebarActive"
				className="absolute inset-0 bg-green-50 rounded-lg"
				transition={{ type: "spring", stiffness: 500, damping: 40 }}
			/>
		)}
		<button
			onClick={onClick}
			className={`relative z-10 w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
				active ? "text-green-800" : "hover:bg-gray-100"
			}`}
		>
			{Icon && <Icon />} {label}
		</button>
	</div>
);

const pageInitial = { opacity: 0, y: 6 };
const pageAnimate = { opacity: 1, y: 0 };

const AdminLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { permissions } = usePermissions();
	const [menuOptions, setMenuOptions] = useState([]);

	useEffect(() => {
		setMenuOptions(getMenuOptions(permissions));
	}, [permissions]);

	const is = (path) => location.pathname === path;
	const handleLogout = () => {
		logout();
		navigate("/admin/login");
	};

	useEffect(() => {
		// Asegura que cada navegación dentro del admin empiece arriba
		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		}
	}, [location.pathname]);

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Navbar estético del panel admin */}
			<div className="bg-green-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
					<img
						src={logo}
						alt="Logo Huerta"
						className="h-15 w-auto object-contain mr-3"
					/>
					<span
						className="text-4xl sm:text-3xl font-bold text-white tracking-wide"
						style={{ fontFamily: "'Playfair Display', serif" }}
					>
						Huerta
					</span>
					<button
						onClick={handleLogout}
						className="ml-auto lg:hidden inline-flex items-center px-3 py-1.5 rounded-md border border-white/60 text-white text-sm hover:bg-white/10"
					>
						Cerrar sesión
					</button>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Sidebar Desktop persistente */}
					<aside className="hidden lg:block lg:col-span-3">
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-4">
							<div className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<FiGrid /> Management Panel
							</div>
							<nav className="space-y-2 relative">
								{menuOptions.map((option) => (
									<SidebarItem
										key={option.path}
										active={is(option.path)}
										icon={option.icon}
										label={option.label}
										onClick={() => navigate(option.path)}
									/>
								))}
							</nav>
							<button
								onClick={handleLogout}
								className="w-full mt-4 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
							>
								Cerrar sesión
							</button>
						</div>
					</aside>

					{/* Contenido con transición */}
					<div className="lg:col-span-9">
						<Motion.div
							key={location.pathname}
							initial={pageInitial}
							animate={pageAnimate}
							transition={{ duration: 0.18, ease: "easeOut" }}
						>
							<Outlet />
						</Motion.div>
					</div>
				</div>
			</div>

			{/* Bottom navigation persistente en mobile */}
			<AdminBottomNav userRole={permissions.userRole} />
		</div>
	);
};

export default AdminLayout;

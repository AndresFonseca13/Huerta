import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FiGrid, FiCoffee, FiTag, FiUsers, FiTrendingUp } from "react-icons/fi";
import AdminBottomNav from "../components/AdminBottomNav";
import { logout } from "../services/authService";

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
			<Icon /> {label}
		</button>
	</div>
);

const pageInitial = { opacity: 0, y: 6 };
const pageAnimate = { opacity: 1, y: 0 };

const AdminLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();

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
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Sidebar Desktop persistente */}
					<aside className="hidden lg:block lg:col-span-3">
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-4">
							<div className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<FiGrid /> Management Panel
							</div>
							<nav className="space-y-2 relative">
								<SidebarItem
									active={is("/admin")}
									icon={FiGrid}
									label="Dashboard"
									onClick={() => navigate("/admin")}
								/>
								<SidebarItem
									active={is("/admin/cocktails")}
									icon={FiCoffee}
									label="Cocktails"
									onClick={() => navigate("/admin/cocktails")}
								/>
								<SidebarItem
									active={is("/admin/food")}
									icon={FiTag}
									label="Food"
									onClick={() => navigate("/admin/food")}
								/>
								<SidebarItem
									active={is("/admin/categories")}
									icon={FiTag}
									label="Categories"
									onClick={() => navigate("/admin/categories")}
								/>
								<SidebarItem
									active={false}
									icon={FiUsers}
									label="Users"
									onClick={() => {}}
								/>
								<SidebarItem
									active={false}
									icon={FiTrendingUp}
									label="Promotions"
									onClick={() => {}}
								/>
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
			<AdminBottomNav />
		</div>
	);
};

export default AdminLayout;

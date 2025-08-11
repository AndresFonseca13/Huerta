import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FiHome, FiCoffee, FiTag, FiUsers, FiVolume2 } from "react-icons/fi";

const NavItem = ({ active, label, icon: Icon, onClick, disabled }) => (
	<div className="relative flex-1">
		{active && (
			<Motion.div
				layoutId="bottomActive"
				className="absolute -top-1 left-2 right-2 h-[3px] rounded-full bg-green-600"
				transition={{ type: "spring", stiffness: 500, damping: 40 }}
			/>
		)}
		<button
			onClick={onClick}
			disabled={disabled}
			className={`relative flex flex-col items-center justify-center w-full py-2 ${
				active ? "text-green-700" : "text-gray-500"
			} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
		>
			<Icon size={18} />
			<span className="text-[11px] mt-1">{label}</span>
		</button>
	</div>
);

const AdminBottomNav = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const is = (path) => location.pathname === path;

	return (
		<Motion.nav
			initial={{ y: 40, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.25 }}
			className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-40 sm:hidden"
		>
			<div className="max-w-5xl mx-auto px-2 flex">
				<NavItem
					active={is("/admin")}
					label="Dashboard"
					icon={FiHome}
					onClick={() => navigate("/admin")}
				/>
				<NavItem
					active={is("/admin/food")}
					label="Food"
					icon={FiTag}
					onClick={() => navigate("/admin/food")}
				/>
				<NavItem
					active={is("/admin/users")}
					label="Users"
					icon={FiUsers}
					onClick={() => navigate("/admin")}
					disabled
				/>
				<NavItem
					active={is("/admin/cocktails")}
					label="Cocktails"
					icon={FiCoffee}
					onClick={() => navigate("/admin/cocktails")}
				/>
				<NavItem
					active={is("/admin/promotions")}
					label="Promos"
					icon={FiVolume2}
					onClick={() => navigate("/admin")}
					disabled
				/>
				<NavItem
					active={is("/admin/categories")}
					label="Categories"
					icon={FiTag}
					onClick={() => navigate("/admin/categories")}
				/>
			</div>
		</Motion.nav>
	);
};

export default AdminBottomNav;

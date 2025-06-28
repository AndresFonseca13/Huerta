import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const ConditionalNavbar = () => {
	const location = useLocation();

	// Rutas donde NO queremos mostrar el navbar
	const adminRoutes = ["/admin", "/admin/login", "/admin/create"];

	// Verificar si la ruta actual es una ruta de admin
	const isAdminRoute = adminRoutes.some(
		(route) =>
			location.pathname === route || location.pathname.startsWith(route)
	);

	// Solo mostrar navbar si NO es una ruta de admin
	if (isAdminRoute) {
		return null;
	}

	return <Navbar />;
};

export default ConditionalNavbar;

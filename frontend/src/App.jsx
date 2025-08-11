import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateCocktail from "./pages/CreateCocktail";
import FilteredCocktails from "./pages/FilteredCocktails";
import ConditionalNavbar from "./components/ConditionalNavbar.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CocktailsAdmin from "./pages/CocktailsAdmin";
import FoodAdmin from "./pages/FoodAdmin.jsx";
import CreateFood from "./pages/CreateFood.jsx";
import CategoriesAdmin from "./pages/CategoriesAdmin";
import Footer from "./components/Footer.jsx";

function App() {
	const location = useLocation();
	// Rutas donde SÍ debe aparecer el Footer
	const showFooter = ["/", "/login", "/cocteles", "/comida"].some((path) => {
		if (path === "/cocteles" || path === "/comida") {
			return (
				location.pathname === path ||
				location.pathname.startsWith("/cocteles/") ||
				location.pathname.startsWith("/comida/")
			);
		}
		return location.pathname === path;
	});

	return (
		<>
			<ConditionalNavbar />
			<Routes>
				<Route path="/" element={<Navigate to="/cocteles" replace />} />
				<Route path="/login" element={<Login />} />
				<Route
					path="/admin/create"
					element={
						<ProtectedRoute>
							<CreateCocktail />
						</ProtectedRoute>
					}
				/>
				<Route path="/cocteles" element={<FilteredCocktails />} />
				<Route path="/cocteles/:categoria" element={<FilteredCocktails />} />
				<Route path="/comida" element={<FilteredCocktails />} />
				<Route path="/comida/:categoria" element={<FilteredCocktails />} />
				<Route path="/admin/login" element={<AdminLogin />} />
				<Route
					path="/admin"
					element={
						<ProtectedRoute>
							<AdminLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<AdminPanel />} />
					<Route path="cocktails" element={<CocktailsAdmin />} />
					<Route path="categories" element={<CategoriesAdmin />} />
					<Route path="food" element={<FoodAdmin />} />
					<Route path="create" element={<CreateCocktail />} />
					<Route path="food/create" element={<CreateFood />} />
				</Route>
			</Routes>
			{showFooter && <Footer />}
		</>
	);
}

export default App;

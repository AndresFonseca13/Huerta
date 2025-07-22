import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateCocktail from "./pages/CreateCocktail";
import FilteredCocktails from "./pages/FilteredCocktails";
import ConditionalNavbar from "./components/ConditionalNavbar.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CocktailsAdmin from "./pages/CocktailsAdmin";
import CategoriesAdmin from "./pages/CategoriesAdmin";
import Footer from "./components/Footer.jsx";

function App() {
	const location = useLocation();
	// Rutas donde SÍ debe aparecer el Footer
	const showFooter = [
		"/",
		"/login",
		"/cocteles/:categoria",
		"/comida/:categoria",
	].some((path) => {
		if (path.includes(":categoria")) {
			// Coincidencia parcial para rutas dinámicas
			return (
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
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route
					path="/admin/create"
					element={
						<ProtectedRoute>
							<CreateCocktail />
						</ProtectedRoute>
					}
				/>
				<Route path="/cocteles/:categoria" element={<FilteredCocktails />} />
				<Route path="/comida/:categoria" element={<FilteredCocktails />} />
				<Route path="/admin/login" element={<AdminLogin />} />
				<Route
					path="/admin"
					element={
						<ProtectedRoute>
							<AdminPanel />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/cocktails"
					element={
						<ProtectedRoute>
							<CocktailsAdmin />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/categories"
					element={
						<ProtectedRoute>
							<CategoriesAdmin />
						</ProtectedRoute>
					}
				/>
			</Routes>
			{showFooter && <Footer />}
		</>
	);
}

export default App;

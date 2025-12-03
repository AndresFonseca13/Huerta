import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ConditionalNavbar from "./components/ConditionalNavbar.jsx";
import Footer from "./components/Footer.jsx";
import { Analytics } from "@vercel/analytics/react";

// ✅ Páginas públicas - importación directa (se cargan inmediatamente)
import FilteredCocktails from "./pages/FilteredCocktails";
import OtherDrinks from "./pages/OtherDrinks.jsx";

// ✅ Páginas de admin y secundarias - lazy loading (se cargan cuando se necesitan)
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const AdminPanel = lazy(() => import("./pages/AdminPanel.jsx"));
const CocktailsAdmin = lazy(() => import("./pages/CocktailsAdmin"));
const FoodAdmin = lazy(() => import("./pages/FoodAdmin.jsx"));
const CreateCocktail = lazy(() => import("./pages/CreateCocktail"));
const CreateFood = lazy(() => import("./pages/CreateFood.jsx"));
const CategoriesAdmin = lazy(() => import("./pages/CategoriesAdmin"));
const UsersAdmin = lazy(() => import("./pages/UsersAdmin.jsx"));
const PromotionsAdmin = lazy(() => import("./pages/PromotionsAdmin.jsx"));
const PromotionEditor = lazy(() => import("./pages/PromotionEditor.jsx"));
const OtherDrinksAdmin = lazy(() => import("./pages/OtherDrinksAdmin.jsx"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute.jsx"));
const RoleProtectedRoute = lazy(() =>
	import("./components/RoleProtectedRoute.jsx")
);

// Componente de carga
const LoadingSpinner = () => (
	<div
		className="flex items-center justify-center min-h-screen"
		style={{ backgroundColor: "#191919" }}
	>
		<div
			className="animate-spin rounded-full h-12 w-12 border-b-2"
			style={{ borderColor: "#e9cc9e" }}
		></div>
	</div>
);

function App() {
	const location = useLocation();
	// Rutas donde SÍ debe aparecer el Footer
	const showFooter = [
		"/",
		"/login",
		"/bebidas",
		"/comida",
		"/otras-bebidas",
	].some((path) => {
		if (path === "/cocteles" || path === "/comida") {
			return (
				location.pathname === path || location.pathname.startsWith("/comida/")
			);
		}
		if (path === "/bebidas") {
			return (
				location.pathname === path || location.pathname.startsWith("/bebidas/")
			);
		}
		if (path === "/otras-bebidas") {
			return (
				location.pathname === path ||
				location.pathname.startsWith("/otras-bebidas/")
			);
		}
		return location.pathname === path;
	});

	return (
		<>
			<ConditionalNavbar />
			<Suspense fallback={<LoadingSpinner />}>
				<Routes>
					<Route path="/" element={<Navigate to="/bebidas" replace />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/admin/create"
						element={
							<ProtectedRoute>
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "barmanager"]}
								>
									<CreateCocktail />
								</RoleProtectedRoute>
							</ProtectedRoute>
						}
					/>
					<Route path="/bebidas" element={<FilteredCocktails />} />
					<Route path="/bebidas/:categoria" element={<FilteredCocktails />} />
					<Route path="/comida" element={<FilteredCocktails />} />
					<Route path="/comida/:categoria" element={<FilteredCocktails />} />
					<Route path="/otras-bebidas" element={<OtherDrinks />} />
					<Route path="/otras-bebidas/:categoria" element={<OtherDrinks />} />
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
						<Route
							path="beverages"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "barmanager"]}
								>
									<CocktailsAdmin />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="other-beverages"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "barmanager"]}
								>
									<OtherDrinksAdmin />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="categories"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "chef", "barmanager"]}
								>
									<CategoriesAdmin />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="users"
							element={
								<RoleProtectedRoute requiredRoles={["admin", "ventas"]}>
									<UsersAdmin />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="food"
							element={
								<RoleProtectedRoute requiredRoles={["admin", "ventas", "chef"]}>
									<FoodAdmin />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="create"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "barmanager"]}
								>
									<CreateCocktail />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="food/create"
							element={
								<RoleProtectedRoute requiredRoles={["admin", "ventas", "chef"]}>
									<CreateFood />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="promotions"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "chef", "barmanager"]}
								>
									<PromotionsAdmin />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="promotions/create"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "chef", "barmanager"]}
								>
									<PromotionEditor />
								</RoleProtectedRoute>
							}
						/>
						<Route
							path="promotions/:id/edit"
							element={
								<RoleProtectedRoute
									requiredRoles={["admin", "ventas", "chef", "barmanager"]}
								>
									<PromotionEditor />
								</RoleProtectedRoute>
							}
						/>
					</Route>
				</Routes>
			</Suspense>
			{showFooter && <Footer />}
			<Analytics />
		</>
	);
}

export default App;

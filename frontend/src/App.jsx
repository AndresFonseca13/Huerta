import { Routes, Route } from "react-router-dom";
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

function App() {
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
    </>
  );
}

export default App;

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateCocktail from "./pages/CreateCocktail";
import FilteredCocktails from "./pages/FilteredCocktails";
import Navbar from "./components/Navbar.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

function App() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/create" element={<CreateCocktail />} />
				<Route path="/cocteles/:categoria" element={<FilteredCocktails />} />
				<Route path="/comida/:categoria" element={<FilteredCocktails />} />
				<Route path="/admin" element={<AdminPanel />} />
			</Routes>
		</>
	);
}

export default App;

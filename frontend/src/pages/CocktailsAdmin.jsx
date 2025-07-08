import React, { useState, useEffect } from "react";
import { getCocktailsAdmin } from "../services/cocktailService.js";

const CocktailsAdmin = () => {
	const [cocktails, setCocktails] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCocktails = async () => {
			try {
				const response = await getCocktailsAdmin(1, 50);
				setCocktails(response.cocteles || []);
			} catch (err) {
				setError("No se pudieron cargar los cócteles.");
			} finally {
				setLoading(false);
			}
		};
		fetchCocktails();
	}, []);

	const formatCategories = (categories) => {
		if (!categories || categories.length === 0) {
			return <span className="text-gray-400">Sin categorías</span>;
		}
		return categories.map((cat, index) => {
			const categoryName = typeof cat === "string" ? cat : cat.name;
			return (
				<span
					key={index}
					className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
				>
					{categoryName}
				</span>
			);
		});
	};

	if (loading) {
		return <div className="p-8 text-center text-lg">Cargando cócteles...</div>;
	}

	if (error) {
		return <div className="p-8 text-center text-red-500">{error}</div>;
	}

	return (
		<div className="p-4 md:p-8 bg-gray-50 min-h-screen">
			<header className="mb-8">
				<h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
					Gestión de Cócteles
				</h1>
				<p className="text-gray-600">Administra los cócteles del sistema</p>
			</header>
			<main>
				<div className="bg-white rounded-lg shadow-md overflow-x-auto">
					<table className="w-full text-left">
						<thead className="border-b bg-gray-100">
							<tr>
								<th className="p-4 font-semibold text-gray-600">Nombre</th>
								<th className="p-4 font-semibold text-gray-600">Precio</th>
								<th className="p-4 font-semibold text-black hidden sm:table-cell">
									Categorías
								</th>
								<th className="p-4 font-semibold text-gray-600 text-center hidden md:table-cell">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{cocktails.map((cocktail) => (
								<tr
									key={cocktail.id}
									className="border-b hover:bg-gray-50 transition-colors"
								>
									<td className="p-4 font-medium text-gray-800 capitalize">
										{cocktail.name}
									</td>
									<td className="p-4 text-gray-700">
										${Number(cocktail.price).toLocaleString("es-CO")}
									</td>
									<td className="p-4 hidden sm:table-cell">
										{formatCategories(cocktail.categories)}
									</td>
									<td className="p-4 hidden md:table-cell text-center">
										{/* Acciones futuras */}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
		</div>
	);
};

export default CocktailsAdmin;

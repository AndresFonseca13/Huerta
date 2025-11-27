// components/CardCocktail.jsx
import React from "react";
import { FaWineBottle } from "react-icons/fa6";
import { useProductTranslation } from "../hooks/useProductTranslation";

const CardCocktail = ({ cocktail, onClick }) => {
	const { translatedProduct } = useProductTranslation(cocktail);
	const { name, price, description, images } = translatedProduct;

	const imageUrl =
		images && images.length > 0 && images[0]
			? images[0]
			: "https://via.placeholder.com/600x400?text=Sin+Imagen";

	const categories = Array.isArray(translatedProduct.categories)
		? translatedProduct.categories.filter(Boolean)
		: [];
	// Preferir etiquetas calculadas por backend: destilado o clasificación de comida
	const primaryCategory =
		translatedProduct.food_classification_name ||
		translatedProduct.destilado_name ||
		categories[0]?.name ||
		categories[0] ||
		"Cóctel";

	const capitalize = (s) =>
		typeof s === "string" && s.length > 0
			? s.charAt(0).toUpperCase() + s.slice(1)
			: s;

	const ingredients = Array.isArray(translatedProduct.ingredients)
		? translatedProduct.ingredients
				.filter(Boolean)
				.map((i) =>
					typeof i === "string" ? capitalize(i) : capitalize(i?.name)
				)
		: [];

	const alcoholPct =
		translatedProduct.alcohol_percentage ??
		translatedProduct.alcoholPercentage ??
		null;

	return (
		<div
			className="w-full max-w-sm rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
			style={{
				backgroundColor: "#2a2a2a",
				borderColor: "#3a3a3a",
				border: "1px solid",
			}}
			onClick={() => onClick && onClick(cocktail)}
		>
			{/* Imagen */}
			<div className="relative">
				<img
					src={imageUrl}
					alt={name}
					className="w-full h-56 object-cover"
					loading="lazy"
					decoding="async"
				/>
				{/* Badge de destilado/categoría principal */}
				<div
					className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full capitalize"
					style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
				>
					{primaryCategory}
				</div>
				{/* Porcentaje de alcohol (solo si existe) */}
				{alcoholPct !== null && (
					<div
						className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
						style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
					>
						<FaWineBottle className="opacity-90" />
						{Number(alcoholPct).toFixed(0)}%
					</div>
				)}
			</div>

			{/* Contenido */}
			<div className="p-4">
				{/* Título y precio */}
				<div className="flex items-start justify-between gap-3 mb-2">
					<h3
						className="text-xl font-semibold capitalize leading-tight"
						style={{ color: "#e9cc9e" }}
					>
						{name}
					</h3>
					<div
						className="text-base font-semibold whitespace-nowrap"
						style={{ color: "#e9cc9e" }}
					>
						${Number(price).toLocaleString()}
					</div>
				</div>

				{/* Descripción */}
				{description && (
					<p className="text-sm mb-3" style={{ color: "#b8b8b8" }}>
						{description}
					</p>
				)}

				{/* Separador */}
				<div className="my-2" style={{ borderTop: "1px solid #3a3a3a" }} />

				{/* Ingredientes */}
				{ingredients.length > 0 && (
					<p
						className="text-sm italic line-clamp-2"
						style={{ color: "#9a9a9a" }}
					>
						{ingredients.join(", ")}
					</p>
				)}
			</div>
		</div>
	);
};

export default CardCocktail;

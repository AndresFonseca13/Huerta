import React from "react";
import { FiTag, FiList } from "react-icons/fi";

const PreviewCardCocktail = ({ cocktail }) => {
	const { name, price, description, images, ingredients, categories } =
		cocktail;

	console.log("Cocktail en PreviewCardCocktail:", cocktail);

	const imageUrl =
		images && images.length > 0
			? images[0]
			: "https://via.placeholder.com/300x200?text=Sin+Imagen";

	return (
		<div className="w-80 bg-white shadow-md rounded-lg overflow-hidden">
			<img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
			<div className="p-4">
				<h3 className="text-xl font-semibold capitalize text-black text-center mb-2">
					{name}
				</h3>
				<p className="text-sm text-gray-600 mb-3 text-center capitalize">
					{description}
				</p>
				<p className="text-lg font-bold mb-4 text-green-600 text-center">
					${Number(price).toLocaleString()}
				</p>

				{/* Ingredientes */}
				{ingredients && ingredients.length > 0 && (
					<div className="mb-3">
						<div className="flex items-center mb-2">
							<FiList className="text-green-600 mr-2" />
							<h4 className="text-sm font-semibold text-gray-800">
								Ingredientes:
							</h4>
						</div>
						<div className="flex flex-wrap gap-1">
							{ingredients.map((ingredient, index) => (
								<span
									key={index}
									className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
								>
									{typeof ingredient === "string"
										? ingredient
										: ingredient.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Categorías */}
				{categories && categories.length > 0 && (
					<div>
						<div className="flex items-center mb-2">
							<FiTag className="text-blue-600 mr-2" />
							<h4 className="text-sm font-semibold text-gray-800">
								Categorías:
							</h4>
						</div>
						<div className="flex flex-wrap gap-1">
							{categories.map((category, index) => (
								<span
									key={index}
									className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
								>
									{category.name}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PreviewCardCocktail;

// components/CardCocktail.jsx
import React from "react";

const CardCocktail = ({ cocktail }) => {
	const { name, price, description, images } = cocktail;

	console.log("Cocktail en CardCocktail:", cocktail);

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
				<p className="text-lg font-bold text-green-600 text-center">
					${Number(price).toLocaleString()}
				</p>
			</div>
		</div>
	);
};

export default CardCocktail;

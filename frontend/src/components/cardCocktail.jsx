// components/CardCocktail.jsx
import React from "react";
import { motion } from "framer-motion";

const CardCocktail = ({ cocktail, onClick }) => {
	const { name, price, description, images } = cocktail;

	console.log("Cocktail en CardCocktail:", cocktail);
	console.log("Images en CardCocktail:", images);

	const imageUrl =
		images && images.length > 0 && images[0]
			? images[0]
			: "https://via.placeholder.com/300x200?text=Sin+Imagen";

	return (
		<motion.div
			className="w-80 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:scale-105"
			onClick={() => onClick && onClick(cocktail)}
			whileHover={{
				scale: 1.02,
				transition: { duration: 0.2 },
			}}
			whileTap={{
				scale: 0.98,
				transition: { duration: 0.1 },
			}}
		>
			<div className="relative overflow-hidden">
				<img
					src={imageUrl}
					alt={name}
					className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
				/>
				<div className="absolute inset-0 hover:bg-opacity-10 transition-all duration-300" />
			</div>
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
				<div className="text-center mt-2">
					<span className="text-xs text-gray-400">Click para ver detalles</span>
				</div>
			</div>
		</motion.div>
	);
};

export default CardCocktail;

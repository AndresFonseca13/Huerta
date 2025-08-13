import React from "react";
import { FiTag, FiList, FiX } from "react-icons/fi";

const PreviewCardCocktail = ({ cocktail, isModal = false, onClose }) => {
	if (!cocktail) return null;
	const { name, price, description, images, ingredients, categories } =
		cocktail;

	console.log("Cocktail en PreviewCardCocktail:", cocktail);

	const imageUrl =
		images && images.length > 0
			? images[0]
			: "https://via.placeholder.com/600x400?text=Sin+Imagen";

	const content = (
		<div className={isModal ? "w-full" : "w-80"}>
			<img
				src={imageUrl}
				alt={name}
				className={
					isModal
						? "w-full h-72 object-cover rounded-t-2xl mb-6"
						: "w-full h-48 object-cover"
				}
			/>
			<div className={isModal ? "px-6 pb-6" : "p-4"}>
				<h3
					className={
						isModal
							? "text-3xl font-bold capitalize text-gray-900 text-left mb-4"
							: "text-xl font-semibold capitalize text-black text-center mb-2"
					}
				>
					{name}
				</h3>
				<p
					className={
						isModal
							? "text-lg text-gray-700 mb-4 text-left"
							: "text-sm text-gray-600 mb-3 text-center"
					}
				>
					{description}
				</p>
				<p
					className={
						isModal
							? "text-2xl font-bold mb-6 text-green-600 text-left"
							: "text-lg font-bold mb-4 text-green-600 text-center"
					}
				>
					${Number(price).toLocaleString()}
				</p>

				{/* Ingredientes */}
				{ingredients && ingredients.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center mb-2">
							<FiList className="text-green-600 mr-2 text-lg" />
							<h4 className="text-lg font-semibold text-gray-800">
								Ingredientes:
							</h4>
						</div>
						<div className="flex flex-wrap gap-2">
							{ingredients.map((ingredient, index) => (
								<span
									key={index}
									className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
								>
									{(() => {
										const value =
											typeof ingredient === "string"
												? ingredient
												: ingredient.name;
										if (!value) return value;
										return value.charAt(0).toUpperCase() + value.slice(1);
									})()}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Categorías */}
				{categories && categories.length > 0 && (
					<div className="mb-2">
						<div className="flex items-center mb-2">
							<FiTag className="text-blue-600 mr-2 text-lg" />
							<h4 className="text-lg font-semibold text-gray-800">
								Categorías:
							</h4>
						</div>
						<div className="flex flex-wrap gap-2">
							{categories.map((category, index) => (
								<span
									key={index}
									className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
								>
									{typeof category === "string" ? category : category.name}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);

	if (!isModal)
		return (
			<div className="w-80 bg-white shadow-md rounded-lg overflow-hidden">
				{content}
			</div>
		);

	// Modal layout para admin
	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col items-center"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
				>
					<FiX className="text-gray-600 text-xl" />
				</button>
				{content}
			</div>
		</div>
	);
};

export default PreviewCardCocktail;

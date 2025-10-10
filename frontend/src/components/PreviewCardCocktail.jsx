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
							? "text-3xl font-bold capitalize text-left mb-4"
							: "text-xl font-semibold capitalize text-center mb-2"
					}
					style={{ color: "#e9cc9e" }}
				>
					{name}
				</h3>
				<p
					className={
						isModal ? "text-lg mb-4 text-left" : "text-sm mb-3 text-center"
					}
					style={{ color: "#b8b8b8" }}
				>
					{description}
				</p>
				<p
					className={
						isModal
							? "text-2xl font-bold mb-6 text-left"
							: "text-lg font-bold mb-4 text-center"
					}
					style={{ color: "#e9cc9e" }}
				>
					${Number(price).toLocaleString()}
				</p>

				{/* Ingredientes */}
				{ingredients && ingredients.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center mb-2">
							<FiList className="mr-2 text-lg" style={{ color: "#e9cc9e" }} />
							<h4
								className="text-lg font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								Ingredientes:
							</h4>
						</div>
						<div className="flex flex-wrap gap-2">
							{ingredients.map((ingredient, index) => (
								<span
									key={index}
									className="px-3 py-1 text-sm rounded-full"
									style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
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
							<FiTag className="mr-2 text-lg" style={{ color: "#e9cc9e" }} />
							<h4
								className="text-lg font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								Categorías:
							</h4>
						</div>
						<div className="flex flex-wrap gap-2">
							{categories.map((category, index) => (
								<span
									key={index}
									className="px-3 py-1 text-sm rounded-full"
									style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
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
			<div
				className="w-80 shadow-md rounded-lg overflow-hidden"
				style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
			>
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
				className="rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col items-center"
				style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-10 rounded-full p-2 transition-all duration-200 hover:scale-110"
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
				>
					<FiX className="text-xl" style={{ color: "#e9cc9e" }} />
				</button>
				{content}
			</div>
		</div>
	);
};

export default PreviewCardCocktail;

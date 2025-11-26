import React from "react";
import { FiTag, FiList, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useProductTranslation } from "../hooks/useProductTranslation";

const PreviewCardCocktail = ({ cocktail, isModal = false, onClose }) => {
	const { t } = useTranslation();
	const { translatedProduct } = useProductTranslation(cocktail);

	if (!cocktail) return null;

	const { name, price, description, images, ingredients, categories } =
		translatedProduct;

	console.log("Cocktail en PreviewCardCocktail:", cocktail);

	const imageUrl =
		images && images.length > 0
			? images[0]
			: "https://via.placeholder.com/600x400?text=Sin+Imagen";

	const content = (
		<div className={isModal ? "w-full" : "w-full max-w-sm mx-auto"}>
			<img
				src={imageUrl}
				alt={name}
				className={
					isModal
						? "w-full h-48 sm:h-64 md:h-72 object-cover rounded-t-2xl mb-4 sm:mb-6"
						: "w-full h-40 sm:h-48 object-cover rounded-t-lg"
				}
			/>
			<div className={isModal ? "px-4 sm:px-6 pb-4 sm:pb-6" : "p-3 sm:p-4"}>
				<h3
					className={
						isModal
							? "text-xl sm:text-2xl md:text-3xl font-bold capitalize text-left mb-2 sm:mb-3 md:mb-4"
							: "text-lg sm:text-xl font-semibold capitalize text-center mb-2"
					}
					style={{ color: "#e9cc9e" }}
				>
					{name}
				</h3>
				<p
					className={
						isModal
							? "text-sm sm:text-base md:text-lg mb-3 sm:mb-4 text-left line-clamp-3"
							: "text-xs sm:text-sm mb-2 sm:mb-3 text-center line-clamp-2"
					}
					style={{ color: "#b8b8b8" }}
				>
					{description}
				</p>
				<p
					className={
						isModal
							? "text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-left"
							: "text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center"
					}
					style={{ color: "#e9cc9e" }}
				>
					${Number(price).toLocaleString()}
				</p>

				{/* Ingredientes */}
				{ingredients && ingredients.length > 0 && (
					<div className="mb-3 sm:mb-4 md:mb-6">
						<div className="flex items-center mb-1.5 sm:mb-2">
							<FiList
								className="mr-1.5 sm:mr-2 text-base sm:text-lg"
								style={{ color: "#e9cc9e" }}
							/>
							<h4
								className="text-sm sm:text-base md:text-lg font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								{t("cocktailDetail.ingredients")}:
							</h4>
						</div>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{ingredients.map((ingredient, index) => (
								<span
									key={index}
									className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full"
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
						<div className="flex items-center mb-1.5 sm:mb-2">
							<FiTag
								className="mr-1.5 sm:mr-2 text-base sm:text-lg"
								style={{ color: "#e9cc9e" }}
							/>
							<h4
								className="text-sm sm:text-base md:text-lg font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								{t("cocktailDetail.categories")}:
							</h4>
						</div>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{categories.map((category, index) => (
								<span
									key={index}
									className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full"
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
				className="w-full max-w-sm mx-auto shadow-md rounded-lg overflow-hidden"
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

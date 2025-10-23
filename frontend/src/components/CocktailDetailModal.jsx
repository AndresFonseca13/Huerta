import React, { useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiX, FiList, FiDollarSign, FiTag } from "react-icons/fi";
import { FaWineBottle } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./CocktailDetailModal.css";

const CocktailDetailModal = ({ cocktail, isOpen, onClose }) => {
	// Cerrar modal con ESC
	useEffect(() => {
		const handleEsc = (event) => {
			if (event.keyCode === 27) onClose();
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [onClose]);

	if (!isOpen || !cocktail) return null;

	const { name, price, description, images, ingredients } = cocktail;
	const alcoholPct =
		cocktail.alcohol_percentage ?? cocktail.alcoholPercentage ?? null;
	const destilado = cocktail.destilado_name || null;
	const foodClass = cocktail.food_classification_name || null;

	console.log("Cocktail en modal:", cocktail);
	console.log("Images en modal:", images);

	const imageList =
		images && images.length > 0
			? images
			: ["https://via.placeholder.com/400x300?text=Sin+Imagen"];

	return (
		<AnimatePresence>
			<Motion.div
				className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				onClick={onClose}
			>
				<Motion.div
					className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					initial={{
						opacity: 0,
						scale: 0.8,
						y: 50,
					}}
					animate={{
						opacity: 1,
						scale: 1,
						y: 0,
					}}
					exit={{
						opacity: 0,
						scale: 0.8,
						y: 50,
					}}
					transition={{
						duration: 0.4,
						ease: "easeOut",
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Botón de cerrar */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 z-10 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<FiX className="text-xl" style={{ color: "#e9cc9e" }} />
					</button>

					{/* Carrusel de imágenes */}
					<div className="relative">
						{imageList.length > 1 ? (
							<Swiper
								modules={[Navigation, Pagination, Autoplay]}
								navigation
								pagination={{ clickable: true }}
								className="w-full h-80 rounded-t-2xl"
								spaceBetween={0}
								loop={true}
								autoplay={{
									delay: 5000,
									disableOnInteraction: false,
								}}
							>
								{imageList.map((img, idx) => (
									<SwiperSlide key={idx}>
										<img
											src={img}
											alt={name}
											className="w-full h-80 object-cover rounded-t-2xl"
											onError={(e) => {
												e.target.src =
													"https://via.placeholder.com/400x300?text=Error+Imagen";
											}}
										/>
									</SwiperSlide>
								))}
							</Swiper>
						) : (
							<img
								src={imageList[0]}
								alt={name}
								className="w-full h-80 object-cover rounded-t-2xl"
								onError={(e) => {
									e.target.src =
										"https://via.placeholder.com/400x300?text=Error+Imagen";
								}}
							/>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl" />
						{/* Badges superpuestos */}
						{(destilado || foodClass) && (
							<div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
								{foodClass || destilado}
							</div>
						)}
						{alcoholPct !== null && (
							<div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
								<FaWineBottle className="opacity-90" />
								{Number(alcoholPct).toFixed(0)}%
							</div>
						)}
					</div>

					{/* Contenido */}
					<div className="p-6">
						{/* Header */}
						<Motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="mb-6"
						>
							<h2
								className="text-3xl font-bold mb-2 capitalize"
								style={{ color: "#e9cc9e" }}
							>
								{name}
							</h2>
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<span
										className="text-2xl font-bold"
										style={{ color: "#e9cc9e" }}
									>
										${Number(price).toLocaleString()}
									</span>
								</div>
							</div>
							{/* Etiquetas secundarias */}
							<div className="mt-3 flex flex-wrap gap-2">
								{(foodClass || destilado) && (
									<span
										className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize"
										style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
									>
										<FiTag /> {foodClass || destilado}
									</span>
								)}
								{alcoholPct !== null && (
									<span
										className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
										style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
									>
										<FaWineBottle /> {Number(alcoholPct).toFixed(0)}%
									</span>
								)}
							</div>
						</Motion.div>

						{/* Descripción */}
						<Motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="mb-6"
						>
							<p
								className="text-lg leading-relaxed"
								style={{ color: "#b8b8b8" }}
							>
								{description}
							</p>
						</Motion.div>

						{/* Ingredientes */}
						{ingredients && ingredients.length > 0 && (
							<Motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="mb-6"
							>
								<div className="flex items-center mb-3">
									<FiList
										className="mr-2 text-xl"
										style={{ color: "#e9cc9e" }}
									/>
									<h3
										className="text-xl font-semibold"
										style={{ color: "#e9cc9e" }}
									>
										Ingredientes
									</h3>
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2 capitalize items-center justify-center">
									{ingredients.map((ingredient, index) => (
										<span
											key={index}
											className="px-3 py-2 text-sm rounded-lg font-medium text-center"
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
							</Motion.div>
						)}

						{/* Botón de acción */}
						<Motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="pt-4"
							style={{
								borderTop: "1px solid #3a2a2a".replace("#3a2a2a", "#3a3a3a"),
							}}
						>
							<button
								onClick={onClose}
								className="w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
								style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
							>
								Cerrar
							</button>
						</Motion.div>
					</div>
				</Motion.div>
			</Motion.div>
		</AnimatePresence>
	);
};

export default CocktailDetailModal;

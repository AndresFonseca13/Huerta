import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiList, FiDollarSign } from "react-icons/fi";
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

	console.log("Cocktail en modal:", cocktail);
	console.log("Images en modal:", images);

	const imageList =
		images && images.length > 0
			? images
			: ["https://via.placeholder.com/400x300?text=Sin+Imagen"];

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				onClick={onClose}
			>
				<motion.div
					className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
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
						className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
					>
						<FiX className="text-gray-600 text-xl" />
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
					</div>

					{/* Contenido */}
					<div className="p-6">
						{/* Header */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="mb-6"
						>
							<h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
								{name}
							</h2>
							<div className="flex items-center justify-between">
								<div className="flex items-center text-green-600">
									<FiDollarSign className="mr-1" />
									<span className="text-2xl font-bold">
										${Number(price).toLocaleString()}
									</span>
								</div>
							</div>
						</motion.div>

						{/* Descripción */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="mb-6"
						>
							<p className="text-gray-700 text-lg leading-relaxed">
								{description}
							</p>
						</motion.div>

						{/* Ingredientes */}
						{ingredients && ingredients.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="mb-6"
							>
								<div className="flex items-center mb-3">
									<FiList className="text-green-600 mr-2 text-xl" />
									<h3 className="text-xl font-semibold text-gray-800">
										Ingredientes
									</h3>
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2 capitalize items-center justify-center">
									{ingredients.map((ingredient, index) => (
										<span
											key={index}
											className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg font-medium text-center"
										>
											{typeof ingredient === "string"
												? ingredient
												: ingredient.name}
										</span>
									))}
								</div>
							</motion.div>
						)}

						{/* Botón de acción */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="pt-4 border-t border-gray-200"
						>
							<button
								onClick={onClose}
								className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
							>
								Cerrar
							</button>
						</motion.div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CocktailDetailModal;

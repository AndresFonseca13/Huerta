import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PromotionEntryModal = ({ promotion, onClose }) => {
	if (!promotion) return null;

	const [imageLoaded, setImageLoaded] = useState(false);

	// Bloquear scroll del fondo mientras el modal está abierto
	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
			onClick={handleOverlayClick}
			role="dialog"
			aria-modal="true"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 12 }}
				animate={{
					opacity: imageLoaded ? 1 : 0.6,
					scale: imageLoaded ? 1 : 0.98,
					y: 0,
				}}
				transition={{ duration: 0.25, ease: "easeOut" }}
				className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-gray-100"
			>
				<div className="relative bg-black">
					{!imageLoaded && (
						<div className="flex items-center justify-center h-[40vh] text-white/80 text-sm">
							Cargando promoción…
						</div>
					)}
					{promotion.image_url && (
						<img
							src={promotion.image_url}
							alt={promotion.title}
							onLoad={() => setImageLoaded(true)}
							className="w-full max-h-[70vh] object-contain bg-black"
						/>
					)}
					<button
						aria-label="Cerrar"
						onClick={onClose}
						className="absolute top-3 right-3 rounded-full bg-black/60 text-white w-9 h-9 flex items-center justify-center hover:bg-black/80"
					>
						✕
					</button>
				</div>
				<div className="px-6 pt-5 pb-6 text-center">
					<h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
						{promotion.title}
					</h3>
					{promotion.description && (
						<p className="mt-3 text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
							{promotion.description}
						</p>
					)}
					<div className="mt-7 flex justify-center">
						<button
							onClick={onClose}
							className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-800 shadow-sm"
						>
							Cerrar
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default PromotionEntryModal;

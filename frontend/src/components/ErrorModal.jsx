import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ErrorModal = ({ message, onClose }) => {
	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 0.3 },
		},
	};

	const modalVariants = {
		hidden: {
			opacity: 0,
			scale: 0.8,
			y: 50,
		},
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: {
				duration: 0.4,
				ease: "easeOut",
			},
		},
	};

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
				variants={overlayVariants}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
			>
				<motion.div
					className="bg-white rounded-xl p-8 max-w-sm w-full relative text-center shadow-2xl"
					variants={modalVariants}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<motion.div
							initial={{ scale: 0, rotate: 45 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
							className="text-red-600 text-3xl font-semibold"
						>
							!
						</motion.div>
					</div>
					<h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
					<p className="text-gray-700 mb-6">{message}</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onClose}
						className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Cerrar
					</motion.button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default ErrorModal;

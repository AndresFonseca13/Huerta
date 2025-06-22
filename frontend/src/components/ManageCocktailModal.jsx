import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FiX,
	FiEye,
	FiEyeOff,
	FiTrash2,
	FiAlertTriangle,
} from "react-icons/fi";
import {
	updateCocktailStatus,
	deleteCocktail,
} from "../services/cocktailService";
import ErrorModal from "./ErrorModal";

const ManageCocktailModal = ({
	cocktail,
	isOpen,
	onClose,
	onUpdateSuccess,
}) => {
	console.log("[DEBUG] ManageCocktailModal - Cocktail recibido:", cocktail);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleToggleStatus = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			const newStatus = !cocktail.is_active;
			const result = await updateCocktailStatus(cocktail.id, newStatus);

			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				onUpdateSuccess(result.cocktail);
			}, 2000);
		} catch (err) {
			setError(err.message || "Error al cambiar el estado del cóctel.");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePhysicalDelete = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await deleteCocktail(cocktail.id);
			setShowDeleteConfirm(false);
			onUpdateSuccess(null); // null indica que se eliminó
		} catch (err) {
			setError(err.message || "Error al eliminar el cóctel.");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{error && <ErrorModal message={error} onClose={() => setError(null)} />}
			{isSuccess && (
				<motion.div
					className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center"
						initial={{ scale: 0.9, y: 50, opacity: 0 }}
						animate={{ scale: 1, y: 0, opacity: 1 }}
						exit={{ scale: 0.9, y: 50, opacity: 0 }}
					>
						<motion.div
							className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						>
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</motion.div>
						<motion.h3
							className="text-xl font-bold text-gray-800 mb-2"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							¡Estado Actualizado!
						</motion.h3>
						<motion.p
							className="text-gray-600"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							El cóctel "{cocktail.name}" ha sido{" "}
							{cocktail.is_active ? "deshabilitado" : "habilitado"}{" "}
							exitosamente.
						</motion.p>
					</motion.div>
				</motion.div>
			)}
			{showDeleteConfirm && (
				<motion.div
					className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center"
						initial={{ scale: 0.9, y: 50, opacity: 0 }}
						animate={{ scale: 1, y: 0, opacity: 1 }}
						exit={{ scale: 0.9, y: 50, opacity: 0 }}
					>
						<motion.div
							className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						>
							<FiAlertTriangle className="w-8 h-8 text-red-600" />
						</motion.div>
						<motion.h3
							className="text-xl font-bold text-gray-800 mb-2"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							¿Eliminar definitivamente?
						</motion.h3>
						<motion.p
							className="text-gray-600 mb-6"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							Esta acción eliminará permanentemente el cóctel "{cocktail.name}"
							y no se puede deshacer.
						</motion.p>
						<motion.div
							className="flex space-x-4 justify-center"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isSubmitting}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								onClick={handlePhysicalDelete}
								disabled={isSubmitting}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
							>
								{isSubmitting ? "Eliminando..." : "Eliminar Definitivamente"}
							</button>
						</motion.div>
					</motion.div>
				</motion.div>
			)}
			{!isSuccess && !showDeleteConfirm && (
				<motion.div
					className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				>
					<motion.div
						className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative"
						initial={{ scale: 0.9, y: 50, opacity: 0 }}
						animate={{ scale: 1, y: 0, opacity: 1 }}
						exit={{ scale: 0.9, y: 50, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={onClose}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
							aria-label="Cerrar modal"
						>
							<FiX size={24} />
						</button>

						<h2 className="text-2xl font-bold text-gray-800 mb-6">
							Gestionar Cóctel
						</h2>

						{/* Información del cóctel */}
						<div className="bg-gray-50 rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
								{cocktail.name}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-gray-700">Precio:</span>
									<span className="ml-2 text-gray-600">${cocktail.price}</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Estado:</span>
									<span
										className={`ml-2 ${
											cocktail.is_active ? "text-green-600" : "text-red-600"
										}`}
									>
										{cocktail.is_active ? "Activo" : "Inactivo"}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">
										Ingredientes:
									</span>
									<span className="ml-2 text-gray-600">
										{cocktail.ingredients?.length || 0}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Categorías:</span>
									<span className="ml-2 text-gray-600">
										{cocktail.categories?.length || 0}
									</span>
								</div>
							</div>
						</div>

						{/* Opciones de gestión */}
						<div className="space-y-4">
							{/* Toggle de estado */}
							<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div className="flex items-center">
									{cocktail.is_active ? (
										<FiEye className="w-5 h-5 text-green-600 mr-3" />
									) : (
										<FiEyeOff className="w-5 h-5 text-red-600 mr-3" />
									)}
									<div>
										<h4 className="font-medium text-gray-800">
											{cocktail.is_active ? "Habilitado" : "Deshabilitado"} en
											el menú
										</h4>
										<p className="text-sm text-gray-600">
											{cocktail.is_active
												? "Los clientes pueden ver este cóctel en el menú"
												: "Los clientes no pueden ver este cóctel en el menú"}
										</p>
									</div>
								</div>
								<button
									onClick={handleToggleStatus}
									disabled={isSubmitting}
									className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
										cocktail.is_active
											? "bg-red-100 text-red-700 hover:bg-red-200"
											: "bg-green-100 text-green-700 hover:bg-green-200"
									}`}
								>
									{isSubmitting
										? "Procesando..."
										: cocktail.is_active
										? "Deshabilitar"
										: "Habilitar"}
								</button>
							</div>

							{/* Eliminación física */}
							<div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
								<div className="flex items-center">
									<FiTrash2 className="w-5 h-5 text-red-600 mr-3" />
									<div>
										<h4 className="font-medium text-red-800">
											Eliminación permanente
										</h4>
										<p className="text-sm text-red-600">
											Elimina completamente el cóctel de la base de datos
										</p>
									</div>
								</div>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									disabled={isSubmitting}
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
								>
									Eliminar
								</button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ManageCocktailModal;

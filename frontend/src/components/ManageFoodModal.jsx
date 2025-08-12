import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
	FiX,
	FiEye,
	FiEyeOff,
	FiTrash2,
	FiAlertTriangle,
} from "react-icons/fi";
import { updateProductStatus, deleteProduct } from "../services/productService";
import ErrorModal from "./ErrorModal";

const ManageFoodModal = ({ item, isOpen, onClose, onUpdateSuccess }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleToggleStatus = async () => {
		setIsSubmitting(true);
		setError(null);
		try {
			const currentStatus = item.is_active === null ? false : item.is_active;
			const newStatus = !currentStatus;
			const result = await updateProductStatus(item.id, newStatus);
			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				onUpdateSuccess(result.cocktail);
			}, 1200);
		} catch (err) {
			setError(err.message || "Error al cambiar el estado del plato.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePhysicalDelete = async () => {
		setIsSubmitting(true);
		setError(null);
		try {
			await deleteProduct(item.id);
			setShowDeleteConfirm(false);
			onUpdateSuccess(null);
		} catch (err) {
			setError(err.message || "Error al eliminar el plato.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{error && <ErrorModal message={error} onClose={() => setError(null)} />}
			{isSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
					<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							✓
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							¡Estado Actualizado!
						</h3>
						<p className="text-gray-600">
							El plato "{item.name}" ha sido{" "}
							{item.is_active ? "deshabilitado" : "habilitado"} exitosamente.
						</p>
					</div>
				</div>
			)}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
					<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiAlertTriangle className="w-8 h-8 text-red-600" />
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							¿Eliminar definitivamente?
						</h3>
						<p className="text-gray-600 mb-6">
							Esta acción eliminará permanentemente el plato "{item.name}" y no
							se puede deshacer.
						</p>
						<div className="flex space-x-4 justify-center">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isSubmitting}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
							>
								Cancelar
							</button>
							<button
								onClick={handlePhysicalDelete}
								disabled={isSubmitting}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
							>
								{isSubmitting ? "Eliminando..." : "Eliminar Definitivamente"}
							</button>
						</div>
					</div>
				</div>
			)}
			{!isSuccess && !showDeleteConfirm && (
				<div
					className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
					onClick={onClose}
				>
					<div
						className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={onClose}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
							aria-label="Cerrar"
						>
							<FiX size={24} />
						</button>
						<h2 className="text-2xl font-bold text-gray-800 mb-6">
							Gestionar Plato
						</h2>
						<div className="bg-gray-50 rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
								{item.name}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-gray-700">Precio:</span>
									<span className="ml-2 text-gray-600">${item.price}</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">Estado:</span>
									<span
										className={`ml-2 ${
											item.is_active ? "text-green-600" : "text-red-600"
										}`}
									>
										{item.is_active ? "Activo" : "Inactivo"}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">
										Ingredientes:
									</span>
									<span className="ml-2 text-gray-600">
										{item.ingredients?.length || 0}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-700">
										Clasificaciones:
									</span>
									<span className="ml-2 text-gray-600">
										{item.categories?.length || 0}
									</span>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div className="flex items-center">
									{item.is_active ? (
										<FiEye className="w-5 h-5 text-green-600 mr-3" />
									) : (
										<FiEyeOff className="w-5 h-5 text-red-600 mr-3" />
									)}
									<div>
										<h4 className="font-medium text-gray-800">
											{item.is_active ? "Habilitado" : "Deshabilitado"} en el
											menú
										</h4>
										<p className="text-sm text-gray-600">
											{item.is_active
												? "Los clientes pueden ver este plato en el menú"
												: "Los clientes no pueden ver este plato en el menú"}
										</p>
									</div>
								</div>
								<button
									onClick={handleToggleStatus}
									disabled={isSubmitting}
									className={`px-4 py-2 rounded-md ${
										item.is_active
											? "bg-red-100 text-red-700 hover:bg-red-200"
											: "bg-green-100 text-green-700 hover:bg-green-200"
									}`}
								>
									{isSubmitting
										? "Procesando..."
										: item.is_active
										? "Deshabilitar"
										: "Habilitar"}
								</button>
							</div>
							<div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
								<div className="flex items-center">
									<FiTrash2 className="w-5 h-5 text-red-600 mr-3" />
									<div>
										<h4 className="font-medium text-red-800">
											Eliminación permanente
										</h4>
										<p className="text-sm text-red-600">
											Elimina completamente el plato de la base de datos
										</p>
									</div>
								</div>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									disabled={isSubmitting}
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
								>
									Eliminar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default ManageFoodModal;

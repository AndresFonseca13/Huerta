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
					<div
						className="rounded-lg shadow-xl p-8 max-w-md w-full text-center"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
							style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
						>
							✓
						</div>
						<h3 className="text-xl font-bold mb-2" style={{ color: "#e9cc9e" }}>
							¡Estado Actualizado!
						</h3>
						<p style={{ color: "#b8b8b8" }}>
							El plato "{item.name}" ha sido{" "}
							{item.is_active ? "deshabilitado" : "habilitado"} exitosamente.
						</p>
					</div>
				</div>
			)}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
					<div
						className="rounded-lg shadow-xl p-8 max-w-md w-full text-center"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
							style={{
								backgroundColor: "#2a1414",
								border: "1px solid #b91c1c",
							}}
						>
							<FiAlertTriangle
								className="w-8 h-8"
								style={{ color: "#b91c1c" }}
							/>
						</div>
						<h3 className="text-xl font-bold mb-2" style={{ color: "#e9cc9e" }}>
							¿Eliminar definitivamente?
						</h3>
						<p className="mb-6" style={{ color: "#b8b8b8" }}>
							Esta acción eliminará permanentemente el plato "{item.name}" y no
							se puede deshacer.
						</p>
						<div className="flex space-x-4 justify-center">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isSubmitting}
								className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
							>
								Cancelar
							</button>
							<button
								onClick={handlePhysicalDelete}
								disabled={isSubmitting}
								className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
								style={{
									backgroundColor: "#b91c1c",
									color: "#ffffff",
									border: "1px solid #7f1d1d",
								}}
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
						className="rounded-lg shadow-xl p-8 max-w-2xl w-full relative"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={onClose}
							className="absolute top-4 right-4"
							style={{ color: "#e9cc9e" }}
							aria-label="Cerrar"
						>
							<FiX size={24} />
						</button>
						<h2
							className="text-2xl font-bold mb-6"
							style={{ color: "#e9cc9e" }}
						>
							Gestionar Plato
						</h2>
						<div
							className="rounded-lg p-6 mb-6"
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							<h3
								className="text-lg font-semibold mb-4 capitalize"
								style={{ color: "#e9cc9e" }}
							>
								{item.name}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium" style={{ color: "#e9cc9e" }}>
										Precio:
									</span>
									<span className="ml-2" style={{ color: "#b8b8b8" }}>
										${item.price}
									</span>
								</div>
								<div>
									<span className="font-medium" style={{ color: "#e9cc9e" }}>
										Estado:
									</span>
									<span
										className="ml-2"
										style={{ color: item.is_active ? "#22c55e" : "#b91c1c" }}
									>
										{item.is_active ? "Activo" : "Inactivo"}
									</span>
								</div>
								<div>
									<span className="font-medium" style={{ color: "#e9cc9e" }}>
										Ingredientes:
									</span>
									<span className="ml-2" style={{ color: "#b8b8b8" }}>
										{item.ingredients?.length || 0}
									</span>
								</div>
								<div>
									<span className="font-medium" style={{ color: "#e9cc9e" }}>
										Clasificaciones:
									</span>
									<span className="ml-2" style={{ color: "#b8b8b8" }}>
										{item.categories?.length || 0}
									</span>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div
								className="flex items-center justify-between p-4 rounded-lg"
								style={{ border: "1px solid #3a3a3a" }}
							>
								<div className="flex items-center">
									{item.is_active ? (
										<FiEye
											className="w-5 h-5 mr-3"
											style={{ color: "#22c55e" }}
										/>
									) : (
										<FiEyeOff
											className="w-5 h-5 mr-3"
											style={{ color: "#b91c1c" }}
										/>
									)}
									<div>
										<h4 className="font-medium" style={{ color: "#e9cc9e" }}>
											{item.is_active ? "Habilitado" : "Deshabilitado"} en el
											menú
										</h4>
										<p className="text-sm" style={{ color: "#b8b8b8" }}>
											{item.is_active
												? "Los clientes pueden ver este plato en el menú"
												: "Los clientes no pueden ver este plato en el menú"}
										</p>
									</div>
								</div>
								<button
									onClick={handleToggleStatus}
									disabled={isSubmitting}
									className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50`}
									style={{
										backgroundColor: item.is_active ? "#2a1414" : "#122114",
										border: `1px solid ${
											item.is_active ? "#b91c1c" : "#22c55e"
										}`,
										color: item.is_active ? "#fca5a5" : "#86efac",
									}}
								>
									{isSubmitting
										? "Procesando..."
										: item.is_active
										? "Deshabilitar"
										: "Habilitar"}
								</button>
							</div>

							<div
								className="flex items-center justify-between p-4 rounded-lg"
								style={{
									border: "1px solid #7f1d1d",
									backgroundColor: "#2a1414",
								}}
							>
								<div className="flex items-center">
									<FiTrash2
										className="w-5 h-5 mr-3"
										style={{ color: "#b91c1c" }}
									/>
									<div>
										<h4 className="font-medium" style={{ color: "#fca5a5" }}>
											Eliminación permanentes
										</h4>
										<p className="text-sm" style={{ color: "#fca5a5" }}>
											Elimina completamente el plato de la base de datos
										</p>
									</div>
								</div>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									disabled={isSubmitting}
									className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
									style={{
										backgroundColor: "#b91c1c",
										color: "#ffffff",
										border: "1px solid #7f1d1d",
									}}
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

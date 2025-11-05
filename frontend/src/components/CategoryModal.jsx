import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTag, FiType } from "react-icons/fi";

const CategoryModal = ({
	isOpen,
	onClose,
	onSave,
	initialData = {},
	modoEdicion = false,
}) => {
	const [name, setName] = useState("");
	const [type, setType] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (modoEdicion && initialData) {
			setName(initialData.name || "");
			setType(initialData.type || "");
		} else {
			setName("");
			setType("");
		}
		setError("");
	}, [isOpen, initialData, modoEdicion]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name.trim()) {
			setError("El nombre es obligatorio");
			return;
		}
		if (!type.trim()) {
			setError("El tipo es obligatorio");
			return;
		}
		onSave({ name: name.trim(), type: type.trim() });
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="rounded-xl shadow-2xl p-6 w-full max-w-md relative"
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					initial={{ scale: 0.9, y: 40 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.9, y: 40 }}
					transition={{ duration: 0.2 }}
				>
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2"
						style={{
							WebkitAppearance: "none",
							WebkitTapHighlightColor: "transparent",
						}}
						aria-label="Cerrar modal"
					>
						<FiX size={20} />
					</button>
					<h2
						className="text-xl font-bold mb-4 text-center"
						style={{ color: "#e9cc9e" }}
					>
						{modoEdicion ? "Editar Categoría" : "Crear Nueva Categoría"}
					</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								className="block text-sm font-medium mb-1"
								style={{ color: "#e9cc9e" }}
							>
								<FiTag className="inline mr-1" style={{ color: "#e9cc9e" }} />{" "}
								Nombre
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
								placeholder="Nombre de la categoría"
								autoFocus
							/>
						</div>
						<div>
							<label
								className="block text-sm font-medium mb-1"
								style={{ color: "#e9cc9e" }}
							>
								<FiType className="inline mr-1" style={{ color: "#e9cc9e" }} />{" "}
								Tipo
							</label>
							<input
								type="text"
								value={type}
								onChange={(e) => setType(e.target.value)}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
								placeholder="Tipo de la categoría"
							/>
						</div>
						{error && (
							<div className="text-red-500 text-sm text-center">{error}</div>
						)}
						<button
							type="submit"
							className="w-full py-2 rounded-lg font-semibold transition-colors"
							style={{ 
								backgroundColor: "#e9cc9e", 
								color: "#191919",
								WebkitAppearance: "none",
								WebkitTapHighlightColor: "transparent",
							}}
						>
							{modoEdicion ? "Guardar Cambios" : "Crear Categoría"}
						</button>
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CategoryModal;

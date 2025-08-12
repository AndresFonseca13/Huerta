import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCocktail, FaUtensils, FaTimes } from "react-icons/fa";

const FloatingTypeSwitcher = ({ tipo, onChange }) => {
	const [open, setOpen] = useState(false);

	const content = (
		<div
			className="fixed z-[2000] pointer-events-auto"
			style={{
				right: "1rem",
				top: "50%",
				transform: "translateY(-50%)",
			}}
		>
			<button
				type="button"
				aria-label="Cambiar tipo"
				onClick={() => setOpen((v) => !v)}
				className="flex items-center justify-center w-12 h-12 rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 focus:outline-none"
			>
				{tipo === "destilado" ? (
					<FaCocktail size={18} />
				) : (
					<FaUtensils size={18} />
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.98 }}
						transition={{ duration: 0.2 }}
						className="absolute top-14 right-0 w-48 bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden z-[2001]"
					>
						<div className="flex items-center justify-between px-3 py-2 border-b">
							<span className="text-sm font-medium text-gray-700">
								Seleccionar
							</span>
							<button
								className="p-1 text-gray-500 hover:text-gray-700"
								onClick={() => setOpen(false)}
								aria-label="Cerrar"
							>
								<FaTimes size={14} />
							</button>
						</div>
						<button
							className={`w-full flex items-center gap-2 px-3 py-3 text-left text-sm transition-colors ${
								tipo === "destilado"
									? "bg-green-50 text-green-800"
									: "hover:bg-gray-50"
							}`}
							onClick={() => {
								onChange?.("destilado");
								setOpen(false);
							}}
						>
							<FaCocktail /> Bebidas
						</button>
						<button
							className={`w-full flex items-center gap-2 px-3 py-3 text-left text-sm transition-colors ${
								tipo === "clasificacion"
									? "bg-green-50 text-green-800"
									: "hover:bg-gray-50"
							}`}
							onClick={() => {
								onChange?.("clasificacion");
								setOpen(false);
							}}
						>
							<FaUtensils /> Comida
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);

	const root = typeof document !== "undefined" ? document.body : null;
	return root ? createPortal(content, root) : content;
};

export default FloatingTypeSwitcher;

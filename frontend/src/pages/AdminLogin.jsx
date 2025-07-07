import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { loginAdmin } from "../services/authService";

const AdminLogin = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const location = useLocation();

	// Obtener la página de destino desde el estado de la ubicación
	const from = location.state?.from?.pathname || "/admin";

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Limpiar error cuando el usuario empiece a escribir
		if (error) setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await loginAdmin(formData.username, formData.password);

			// Guardar token en localStorage
			localStorage.setItem("adminToken", response.token);
			localStorage.setItem("adminUsername", response.username);

			// Redirigir a la página de destino o al panel de administración
			navigate(from, { replace: true });
		} catch (err) {
			setError(err.message || "Error al iniciar sesión");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
			<motion.div
				className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-4"
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="text-center mb-6 sm:mb-8">
					<motion.div
						className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
					>
						<FiUser className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
					</motion.div>
					<motion.h1
						className="text-sm sm:text-2xl font-bold text-gray-800 leading-tight w-full max-w-full mx-auto text-center break-words whitespace-normal"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						Panel de Administración
					</motion.h1>
					<motion.p
						className="text-sm sm:text-base text-gray-600 mt-2"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						Inicia sesión para continuar
					</motion.p>
				</div>

				{/* Form */}
				<motion.form
					onSubmit={handleSubmit}
					className="space-y-4 sm:space-y-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					{/* Username Field */}
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Usuario
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
							</div>
							<input
								id="username"
								name="username"
								type="text"
								required
								value={formData.username}
								onChange={handleInputChange}
								className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
								placeholder="Ingresa tu usuario"
								disabled={isLoading}
							/>
						</div>
					</div>

					{/* Password Field */}
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Contraseña
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
							</div>
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								value={formData.password}
								onChange={handleInputChange}
								className="block w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
								placeholder="Ingresa tu contraseña"
								disabled={isLoading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
								disabled={isLoading}
							>
								{showPassword ? (
									<FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
								) : (
									<FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
								)}
							</button>
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<motion.div
							className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							{error}
						</motion.div>
					)}

					{/* Submit Button */}
					<motion.button
						type="submit"
						disabled={isLoading}
						className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						{isLoading ? (
							<div className="flex items-center justify-center">
								<div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
								<span className="text-xs sm:text-sm">Iniciando sesión...</span>
							</div>
						) : (
							"Iniciar Sesión"
						)}
					</motion.button>
				</motion.form>

				{/* Footer */}
				<motion.div
					className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<p>Acceso exclusivo para administradores</p>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default AdminLogin;

import axios from "axios";

const API_URL = "http://localhost:3000";

export const loginUser = async (username, password) => {
	try {
		const response = await axios.post(`${API_URL}/auth/login`, {
			username,
			password,
		});

		const { token } = response.data;
		localStorage.setItem("token", token);
		return response.data;
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};

// Función para login de administrador
export const loginAdmin = async (username, password) => {
	try {
		const response = await axios.post(`${API_URL}/auth/login`, {
			username,
			password,
		});

		const { token } = response.data;
		localStorage.setItem("token", token);
		return response.data;
	} catch (error) {
		console.error("Error during admin login:", error);
		throw error;
	}
};

// Función para cerrar sesión
export const logout = () => {
	localStorage.removeItem("token");
	// Opcional: redirigir al usuario a la página de login
	window.location.href = "/admin/login";
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
	const token = localStorage.getItem("token");
	return !!token; // Retorna true si existe un token, false si no
};

// Función para obtener los headers de autenticación
export const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		"Content-Type": "application/json",
		Authorization: token ? `Bearer ${token}` : "",
	};
};

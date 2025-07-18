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
		// Manejar diferentes tipos de errores con mensajes amigables
		if (error.response) {
			const status = error.response.status;
			const message =
				error.response.data?.mensaje || error.response.data?.message;
			switch (status) {
				case 401:
					throw new Error("Usuario o contraseña incorrectos");
				case 400:
					throw new Error(message || "Datos de entrada inválidos");
				case 404:
					throw new Error("Usuario no encontrado");
				case 500:
					throw new Error("Error del servidor. Inténtalo más tarde");
				default:
					throw new Error(message || "Error al iniciar sesión");
			}
		} else if (error.request) {
			throw new Error(
				"No se pudo conectar con el servidor. Verifica tu conexión"
			);
		} else {
			throw new Error("Error inesperado. Inténtalo nuevamente");
		}
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
		// Manejar diferentes tipos de errores con mensajes amigables
		if (error.response) {
			const status = error.response.status;
			const message =
				error.response.data?.mensaje || error.response.data?.message;
			switch (status) {
				case 401:
					throw new Error("Usuario o contraseña incorrectos");
				case 400:
					throw new Error(message || "Datos de entrada inválidos");
				case 404:
					throw new Error("Usuario no encontrado");
				case 500:
					throw new Error("Error del servidor. Inténtalo más tarde");
				default:
					throw new Error(message || "Error al iniciar sesión");
			}
		} else if (error.request) {
			throw new Error(
				"No se pudo conectar con el servidor. Verifica tu conexión"
			);
		} else {
			throw new Error("Error inesperado. Inténtalo nuevamente");
		}
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
	if (!token) {
		return false;
	}

	// Verificar si el token no está vacío
	if (token.trim() === "") {
		localStorage.removeItem("token");
		return false;
	}

	// Opcional: Verificar si el token no ha expirado (si es un JWT)
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		const currentTime = Date.now() / 1000;
		if (payload.exp && payload.exp < currentTime) {
			localStorage.removeItem("token");
			return false;
		}
	} catch {
		// Si no es un JWT válido, asumimos que es un token simple
		// y solo verificamos que no esté vacío
	}

	return true;
};

// Función para obtener los headers de autenticación
export const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		"Content-Type": "application/json",
		Authorization: token ? `Bearer ${token}` : "",
	};
};

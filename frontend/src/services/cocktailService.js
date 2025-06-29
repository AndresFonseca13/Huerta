import { getAuthHeaders } from "./authService";

const API_BASE_URL = "/api";

// Función para obtener cócteles (pública - no requiere autenticación)
export const getCocktails = async (
	page = 1,
	limit = 12,
	categoria = null,
	tipo = null,
	orden = "name"
) => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			orden: orden,
		});

		if (categoria) params.append("categoria", categoria);
		if (tipo) params.append("tipo", tipo);

		const response = await fetch(`${API_BASE_URL}/cocktails?${params}`, {
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.mensaje || "Error al obtener cócteles");
		}

		return data;
	} catch (error) {
		console.error("Error fetching cocktails:", error);
		throw error;
	}
};

// Función para obtener TODOS los cócteles para admin (requiere autenticación)
export const getCocktailsAdmin = async (
	page = 1,
	limit = 50,
	categoria = null,
	tipo = null,
	orden = "name"
) => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			orden: orden,
		});

		if (categoria) params.append("categoria", categoria);
		if (tipo) params.append("tipo", tipo);

		const response = await fetch(
			`${API_BASE_URL}/cocktails/admin/all?${params}`,
			{
				headers: getAuthHeaders(),
			}
		);
		const data = await response.json();

		if (!response.ok) {
			// Si es un error 401 (Unauthorized), limpiar token y redirigir
			if (response.status === 401) {
				localStorage.removeItem("token");
				window.location.href = "/admin/login";
				throw new Error(
					"Sesión expirada. Por favor, inicia sesión nuevamente."
				);
			}
			throw new Error(data.mensaje || "Error al obtener cócteles");
		}

		return data;
	} catch (error) {
		console.error("Error fetching admin cocktails:", error);
		throw error;
	}
};

// Función para crear cóctel (requiere autenticación)
export const createCocktail = async (cocktailData) => {
	try {
		const response = await fetch(`${API_BASE_URL}/cocktails`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(cocktailData),
		});

		const data = await response.json();

		if (!response.ok) {
			// Si es un error 401 (Unauthorized), limpiar token y redirigir
			if (response.status === 401) {
				localStorage.removeItem("token");
				window.location.href = "/admin/login";
				throw new Error(
					"Sesión expirada. Por favor, inicia sesión nuevamente."
				);
			}
			throw new Error(data.mensaje || "Error al crear cóctel");
		}

		return data;
	} catch (error) {
		console.error("Error creating cocktail:", error);
		throw error;
	}
};

// Función para actualizar cóctel (requiere autenticación)
export const updateCocktail = async (id, cocktailData) => {
	try {
		const response = await fetch(`${API_BASE_URL}/cocktails/${id}`, {
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify(cocktailData),
		});

		const data = await response.json();

		if (!response.ok) {
			// Si es un error 401 (Unauthorized), limpiar token y redirigir
			if (response.status === 401) {
				localStorage.removeItem("token");
				window.location.href = "/admin/login";
				throw new Error(
					"Sesión expirada. Por favor, inicia sesión nuevamente."
				);
			}
			throw new Error(data.mensaje || "Error al actualizar cóctel");
		}

		return data;
	} catch (error) {
		console.error("Error updating cocktail:", error);
		throw error;
	}
};

// Función para actualizar estado del cóctel (requiere autenticación)
export const updateCocktailStatus = async (id, isActive) => {
	try {
		const response = await fetch(`${API_BASE_URL}/cocktails/${id}/status`, {
			method: "PATCH",
			headers: getAuthHeaders(),
			body: JSON.stringify({ isActive }),
		});

		const data = await response.json();

		if (!response.ok) {
			// Si es un error 401 (Unauthorized), limpiar token y redirigir
			if (response.status === 401) {
				localStorage.removeItem("token");
				window.location.href = "/admin/login";
				throw new Error(
					"Sesión expirada. Por favor, inicia sesión nuevamente."
				);
			}
			throw new Error(data.mensaje || "Error al actualizar estado del cóctel");
		}

		return data;
	} catch (error) {
		console.error("Error updating cocktail status:", error);
		throw error;
	}
};

// Función para eliminar cóctel (requiere autenticación)
export const deleteCocktail = async (id) => {
	try {
		const response = await fetch(`${API_BASE_URL}/cocktails/${id}`, {
			method: "DELETE",
			headers: getAuthHeaders(),
		});

		const data = await response.json();

		if (!response.ok) {
			// Si es un error 401 (Unauthorized), limpiar token y redirigir
			if (response.status === 401) {
				localStorage.removeItem("token");
				window.location.href = "/admin/login";
				throw new Error(
					"Sesión expirada. Por favor, inicia sesión nuevamente."
				);
			}
			throw new Error(data.mensaje || "Error al eliminar cóctel");
		}

		return data;
	} catch (error) {
		console.error("Error deleting cocktail:", error);
		throw error;
	}
};

// Función para subir imágenes (requiere autenticación)
export const uploadImages = async (files) => {
	try {
		const formData = new FormData();
		Array.from(files).forEach((file) => {
			formData.append("images", file);
		});

		const response = await fetch(`${API_BASE_URL}/upload`, {
			method: "POST",
			headers: {
				Authorization: getAuthHeaders().Authorization,
			},
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.mensaje || "Error al subir imágenes");
		}

		return data.urls;
	} catch (error) {
		console.error("Error uploading images:", error);
		throw error;
	}
};

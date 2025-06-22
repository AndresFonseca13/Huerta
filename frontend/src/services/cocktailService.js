import axios from "axios";

const API_URL = "http://localhost:3000";

export const getCocktails = async (
	page = 1,
	limit = 10,
	categoria = null,
	tipo = null
) => {
	console.log("[DEBUG] getCocktails - Parámetros enviados:", {
		page,
		limit,
		categoria,
		tipo,
	});

	const params = new URLSearchParams({
		pagina: page,
		limite: limit,
	});

	if (categoria) params.append("categoria", categoria);
	if (tipo) params.append("tipo", tipo);

	console.log(
		"[DEBUG] getCocktails - URL de la petición:",
		`${API_URL}/cocktails?${params.toString()}`
	);

	const response = await axios.get(`${API_URL}/cocktails?${params.toString()}`);
	console.log(
		"[DEBUG] getCocktails - Respuesta completa del backend:",
		response.data
	);
	console.log(
		"[DEBUG] getCocktails - Cocteles recibidos:",
		response.data.cocteles
	);
	console.log(
		"[DEBUG] getCocktails - Paginación recibida:",
		response.data.paginacion
	);

	// Expect response.data = { cocteles: [...], paginacion: {...} }
	return {
		items: response.data.cocteles,
		totalPages: response.data.paginacion.totalPages,
		totalRecords: response.data.paginacion.totalRecords,
		currentPage: response.data.paginacion.currentPage,
	};
};

export const createCocktail = async (cocktailData) => {
	try {
		const response = await axios.post(`${API_URL}/cocktails`, cocktailData);
		return response.data;
	} catch (error) {
		console.error(
			"Error al crear el cóctel:",
			error.response?.data?.mensaje || error.message
		);
		const errorMessage =
			error.response?.data?.mensaje || "Ocurrió un error inesperado.";
		throw new Error(errorMessage);
	}
};

export const uploadImages = async (files) => {
	const uploadedUrls = [];

	for (const file of files) {
		const formData = new FormData();
		formData.append("image", file);

		try {
			const response = await axios.post(`${API_URL}/upload/upload`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			console.log("Image uploaded:", response.data);
			uploadedUrls.push(response.data.data.url);
		} catch (error) {
			console.error("Error uploading image:", file.name, error);
			throw error;
		}
	}

	return uploadedUrls;
};

// Servicio para actualizar un cóctel
export const updateCocktail = async (id, cocktailData) => {
	try {
		const token = localStorage.getItem("token"); // Asumiendo que el token se guarda en localStorage
		const response = await fetch(`${API_URL}/cocktails/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				// 'Authorization': `Bearer ${token}` // Descomentar si la autenticación está activa
			},
			body: JSON.stringify(cocktailData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.mensaje ||
					`Error ${response.status}: No se pudo actualizar el cóctel`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error en el servicio de actualización de cóctel:", error);
		throw error;
	}
};

// Servicio para actualizar el estado de un cóctel (is_active)
export const updateCocktailStatus = async (id, isActive) => {
	try {
		const response = await fetch(`${API_URL}/cocktails/${id}/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ is_active: isActive }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.mensaje ||
					`Error ${response.status}: No se pudo actualizar el estado del cóctel`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error en el servicio de actualización de estado:", error);
		throw error;
	}
};

// Servicio para eliminar un cóctel
export const deleteCocktail = async (id) => {
	try {
		const response = await fetch(`${API_URL}/cocktails/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.mensaje ||
					`Error ${response.status}: No se pudo eliminar el cóctel`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error en el servicio de eliminación de cóctel:", error);
		throw error;
	}
};

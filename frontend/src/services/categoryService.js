import axios from "axios";

// Usamos el proxy de Vite: todas las rutas del backend están bajo `/api`
const API_BASE_URL = "/api";

export const searchCategories = async (term) => {
	const response = await axios.get(
		`${API_BASE_URL}/categories/search?searchTerm=${term}`
	);
	return response.data;
};

export const getAllCategories = async (showAll = false) => {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/categories?showAll=${showAll}`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching categories:", error);
		throw error;
	}
};

export const createCategory = async (data) => {
	try {
		const token = localStorage.getItem("token");
		const response = await axios.post(`${API_BASE_URL}/categories`, data, {
			headers: {
				Authorization: token ? `Bearer ${token}` : undefined,
			},
		});
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const updateCategory = async (id, data) => {
	try {
		const token = localStorage.getItem("token");
		const response = await axios.put(`${API_BASE_URL}/categories/${id}`, data, {
			headers: {
				Authorization: token ? `Bearer ${token}` : undefined,
			},
		});
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const toggleCategoryActive = async (id, is_active) => {
	try {
		const token = localStorage.getItem("token");
		const response = await axios.patch(
			`${API_BASE_URL}/categories/${id}/active`,
			{ is_active },
			{
				headers: {
					Authorization: token ? `Bearer ${token}` : undefined,
				},
			}
		);
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const deleteCategory = async (id) => {
	try {
		const token = localStorage.getItem("token");
		const response = await axios.delete(
			`${API_BASE_URL}/categories/${id}?logical=false`,
			{
				headers: {
					Authorization: token ? `Bearer ${token}` : undefined,
				},
			}
		);
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

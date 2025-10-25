import axios from "axios";
import { apiConfig } from "../config/api"
// Usamos el proxy de Vite: todas las rutas del backend están bajo `/api`


export const searchCategories = async (term) => {
	const response = await axios.get(
		`${apiConfig.baseURL}/categories/search?searchTerm=${term}`
	);
	return response.data;
};

export const getAllCategories = async (showAll = false) => {
	try {
		const response = await axios.get(
			`${apiConfig.baseURL}/categories?showAll=${showAll}`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching categories:", error);
		throw error;
	}
};

// Obtener solo categorías de comida (type=clasificacion comida) asociadas a productos de comida
export const getFoodCategories = async () => {
	try {
		const response = await axios.get(
			`${apiConfig.baseURL}/categories?onlyFood=true`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching food categories:", error);
		throw error;
	}
};

// Obtener solo categorías de bebidas (type=clasificacion bebida)
export const getBeverageCategories = async () => {
	try {
		const response = await axios.get(
			`${apiConfig.baseURL}/categories?onlyBeverage=true`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching beverage categories:", error);
		throw error;
	}
};

export const createCategory = async (data) => {
	try {
		const token = localStorage.getItem("token");
		const response = await axios.post(`${apiConfig.baseURL}/categories`, data, {
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
		const response = await axios.put(`${apiConfig.baseURL}/categories/${id}`, data, {
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
			`${apiConfig.baseURL}/categories/${id}/active`,
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
			`${apiConfig.baseURL}/categories/${id}?logical=false`,
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

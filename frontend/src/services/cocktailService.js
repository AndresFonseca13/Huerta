import axios from "axios";

const API_URL = "http://localhost:3000";

export const getCocktails = async (
	page = 1,
	limit = 10,
	categoria = null,
	tipo = null
) => {
	const params = new URLSearchParams({
		pagina: page,
		limite: limit,
	});

	if (categoria) params.append("categoria", categoria);
	if (tipo) params.append("tipo", tipo);

	const response = await axios.get(`${API_URL}/cocktails?${params.toString()}`);
	console.log("Cocktails llegan:", response.data);
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

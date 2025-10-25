import { getAuthHeaders } from "./authService";
import { apiConfig } from "../config/api";

export const uploadImages = async (files, productName) => {
	const formData = new FormData();
	Array.from(files).forEach((file) => {
		formData.append("images", file);
	});
	if (productName) {
		formData.append("cocktailName", productName);
	}

	const response = await fetch(`${apiConfig.baseURL}/upload/upload`, {
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
	return data.urls || [];
};

export default { uploadImages };

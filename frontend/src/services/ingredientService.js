import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const searchIngredients = async (term) => {
	const response = await axios.get(
		`${API_BASE_URL}/ingredient/search?searchTerm=${term}`
	);
	return response.data;
};

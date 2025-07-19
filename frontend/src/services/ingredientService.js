import axios from "axios";

const API_URL = "http://localhost:3000";

export const searchIngredients = async (term) => {
  const response = await axios.get(
    `${API_URL}/ingredient/search?searchTerm=${term}`,
  );
  return response.data;
};

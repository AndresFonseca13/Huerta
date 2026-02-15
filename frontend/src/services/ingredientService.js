import { api, apiConfig } from '../config/api';

export const searchIngredients = async (term) => {
  const response = await api.get(
    `${apiConfig.baseURL}/ingredient/search?searchTerm=${term}`,
  );
  return response.data;
};

import { api } from '../config/api';

export const searchIngredients = async (term) => {
  const response = await api.get(
    `/ingredient/search?searchTerm=${term}`,
  );
  return response.data;
};

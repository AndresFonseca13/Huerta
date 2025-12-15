import axios from 'axios';
import { apiConfig } from '../config/api';

export const searchIngredients = async (term) => {
  const response = await axios.get(
    `${apiConfig.baseURL}/ingredient/search?searchTerm=${term}`,
  );
  return response.data;
};

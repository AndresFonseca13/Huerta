import axios from "axios";

const API_URL = "http://localhost:3000";

export const searchCategories = async (term) => {
  const response = await axios.get(
    `${API_URL}/categories/search?searchTerm=${term}`,
  );
  return response.data;
};

export const getAllCategories = async (showAll = false) => {
  try {
    const response = await axios.get(
      `${API_URL}/categories?showAll=${showAll}`,
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
    const response = await axios.post(`${API_URL}/categories`, data, {
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
    const response = await axios.put(`${API_URL}/categories/${id}`, data, {
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
      `${API_URL}/categories/${id}/active`,
      { is_active },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      },
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
      `${API_URL}/categories/${id}?logical=false`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

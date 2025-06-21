import axios from "axios";

const API_URL = "http://localhost:3000";

export const searchCategories = async (term) => {
    const response = await axios.get(`${API_URL}/categories/search?searchTerm=${term}`);
    return response.data;
};

export const getAllCategories = async () => {
    try{
        const response = await axios.get(`${API_URL}/categories/`);
        return response.data;
    }catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
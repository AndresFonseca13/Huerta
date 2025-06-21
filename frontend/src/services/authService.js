import axios from "axios";

const API_URL = "http://localhost:3000";

export const loginUser = async (username, password) => {
    try{
        const response = await axios.post(`${API_URL}/auth/login`,{
            username,
            password
        });

        const {token} = response.data;
        localStorage.setItem('token', token);
        return response.data;
    }catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}

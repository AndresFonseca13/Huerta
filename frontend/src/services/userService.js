import axios from "axios";
import { getAuthHeaders } from "./authService";
import { apiConfig } from "../config/api";

export const getUsers = async () => {
	const headers = getAuthHeaders();
	const { data } = await axios.get(`${apiConfig.baseURL}/users`, { headers });
	return data.users || [];
};

export const getUserById = async (id) => {
	const headers = getAuthHeaders();
	const { data } = await axios.get(`${apiConfig.baseURL}/users/${id}`, { headers });
	return data;
};

export const updateUserRole = async (id, role) => {
	const headers = getAuthHeaders();
	const { data } = await axios.patch(
		`${apiConfig.baseURL}/users/${id}/role`,
		{ role },
		{ headers }
	);
	return data;
};

export const createUser = async ({ username, password, role }) => {
	const headers = getAuthHeaders();
	const { data } = await axios.post(
		`${apiConfig.baseURL}/auth/signup`,
		{ username, password, role },
		{ headers }
	);
	return data;
};

export const updateUserStatus = async (id, isActive) => {
	const headers = getAuthHeaders();
	const { data } = await axios.patch(
		`${apiConfig.baseURL}/users/${id}/status`,
		{ isActive },
		{ headers }
	);
	return data;
};

export const deleteUser = async (id) => {
	const headers = getAuthHeaders();
	const { data } = await axios.delete(`${apiConfig.baseURL}/users/${id}`, {
		headers,
	});
	return data;
};

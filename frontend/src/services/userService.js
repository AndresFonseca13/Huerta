import axios from "axios";
import { getAuthHeaders } from "./authService";

const API_BASE_URL = "/api";

export const getUsers = async () => {
	const headers = getAuthHeaders();
	const { data } = await axios.get(`${API_BASE_URL}/users`, { headers });
	return data.users || [];
};

export const getUserById = async (id) => {
	const headers = getAuthHeaders();
	const { data } = await axios.get(`${API_BASE_URL}/users/${id}`, { headers });
	return data;
};

export const updateUserRole = async (id, role) => {
	const headers = getAuthHeaders();
	const { data } = await axios.patch(
		`${API_BASE_URL}/users/${id}/role`,
		{ role },
		{ headers }
	);
	return data;
};

export const createUser = async ({ username, password, role }) => {
	const headers = getAuthHeaders();
	const { data } = await axios.post(
		`${API_BASE_URL}/auth/signup`,
		{ username, password, role },
		{ headers }
	);
	return data;
};

export const updateUserStatus = async (id, isActive) => {
	const headers = getAuthHeaders();
	const { data } = await axios.patch(
		`${API_BASE_URL}/users/${id}/status`,
		{ isActive },
		{ headers }
	);
	return data;
};

export const deleteUser = async (id) => {
	const headers = getAuthHeaders();
	const { data } = await axios.delete(`${API_BASE_URL}/users/${id}`, {
		headers,
	});
	return data;
};

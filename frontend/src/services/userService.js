import { api } from '../config/api';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data.users || [];
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/users/${id}/role`, { role });
  return data;
};

export const createUser = async ({ username, password, role }) => {
  const { data } = await api.post('/auth/signup', { username, password, role });
  return data;
};

export const updateUserStatus = async (id, isActive) => {
  const { data } = await api.patch(`/users/${id}/status`, { isActive });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

export const resetUserPassword = async (id, newPassword) => {
  const { data } = await api.patch(`/users/${id}/reset-password`, { newPassword });
  return data;
};

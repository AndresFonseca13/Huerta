import { api } from '../config/api';

const handleAuthError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.mensaje || error.response.data?.message;
    switch (status) {
    case 401:
      throw new Error('Usuario o contraseña incorrectos');
    case 400:
      throw new Error(message || 'Datos de entrada inválidos');
    case 404:
      throw new Error('Usuario no encontrado');
    case 429:
      throw new Error(message || 'Demasiados intentos. Intenta más tarde');
    case 500:
      throw new Error('Error del servidor. Inténtalo más tarde');
    default:
      throw new Error(message || 'Error al iniciar sesión');
    }
  } else if (error.request) {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión');
  } else {
    throw new Error('Error inesperado. Inténtalo nuevamente');
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const loginAdmin = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const logout = async () => {
  try {
    const { clearPermissionsCache } = await import('../hooks/usePermissions');
    clearPermissionsCache();
  } catch {
    // Ignorar si no se puede importar
  }
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignorar errores de logout
  }
  window.location.href = '/admin/login';
};

export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch {
    return null;
  }
};

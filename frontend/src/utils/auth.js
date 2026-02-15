import { api } from '../config/api';

/**
 * Verifica la sesión con el backend y retorna los datos del usuario.
 * Retorna null si no hay sesión válida.
 */
export async function checkSession() {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Obtiene el rol del usuario desde el backend.
 * Retorna null si no hay sesión válida.
 */
export async function getUserRole() {
  const user = await checkSession();
  return user?.role || null;
}

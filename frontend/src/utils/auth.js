/**
 * Decodifica el payload del JWT almacenado en localStorage.
 * Retorna null si no hay token, está expirado o es inválido.
 */
export function getTokenPayload() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Obtiene el rol del usuario desde el JWT, no desde localStorage.
 * Retorna null si no hay token válido.
 */
export function getUserRole() {
  const payload = getTokenPayload();
  return payload?.role || null;
}

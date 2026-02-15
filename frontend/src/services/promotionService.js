import { apiConfig } from '../config/api';


export const getEligiblePromotionNow = async () => {
  const url = `${apiConfig.baseURL}/promotions/eligible-now?_t=${Date.now()}`;
  const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error al consultar promoción');
  if (Array.isArray(data.promotions)) return data.promotions;
  return data.promotion ? [data.promotion] : [];
};

export const listPromotions = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${apiConfig.baseURL}/promotions?${params}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al listar promociones');
  return data;
};

export const getPromotionById = async (id) => {
  const res = await fetch(`${apiConfig.baseURL}/promotions/${id}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener promoción');
  return data.promotion;
};

export const createPromotion = async (payload) => {
  const res = await fetch(`${apiConfig.baseURL}/promotions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear promoción');
  return data.promotion;
};

export const updatePromotion = async (id, payload) => {
  const res = await fetch(`${apiConfig.baseURL}/promotions/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Propagar error estructurado para que el caller lo muestre en modal
    throw new Error(JSON.stringify(data));
  }
  return data.promotion;
};

export const deletePromotion = async (id) => {
  const res = await fetch(`${apiConfig.baseURL}/promotions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar promoción');
  return true;
};

export default {
  getEligiblePromotionNow,
  listPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};

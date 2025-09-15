import { getAuthHeaders } from "./authService";

const API_BASE_URL = "/api";

export const getEligiblePromotionNow = async () => {
	const url = `${API_BASE_URL}/promotions/eligible-now?_t=${Date.now()}`;
	console.log("[Promo] Fetch elegible-now:", url);
	const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
	console.log("[Promo] HTTP status:", res.status);
	const data = await res.json().catch(() => ({}));
	console.log("[Promo] Response body:", data);
	if (!res.ok) throw new Error(data.mensaje || "Error al consultar promoción");
	if (Array.isArray(data.promotions)) return data.promotions;
	return data.promotion ? [data.promotion] : [];
};

export const listPromotions = async (page = 1, limit = 20) => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await fetch(`${API_BASE_URL}/promotions?${params}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.mensaje || "Error al listar promociones");
	return data;
};

export const getPromotionById = async (id) => {
	const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.mensaje || "Error al obtener promoción");
	return data.promotion;
};

export const createPromotion = async (payload) => {
	const res = await fetch(`${API_BASE_URL}/promotions`, {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.mensaje || "Error al crear promoción");
	return data.promotion;
};

export const updatePromotion = async (id, payload) => {
	const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
		method: "PUT",
		headers: getAuthHeaders(),
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
	const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.mensaje || "Error al eliminar promoción");
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

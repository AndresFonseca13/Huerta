import { getAuthHeaders } from './authService';
import { apiConfig } from '../config/api';

// Públicas
export const getProducts = async (
  page = 1,
  limit = 12,
  categoria = null,
  tipo = null,
  orden = 'name',
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    orden,
  });
  if (categoria) params.append('categoria', categoria);

  const isFood = tipo === 'clasificacion';
  if (!isFood && tipo) params.append('tipo', tipo);

  const endpoint = isFood ? '/products/food' : '/products';
  const response = await fetch(`${apiConfig.baseURL}${endpoint}?${params}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.mensaje || 'Error al obtener productos');
  return data;
};

// Admin
export const getProductsAdmin = async (
  page = 1,
  limit = 50,
  categoria = null,
  tipo = null,
  orden = 'name',
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    orden,
  });
  if (categoria) params.append('categoria', categoria);
  if (tipo) params.append('tipo', tipo);

  const response = await fetch(`${apiConfig.baseURL}/products/admin/all?${params}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(data.mensaje || 'Error al obtener productos');
  }
  return data;
};

export const createProduct = async (productData) => {
  const response = await fetch(`${apiConfig.baseURL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(data.mensaje || 'Error al crear producto');
  }
  return data;
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${apiConfig.baseURL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(data.mensaje || 'Error al actualizar producto');
  }
  return data;
};

export const updateProductStatus = async (id, isActive) => {
  const response = await fetch(`${apiConfig.baseURL}/products/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(data.mensaje || 'Error al actualizar estado del producto');
  }
  return data;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${apiConfig.baseURL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(data.mensaje || 'Error al eliminar producto');
  }
  return data;
};

const API_BASE = '/api';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/* ---------- Admin ---------- */

export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error('Wrong password');
  return res.json(); // { token }
}

function authHeaders() {
  const token = localStorage.getItem('bloombears_admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function adminFetchProducts() {
  const res = await fetch(`${API_BASE}/admin/products`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function adminCreateProduct(product) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create product');
  return res.json();
}

export async function adminUpdateProduct(id, product) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function adminDeleteProduct(id) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function adminFetchOrders() {
  const res = await fetch(`${API_BASE}/admin/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function adminUpdateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function adminUploadImages(files) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  const token = localStorage.getItem('bloombears_admin_token');
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('Image upload failed');
  return res.json(); // { urls }
}

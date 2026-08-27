let API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
if (API_BASE !== '/api' && !API_BASE.endsWith('/api') && !API_BASE.endsWith('/api/')) {
  API_BASE = API_BASE.endsWith('/') ? `${API_BASE}api` : `${API_BASE}/api`;
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const errData = await res.json();
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }
    throw new Error(`Server returned HTML error (${res.status}). Make sure VITE_API_BASE_URL is set correctly in Vercel and points to the Render backend.`);
  }

  if (isJson) {
    return res.json();
  }
  throw new Error('Server did not return JSON format. Check your API configuration.');
}

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
  return handleResponse(res);
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

export async function createOrder(amount, items, customer) {
  const res = await fetch(`${API_BASE}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, items, customer })
  });
  return handleResponse(res);
}

export async function verifyPayment(payload) {
  const res = await fetch(`${API_BASE}/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res;
}

export async function userRegister(name, email, password) {
  const res = await fetch(`${API_BASE}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(res);
}

export async function userLogin(email, password) {
  const res = await fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function fetchUserOrders() {
  const token = localStorage.getItem('bloombears_user_token');
  const res = await fetch(`${API_BASE}/user/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return handleResponse(res);
}




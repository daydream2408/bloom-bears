import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminFetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminFetchOrders, adminUpdateOrderStatus, adminUploadImages, getImageUrl
} from '../api';

const emptyForm = { id: '', name: '', price: '', image: '', description: '', category: '', images: [] };

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  async function loadProducts() {
    try {
      setProducts(await adminFetchProducts());
    } catch {
      localStorage.removeItem('bloombears_admin_token');
      navigate('/admin');
    }
  }

  async function loadOrders() {
    try {
      setOrders(await adminFetchOrders());
    } catch {
      navigate('/admin');
    }
  }

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
      category: p.category || '',
      images: p.images || [p.image]
    });
    setImageFiles([]);
    const fileInput = document.getElementById('admin-image-file');
    if (fileInput) fileInput.value = '';
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles([]);
    const fileInput = document.getElementById('admin-image-file');
    if (fileInput) fileInput.value = '';
  }

  function removeImage(imgUrl) {
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter(url => url !== imgUrl)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        const uploadRes = await adminUploadImages(imageFiles);
        uploadedUrls = uploadRes.urls;
      }

      const existingImages = form.images || [];
      const combinedImages = [...existingImages, ...uploadedUrls].filter(Boolean);

      if (combinedImages.length === 0) {
        throw new Error('Please select at least one product image file.');
      }

      const coverImage = combinedImages[0];

      const payload = {
        ...form,
        price: parseFloat(form.price),
        image: coverImage,
        images: combinedImages
      };
      
      if (editingId) {
        await adminUpdateProduct(editingId, payload);
      } else {
        await adminCreateProduct(payload);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await adminDeleteProduct(id);
    loadProducts();
  }

  async function handleStatusChange(orderId, status) {
    try {
      await adminUpdateOrderStatus(orderId, status);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('bloombears_admin_token');
    navigate('/admin');
  }

  const orderCount = orders.length;
  const totalSales = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0), 0);
  const activeProductCount = products.filter(p => p.active === 1).length;

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const name = o.customer?.name?.toLowerCase() || '';
    const phone = o.customer?.phone || '';
    const id = o.orderId?.toLowerCase() || '';
    return name.includes(q) || phone.includes(q) || id.includes(q);
  });

  const existingCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Store Administration</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: 4 }}>Manage catalog inventory and track orders.</p>
        </div>
        <button className="btn btn-outline" onClick={logout} style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Log out</button>
      </div>

      <div className="admin-metrics">
        <div className="metric-card">
          <span className="label">Total Sales Revenue</span>
          <span className="value">Rs. {totalSales.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <span className="label">Total Orders</span>
          <span className="value">{orderCount}</span>
        </div>
        <div className="metric-card">
          <span className="label">Active Plushies</span>
          <span className="value">{activeProductCount} / {products.length}</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'products' ? 'btn' : 'btn btn-outline'} onClick={() => setTab('products')} style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
          Catalog Products
        </button>
        <button className={tab === 'orders' ? 'btn' : 'btn btn-outline'} onClick={() => setTab('orders')} style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
          Customer Orders
        </button>
      </div>

      {tab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '18px' }}>{editingId ? `Edit Companion: ${editingId}` : 'Add New Companion'}</h3>
            <form className="checkout-form" onSubmit={handleSubmit} style={{ gap: '12px' }}>
              <div className="form-group">
                <label>Product ID (Unique Slug)</label>
                <input name="id" placeholder="E.g. cute-red-bunny" value={form.id}
                  onChange={handleChange} required disabled={!!editingId} />
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input name="name" placeholder="E.g. Cute Red Bunny" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category (Type new or select below)</label>
                <input name="category" list="category-list" placeholder="E.g. Bunnies & Rabbits" value={form.category} onChange={handleChange} required />
                <datalist id="category-list">
                  {existingCategories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Price (Rs.)</label>
                <input name="price" type="number" step="0.01" placeholder="E.g. 450" value={form.price}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Product Image Files (Select one or more)</label>
                <input type="file" id="admin-image-file" accept="image/*" multiple onChange={handleFileChange} required={!editingId && (!form.images || form.images.length === 0)} />
                
                {imageFiles.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>Files to upload:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {imageFiles.map((file, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Upload Preview"
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--line)' }}
                          />
                          <button
                            type="button"
                            onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: -4, right: -4, background: 'crimson', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.images && form.images.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>Currently Saved Images (First is cover):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {form.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img
                            src={getImageUrl(img)}
                            alt="Saved Preview"
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--line)' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img)}
                            style={{ position: 'absolute', top: -4, right: -4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Description Details</label>
                <textarea name="description" placeholder="Describe materials, size, wraps..." rows="2" value={form.description}
                  onChange={handleChange} />
              </div>
              {error && <p style={{ color: 'crimson', fontSize: '0.85rem', fontWeight: 600 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: '8px' }}>
                <button className="btn" type="submit" style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}>{editingId ? 'Save Changes' : 'Add Companion'}</button>
                {editingId && <button type="button" className="btn btn-outline" onClick={resetForm} style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}>Cancel</button>}
              </div>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '18px' }}>Current Inventory</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={getImageUrl(p.image)} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'var(--pink-soft)' }} onError={(e) => e.target.style.opacity = 0.3} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Slug: {p.id} | Category: {p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>Rs. {p.price}</td>
                    <td>
                      <span className={`badge ${p.active ? 'badge-paid' : 'badge-created'}`}>
                        {p.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '4px' }} onClick={() => startEdit(p)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '4px', borderColor: 'crimson', color: 'crimson' }} onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Customer Transaction Orders</h3>
            <input
              className="admin-search-bar"
              placeholder="Search by Buyer Name, ID, Phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID / Date</th>
                <th>Customer / Contact</th>
                <th>Items Ordered</th>
                <th style={{ textAlign: 'center' }}>Total Paid</th>
                <th style={{ textAlign: 'center' }}>Status Badge</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const totalAmt = o.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
                return (
                  <tr key={o.orderId}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.orderId}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 4 }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.customer?.name || 'N/A'}</div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: 2 }}>📞 {o.customer?.phone || 'N/A'}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 2, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.customer?.address}>📍 {o.customer?.address || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {o.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                            • {item.name} <strong style={{ color: 'var(--pink-dark)' }}>x{item.qty}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>
                      Rs. {totalAmt.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${o.status}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={e => handleStatusChange(o.orderId, e.target.value)}
                      >
                        <option value="created">Created</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserOrders } from '../api';

export default function Profile() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userName = localStorage.getItem('bloombears_user_name') || 'Customer';
  const userEmail = localStorage.getItem('bloombears_user_email');
  const userToken = localStorage.getItem('bloombears_user_token');

  useEffect(() => {
    if (!userToken) {
      navigate('/login');
      return;
    }

    async function loadOrders() {
      try {
        const data = await fetchUserOrders();
        // Sort orders chronologically (newest first)
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      } catch (err) {
        setError(err.message || 'Could not load your order history.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [userToken, navigate]);

  function handleLogout() {
    localStorage.removeItem('bloombears_user_token');
    localStorage.removeItem('bloombears_user_name');
    localStorage.removeItem('bloombears_user_email');
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--pink-dark)' }}>Loading your dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Profile Header Card */}
      <div className="profile-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '24px 32px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--pink-dark)' }}>🌸 Hello, {userName}!</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '4px' }}>Logged in as: <strong>{userEmail}</strong></p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={handleLogout}
          style={{ padding: '8px 24px', fontSize: '0.9rem', borderRadius: '30px' }}
        >
          Log Out
        </button>
      </div>

      <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--pink-dark)', marginBottom: '20px' }}>Your Order History</h2>

      {error && <p style={{ color: 'crimson', fontWeight: 600, marginBottom: '20px' }}>{error}</p>}

      {orders.length === 0 ? (
        <div className="empty-orders-card" style={{ backgroundColor: '#fff', padding: '48px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧸</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No orders found</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '20px' }}>You haven't adopted any soft companions yet!</p>
          <Link className="btn" to="/catalog">Shop Plush toys</Link>
        </div>
      ) : (
        <div className="orders-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => {
            const totalAmt = order.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0;
            return (
              <div 
                key={order.orderId} 
                className="profile-order-card" 
                style={{ backgroundColor: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--line)', padding: '24px', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
              >
                {/* Order Meta Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>ORDER ID</div>
                    <div style={{ fontWeight: 700, color: 'var(--pink-dark)' }}>{order.orderId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>PLACED ON</div>
                    <div style={{ fontWeight: 600 }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>TOTAL VALUE</div>
                    <div style={{ fontWeight: 700, color: 'var(--pink-dark)' }}>Rs. {totalAmt.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className={`badge badge-${order.status}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '20px' }}>
                      {order.status ? order.status.toUpperCase() : 'CREATED'}
                    </span>
                  </div>
                </div>

                {/* Items and Details Split Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="order-details-grid">
                  {/* Items list */}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--pink-dark)', marginBottom: '12px', fontSize: '0.95rem' }}>Items Adopted</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx < order.items.length - 1 ? '1px dashed var(--line)' : 'none', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', backgroundColor: 'var(--pink-soft)', border: '1px solid var(--line)' }}
                              onError={(e) => e.target.style.opacity = 0.3}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.name}</div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Qty: {item.qty} × Rs. {item.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Rs. {(item.price * item.qty).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping/Contact details */}
                  <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: '24px' }} className="order-shipping-col">
                    <div style={{ fontWeight: 600, color: 'var(--pink-dark)', marginBottom: '12px', fontSize: '0.95rem' }}>Delivery Details</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-light)' }}>
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Recipient:</strong> {order.customer?.name}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Phone:</strong> {order.customer?.phone}
                      </div>
                      <div style={{ lineHeight: '1.4' }}>
                        <strong style={{ color: 'var(--text)' }}>Address:</strong><br />
                        <span style={{ fontSize: '0.85rem' }}>📍 {order.customer?.address}</span>
                      </div>
                      <div style={{ marginTop: '4px', padding: '8px 12px', backgroundColor: 'var(--pink-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--pink-dark)', fontWeight: 600, fontSize: '0.8rem', display: 'inline-block' }}>
                        ⚡ 60 min Jaipur Delivery
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

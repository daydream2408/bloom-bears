import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handlePay(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.address) {
      setError('Please fill name, phone, and address.');
      return;
    }
    setLoading(true);

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error('Razorpay SDK failed to load. Check your connection.');

      // Ask our backend to create an order (amount in paise)
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), items, customer: form })
      });
      if (!orderRes.ok) throw new Error('Could not create order. Try again.');
      const order = await orderRes.json();

      if (order.isMock) {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id: "pay_mock_" + Date.now(),
            razorpay_signature: "signature_mock",
            isMock: true,
            items,
            customer: form
          })
        });
        if (verifyRes.ok) {
          clearCart();
          navigate('/order-success');
        } else {
          setError('Mock checkout failed.');
        }
        return;
      }

      const options = {
        key: order.keyId, // public key from backend
        amount: order.amount,
        currency: order.currency,
        name: 'BloomBears',
        description: 'Plush toy order',
        order_id: order.id,
        handler: async function (response) {
          // Verify payment on backend
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, items, customer: form })
          });
          if (verifyRes.ok) {
            clearCart();
            navigate('/order-success');
          } else {
            setError('Payment verification failed. Contact support if amount was deducted.');
          }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#e8749e' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><h1>Your cart is empty.</h1></div>;
  }

  return (
    <div className="container">
      <div className="checkout-layout">
        <div className="checkout-card">
          <h3>Delivery Information</h3>
          <form className="checkout-form" onSubmit={handlePay}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" placeholder="E.g. Jane Doe" value={form.name} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Email Address (Optional)</label>
              <input name="email" type="email" placeholder="E.g. jane@example.com" value={form.email} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="E.g. +91 99999 88888" value={form.phone} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea name="address" placeholder="Enter complete home or office address in Jaipur" rows="3" value={form.address} onChange={handleChange} required />
            </div>

            {error && <p style={{ color: 'crimson', fontSize: '0.9rem', fontWeight: 600 }}>{error}</p>}
            
            <button className="btn" type="submit" disabled={loading} style={{ marginTop: '12px' }}>
              {loading ? 'Processing...' : `Pay & Confirm Order (Rs. ${total.toFixed(2)})`}
            </button>
          </form>
        </div>

        <div className="checkout-summary-sidebar">
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '16px' }}>Your Order</h3>
          
          <div className="checkout-items-list">
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <div className="checkout-item-details">
                  <img className="checkout-item-img" src={item.image} alt={item.name} />
                  <div>
                    <div className="checkout-item-name">{item.name}</div>
                    <div className="checkout-item-qty">Qty: {item.qty}</div>
                  </div>
                </div>
                <div className="checkout-item-price">Rs. {(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', color: 'var(--text-light)' }}>
            <span>Subtotal</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--line)', color: 'var(--text-light)' }}>
            <span>Shipping (60 min Jaipur)</span>
            <span style={{ color: '#2e7d32', fontWeight: 600 }}>FREE</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            <span>Total to Pay</span>
            <span style={{ color: 'var(--pink-dark)' }}>Rs. {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

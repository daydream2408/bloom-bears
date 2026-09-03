import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
        <h1 style={{ marginBottom: '12px' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>Add some adorable plush companions to bring home!</p>
        <Link className="btn" to="/catalog">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 style={{ marginBottom: '8px' }}>Your Shopping Bag</h1>
      <p style={{ color: 'var(--text-light)' }}>Review your items before proceeding to payment.</p>
      
      {/* Desktop Cart Table (Hidden on Mobile) */}
      <div className="cart-items-wrapper cart-desktop-view">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th style={{ textAlign: 'center' }}>Quantity</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="cart-product">
                    <img className="cart-product-img" src={getImageUrl(item.image)} alt={item.name} />
                    <div className="cart-product-info">
                      <h4>{item.name}</h4>
                      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>ID: {item.id}</p>
                    </div>
                  </div>
                </td>
                <td>Rs. {item.price.toFixed(2)}</td>
                <td>
                  <div className="qty-control" style={{ justifyContent: 'center', marginBottom: 0 }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>Rs. {(item.price * item.qty).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '4px' }}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cart Cards (Visible only on Mobile) */}
      <div className="cart-mobile-view">
        {items.map(item => (
          <div key={item.id} className="cart-mobile-card">
            <img className="cart-mobile-img" src={getImageUrl(item.image)} alt={item.name} />
            <div className="cart-mobile-content">
              <div className="cart-mobile-header">
                <div>
                  <h4 className="cart-mobile-title">{item.name}</h4>
                  <div className="cart-mobile-unit-price">Rs. {item.price.toFixed(2)} each</div>
                </div>
                <button
                  className="cart-mobile-remove-btn"
                  onClick={() => removeItem(item.id)}
                  title="Remove item"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>

              <div className="cart-mobile-footer">
                <div className="qty-control" style={{ marginBottom: 0 }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <div className="cart-mobile-total">
                  Rs. {(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary-card">
        <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '8px' }}>Order Summary</h3>
        <div className="cart-summary-line">
          <span>Subtotal</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
        <div className="cart-summary-line">
          <span>Delivery</span>
          <span style={{ color: '#2e7d32', fontWeight: 600 }}>FREE</span>
        </div>
        <div className="cart-summary-total">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px', textAlign: 'center' }}>
          🏍️ Delivering in Jaipur within 60 minutes.
        </p>
        <Link className="btn" to="/checkout" style={{ width: '100%', marginTop: '10px' }}>
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

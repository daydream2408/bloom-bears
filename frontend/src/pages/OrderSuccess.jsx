import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div className="container">
      <div className="order-success-page">
        <div className="success-icon-wrapper">
          <svg className="success-icon-svg" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for shopping with BloomBears. Your payment was verified successfully. Our delivery partner will reach your address in Jaipur within 60 minutes.</p>
        <Link className="btn" to="/catalog">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>🌸 BloomBears</h3>
            <p style={{ marginBottom: 12 }}>Ultra-soft, premium quality plush toys designed to bring joy and comfort into your life. Perfect gifts for your loved ones.</p>
            <p><strong>⚡ Delivery Promise:</strong> Within 60 min anywhere in Jaipur.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catalog">Shop Catalog</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Contact Info</h4>
            <ul>
              <li>📞 +91 73740 15643</li>
              <li>✉️ info@bloombears.com</li>
              <li>📍 Jaipur, Rajasthan</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BloomBears. All rights reserved. Made with love in Jaipur.</p>
        </div>
      </div>
    </footer>
  );
}

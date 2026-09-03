import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, getImageUrl } from '../api';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  // Show first 4 products as featured
  const featured = products.slice(0, 4);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      
      {/* 1. Hero Title Section (Screenshot 1) */}
      <section className="hero-text-section" style={{ padding: '80px 0 50px', textAlign: 'left' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-wine)',
          fontSize: '5.5rem',
          fontWeight: 400,
          margin: 0,
          lineHeight: 1.02,
          maxWidth: '850px',
          letterSpacing: '-0.02em'
        }}>
          Make every moment blossom
        </h1>
      </section>

      {/* 2. Landscape Banner Section (Screenshot 2) */}
      <section className="hero-banner-image-section" style={{ marginBottom: '80px' }}>
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          width: '100%',
          aspectRatio: '16/9',
          maxHeight: '520px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <img
            src="/extra-banner.png"
            alt="Plush Bear Companions Pedestal Display"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* 3. Featured Products Grid (Screenshot 3) */}
      <section className="featured-section" style={{ marginBottom: '80px' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-wine)',
          fontSize: '2.5rem',
          fontWeight: 400,
          margin: '0 0 32px 0'
        }}>
          Featured products
        </h2>
        
        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '30px'
        }}>
          {featured.map(p => (
            <div key={p.id} className="product-card-shopify">
              <div className="image-wrapper" style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                aspectRatio: '1/1',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Link to={`/product/${p.id}`}>
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="prod-img"
                    onError={(e) => e.target.style.opacity = 0.3}
                  />
                </Link>
                {/* Floating Quick Add Icon */}
                <button
                  onClick={() => addItem(p, 1)}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--white)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(94, 28, 62, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-wine)',
                    transition: 'all 0.2s ease'
                  }}
                  className="quick-add-btn"
                  title="Add to Cart"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </button>
              </div>
              
              <Link to={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                <h3 style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  color: 'var(--text-wine)',
                  margin: '0 0 4px 0',
                  textTransform: 'lowercase'
                }}>
                  {p.name}
                </h3>
                <div style={{
                  color: 'var(--text-wine)',
                  fontSize: '0.92rem',
                  fontWeight: 400
                }}>
                  Rs. {p.price.toFixed(2)}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Promotional Delivery Banner Section (Screenshot 4) */}
      <section className="promo-delivery-section" style={{
        backgroundColor: 'var(--bg-mauve)',
        borderRadius: '24px',
        padding: '50px 60px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '40px',
        alignItems: 'center',
        marginBottom: '40px',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'start' }}>
          <span style={{
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            color: 'var(--text-wine)',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            Bundles of joy
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-wine)',
            fontSize: '3.6rem',
            fontWeight: 400,
            lineHeight: 1.1,
            margin: 0,
            fontStyle: 'italic',
            letterSpacing: '-0.01em'
          }}>
            Delivered within 60 min anywhere in jaipur
          </h2>
          <Link to="/catalog" style={{
            border: '1.5px solid var(--text-wine)',
            color: 'var(--text-wine)',
            backgroundColor: 'transparent',
            padding: '12px 36px',
            borderRadius: '99px',
            fontSize: '0.95rem',
            fontWeight: 600,
            marginTop: '12px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }} className="promo-shop-btn">
            Shop now
          </Link>
        </div>
        <div style={{
          borderRadius: '20px',
          overflow: 'hidden',
          aspectRatio: '1.4/1',
          width: '100%',
          boxShadow: '0 8px 32px rgba(94, 28, 62, 0.1)'
        }}>
          <img
            src="/delivery-banner.png"
            alt="Signature Blue Gift Box Delivery"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

    </div>
  );
}

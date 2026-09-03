import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct, getImageUrl } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    fetchProduct(id).then(data => {
      setProduct(data);
      if (data) {
        setActiveImage(data.image);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    addItem(product, qty);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  }

  if (loading) return <div className="container" style={{ padding: '60px 0' }}><p>Loading companion details...</p></div>;

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <p>Product not found. <Link to="/catalog" style={{ color: 'var(--pink-dark)', fontWeight: 600 }}>Back to catalog</Link></p>
      </div>
    );
  }

  const imagesList = product.images || [product.image];

  return (
    <div className="container">
      <div style={{ marginTop: 24 }}>
        <Link to="/catalog" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>← Back to catalog</Link>
      </div>
      <div className="product-detail">
        <div className="product-image-gallery" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="product-image-container">
            <img src={getImageUrl(activeImage)} alt={product.name} onError={(e) => e.target.style.opacity = 0.3} style={{ transition: 'all 0.3s ease' }} />
          </div>
          {imagesList.length > 1 && (
            <div className="gallery-thumbnails" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {imagesList.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`${product.name} preview ${idx + 1}`}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: activeImage === img ? '2px solid var(--pink-dark)' : '1px solid var(--line)',
                    padding: '2px',
                    backgroundColor: '#fff',
                    transition: 'var(--transition)'
                  }}
                  onError={(e) => e.target.style.opacity = 0.3}
                />
              ))}
            </div>
          )}
        </div>
        <div className="info">
          <h1>{product.name}</h1>
          <div className="price">Rs. {product.price.toFixed(2)}</div>
          <p>{product.description}</p>
          
          <div style={{ marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>Quantity</div>
          <div className="qty-control">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn" onClick={handleAddToCart}>Add to cart</button>
            {addedMessage && (
              <span style={{ color: 'var(--pink-dark)', fontSize: '0.9rem', fontWeight: 600, animation: 'fadeIn 0.3s ease' }}>
                ✓ Added to cart successfully!
              </span>
            )}
          </div>

          <div style={{ marginTop: '36px', borderTop: '1px solid var(--line)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <span style={{ fontSize: '1.2rem' }}>🚚</span> <span>Jaipur: <strong>Free 60 Min Delivery</strong> on orders above Rs. 500</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <span style={{ fontSize: '1.2rem' }}>🎁</span> <span>Comes wrapped in our signature pink box with a printed note</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span> <span>Made from ultra-soft, kid-friendly hypoallergenic fabric</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

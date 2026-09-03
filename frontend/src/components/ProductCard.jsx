import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  return (
    <div className="card">
      <Link to={`/product/${product.id}`}>
        <img src={getImageUrl(product.image)} alt={product.name} onError={(e) => e.target.style.opacity = 0.3} />
      </Link>
      <div className="card-body">
        <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
        <div className="price">Rs. {product.price.toFixed(2)}</div>
        <button className="btn" onClick={() => addItem(product, 1)}>Add to cart</button>
      </div>
    </div>
  );
}

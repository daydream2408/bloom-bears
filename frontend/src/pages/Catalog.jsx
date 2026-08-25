import { useEffect, useState } from 'react';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    if (category === 'All') return true;
    return p.category === category;
  });

  return (
    <div className="container">
      <h1 style={{ marginTop: 40 }}>All Plush Companions</h1>
      <p style={{ color: 'var(--text-light)', marginTop: 8 }}>Browse our hand-crafted, softest friends.</p>
      
      <div className="filter-container">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p style={{ marginTop: 24 }}>Loading companions...</p>}
      {!loading && filtered.length === 0 && <p style={{ marginTop: 24 }}>No products found in this category.</p>}
      
      <div className="grid">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

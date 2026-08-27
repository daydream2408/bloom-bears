import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'bloombears_db.json');

// Helper to load data from JSON
function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    return { products: [], orders: [], users: [] };
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (err) {
    console.error('Error reading JSON DB file, returning empty structure:', err);
    return { products: [], orders: [], users: [] };
  }
}

// Helper to save data to JSON
function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving JSON DB file:', err);
  }
}

// Load data initially
const data = loadData();

// Migrate existing products to have a category and images list if they don't already
data.products.forEach(p => {
  if (!p.category) {
    const isBunny = p.name.toLowerCase().includes('bunny') || p.name.toLowerCase().includes('rabbit');
    p.category = isBunny ? 'Bunnies & Rabbits' : 'Plush Friends';
  }
  if (!p.images || !Array.isArray(p.images)) {
    p.images = p.image ? [p.image] : [];
  }
});
saveData(data);

// Seed database with initial products if none exist
if (data.products.length === 0) {
  const initial = [
    { id: 'cute-bunny', name: 'Cute Bunny', price: 450, image: '/products/cute-bunny.png', images: ['/products/cute-bunny.png'], description: 'Ultra-soft bunny plush, perfect gift companion.', category: 'Bunnies & Rabbits', active: 1 },
    { id: 'cute-star', name: 'Cute Star', price: 300, image: '/products/cute-star.png', images: ['/products/cute-star.png'], description: 'A cheerful star-shaped plush toy.', category: 'Plush Friends', active: 1 },
    { id: 'cute-rabbit-1', name: 'Cute Rabbit', price: 500, image: '/products/cute-rabbit-1.png', images: ['/products/cute-rabbit-1.png'], description: 'Premium rabbit plush with soft fur.', category: 'Bunnies & Rabbits', active: 1 },
    { id: 'cute-rabbit', name: 'Cute Red Rabbit', price: 300, image: '/products/cute-rabbit.png', images: ['/products/cute-rabbit.png'], description: 'A vibrant red rabbit plush.', category: 'Bunnies & Rabbits', active: 1 },
    { id: 'cute-avacado', name: 'Cute Avocado', price: 500, image: '/products/cute-avacado.png', images: ['/products/cute-avacado.png'], description: 'Fun avocado-shaped plush toy.', category: 'Plush Friends', active: 1 },
    { id: 'cute-banana-with-a-baby', name: 'Cute Banana with a Baby', price: 550, image: '/products/cute-banana.png', images: ['/products/cute-banana.png'], description: 'A playful banana plush with a tiny companion.', category: 'Plush Friends', active: 1 },
    { id: 'cute-elephant', name: 'Cute Elephant', price: 350, image: '/products/cute-elephant.png', images: ['/products/cute-elephant.png'], description: 'Adorable elephant plush, soft and huggable.', category: 'Plush Friends', active: 1 }
  ];
  data.products = initial;
  saveData(data);
}

// Expose orders reference and saveOrders function
export const orders = data.orders;
export function saveOrders() {
  saveData(data);
}

// Expose users reference and saveUsers function
export const users = data.users;
export function saveUsers() {
  saveData(data);
}

// Statement class mimicking better-sqlite3 Statement
class Statement {
  constructor(sql) {
    this.sql = sql.trim().replace(/\s+/g, ' ');
  }

  get(...args) {
    // 1. SELECT COUNT(*) as c FROM products
    if (this.sql.toUpperCase().includes('SELECT COUNT(*)')) {
      return { c: data.products.length };
    }
    // 2. SELECT * FROM products WHERE id = ?
    if (this.sql.toUpperCase().includes('SELECT * FROM PRODUCTS WHERE ID = ?') || this.sql.includes('id = ?')) {
      const id = args[0];
      return data.products.find(p => p.id === id);
    }
    return undefined;
  }

  all(...args) {
    // 1. SELECT * FROM products WHERE active = 1
    if (this.sql.toUpperCase().includes('WHERE ACTIVE = 1')) {
      return data.products.filter(p => p.active === 1);
    }
    // 2. SELECT * FROM products
    if (this.sql.toUpperCase().includes('SELECT * FROM PRODUCTS')) {
      return data.products;
    }
    return [];
  }

  run(...args) {
    // 1. INSERT INTO products
    if (this.sql.toUpperCase().startsWith('INSERT INTO PRODUCTS')) {
      const [id, name, price, image, imagesJSON, description, category] = args;
      if (data.products.some(p => p.id === id)) {
        throw new Error('Product id already exists');
      }
      let parsedImages = [];
      try {
        parsedImages = imagesJSON ? JSON.parse(imagesJSON) : [];
      } catch {
        parsedImages = [image];
      }
      data.products.push({
        id,
        name,
        price,
        image: image || '',
        images: Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : [image],
        description: description || '',
        category: category || 'Plush Friends',
        active: 1
      });
      saveData(data);
      return { changes: 1 };
    }

    // 2. UPDATE products
    if (this.sql.toUpperCase().startsWith('UPDATE PRODUCTS')) {
      let name, price, image, imagesJSON, description, category, active, id;
      if (args.length === 8) {
        [name, price, image, imagesJSON, description, category, active, id] = args;
      } else if (args.length === 7) {
        [name, price, image, description, category, active, id] = args;
      } else {
        [name, price, image, description, active, id] = args;
      }
      const index = data.products.findIndex(p => p.id === id);
      if (index !== -1) {
        let parsedImages = data.products[index].images || [data.products[index].image];
        if (imagesJSON) {
          try {
            parsedImages = JSON.parse(imagesJSON);
          } catch {}
        }
        data.products[index] = {
          id,
          name: name ?? data.products[index].name,
          price: price ?? data.products[index].price,
          image: image ?? data.products[index].image,
          images: Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : [image ?? data.products[index].image],
          description: description ?? data.products[index].description,
          category: category ?? data.products[index].category ?? 'Plush Friends',
          active: active === undefined ? data.products[index].active : (active ? 1 : 0)
        };
        saveData(data);
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    // 3. DELETE FROM products WHERE id = ?
    if (this.sql.toUpperCase().startsWith('DELETE FROM PRODUCTS')) {
      const id = args[0];
      const lengthBefore = data.products.length;
      data.products = data.products.filter(p => p.id !== id);
      if (data.products.length !== lengthBefore) {
        saveData(data);
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    return { changes: 0 };
  }
}

// Mock Database object mimicking better-sqlite3
const db = {
  exec(sql) {
    // Executing table creation - no-op for JSON DB
    return this;
  },
  prepare(sql) {
    return new Statement(sql);
  },
  transaction(fn) {
    // Synchronous execution is a transaction in our synchronous JS DB
    return function (...args) {
      return fn(...args);
    };
  }
};

export default db;

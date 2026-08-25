import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import db, { orders, saveOrders } from './db.js';
import { login, requireAdmin } from './auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));

app.post('/api/admin/upload', requireAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const urls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ urls });
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// orders array is now loaded and exported from db.js

/* ---------- Public product routes ---------- */

app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE active = 1').all();
  res.json(rows);
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

/* ---------- Admin auth ---------- */

app.post('/api/admin/login', login);

/* ---------- Admin product CRUD (protected) ---------- */

app.get('/api/admin/products', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM products').all());
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { id, name, price, image, images, description, category } = req.body;
  if (!id || !name || !price) return res.status(400).json({ error: 'id, name, price required' });
  try {
    const imagesJSON = Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : JSON.stringify([image || '']);
    db.prepare(
      'INSERT INTO products (id, name, price, image, images, description, category, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
    ).run(id, name, price, image || '', imagesJSON, description || '', category || 'Plush Friends');
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: 'Product id already exists' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { name, price, image, images, description, category, active } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const imagesJSON = Array.isArray(images) ? JSON.stringify(images) : undefined;
  db.prepare(
    'UPDATE products SET name = ?, price = ?, image = ?, images = ?, description = ?, category = ?, active = ? WHERE id = ?'
  ).run(
    name ?? existing.name,
    price ?? existing.price,
    image ?? existing.image,
    imagesJSON,
    description ?? existing.description,
    category ?? existing.category,
    active === undefined ? existing.active : (active ? 1 : 0),
    req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- Admin orders view (protected) ---------- */

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  res.json(orders);
});

app.put('/api/admin/orders/:orderId', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  saveOrders();
  res.json({ ok: true });
});

/* ---------- Payment routes ---------- */

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, items, customer } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const isMock = !process.env.RAZORPAY_KEY_ID || 
                   process.env.RAZORPAY_KEY_ID === 'your_key_id_here' || 
                   process.env.RAZORPAY_KEY_ID.trim() === '';

    if (isMock) {
      const mockId = `mock_order_${Date.now()}`;
      orders.push({ orderId: mockId, items, customer, status: 'created', createdAt: new Date().toISOString() });
      saveOrders();
      return res.json({
        id: mockId,
        amount,
        currency: 'INR',
        keyId: 'mock',
        isMock: true
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });

    orders.push({ orderId: order.id, items, customer, status: 'created', createdAt: new Date().toISOString() });
    saveOrders();

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

  const isKeysPlaceholder = !process.env.RAZORPAY_KEY_ID || 
                            process.env.RAZORPAY_KEY_ID === 'your_key_id_here' || 
                            process.env.RAZORPAY_KEY_ID.trim() === '';

  if (isMock || isKeysPlaceholder || (razorpay_order_id && razorpay_order_id.startsWith('mock_order_'))) {
    const order = orders.find(o => o.orderId === razorpay_order_id);
    if (order) {
      order.status = 'paid';
      order.paymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
      saveOrders();
    }
    return res.json({ ok: true });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const order = orders.find(o => o.orderId === razorpay_order_id);
  if (order) {
    order.status = 'paid';
    order.paymentId = razorpay_payment_id;
    saveOrders();
  }

  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BloomBears backend running on port ${PORT}`));

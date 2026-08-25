# BloomBears — Custom Storefront

React frontend + Node/Express backend. Replaces Shopify store.

## Structure
```
bloombears/
  frontend/   React (Vite) storefront
  backend/    Express API — Razorpay order create + payment verify
```

## Setup

### 1. Backend
```
cd backend
npm install
cp .env.example .env
# fill in RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET from razorpay.com dashboard
npm run dev
```
Runs on http://localhost:4000

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173, proxies /api/* to backend.

### 3. Product images
Drop images in `frontend/public/products/` matching filenames in `src/data/products.js`
(e.g. cute-bunny.png). Currently placeholders — swap with real photos.

## Admin panel
Go to `/admin` on the frontend, log in with `ADMIN_PASSWORD` (set in backend `.env`).
From `/admin/dashboard` you can add, edit, hide, and delete products — changes show up
live on the storefront (products now come from a SQLite DB, not a static file).
Orders tab shows orders captured via checkout.

Auth: simple password + JWT (12h expiry), stored in `localStorage`. Fine for one-person
admin use; swap for proper multi-user auth if you ever add staff logins.

## Adding new features
- New page: add a file in `frontend/src/pages/`, register route in `App.jsx`.
- New API endpoint: add a route in `backend/server.js` (use `requireAdmin` middleware
  from `auth.js` if it should be admin-only).
- New product field (e.g. category, stock count): add column via `backend/db.js`
  (ALTER TABLE or just delete `bloombears.db` to re-seed during dev), then include it
  in the admin form + CRUD routes.
- Database: currently SQLite (`backend/bloombears.db`, file-based, zero setup). Fine
  up to moderate traffic; migrate to Postgres later if needed.

## What's real vs stub
- Cart: fully working, persists to localStorage.
- Checkout form: fully working.
- Payment: real Razorpay Checkout.js integration — order creation + signature
  verification on backend. Needs your live Razorpay keys to actually charge cards.
- Products: real, stored in SQLite, fully manageable via admin panel.
- Order storage: still in-memory array in server.js — swap for a real DB table
  before going live, or orders vanish on server restart.
- No email/SMS confirmation yet — TODO marked in server.js.

## Deploy
- Frontend: Vercel/Netlify (static build via `npm run build` → `dist/`)
- Backend: Render/Railway/a VPS — needs to stay running (holds Razorpay secret key)
- Point frontend's /api proxy (or fetch base URL) at deployed backend URL.

## Next steps
- Swap placeholder product images for real photos
- Add real contact info to Contact.jsx
- Add admin panel or Google Sheet sync for order management
- Add order confirmation email (e.g. via Resend/Nodemailer)
- Move orders array to real database

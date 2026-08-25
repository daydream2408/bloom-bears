import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET || 'change_this_secret_before_deploying';

export function login(req, res) {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  const token = jwt.sign({ admin: true }, SECRET, { expiresIn: '12h' });
  res.json({ token });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const q = {
  userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  insertUser: db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'),
  hasAdmin: db.prepare("SELECT 1 FROM users WHERE role = 'admin'"),
  touchLogin: db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?"),
  insertSession: db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
  ),
  revokeSession: db.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?'),
  logAttempt: db.prepare(
    'INSERT INTO login_history (user_id, email, success, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
  ),
  history: db.prepare(
    'SELECT success, ip_address, user_agent, created_at FROM login_history WHERE user_id = ? ORDER BY id DESC LIMIT 10'
  ),
};

function issueSession(user, req) {
  const jti = crypto.randomUUID();
  const expires = new Date(Date.now() + config.jwtExpiresHours * 3600 * 1000);
  q.insertSession.run(
    jti,
    user.id,
    expires.toISOString().slice(0, 19).replace('T', ' '),
    req.ip,
    String(req.headers['user-agent'] || '').slice(0, 255)
  );
  const token = jwt.sign({ sub: user.id, jti }, config.jwtSecret, {
    expiresIn: `${config.jwtExpiresHours}h`,
  });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

router.post('/register', authLimiter, (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (q.userByEmail.get(email)) return res.status(409).json({ error: 'An account with this email already exists' });

  const hash = bcrypt.hashSync(password, 10);
  // The first account (or ADMIN_EMAIL) becomes admin and can open the Database page.
  const role = !q.hasAdmin.get() || email === config.adminEmail ? 'admin' : 'analyst';
  const { lastInsertRowid } = q.insertUser.run(name, email, hash, role);
  const user = { id: Number(lastInsertRowid), name, email, role };
  q.touchLogin.run(user.id);
  q.logAttempt.run(user.id, email, 1, req.ip, String(req.headers['user-agent'] || '').slice(0, 255));
  res.status(201).json(issueSession(user, req));
});

router.post('/login', authLimiter, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const ua = String(req.headers['user-agent'] || '').slice(0, 255);
  const user = q.userByEmail.get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    q.logAttempt.run(user?.id ?? null, email || '(blank)', 0, req.ip, ua);
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  q.touchLogin.run(user.id);
  q.logAttempt.run(user.id, email, 1, req.ip, ua);
  res.json(issueSession(user, req));
});

router.post('/logout', requireAuth, (req, res) => {
  q.revokeSession.run(req.sessionId);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user, loginHistory: q.history.all(req.user.id) });
});

export default router;

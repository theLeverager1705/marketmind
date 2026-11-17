import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { config } from '../config.js';

const findSession = db.prepare(
  `SELECT s.id, s.revoked, s.expires_at, u.id AS user_id, u.name, u.email, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = ?`
);

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not signed in' });

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' });
  }

  const session = findSession.get(payload.jti);
  if (!session || session.revoked || new Date(session.expires_at + 'Z') < new Date()) {
    return res.status(401).json({ error: 'Session is no longer valid' });
  }

  req.user = { id: session.user_id, name: session.name, email: session.email, role: session.role };
  req.sessionId = session.id;
  next();
}

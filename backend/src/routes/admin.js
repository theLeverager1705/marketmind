import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

// Read-only database explorer for admins. Shows every table, its schema and its latest rows.
const router = Router();

const TABLES = ['users', 'sessions', 'login_history', 'analyses', 'agent_runs'];
const ROW_LIMIT = 50;
const MAX_TEXT = 140;

// Shorten long values (hashes, JSON) so the table stays readable; secrets are never shown in full.
function present(table, row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (value == null) { out[key] = null; continue; }
    if (key === 'password_hash') { out[key] = `${String(value).slice(0, 29)}…`; continue; }
    if (table === 'sessions' && key === 'id') { out[key] = `${String(value).slice(0, 8)}…`; continue; }
    const text = typeof value === 'bigint' ? Number(value) : value;
    out[key] = typeof text === 'string' && text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text;
  }
  return out;
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
}

router.get('/database', requireAuth, requireAdmin, (_req, res) => {
  const tables = TABLES.map((name) => {
    const { sql } = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
    const columns = db.prepare(`PRAGMA table_info(${name})`).all().map((c) => ({
      name: c.name, type: c.type, pk: Boolean(c.pk), notNull: Boolean(c.notnull),
    }));
    const count = Number(db.prepare(`SELECT COUNT(*) AS n FROM ${name}`).get().n);
    const order = name === 'sessions' ? 'created_at DESC' : 'id DESC';
    const rows = db.prepare(`SELECT * FROM ${name} ORDER BY ${order} LIMIT ${ROW_LIMIT}`).all().map((r) => present(name, r));
    return { name, sql, columns, count, rows };
  });
  res.json({ engine: 'SQLite (node:sqlite)', rowLimit: ROW_LIMIT, tables });
});

export default router;

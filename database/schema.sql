-- MarketMind database schema (SQLite)
-- Applied automatically by backend/src/db.js on server start.

PRAGMA foreign_keys = ON;

-- Registered users. Passwords are never stored in plain text: bcrypt hash only.
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'analyst',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- Active login sessions. Each JWT carries a session id (jti); logout revokes it.
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT    NOT NULL,
  revoked     INTEGER NOT NULL DEFAULT 0,
  ip_address  TEXT,
  user_agent  TEXT
);

-- Audit trail of every login attempt (success and failure).
CREATE TABLE IF NOT EXISTS login_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email       TEXT    NOT NULL,
  success     INTEGER NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- One row per research request.
CREATE TABLE IF NOT EXISTS analyses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic        TEXT    NOT NULL,
  industry     TEXT,
  region       TEXT,
  objective    TEXT,
  status       TEXT    NOT NULL DEFAULT 'queued',  -- queued | running | completed | failed
  mode         TEXT    NOT NULL DEFAULT 'ai',      -- ai | demo
  report_json  TEXT,                               -- final synthesized report
  error        TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Output of every individual agent for an analysis.
CREATE TABLE IF NOT EXISTS agent_runs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id  INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  agent_key    TEXT    NOT NULL,
  agent_name   TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'pending', -- pending | running | completed | failed
  output_json  TEXT,
  duration_ms  INTEGER,
  started_at   TEXT,
  finished_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_analysis ON agent_runs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

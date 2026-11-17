import { Router } from 'express';
import { db } from '../db.js';
import { aiEnabled } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { createAgentRuns, runAnalysis } from '../agents/orchestrator.js';
import { ALL_AGENTS } from '../agents/definitions.js';

const router = Router();
router.use(requireAuth);

const q = {
  insert: db.prepare('INSERT INTO analyses (user_id, topic, industry, region, objective, mode) VALUES (?, ?, ?, ?, ?, ?)'),
  list: db.prepare('SELECT id, topic, industry, region, status, mode, created_at, completed_at, report_json FROM analyses WHERE user_id = ? ORDER BY id DESC'),
  get: db.prepare('SELECT * FROM analyses WHERE id = ? AND user_id = ?'),
  runs: db.prepare('SELECT agent_key, agent_name, status, output_json, duration_ms, started_at, finished_at FROM agent_runs WHERE analysis_id = ? ORDER BY id'),
  del: db.prepare('DELETE FROM analyses WHERE id = ? AND user_id = ?'),
  stats: db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(status = 'completed'), 0) AS completed, COALESCE(SUM(status IN ('queued','running')), 0) AS running FROM analyses WHERE user_id = ?"),
};

const agentMeta = Object.fromEntries(ALL_AGENTS.map((a) => [a.key, { icon: a.icon, role: a.role }]));
const parse = (s) => (s ? JSON.parse(s) : null);

router.get('/agents', (_req, res) => {
  res.json({
    mode: aiEnabled() ? 'ai' : 'demo',
    agents: ALL_AGENTS.map(({ key, name, icon, role }) => ({ key, name, icon, role })),
  });
});

router.get('/', (req, res) => {
  const rows = q.list.all(req.user.id).map(({ report_json, ...r }) => ({
    ...r,
    overallScore: parse(report_json)?.overallScore ?? null,
  }));
  res.json({ analyses: rows, stats: q.stats.get(req.user.id) });
});

router.post('/', (req, res) => {
  const topic = String(req.body?.topic || '').trim();
  if (topic.length < 3) return res.status(400).json({ error: 'Please describe what you want to research' });
  const input = {
    topic: topic.slice(0, 200),
    industry: String(req.body?.industry || '').trim().slice(0, 100),
    region: String(req.body?.region || 'Global').trim().slice(0, 100) || 'Global',
    objective: String(req.body?.objective || '').trim().slice(0, 500),
  };
  const mode = aiEnabled() ? 'ai' : 'demo';
  const { lastInsertRowid } = q.insert.run(req.user.id, input.topic, input.industry, input.region, input.objective, mode);
  const id = Number(lastInsertRowid);
  createAgentRuns(id);
  runAnalysis(id, input); // runs in the background; the client polls for progress
  res.status(202).json({ id });
});

router.get('/:id', (req, res) => {
  const a = q.get.get(Number(req.params.id), req.user.id);
  if (!a) return res.status(404).json({ error: 'Analysis not found' });
  const { report_json, ...rest } = a;
  res.json({
    analysis: { ...rest, report: parse(report_json) },
    agents: q.runs.all(a.id).map(({ output_json, ...r }) => ({ ...r, ...agentMeta[r.agent_key], output: parse(output_json) })),
  });
});

router.delete('/:id', (req, res) => {
  const { changes } = q.del.run(Number(req.params.id), req.user.id);
  if (!changes) return res.status(404).json({ error: 'Analysis not found' });
  res.json({ ok: true });
});

export default router;

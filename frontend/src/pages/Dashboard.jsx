import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../components/AuthContext.jsx';

const EXAMPLES = [
  { topic: 'Electric two-wheelers', industry: 'Automotive / Mobility', region: 'India' },
  { topic: 'Plant-based protein snacks', industry: 'Food & Beverage', region: 'North America' },
  { topic: 'AI tutoring apps for students', industry: 'EdTech', region: 'Global' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState({ analyses: [], stats: {} });
  const [mode, setMode] = useState('');
  const [form, setForm] = useState({ topic: '', industry: '', region: 'Global', objective: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/analyses').then(setData).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    api('/analyses/agents').then((d) => setMode(d.mode)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { id } = await api('/analyses', { method: 'POST', body: form });
      nav(`/analysis/${id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this analysis?')) return;
    await api(`/analyses/${id}`, { method: 'DELETE' });
    load();
  }

  const s = data.stats || {};

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">Launch a new multi-agent research run or open a past report.</p>
        </div>
        {mode && (
          <span className={`pill ${mode === 'ai' ? 'ok' : 'warn'}`}>
            {mode === 'ai' ? '● Live AI mode (Claude)' : '● Demo mode (no API key)'}
          </span>
        )}
      </div>

      <div className="grid stats">
        <div className="card stat"><span>Total analyses</span><strong>{s.total ?? 0}</strong></div>
        <div className="card stat"><span>Completed</span><strong>{s.completed ?? 0}</strong></div>
        <div className="card stat"><span>Running</span><strong>{s.running ?? 0}</strong></div>
        <div className="card stat"><span>AI agents</span><strong>5</strong></div>
      </div>

      <div className="grid two">
        <form className="card" onSubmit={submit}>
          <h2>New research</h2>
          <label>
            What do you want to research?
            <input value={form.topic} onChange={set('topic')} placeholder="e.g. Electric two-wheelers" required minLength={3} />
          </label>
          <div className="grid two tight">
            <label>
              Industry
              <input value={form.industry} onChange={set('industry')} placeholder="e.g. Mobility" />
            </label>
            <label>
              Region
              <input value={form.region} onChange={set('region')} placeholder="e.g. India" />
            </label>
          </div>
          <label>
            Business objective (optional)
            <textarea rows={3} value={form.objective} onChange={set('objective')} placeholder="e.g. Should we launch a budget model next year?" />
          </label>
          <div className="examples">
            <span className="muted">Try:</span>
            {EXAMPLES.map((ex) => (
              <button type="button" className="chip" key={ex.topic} onClick={() => setForm({ ...form, ...ex })}>
                {ex.topic}
              </button>
            ))}
          </div>
          {error && <div className="alert">{error}</div>}
          <button className="btn full" disabled={busy}>{busy ? 'Starting agents…' : 'Run multi-agent analysis'}</button>
        </form>

        <div className="card">
          <h2>Your research history</h2>
          {data.analyses.length === 0 ? (
            <p className="muted">No analyses yet. Run your first one on the left.</p>
          ) : (
            <ul className="history">
              {data.analyses.map((a) => (
                <li key={a.id}>
                  <Link to={`/analysis/${a.id}`} className="history-main">
                    <strong>{a.topic}</strong>
                    <span className="muted small">
                      {[a.industry, a.region].filter(Boolean).join(' · ')} · {new Date(a.created_at + 'Z').toLocaleString()}
                    </span>
                  </Link>
                  <div className="row gap-sm">
                    {a.overallScore != null && <span className="score-badge">{a.overallScore}</span>}
                    <span className={`status ${a.status}`}>{a.status}</span>
                    <button className="icon-btn" title="Delete" onClick={() => remove(a.id)}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

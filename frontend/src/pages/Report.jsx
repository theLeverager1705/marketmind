import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';

const COLORS = ['#6366f1', '#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#f43f5e'];

function AgentTimeline({ agents }) {
  return (
    <div className="timeline">
      {agents.map((a) => (
        <div key={a.agent_key} className={`agent-step ${a.status}`}>
          <div className="agent-icon sm">{a.icon}</div>
          <div className="grow">
            <strong>{a.agent_name}</strong>
            <div className="muted small">{a.role}</div>
          </div>
          <div className="right">
            <span className={`status ${a.status}`}>
              {a.status === 'running' && <span className="spinner" />}
              {a.status}
            </span>
            {a.duration_ms != null && <div className="muted small">{(a.duration_ms / 1000).toFixed(1)}s</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

const List = ({ items }) => <ul className="bullets">{(items || []).map((x, i) => <li key={i}>{x}</li>)}</ul>;

function ScoreRing({ value }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="ring">
      <circle cx="70" cy="70" r={r} stroke="var(--border)" strokeWidth="12" fill="none" />
      <circle cx="70" cy="70" r={r} stroke={color} strokeWidth="12" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 70 70)" />
      <text x="70" y="68" textAnchor="middle" fontSize="32" fontWeight="800" fill="var(--text)">{value}</text>
      <text x="70" y="90" textAnchor="middle" fontSize="12" fill="var(--muted)">/ 100</text>
    </svg>
  );
}

function FinalReport({ report }) {
  const { findings = {} } = report;
  const { market = {}, competitor = {}, consumer = {}, risk = {} } = findings;

  return (
    <>
      <div className="card hero-report">
        <ScoreRing value={Math.round(report.overallScore)} />
        <div className="grow">
          <span className="muted small upper">Opportunity verdict · {report.confidence} confidence</span>
          <h2>{report.verdict}</h2>
          <p>{report.executiveSummary}</p>
        </div>
      </div>

      <div className="grid stats">
        <div className="card stat"><span>Market size</span><strong className="md">{market.marketSize}</strong></div>
        <div className="card stat"><span>Growth</span><strong className="md">{market.growthRate}</strong></div>
        <div className="card stat"><span>Customer sentiment</span><strong className="md">{consumer.sentimentScore > 0 ? '+' : ''}{consumer.sentimentScore}</strong></div>
        <div className="card stat"><span>Risk score</span><strong className="md">{risk.riskScore}/10</strong></div>
      </div>

      <div className="card">
        <h2>SWOT analysis</h2>
        <div className="swot">
          {[['Strengths', 'strengths', 's'], ['Weaknesses', 'weaknesses', 'w'], ['Opportunities', 'opportunities', 'o'], ['Threats', 'threats', 't']].map(([label, key, cls]) => (
            <div className={`swot-box ${cls}`} key={key}>
              <h3>{label}</h3>
              <List items={report.swot?.[key]} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Recommendations</h2>
        <div className="recs">
          {(report.recommendations || []).map((r, i) => (
            <div className="rec" key={i}>
              <span className={`prio ${r.priority?.toLowerCase()}`}>{r.priority}</span>
              <div>
                <strong>{r.title}</strong>
                <p className="muted">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>📊 Market segments</h2>
          <p className="muted">{market.summary}</p>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={market.segments || []} dataKey="share" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {(market.segments || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {(market.segments || []).map((s, i) => (
              <span key={s.name}><i style={{ background: COLORS[i % COLORS.length] }} />{s.name} ({s.share}%)</span>
            ))}
          </div>
          <h3>Key trends</h3>
          <List items={market.keyTrends} />
        </div>

        <div className="card">
          <h2>🏁 Competitive landscape</h2>
          <p className="muted">{competitor.summary} Intensity: <strong>{competitor.competitiveIntensity}/10</strong></p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={competitor.competitors || []} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" unit="%" stroke="var(--muted)" fontSize={12} />
              <YAxis type="category" dataKey="name" width={130} stroke="var(--muted)" fontSize={12} />
              <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: 'rgba(99,102,241,.08)' }} />
              <Bar dataKey="marketShare" name="Market share" radius={[0, 6, 6, 0]}>
                {(competitor.competitors || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <h3>White space</h3>
          <List items={competitor.whiteSpace} />
        </div>
      </div>

      <div className="card">
        <h2>Competitor profiles</h2>
        <table className="table">
          <thead><tr><th>Competitor</th><th>Positioning</th><th>Strength</th><th>Weakness</th></tr></thead>
          <tbody>
            {(competitor.competitors || []).map((c) => (
              <tr key={c.name}><td><strong>{c.name}</strong></td><td>{c.positioning}</td><td>{c.strength}</td><td>{c.weakness}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>💬 Consumer insights</h2>
          <p className="muted">{consumer.summary}</p>
          <h3>Purchase drivers</h3>
          <List items={consumer.purchaseDrivers} />
          <h3>Pain points</h3>
          <List items={consumer.painPoints} />
          <h3>Personas</h3>
          {(consumer.personas || []).map((p) => (
            <div className="persona" key={p.name}><strong>{p.name}</strong><span className="muted">{p.description}</span></div>
          ))}
        </div>
        <div className="card">
          <h2>⚖️ Financial & risk</h2>
          <p className="muted">{risk.summary} Outlook: <strong>{risk.outlook}</strong></p>
          <table className="table">
            <thead><tr><th>Risk</th><th>Severity</th><th>Mitigation</th></tr></thead>
            <tbody>
              {(risk.risks || []).map((r) => (
                <tr key={r.risk}><td>{r.risk}</td><td><span className={`prio ${r.severity?.toLowerCase()}`}>{r.severity}</span></td><td>{r.mitigation}</td></tr>
              ))}
            </tbody>
          </table>
          <h3>Opportunities</h3>
          <List items={risk.opportunities} />
        </div>
      </div>
    </>
  );
}

export default function Report() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    let stopped = false;
    const poll = async () => {
      try {
        const d = await api(`/analyses/${id}`);
        if (stopped) return;
        setData(d);
        if (['queued', 'running'].includes(d.analysis.status)) timer = setTimeout(poll, 1200);
      } catch (e) {
        setError(e.message);
      }
    };
    poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [id]);

  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!data) return <div className="center muted">Loading…</div>;

  const { analysis, agents } = data;
  const done = agents.filter((a) => a.status === 'completed').length;

  return (
    <div className="page">
      <Link to="/dashboard" className="muted small">← Back to dashboard</Link>
      <div className="page-head">
        <div>
          <h1>{analysis.topic}</h1>
          <p className="muted">
            {[analysis.industry, analysis.region].filter(Boolean).join(' · ')}
            {analysis.objective && <> · {analysis.objective}</>}
          </p>
        </div>
        <span className={`pill ${analysis.mode === 'ai' ? 'ok' : 'warn'}`}>{analysis.mode === 'ai' ? 'Claude AI' : 'Demo mode'}</span>
      </div>

      <div className="card">
        <div className="row between">
          <h2>Agent pipeline</h2>
          <span className="muted small">{done} / {agents.length} agents finished</span>
        </div>
        <div className="progress"><div style={{ width: `${(done / agents.length) * 100}%` }} /></div>
        <AgentTimeline agents={agents} />
      </div>

      {analysis.status === 'failed' && <div className="alert">The analysis failed: {analysis.error}</div>}
      {analysis.status === 'completed' && analysis.report && <FinalReport report={analysis.report} />}
    </div>
  );
}

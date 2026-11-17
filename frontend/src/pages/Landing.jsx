import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

const AGENTS = [
  ['📊', 'Market Research Agent', 'Market size, growth rate, trends and customer segments.'],
  ['🏁', 'Competitor Intelligence Agent', 'Key players, positioning, strengths, weaknesses and white space.'],
  ['💬', 'Consumer Sentiment Agent', 'Customer sentiment, purchase drivers, pain points and personas.'],
  ['⚖️', 'Financial & Risk Agent', 'Financial outlook, risk register with mitigations, opportunities.'],
  ['🧠', 'Strategy Synthesizer Agent', 'Combines every finding into a SWOT, score and recommendations.'],
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <section className="hero">
        <span className="pill">AI-powered · Multi-agent · Research in minutes</span>
        <h1>
          A team of AI analysts for <span className="grad">market research</span>
        </h1>
        <p className="lead">
          MarketMind splits every research question across five specialised AI agents that work in parallel,
          then combines their findings into one clear, decision-ready report.
        </p>
        <div className="row gap">
          <Link to={user ? '/dashboard' : '/register'} className="btn lg">
            {user ? 'Go to dashboard' : 'Start researching free'}
          </Link>
          {!user && <Link to="/login" className="btn ghost lg">Sign in</Link>}
        </div>
      </section>

      <section className="flow">
        <div className="flow-step">You ask a question</div>
        <div className="flow-arrow">→</div>
        <div className="flow-step multi">4 specialist agents research in parallel</div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">Synthesizer agent writes the report</div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">Saved to your dashboard</div>
      </section>

      <section>
        <h2 className="section-title">Meet the agents</h2>
        <div className="grid agents-grid">
          {AGENTS.map(([icon, name, desc]) => (
            <div className="card agent-card" key={name}>
              <div className="agent-icon">{icon}</div>
              <h3>{name}</h3>
              <p className="muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

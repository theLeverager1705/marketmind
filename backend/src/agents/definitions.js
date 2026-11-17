// The specialist agents in the MarketMind multi-agent system.
// Each agent has one job, its own system prompt, and a JSON schema for its output.

const str = { type: 'string' };
const num = { type: 'number' };
const strList = { type: 'array', items: str };
const obj = (properties) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const SPECIALISTS = [
  {
    key: 'market',
    name: 'Market Research Agent',
    icon: '📊',
    role: 'Sizes the market, measures growth and identifies trends and segments.',
    system:
      'You are a senior market research analyst. Estimate market size, growth, key trends and customer segments for the topic. Give realistic, clearly-labelled estimates (e.g. "~$12B (2026 est.)"). Be concise and specific.',
    schema: obj({
      summary: str,
      marketSize: str,
      growthRate: str,
      keyTrends: strList,
      segments: { type: 'array', items: obj({ name: str, share: num }) },
      attractivenessScore: num,
    }),
  },
  {
    key: 'competitor',
    name: 'Competitor Intelligence Agent',
    icon: '🏁',
    role: 'Maps the competitive landscape and the main players.',
    system:
      'You are a competitive intelligence analyst. Identify the 4-6 most relevant competitors or company archetypes, their positioning, strengths and weaknesses, and how intense the competition is. Be concise and specific.',
    schema: obj({
      summary: str,
      competitors: {
        type: 'array',
        items: obj({ name: str, positioning: str, strength: str, weakness: str, marketShare: num }),
      },
      competitiveIntensity: num,
      whiteSpace: strList,
    }),
  },
  {
    key: 'consumer',
    name: 'Consumer Sentiment Agent',
    icon: '💬',
    role: 'Analyses customer needs, sentiment, pain points and personas.',
    system:
      'You are a consumer insights researcher. Describe overall customer sentiment, what drives purchases, the main pain points and 2-3 buyer personas. sentimentScore is -100 (very negative) to 100 (very positive). Be concise.',
    schema: obj({
      summary: str,
      sentimentScore: num,
      purchaseDrivers: strList,
      painPoints: strList,
      personas: { type: 'array', items: obj({ name: str, description: str }) },
    }),
  },
  {
    key: 'risk',
    name: 'Financial & Risk Agent',
    icon: '⚖️',
    role: 'Evaluates financial viability, regulatory and market risks.',
    system:
      'You are a financial and risk analyst. Assess the business/financial outlook, the major risks (with severity Low, Medium or High and a mitigation) and the main opportunities. riskScore is 1 (low risk) to 10 (high risk). Be concise.',
    schema: obj({
      summary: str,
      outlook: str,
      riskScore: num,
      risks: { type: 'array', items: obj({ risk: str, severity: str, mitigation: str }) },
      opportunities: strList,
    }),
  },
];

export const STRATEGIST = {
  key: 'strategist',
  name: 'Strategy Synthesizer Agent',
  icon: '🧠',
  role: 'Combines all agent findings into one report with a SWOT and recommendations.',
  system:
    'You are the lead strategy consultant coordinating a team of AI research agents. You receive their findings as JSON. Resolve any disagreements between them, then write an executive report: summary, SWOT, 3-5 prioritised recommendations (priority High, Medium or Low), an overall opportunity score from 0-100, a confidence level (Low, Medium or High) and a one-line verdict.',
  schema: obj({
    executiveSummary: str,
    swot: obj({ strengths: strList, weaknesses: strList, opportunities: strList, threats: strList }),
    recommendations: { type: 'array', items: obj({ title: str, detail: str, priority: str }) },
    overallScore: num,
    confidence: str,
    verdict: str,
  }),
};

export const ALL_AGENTS = [...SPECIALISTS, STRATEGIST];

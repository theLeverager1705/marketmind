// Offline demo mode: produces realistic-looking agent output without an API key,
// so the whole system can be run and presented anywhere. Output is deterministic per topic.

function seeded(text) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const pick = (r, arr, n) => [...arr].map((v) => [r(), v]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
const between = (r, a, b) => Math.round(a + r() * (b - a));

export function demoAgentOutput(agentKey, input, previous = {}) {
  const topic = input.topic;
  const industry = input.industry || 'the sector';
  const region = input.region || 'Global';
  const r = seeded(`${topic}|${industry}|${region}|${agentKey}`);

  switch (agentKey) {
    case 'market': {
      const size = between(r, 4, 180);
      const cagr = between(r, 6, 24);
      const shares = [between(r, 30, 45), between(r, 20, 30), between(r, 10, 20)];
      return {
        summary: `The ${topic} market in ${region} is estimated at about $${size}B and is growing at roughly ${cagr}% CAGR, driven by digital adoption and changing customer expectations in ${industry}.`,
        marketSize: `~$${size}B (2026 est.)`,
        growthRate: `${cagr}% CAGR (2026-2031)`,
        keyTrends: pick(r, [
          `AI and automation are being built into ${topic} offerings`,
          'Subscription and usage-based pricing are replacing one-time sales',
          'Customers expect mobile-first, personalised experiences',
          'Sustainability is becoming a purchase criterion',
          'Consolidation as larger players acquire niche startups',
          `Rising demand from tier-2 and tier-3 cities in ${region}`,
          'Data privacy regulation is reshaping go-to-market',
        ], 4),
        segments: [
          { name: 'Enterprise', share: shares[0] },
          { name: 'Small & mid-size businesses', share: shares[1] },
          { name: 'Consumers', share: shares[2] },
          { name: 'Public sector & other', share: 100 - shares[0] - shares[1] - shares[2] },
        ],
        attractivenessScore: between(r, 62, 88),
      };
    }
    case 'competitor': {
      const names = pick(r, ['Global incumbent', 'Fast-growing startup', 'Regional specialist', 'Big-tech platform', 'Low-cost challenger', 'Vertical niche player'], 5);
      const raw = names.map(() => between(r, 8, 30));
      const total = raw.reduce((a, b) => a + b, 0);
      const competitors = names.map((name, i) => ({
        name,
        positioning: pick(r, ['Premium, full-featured', 'Price leader', 'Best user experience', 'Deep industry focus', 'Broad ecosystem & integrations'], 1)[0],
        strength: pick(r, ['Strong brand and trust', 'Large distribution network', 'Rapid product innovation', 'Lowest cost to serve', 'Loyal customer base'], 1)[0],
        weakness: pick(r, ['Slow to innovate', 'Poor customer support', 'High prices', 'Limited regional presence', 'Fragmented product line'], 1)[0],
        marketShare: Math.round((raw[i] / total) * 75),
      }));
      return {
        summary: `The ${topic} landscape is moderately concentrated. Incumbents lead on brand and distribution, while startups compete on product experience and price.`,
        competitors,
        competitiveIntensity: between(r, 5, 9),
        whiteSpace: pick(r, [
          'An affordable offering for small businesses',
          `A product localised for ${region}`,
          'AI-powered insights and automation',
          'Better onboarding and customer support',
          'Transparent, simple pricing',
        ], 3),
      };
    }
    case 'consumer':
      return {
        summary: `Customers are generally positive about ${topic}, but frustrated by complexity, cost and inconsistent service quality.`,
        sentimentScore: between(r, 15, 65),
        purchaseDrivers: pick(r, ['Price and value for money', 'Ease of use', 'Trust and brand reputation', 'Speed and convenience', 'Recommendations from peers', 'Quality of support'], 4),
        painPoints: pick(r, ['Hidden fees and confusing pricing', 'Hard to set up and learn', 'Slow customer service', 'Lack of personalisation', 'Concerns about data privacy'], 3),
        personas: [
          { name: 'The Pragmatic Buyer', description: 'Cost-conscious, compares options carefully, values reliability over features.' },
          { name: 'The Early Adopter', description: 'Digitally savvy, tries new products quickly, influences peers on social media.' },
          { name: 'The Enterprise Decision-Maker', description: 'Needs security, compliance and integrations; long buying cycle.' },
        ],
      };
    case 'risk':
      return {
        summary: `${topic} shows a healthy financial outlook with moderate risk. Margins depend on customer acquisition cost and regulatory stability in ${region}.`,
        outlook: pick(r, ['Positive', 'Cautiously positive', 'Strongly positive'], 1)[0],
        riskScore: between(r, 3, 7),
        risks: [
          { risk: 'Intense price competition compressing margins', severity: 'High', mitigation: 'Differentiate on experience and build switching costs' },
          { risk: `Regulatory changes in ${region}`, severity: 'Medium', mitigation: 'Invest early in compliance and monitor policy' },
          { risk: 'Macroeconomic slowdown reducing spend', severity: 'Medium', mitigation: 'Offer flexible, usage-based pricing' },
          { risk: 'Technology disruption by new entrants', severity: 'Low', mitigation: 'Continuous R&D and partnerships' },
        ],
        opportunities: pick(r, ['Expansion into adjacent segments', 'Strategic partnerships', 'A premium tier with AI features', 'Government digitisation programmes', 'Export to neighbouring markets'], 3),
      };
    case 'strategist': {
      const m = previous.market || {};
      const c = previous.competitor || {};
      const s = previous.consumer || {};
      const k = previous.risk || {};
      const score = Math.round(
        0.4 * (m.attractivenessScore ?? 70) +
          0.2 * (100 - (c.competitiveIntensity ?? 6) * 8) +
          0.2 * (50 + (s.sentimentScore ?? 30) / 2) +
          0.2 * (100 - (k.riskScore ?? 5) * 9)
      );
      const white = c.whiteSpace || ['underserved segments'];
      return {
        executiveSummary: `${topic} in ${region} is an attractive opportunity: a ${m.marketSize || 'sizeable'} market growing at ${m.growthRate || 'a healthy rate'}. Competition is real, but there is white space in ${white[0].toLowerCase()}. Customer sentiment is positive and the risks are manageable with the right positioning.`,
        swot: {
          strengths: ['Large and growing addressable market', 'Clear, proven customer demand', ...(k.opportunities || []).slice(0, 1)],
          weaknesses: ['Brand awareness must be built from scratch', 'High customer acquisition cost early on'],
          opportunities: [...white.slice(0, 2), ...(m.keyTrends || []).slice(0, 1)],
          threats: (k.risks || []).slice(0, 2).map((x) => x.risk),
        },
        recommendations: [
          { title: 'Target the white space first', detail: `Launch with ${white[0].toLowerCase()} to avoid competing head-on with incumbents.`, priority: 'High' },
          { title: 'Fix the top customer pain point', detail: `Make solving "${(s.painPoints || ['complexity'])[0]}" your main differentiator.`, priority: 'High' },
          { title: 'Use flexible pricing', detail: 'Offer a freemium or usage-based plan to lower the barrier to trial.', priority: 'Medium' },
          { title: 'Build a compliance moat', detail: `Invest early in ${region} regulation and data-privacy readiness.`, priority: 'Medium' },
        ],
        overallScore: Math.max(0, Math.min(100, score)),
        confidence: 'Medium',
        verdict: score >= 70 ? 'Go: strong opportunity, enter with a focused niche strategy.' : 'Proceed with caution: validate demand with a pilot first.',
      };
    }
    default:
      return {};
  }
}

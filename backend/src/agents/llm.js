import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

let client;
const getClient = () => (client ??= new Anthropic({ apiKey: config.anthropicKey }));

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('Agent did not return valid JSON');
  }
}

/** Ask Claude to act as one agent and return JSON matching the agent's schema. */
export async function runAgentWithClaude(agent, userPrompt) {
  const request = {
    model: config.model,
    // If the model declines on a safety classifier, the API retries on a fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    max_tokens: 16000,
    system: `${agent.system}\nRespond only with JSON that matches the required schema.`,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: agent.schema },
    },
  };

  const response = await getClient().beta.messages.create(request);

  if (response.stop_reason === 'refusal') {
    throw new Error(`${agent.name} declined this request`);
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error(`${agent.name} ran out of output space`);
  }
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return extractJson(text);
}

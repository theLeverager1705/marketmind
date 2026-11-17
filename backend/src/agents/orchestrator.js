import { db } from '../db.js';
import { aiEnabled } from '../config.js';
import { SPECIALISTS, STRATEGIST, ALL_AGENTS } from './definitions.js';
import { runAgentWithClaude } from './llm.js';
import { demoAgentOutput } from './demo.js';

const q = {
  insertRun: db.prepare('INSERT INTO agent_runs (analysis_id, agent_key, agent_name) VALUES (?, ?, ?)'),
  startRun: db.prepare("UPDATE agent_runs SET status = 'running', started_at = datetime('now') WHERE analysis_id = ? AND agent_key = ?"),
  finishRun: db.prepare("UPDATE agent_runs SET status = ?, output_json = ?, duration_ms = ?, finished_at = datetime('now') WHERE analysis_id = ? AND agent_key = ?"),
  setStatus: db.prepare('UPDATE analyses SET status = ? WHERE id = ?'),
  complete: db.prepare("UPDATE analyses SET status = 'completed', report_json = ?, completed_at = datetime('now') WHERE id = ?"),
  fail: db.prepare("UPDATE analyses SET status = 'failed', error = ?, completed_at = datetime('now') WHERE id = ?"),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function briefFor(input) {
  return [
    `Research topic: ${input.topic}`,
    `Industry: ${input.industry || 'not specified'}`,
    `Region: ${input.region || 'Global'}`,
    `Business objective: ${input.objective || 'Assess the market opportunity'}`,
  ].join('\n');
}

async function runOne(analysisId, agent, input, prompt, previous, mode) {
  q.startRun.run(analysisId, agent.key);
  const t0 = Date.now();
  try {
    let output;
    if (mode === 'ai') {
      output = await runAgentWithClaude(agent, prompt);
    } else {
      await sleep(900 + Math.random() * 1800); // simulate the agent working
      output = demoAgentOutput(agent.key, input, previous);
    }
    q.finishRun.run('completed', JSON.stringify(output), Date.now() - t0, analysisId, agent.key);
    return output;
  } catch (err) {
    q.finishRun.run('failed', JSON.stringify({ error: err.message }), Date.now() - t0, analysisId, agent.key);
    throw err;
  }
}

export function createAgentRuns(analysisId) {
  for (const a of ALL_AGENTS) q.insertRun.run(analysisId, a.key, a.name);
}

/**
 * Orchestration pipeline:
 *   1. Four specialist agents research the topic IN PARALLEL.
 *   2. The Strategy Synthesizer reads all four outputs and writes the final report.
 * Every step is saved to the agent_runs table so the UI can show live progress.
 */
export async function runAnalysis(analysisId, input) {
  const mode = aiEnabled() ? 'ai' : 'demo';
  q.setStatus.run('running', analysisId);
  try {
    const brief = briefFor(input);
    const results = await Promise.all(
      SPECIALISTS.map((agent) => runOne(analysisId, agent, input, brief, {}, mode))
    );
    const findings = Object.fromEntries(SPECIALISTS.map((a, i) => [a.key, results[i]]));

    const synthPrompt = `${brief}\n\nFindings from the specialist agents (JSON):\n${JSON.stringify(findings, null, 2)}`;
    const report = await runOne(analysisId, STRATEGIST, input, synthPrompt, findings, mode);

    q.complete.run(JSON.stringify({ ...report, findings }), analysisId);
  } catch (err) {
    console.error(`[analysis ${analysisId}]`, err.message);
    q.fail.run(err.message, analysisId);
  }
}

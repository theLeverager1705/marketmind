// Generates docs/MarketMind-Presentation.pptx
// Usage: npm install pptxgenjs && node docs/build-presentation.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const OUT = path.join(__dirname, 'MarketMind-Presentation.pptx');
const SHOT = (f) => path.join(__dirname, 'screenshots', f);

const THEME = {
  name: 'MarketMind',
  headFontFace: 'Calibri',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '0B1020', lt1: 'FFFFFF', dk2: '161E36', lt2: 'E8ECF8',
    accent1: '6366F1', accent2: '22D3EE', accent3: 'A855F7',
    accent4: 'F59E0B', accent5: '10B981', accent6: 'F43F5E',
    hlink: '22D3EE', folHlink: 'A855F7',
  },
};
const HEX = { bg: '0B1020', card: '161E36', card2: '1E2848', line: '2A3558', text: 'E8ECF8', muted: '9AA6C8' };
const ACC = ['6366F1', '22D3EE', 'A855F7', 'F59E0B', '10B981', 'F43F5E'];

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.title = 'MarketMind - AI-Powered Multi-Agent Market Research';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

// ---------- Layouts ----------
pres.defineSlideMaster({
  title: 'TITLE_DARK',
  background: { color: HEX.bg },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.3, w: 11.7, h: 1.6, fontSize: 48, bold: true, color: HEX.text, valign: 'bottom', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 4.0, w: 11.7, h: 1.2, fontSize: 20, color: HEX.muted, valign: 'top', align: 'left' }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: HEX.bg },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.85, fontSize: 36, bold: true, color: HEX.text, valign: 'middle', align: 'left' }, text: '' } },
    { text: { text: 'MarketMind  ·  AI Multi-Agent Market Research', options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: HEX.muted } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: HEX.muted, align: 'right' },
});

let sectionTitle = 'Introduction';
const section = (t) => { sectionTitle = t; pres.addSection({ title: t }); };
const content = (title) => {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle });
  s.addText(title, { placeholder: 'title' });
  return s;
};
const card = (s, x, y, w, h, fill = HEX.card, name = 'card') =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: HEX.line, width: 0.75 }, rectRadius: 0.12, objectName: name });
const circle = (s, x, y, d, color, label, size = 18) => {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: 'none' }, objectName: 'badge' });
  s.addText(label, { x, y, w: d, h: d, align: 'center', valign: 'middle', fontSize: size, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
};
const txt = (s, text, opts) => s.addText(text, { isTextBox: true, color: HEX.text, fontSize: 16, valign: 'top', ...opts });
const arrow = (s, x1, y1, x2, y2, color = HEX.muted) =>
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001, flipH: x2 < x1, flipV: y2 < y1, line: { color, width: 2, endArrowType: 'triangle' } });
const bullets = (items, opts = {}) =>
  items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1, paraSpaceAfter: 8, ...opts } }));

// ---------- 1. Title ----------
section('Introduction');
{
  const s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle });
  s.addText('MarketMind', { placeholder: 'title' });
  s.addText('An AI-powered multi-agent system for market analysis and research', { placeholder: 'body' });
  // motif: five agent dots
  ['M', 'C', 'S', 'R', 'AI'].forEach((l, i) => circle(s, 0.8 + i * 0.75, 1.3, 0.55, ACC[i], l, l.length > 1 ? 13 : 16));
  txt(s, 'Full-stack web application  ·  React  ·  Node.js / Express  ·  SQLite  ·  Claude AI', { x: 0.8, y: 6.2, w: 11.5, h: 0.5, fontSize: 14, color: HEX.muted });
  s.addNotes('Introduce MarketMind: a web application where a team of AI agents researches a market for you. Each coloured dot is one of the five agents we will meet shortly.');
}

// ---------- 2. Problem ----------
{
  const s = content('Market research today is slow, costly and fragmented');
  const items = [
    ['Slow', 'A proper market study takes analysts days or weeks of manual desk research.', ACC[5]],
    ['Expensive', 'Consulting firms and research reports are out of reach for students, startups and small businesses.', ACC[3]],
    ['Fragmented', 'Market size, competitors, customers and risks are studied separately and rarely combined into one view.', ACC[2]],
  ];
  items.forEach(([h, b, c], i) => {
    const x = 0.6 + i * 4.1;
    card(s, x, 1.6, 3.8, 3.6);
    circle(s, x + 0.35, 1.95, 0.8, c, String(i + 1), 24);
    txt(s, h, { x: x + 0.35, y: 3.0, w: 3.2, h: 0.6, fontSize: 24, bold: true, margin: 0 });
    txt(s, b, { x: x + 0.35, y: 3.7, w: 3.2, h: 2.2, fontSize: 16, color: HEX.muted, margin: 0 });
  });
  txt(s, 'Goal: decision-ready market research in minutes, not weeks', { x: 0.6, y: 5.6, w: 12.1, h: 0.6, fontSize: 22, italic: true, bold: true, color: ACC[1], margin: 0 });
  s.addNotes('Explain the problem: research is slow, costly and done in silos. Our goal is decision-ready research in minutes instead of weeks.');
}

// ---------- 3. Solution ----------
{
  const s = content('Our solution: a team of AI agents that research in parallel');
  txt(s, bullets([
    'The user describes a market question once',
    'Four specialist AI agents each study one angle at the same time',
    'A fifth agent combines their findings into one report',
    'Every report, user and login is stored in a database',
  ]), { x: 0.6, y: 1.6, w: 5.6, h: 4.2, fontSize: 18 });
  // flow on right
  const steps = [['Ask a question', HEX.card2], ['4 agents research in parallel', ACC[0]], ['Synthesizer writes the report', ACC[2]], ['Saved to your dashboard', HEX.card2]];
  steps.forEach(([t, c], i) => {
    const y = 1.6 + i * 1.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.2, y, w: 5.4, h: 0.9, fill: { color: c }, line: { color: HEX.line }, rectRadius: 0.12, objectName: 'flow-step' });
    txt(s, t, { x: 7.2, y, w: 5.4, h: 0.9, align: 'center', valign: 'middle', fontSize: 18, bold: true, margin: 0 });
    if (i < steps.length - 1) arrow(s, 9.9, y + 0.92, 9.9, y + 1.28);
  });
  s.addNotes('The key idea is division of labour. Like a real research team, each agent is a specialist. Running them in parallel makes the whole analysis fast.');
}

// ---------- 4. Agents ----------
section('System design');
{
  const s = content('Meet the five AI agents');
  const agents = [
    ['Market Research', 'Market size, growth rate (CAGR), key trends and customer segments'],
    ['Competitor Intelligence', 'Key players, positioning, strengths, weaknesses, white space'],
    ['Consumer Sentiment', 'Sentiment score, purchase drivers, pain points, buyer personas'],
    ['Financial & Risk', 'Outlook, risk register with severity and mitigation, opportunities'],
    ['Strategy Synthesizer', 'Reads all four outputs; writes SWOT, score, verdict, recommendations'],
  ];
  const w = 2.3, gap = 0.15;
  agents.forEach(([n, d], i) => {
    const x = 0.6 + i * (w + gap);
    card(s, x, 1.7, w, 3.9, i === 4 ? HEX.card2 : HEX.card);
    circle(s, x + 0.25, 2.0, 0.75, ACC[i], String(i + 1), 22);
    txt(s, n + ' Agent', { x: x + 0.25, y: 2.95, w: w - 0.45, h: 1.0, fontSize: 18, bold: true, margin: 0 });
    txt(s, d, { x: x + 0.25, y: 4.0, w: w - 0.45, h: 2.1, fontSize: 14, color: HEX.muted, margin: 0 });
  });
  s.addNotes('Walk through each agent. Agents 1 to 4 are specialists that run in parallel. Agent 5, the synthesizer, acts as the lead consultant: it resolves disagreements and writes the final report.');
}

// ---------- 5. Architecture ----------
{
  const s = content('System architecture');
  const box = (x, y, w, h, title, sub, color) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: HEX.card }, line: { color, width: 2 }, rectRadius: 0.12, objectName: 'arch-' + title });
    txt(s, title, { x, y: y + 0.12, w, h: 0.45, align: 'center', fontSize: 17, bold: true, margin: 0 });
    txt(s, sub, { x: x + 0.1, y: y + 0.55, w: w - 0.2, h: h - 0.6, align: 'center', fontSize: 13, color: HEX.muted, margin: 0 });
  };
  box(0.6, 1.7, 3.0, 1.6, 'Frontend', 'React + Vite\nLogin, dashboard, live report, charts', ACC[1]);
  box(4.6, 1.7, 3.6, 1.6, 'Backend API', 'Node.js + Express\nREST API, JWT auth, validation', ACC[0]);
  box(9.2, 1.7, 3.5, 1.6, 'Database', 'SQLite\nusers, sessions, login history, analyses, agent runs', ACC[4]);
  box(4.6, 4.2, 3.6, 1.5, 'Agent Orchestrator', 'Runs 4 agents in parallel, then the synthesizer', ACC[2]);
  box(9.2, 4.2, 3.5, 1.5, 'Claude AI (LLM)', 'Anthropic API with JSON-schema outputs\n(offline demo mode without a key)', ACC[3]);
  arrow(s, 3.6, 2.5, 4.58, 2.5); txt(s, 'HTTPS + JWT', { x: 3.55, y: 2.05, w: 1.1, h: 0.35, fontSize: 10, color: HEX.muted, align: 'center', margin: 0 });
  arrow(s, 8.2, 2.5, 9.18, 2.5); txt(s, 'SQL', { x: 8.2, y: 2.05, w: 1.0, h: 0.35, fontSize: 10, color: HEX.muted, align: 'center', margin: 0 });
  arrow(s, 6.4, 3.3, 6.4, 4.18);
  arrow(s, 8.2, 4.95, 9.18, 4.95);
  arrow(s, 7.6, 4.2, 9.6, 3.32);
  txt(s, 'Saves each agent result', { x: 9.75, y: 3.45, w: 2.6, h: 0.35, fontSize: 10, color: HEX.muted, margin: 0 });
  txt(s, 'Three-tier design: presentation (React), application (Express + agents), data (SQLite). The browser polls the API to show each agent\'s live status.', { x: 0.6, y: 6.0, w: 12.1, h: 0.8, fontSize: 14, color: HEX.muted });
  s.addNotes('Three tiers. The React frontend talks to the Express API using a JWT token. The API stores everything in SQLite. When an analysis starts, the orchestrator calls Claude once per agent, saving each result to the agent_runs table so the UI can show live progress.');
}

// ---------- 6. Workflow ----------
{
  const s = content('How one analysis runs, step by step');
  const steps = [
    ['Request', 'User submits topic, industry, region and objective'],
    ['Queue', 'API saves the analysis and 5 agent rows to the database'],
    ['Parallel research', 'Market, Competitor, Consumer and Risk agents run at once'],
    ['Synthesis', 'Strategy agent merges all findings into one report'],
    ['Report', 'Score, SWOT, charts and recommendations shown and saved'],
  ];
  const w = 2.3, gap = 0.15, y = 2.2;
  steps.forEach(([h, d], i) => {
    const x = 0.6 + i * (w + gap);
    circle(s, x + w / 2 - 0.4, y, 0.8, ACC[i], String(i + 1), 22);
    if (i < steps.length - 1) arrow(s, x + w / 2 + 0.45, y + 0.4, x + w + gap + w / 2 - 0.45, y + 0.4);
    card(s, x, y + 1.1, w, 2.0);
    txt(s, h, { x: x + 0.2, y: y + 1.3, w: w - 0.4, h: 0.5, fontSize: 18, bold: true, align: 'center', margin: 0 });
    txt(s, d, { x: x + 0.2, y: y + 1.9, w: w - 0.4, h: 1.7, fontSize: 14, color: HEX.muted, align: 'center', margin: 0 });
  });
  s.addNotes('Explain the pipeline. Step 3 uses Promise.all to run four agents concurrently, so total time is roughly the slowest agent plus the synthesizer, not the sum of all five.');
}

// ---------- 7. Tech stack ----------
{
  const s = content('Technology stack');
  const rows = [
    ['Frontend', 'React 18, Vite, React Router, Recharts', ACC[1]],
    ['Backend', 'Node.js 22+, Express, Helmet, CORS, rate limiting', ACC[0]],
    ['Database', 'SQLite (built-in node:sqlite driver), SQL schema file', ACC[4]],
    ['Authentication', 'bcrypt password hashing, JWT tokens, server-side sessions', ACC[5]],
    ['AI / LLM', 'Anthropic Claude via official SDK, structured JSON outputs', ACC[3]],
    ['Tooling', 'Git + GitHub, npm scripts, concurrently for one-command dev', ACC[2]],
  ];
  rows.forEach(([k, v, c], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.6 + row * 1.7;
    card(s, x, y, 5.95, 1.45);
    circle(s, x + 0.3, y + 0.33, 0.8, c, k[0], 22);
    txt(s, k, { x: x + 1.35, y: y + 0.22, w: 4.4, h: 0.45, fontSize: 18, bold: true, margin: 0 });
    txt(s, v, { x: x + 1.35, y: y + 0.7, w: 4.4, h: 0.65, fontSize: 14, color: HEX.muted, margin: 0 });
  });
  s.addNotes('All open-source, JavaScript end to end. SQLite needs no separate database server, so the project runs on any laptop with Node.js installed.');
}

// ---------- 8. Database ----------
section('Data and security');
{
  const s = content('Database design: five related tables');
  const tables = [
    ['users', ['id (PK)', 'name', 'email (unique)', 'password_hash', 'role', 'created_at, last_login_at'], ACC[0]],
    ['sessions', ['id (PK, JWT jti)', 'user_id (FK)', 'expires_at', 'revoked', 'ip_address, user_agent'], ACC[5]],
    ['login_history', ['id (PK)', 'user_id (FK)', 'email', 'success', 'ip_address, user_agent', 'created_at'], ACC[3]],
    ['analyses', ['id (PK)', 'user_id (FK)', 'topic, industry, region', 'status, mode', 'report_json', 'created_at, completed_at'], ACC[1]],
    ['agent_runs', ['id (PK)', 'analysis_id (FK)', 'agent_key, agent_name', 'status', 'output_json', 'duration_ms'], ACC[2]],
  ];
  const w = 2.3, gap = 0.15;
  tables.forEach(([n, cols, c], i) => {
    const x = 0.6 + i * (w + gap);
    card(s, x, 1.6, w, 3.4);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w, h: 0.65, fill: { color: c }, line: { type: 'none' }, rectRadius: 0.12, objectName: 'table-head' });
    txt(s, n, { x, y: 1.6, w, h: 0.65, fontSize: 17, bold: true, align: 'center', valign: 'middle', margin: 0, color: 'FFFFFF' });
    txt(s, bullets(cols, { paraSpaceAfter: 4 }), { x: x + 0.1, y: 2.4, w: w - 0.2, h: 3.4, fontSize: 13, color: HEX.muted });
  });
  txt(s, 'users 1 → many sessions · login_history · analyses        analyses 1 → many agent_runs        Foreign keys use ON DELETE CASCADE', { x: 0.6, y: 5.35, w: 12.1, h: 0.5, fontSize: 14, color: HEX.muted });
  s.addNotes('The schema is in database/schema.sql. Users own sessions, login history and analyses. Each analysis has five agent_runs, one per agent, which stores every agent output separately for transparency.');
}

// ---------- 9. Auth ----------
{
  const s = content('Authentication and security');
  const flow = ['Register / Login', 'Password checked with bcrypt', 'Session row saved, JWT issued', 'Token sent with every request', 'Logout revokes the session'];
  flow.forEach((t, i) => {
    const y = 1.6 + i * 1.0;
    circle(s, 0.6, y, 0.65, ACC[i], String(i + 1), 18);
    txt(s, t, { x: 1.45, y: y + 0.05, w: 4.6, h: 0.55, fontSize: 17, valign: 'middle', margin: 0 });
  });
  card(s, 6.6, 1.6, 6.1, 4.4);
  txt(s, 'What is stored and protected', { x: 6.9, y: 1.8, w: 5.6, h: 0.5, fontSize: 20, bold: true, margin: 0 });
  txt(s, bullets([
    'Passwords stored only as bcrypt hashes, never plain text',
    'Every login attempt logged with time, IP and device',
    'Server-side sessions: tokens can be revoked on logout',
    'Rate limiting on login and register to slow brute force',
    'Users can only read and delete their own analyses',
    'Helmet security headers and input validation',
  ]), { x: 6.9, y: 2.45, w: 5.6, h: 3.8, fontSize: 15, color: HEX.muted });
  s.addNotes('Authentication data lives in the users, sessions and login_history tables. A JWT alone cannot be revoked, so we pair it with a sessions table: logout marks the session revoked and the token stops working immediately. The Account page shows the user their own sign-in history.');
}

// ---------- 10-12. Screenshots ----------
section('Demo');
const shot = (title, file, caption, notes) => {
  const s = content(title);
  // screenshots are 800x500 (16:10)
  const h = 5.0, w = h * 1.6, x = (13.333 - w) / 2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.08, y: 1.42, w: w + 0.16, h: h + 0.16, fill: { color: HEX.line }, line: { type: 'none' }, rectRadius: 0.08, objectName: 'frame' });
  s.addImage({ path: SHOT(file), x, y: 1.5, w, h, altText: caption });
  txt(s, caption, { x: 0.6, y: 6.6, w: 12.1, h: 0.35, fontSize: 12, color: HEX.muted, align: 'center', margin: 0 });
  s.addNotes(notes);
};
shot('Live agent pipeline', 'agent-pipeline.jpg', 'Each agent reports its status and run time as it works; the progress bar fills as agents finish.',
  'Show the report page right after starting an analysis. The four specialists finish in parallel, then the synthesizer runs last.');
shot('Decision-ready report: SWOT and recommendations', 'swot.jpg', 'The Strategy Synthesizer turns all agent findings into a SWOT analysis and prioritised actions.',
  'The SWOT combines evidence from every agent: strengths from the market agent, threats from the risk agent, opportunities from the competitor agent\'s white space.');
shot('Interactive charts and competitor profiles', 'competitors.jpg', 'Market segments and competitor share are drawn with Recharts from the agents\' structured JSON output.',
  'Because each agent returns JSON that matches a schema, the frontend can chart the data reliably instead of parsing free text.');

// ---------- 13. API ----------
section('Implementation');
{
  const s = content('REST API endpoints');
  const head = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: ACC[0] } } });
  const rows = [
    [head('Method'), head('Endpoint'), head('Purpose'), head('Auth')],
    ['POST', '/api/auth/register', 'Create account, return token', 'No'],
    ['POST', '/api/auth/login', 'Sign in, log the attempt', 'No'],
    ['POST', '/api/auth/logout', 'Revoke the current session', 'Yes'],
    ['GET', '/api/auth/me', 'Profile and recent sign-ins', 'Yes'],
    ['GET', '/api/analyses', 'List my analyses and stats', 'Yes'],
    ['POST', '/api/analyses', 'Start a multi-agent analysis', 'Yes'],
    ['GET', '/api/analyses/:id', 'Live status, agent outputs, report', 'Yes'],
    ['DELETE', '/api/analyses/:id', 'Delete an analysis', 'Yes'],
  ];
  s.addTable(rows, {
    x: 0.6, y: 1.55, w: 12.1, colW: [1.4, 3.6, 5.6, 1.5],
    fontSize: 14, color: HEX.text, fill: { color: HEX.card },
    border: { type: 'solid', color: HEX.line, pt: 0.75 }, rowH: 0.52, valign: 'middle', margin: [0.04, 0.12, 0.04, 0.12],
  });
  s.addNotes('Eight endpoints cover authentication and analyses. Starting an analysis returns 202 Accepted straight away; the agents keep working in the background and the browser polls GET /api/analyses/:id.');
}

// ---------- 14. Outcomes ----------
{
  const s = content('Results and key features');
  const stats = [['5', 'specialised AI agents'], ['4', 'agents run in parallel'], ['~10s', 'per analysis in demo mode'], ['5', 'database tables']];
  stats.forEach(([n, l], i) => {
    const x = 0.6 + i * 3.075;
    card(s, x, 1.6, 2.9, 2.0);
    txt(s, n, { x, y: 1.75, w: 2.9, h: 1.0, fontSize: 48, bold: true, align: 'center', color: ACC[i], margin: 0 });
    txt(s, l, { x, y: 2.8, w: 2.9, h: 0.6, fontSize: 15, align: 'center', color: HEX.muted, margin: 0 });
  });
  txt(s, bullets([
    'Secure sign-up and sign-in with every user, session and login stored in the database',
    'Live progress of every agent, then a full report with score, SWOT, charts and recommendations',
    'Research history per user, saved and re-openable at any time',
    'Works offline in demo mode; switch to live Claude AI by adding one API key',
  ]), { x: 0.6, y: 4.0, w: 12.1, h: 2.6, fontSize: 17 });
  s.addNotes('Summarise what the system delivers. The ~10 seconds figure is demo mode; with live Claude AI an analysis takes longer depending on the model.');
}

// ---------- 15. Future ----------
{
  const s = content('Future scope');
  const items = [
    ['Live web data', 'Give agents web search and news feeds so figures cite current sources'],
    ['Export reports', 'Download any report as PDF or PowerPoint for sharing'],
    ['Team workspaces', 'Shared projects, comments and roles for research groups'],
    ['More agents', 'Pricing, regulation and social-media trend agents'],
  ];
  items.forEach(([h, d], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.6 + row * 2.4;
    card(s, x, y, 5.95, 2.1);
    circle(s, x + 0.3, y + 0.35, 0.75, ACC[i + 1], String(i + 1), 20);
    txt(s, h, { x: x + 1.3, y: y + 0.35, w: 4.4, h: 0.5, fontSize: 20, bold: true, margin: 0 });
    txt(s, d, { x: x + 1.3, y: y + 0.9, w: 4.4, h: 1.0, fontSize: 15, color: HEX.muted, margin: 0 });
  });
  s.addNotes('Possible extensions. Live web data is the most valuable next step, because it lets every number be traced to a source.');
}

// ---------- 16. Close ----------
section('Conclusion');
{
  const s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle });
  s.addText('Thank you', { placeholder: 'title' });
  s.addText('MarketMind: research a market with a team of AI agents in minutes\nQuestions?', { placeholder: 'body' });
  ['M', 'C', 'S', 'R', 'AI'].forEach((l, i) => circle(s, 0.8 + i * 0.75, 1.3, 0.55, ACC[i], l, l.length > 1 ? 13 : 16));
  s.addNotes('Close with the one-line summary and invite questions. Offer a live demo of the website if time allows.');
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  try {
    const { applyTheme } = require(process.env.APPLY_THEME || './apply_theme.js');
    await applyTheme(OUT, THEME);
  } catch (e) {
    // theme colours are optional; slides use explicit colours
  }
  console.log('Wrote', OUT);
})();

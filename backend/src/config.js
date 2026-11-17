import 'dotenv/config';

export const config = {
  port: Number(process.env.API_PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresHours: Number(process.env.JWT_EXPIRES_HOURS || 24),
  dbPath: process.env.DB_PATH || './data/marketmind.db',
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.CLAUDE_MODEL || 'claude-opus-5-5',
};

export const aiEnabled = () => Boolean(config.anthropicKey);

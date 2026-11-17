import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../../database/schema.sql');

const dbFile = path.resolve(path.resolve(here, '..'), config.dbPath);
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

export const db = new DatabaseSync(dbFile);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(fs.readFileSync(schemaPath, 'utf8'));

// Admin access for the Database page: ADMIN_EMAIL if set, otherwise the first registered user.
if (config.adminEmail) {
  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(config.adminEmail);
}
if (!db.prepare("SELECT 1 FROM users WHERE role = 'admin'").get()) {
  db.exec("UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users)");
}

console.log(`[db] SQLite ready at ${dbFile}`);

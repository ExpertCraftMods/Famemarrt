import { readFileSync } from 'node:fs';
import { query } from '../db/index.js';

async function run() {
  const seedPath = new URL('../db/seed.sql', import.meta.url);
  const sql = readFileSync(seedPath, 'utf8');
  await query(sql);
  console.log('Seed completed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

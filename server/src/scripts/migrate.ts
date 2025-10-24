import { readFileSync } from 'node:fs';
import { migrate } from '../db/index.js';

async function run() {
  const schemaPath = new URL('../db/schema.sql', import.meta.url);
  const sql = readFileSync(schemaPath, 'utf8');
  await migrate(sql);
  console.log('Migration completed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

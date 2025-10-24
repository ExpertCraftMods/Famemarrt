import { readFileSync } from 'node:fs';
import { app } from './app.js';
import { migrate } from './db/index.js';

async function start() {
  if (process.env.MIGRATE_ON_START === '1' && process.env.NODE_ENV !== 'test') {
    const schema = readFileSync(new URL('./db/schema.sql', import.meta.url));
    await migrate(schema.toString());
  }

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

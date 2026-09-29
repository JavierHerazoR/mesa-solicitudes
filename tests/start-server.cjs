// Browser tests use their own disposable database, never the user's demo data.
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const directory = mkdtempSync(join(tmpdir(), 'mesa-browser-'));
process.env.DATABASE_PATH = join(directory, 'test.sqlite');
const { createApp } = require('../dist/server/app.js');
let app;
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await app?.close();
  rmSync(directory, { recursive: true, force: true });
  process.exit(0);
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
createApp()
  .then(async (instance) => {
    app = instance;
    await app.listen(4011, '127.0.0.1');
  })
  .catch((error) => {
    console.error(error);
    rmSync(directory, { recursive: true, force: true });
    process.exit(1);
  });

const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tsc = path.join(root, 'node_modules/typescript/bin/tsc');
const vite = path.join(root, 'node_modules/vite/bin/vite.js');
const run = (args) => spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
const initial = run([tsc, '-p', 'tsconfig.server.json']);
initial.on('exit', (code) => {
  if (code !== 0) return process.exit(code || 1);
  const children = [
    run([tsc, '-p', 'tsconfig.server.json', '--watch', '--preserveWatchOutput']),
    run(['--watch', 'dist/server/main.js']),
    run([vite, '--host', '127.0.0.1']),
  ];
  let stopping = false;
  function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) child.kill('SIGTERM');
    setTimeout(() => process.exit(code), 250);
  }
  for (const child of children) child.on('exit', (exitCode) => stop(exitCode || 0));
  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());
});

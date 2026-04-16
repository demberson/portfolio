import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const apiDirectory = path.join(projectRoot, 'uncanny-api');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm run dev' : 'npm run dev';
const pythonCommand = isWindows
  ? 'python -m uvicorn app:app --reload --port 8000'
  : 'python3 -m uvicorn app:app --reload --port 8000';

const children = [];

function start(name, command, cwd) {
  const child = spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => process.exit(exitCode), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start('frontend', npmCommand, projectRoot);
start('api', pythonCommand, apiDirectory);

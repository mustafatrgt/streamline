#!/usr/bin/env node

import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const watchTargets = [
  'index.html',
  'tailwind.config.js',
  'assets/css',
  'assets/js',
  'assets/video',
  'img',
];

const ignorePatterns = [
  /(^|\/)node_modules\//,
  /(^|\/)\.git\//,
  /assets\/css\/tailwind\.css$/,
  /assets\/css\/.+\.min\.css$/,
  /assets\/js\/main\.mjs$/,
  /assets\/js\/main\.min\.js$/,
  /assets\/js\/main\.min\.mjs$/,
  /(^|\/)\.DS_Store$/,
];

let buildTimer = null;
let isBuilding = false;
let hasPending = false;

function shouldIgnore(relativePath) {
  return ignorePatterns.some((pattern) => pattern.test(relativePath));
}

function runBuild() {
  return new Promise((resolve, reject) => {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npmCmd, ['run', 'assets:build'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`assets:build exited with code ${code}`));
      }
    });
  });
}

async function processBuildQueue() {
  if (isBuilding) {
    hasPending = true;
    return;
  }

  isBuilding = true;
  try {
    await runBuild();
  } catch (error) {
    console.error('[assets-watch] Build error:', error.message);
  } finally {
    isBuilding = false;
    if (hasPending) {
      hasPending = false;
      setTimeout(processBuildQueue, 50);
    }
  }
}

function queueBuild(reasonPath) {
  if (buildTimer) clearTimeout(buildTimer);
  console.log(`[assets-watch] Change detected: ${reasonPath}`);
  buildTimer = setTimeout(() => {
    processBuildQueue();
  }, 220);
}

function attachWatcher(targetRel) {
  const targetPath = path.join(ROOT, targetRel);
  const watcher = watch(targetPath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    const rel = path.join(targetRel, filename.toString()).replace(/\\/g, '/');
    if (shouldIgnore(rel)) return;

    queueBuild(rel);
  });

  watcher.on('error', (error) => {
    console.error(`[assets-watch] Watch error on ${targetRel}:`, error.message);
  });

  return watcher;
}

const watchers = watchTargets.map((target) => attachWatcher(target));

console.log('[assets-watch] Watching for asset changes...');
console.log('[assets-watch] Press Ctrl+C to stop.');

process.on('SIGINT', () => {
  watchers.forEach((watcher) => watcher.close());
  process.exit(0);
});

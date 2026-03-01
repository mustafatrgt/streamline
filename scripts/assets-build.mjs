#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { transform } from 'esbuild';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const cssTasks = [
  ['assets/css/fonts.css', 'assets/css/fonts.min.css'],
  ['assets/css/tailwind.css', 'assets/css/tailwind.min.css'],
  ['assets/css/style.css', 'assets/css/style.min.css'],
];
const combinedCssOut = 'assets/css/app.min.css';

const jsSource = 'assets/js/main.js';
const jsMin = 'assets/js/main.min.js';
const jsModule = 'assets/js/main.mjs';
const jsMinModule = 'assets/js/main.min.mjs';

const canonicalRewrites = new Map([
  ['assets/css/fonts.css', combinedCssOut],
  ['assets/css/fonts.min.css', combinedCssOut],
  ['assets/css/tailwind.css', combinedCssOut],
  ['assets/css/tailwind.min.css', combinedCssOut],
  ['assets/css/style.css', combinedCssOut],
  ['assets/css/style.min.css', combinedCssOut],
  ['assets/css/app.css', combinedCssOut],
  ['assets/js/main.js', 'assets/js/main.min.js'],
]);

const versionedExtensions = new Set([
  '.css', '.js', '.mjs',
  '.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.mp4', '.webm', '.ogg', '.vtt',
]);

function normalizePathForMatch(urlPath) {
  return urlPath.replace(/^\.\//, '').replace(/^\//, '').replace(/\\/g, '/');
}

function resolveFilesystemPath(urlPath, htmlDir) {
  if (urlPath.startsWith('/')) {
    return path.join(ROOT, urlPath.slice(1));
  }
  return path.resolve(htmlDir, urlPath);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const hashCache = new Map();
async function getShortHash(filePath) {
  const cached = hashCache.get(filePath);
  if (cached) return cached;
  const data = await fs.readFile(filePath);
  const hash = crypto.createHash('sha1').update(data).digest('hex').slice(0, 10);
  hashCache.set(filePath, hash);
  return hash;
}

async function addVersionToUrl(rawUrl, htmlDir) {
  if (!rawUrl) return rawUrl;
  if (/^(?:https?:|data:|mailto:|tel:|javascript:|#|\/\/)/i.test(rawUrl)) return rawUrl;

  const [withoutHash, hashFragment = ''] = rawUrl.split('#');
  const [rawPath, rawQuery = ''] = withoutHash.split('?');

  if (!rawPath) return rawUrl;

  const normalized = normalizePathForMatch(rawPath);
  const rewrittenNormalized = canonicalRewrites.get(normalized) || normalized;
  const rewrittenPath = rawPath.startsWith('/') ? `/${rewrittenNormalized}` : rewrittenNormalized;

  const ext = path.extname(rewrittenNormalized).toLowerCase();
  if (!versionedExtensions.has(ext)) {
    const passthrough = rawQuery ? `${rewrittenPath}?${rawQuery}` : rewrittenPath;
    return hashFragment ? `${passthrough}#${hashFragment}` : passthrough;
  }

  const fsPath = resolveFilesystemPath(rewrittenPath, htmlDir);
  if (!(await fileExists(fsPath))) {
    const passthrough = rawQuery ? `${rewrittenPath}?${rawQuery}` : rewrittenPath;
    return hashFragment ? `${passthrough}#${hashFragment}` : passthrough;
  }

  const params = new URLSearchParams(rawQuery);
  params.delete('v');
  params.set('v', await getShortHash(fsPath));

  const query = params.toString();
  const withQuery = query ? `${rewrittenPath}?${query}` : rewrittenPath;
  return hashFragment ? `${withQuery}#${hashFragment}` : withQuery;
}

async function rewriteHtmlWithVersions(htmlPath) {
  const htmlDir = path.dirname(htmlPath);
  const original = await fs.readFile(htmlPath, 'utf8');
  let updated = original;

  updated = await replaceAsync(
    updated,
    /(\bsrcset\s*=\s*)(["'])([^"']*)(\2)/gi,
    async (match, prefix, quote, srcsetValue, suffixQuote) => {
      const entries = srcsetValue.split(',').map((entry) => entry.trim()).filter(Boolean);
      const rewrittenEntries = [];

      for (const entry of entries) {
        const [urlPart, ...descriptorParts] = entry.split(/\s+/);
        const newUrl = await addVersionToUrl(urlPart, htmlDir);
        rewrittenEntries.push([newUrl, ...descriptorParts].join(' ').trim());
      }

      return `${prefix}${quote}${rewrittenEntries.join(', ')}${suffixQuote}`;
    },
  );

  updated = await replaceAsync(
    updated,
    /(\b(?:href|src|data-src)\s*=\s*)(["'])([^"']+)(\2)/gi,
    async (match, prefix, quote, value, suffixQuote) => {
      const rewritten = await addVersionToUrl(value, htmlDir);
      return `${prefix}${quote}${rewritten}${suffixQuote}`;
    },
  );

  if (updated !== original) {
    await fs.writeFile(htmlPath, updated, 'utf8');
    return true;
  }

  return false;
}

async function replaceAsync(input, regex, replacer) {
  const matches = [...input.matchAll(regex)];
  if (matches.length === 0) return input;

  let output = '';
  let lastIndex = 0;
  for (const match of matches) {
    const [fullMatch] = match;
    const index = match.index ?? 0;
    output += input.slice(lastIndex, index);
    output += await replacer(...match);
    lastIndex = index + fullMatch.length;
  }
  output += input.slice(lastIndex);
  return output;
}

async function collectHtmlFiles(dirPath) {
  const out = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nested = await collectHtmlFiles(fullPath);
      out.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(fullPath);
    }
  }

  return out;
}

async function minifyCss(inputRel, outputRel) {
  const inputPath = path.join(ROOT, inputRel);
  const outputPath = path.join(ROOT, outputRel);
  const css = await fs.readFile(inputPath, 'utf8');
  const result = await transform(css, { loader: 'css', minify: true });
  await fs.writeFile(outputPath, result.code, 'utf8');
}

async function minifyJs(inputRel, outputRel, format = 'iife') {
  const inputPath = path.join(ROOT, inputRel);
  const outputPath = path.join(ROOT, outputRel);
  const code = await fs.readFile(inputPath, 'utf8');
  const result = await transform(code, {
    loader: 'js',
    minify: true,
    legalComments: 'none',
    target: 'es2018',
    format,
  });
  await fs.writeFile(outputPath, result.code, 'utf8');
}

async function buildCombinedCss() {
  const minifiedChunks = [];
  for (const [, outputRel] of cssTasks) {
    const css = await fs.readFile(path.join(ROOT, outputRel), 'utf8');
    minifiedChunks.push(css);
  }
  const result = await transform(minifiedChunks.join('\n'), { loader: 'css', minify: true });
  await fs.writeFile(path.join(ROOT, combinedCssOut), result.code, 'utf8');
}

async function runTailwindBuild() {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  await execFileAsync(npxCmd, [
    'tailwindcss',
    '-c', 'tailwind.config.js',
    '-i', 'assets/css/tailwind.input.css',
    '-o', 'assets/css/tailwind.css',
  ], { cwd: ROOT });
}

async function main() {
  console.log('[assets] Tailwind build...');
  await runTailwindBuild();

  console.log('[assets] Minifying CSS...');
  for (const [inputRel, outputRel] of cssTasks) {
    await minifyCss(inputRel, outputRel);
  }
  await buildCombinedCss();

  console.log('[assets] Minifying JS...');
  await minifyJs(jsSource, jsMin, 'iife');
  await minifyJs(jsSource, jsMinModule, 'esm');
  await fs.copyFile(path.join(ROOT, jsSource), path.join(ROOT, jsModule));

  console.log('[assets] Versioning HTML asset references...');
  const htmlFiles = await collectHtmlFiles(ROOT);
  let updatedCount = 0;
  for (const htmlFile of htmlFiles) {
    const changed = await rewriteHtmlWithVersions(htmlFile);
    if (changed) updatedCount += 1;
  }

  console.log(`[assets] Done. HTML updated: ${updatedCount}`);
}

main().catch((error) => {
  console.error('[assets] Build failed:', error);
  process.exit(1);
});

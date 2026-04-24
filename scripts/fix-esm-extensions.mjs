import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ESM_DIR = 'dist/esm';
const RELATIVE_IMPORT = /(from\s+|import\s*\()(['"])(\.{1,2}\/[^'"]+?)\2/g;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js') || p.endsWith('.d.ts')) fix(p);
  }
}

function fix(file) {
  const src = readFileSync(file, 'utf8');
  const out = src.replace(RELATIVE_IMPORT, (match, pre, quote, path) => {
    if (/\.(m?js|json|node)$/.test(path)) return match;
    return `${pre}${quote}${path}.js${quote}`;
  });
  if (out !== src) writeFileSync(file, out);
}

walk(ESM_DIR);

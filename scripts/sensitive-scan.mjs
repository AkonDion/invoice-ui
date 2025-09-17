import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PATTERNS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apikey',
  'authorization',
  'bearer',
  'cookie',
  'set-cookie',
  'session',
  'helcim',
  'stripe',
  'quickbooks',
  'zoho',
  'supabase',
  'key=',
  'sk_live',
  'pk_live',
  'test_',
  'card',
  'cvv',
  'cvc',
  'iban',
  'routing',
  'transit',
  'ach',
  'sin',
  'ssn'
].map((p) => new RegExp(p, 'i'));

const TARGET_DIRS = ['components', 'app', 'lib'];
const matches = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      if (filePath.includes(`${join('app','api')}`)) continue;
      walk(filePath);
    } else if (/\.(t|j)sx?$/.test(entry)) {
      const content = readFileSync(filePath, 'utf8');
      for (const pattern of PATTERNS) {
        if (pattern.test(content)) {
          matches.push({ file: filePath, pattern: pattern.source });
        }
      }
    }
  }
}

for (const dir of TARGET_DIRS) {
  if (existsSync(dir)) walk(dir);
}

if (matches.length) {
  console.error('Sensitive strings found:');
  for (const m of matches) {
    console.error(` - ${m.file} matches /${m.pattern}/i`);
  }
  process.exit(1);
} else {
  console.log('No sensitive strings found.');
}

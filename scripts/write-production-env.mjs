import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] === 'development' ? 'development' : 'production';
const localEnv = join(root, '.env.local');

if (existsSync(localEnv)) {
  for (const line of readFileSync(localEnv, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}

const required = ['GRIDKING_API_URL', 'GRIDKING_WS_URL'];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
if (mode === 'production' && !process.env.GRIDKING_API_URL.startsWith('https://')) throw new Error('GRIDKING_API_URL must use HTTPS in production.');
if (mode === 'production' && !process.env.GRIDKING_WS_URL.startsWith('wss://')) throw new Error('GRIDKING_WS_URL must use WSS in production.');

const output = join(root, 'src', 'environments', `environment.${mode === 'production' ? 'production' : 'local'}.ts`);
mkdirSync(dirname(output), { recursive: true });
const url = (name) => JSON.stringify(process.env[name].replace(/\/+$/, ''));
writeFileSync(output, `export const environment = {
  production: ${mode === 'production'},
  apiUrl: ${url('GRIDKING_API_URL')},
  wsUrl: ${url('GRIDKING_WS_URL')},
};
`);
console.log(`Wrote ${output}`);

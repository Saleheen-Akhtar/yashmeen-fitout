import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

export const WEB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BUILD_ENV_KEYS = ['VITE_SITE_URL', 'VITE_NOINDEX', 'SITEMAP_API_URL', 'PRERENDER_DATA_FILE'];

// Match Vite's production file precedence while preserving explicit shell overrides.
export function readBuildEnvironment(root = WEB_ROOT) {
  const values = loadEnv('production', root, '');
  return Object.fromEntries(BUILD_ENV_KEYS.map(key => [key, process.env[key] ?? values[key] ?? '']));
}

export const buildEnv = readBuildEnvironment();

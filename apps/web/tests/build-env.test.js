import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BUILD_ENV_KEYS, readBuildEnvironment } from '../scripts/build-env.mjs';

test('SEO and prerender environment follows production files and explicit shell overrides', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yashmeen-build-env-'));
  const saved = Object.fromEntries(BUILD_ENV_KEYS.map(key => [key, process.env[key]]));
  try {
    for (const key of BUILD_ENV_KEYS) delete process.env[key];
    fs.writeFileSync(path.join(root, '.env'), 'VITE_SITE_URL=https://base.example\nSITEMAP_API_URL=https://cms.example/api\nVITE_NOINDEX=false\nPRERENDER_DATA_FILE="fixtures/cms data.json"\nUNRELATED_SECRET=excluded\n');
    fs.writeFileSync(path.join(root, '.env.production'), 'VITE_SITE_URL=https://production.example\n');
    fs.writeFileSync(path.join(root, '.env.production.local'), 'VITE_SITE_URL=https://local.example\nVITE_NOINDEX=true\n');
    assert.deepEqual(readBuildEnvironment(root), {
      VITE_SITE_URL: 'https://local.example', VITE_NOINDEX: 'true', SITEMAP_API_URL: 'https://cms.example/api', PRERENDER_DATA_FILE: 'fixtures/cms data.json',
    });
    process.env.VITE_SITE_URL = 'https://shell.example';
    process.env.SITEMAP_API_URL = '';
    process.env.PRERENDER_DATA_FILE = '/absolute/cms.json';
    const overrides = readBuildEnvironment(root);
    assert.equal(overrides.VITE_SITE_URL, 'https://shell.example');
    assert.equal(overrides.SITEMAP_API_URL, '');
    assert.equal(overrides.PRERENDER_DATA_FILE, '/absolute/cms.json');
    assert.equal(overrides.UNRELATED_SECRET, undefined);
  } finally {
    for (const key of BUILD_ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
});

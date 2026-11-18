import { test } from 'node:test';
import assert from 'node:assert/strict';
import { open, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';
import { resolveMediaUrl } from '../src/lib/media.js';
import media from '../src/lib/legacyMedia.json' with { type: 'json' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('legacy media variants resolve to actual restored, browser-compatible images', async () => {
  assert.equal(Object.keys(media).length, 260);
  for (const [legacy, url] of Object.entries(media)) {
    assert.equal(resolveMediaUrl(legacy), url);
    assert.equal(resolveMediaUrl(`/uploads${legacy}`), url);
    assert.equal(resolveMediaUrl(`/backend/uploads${legacy}`), url);
    const file = await open(path.join(root, 'public', url));
    try {
      const bytes = Buffer.alloc(12);
      await file.read(bytes, 0, 12, 0);
      assert.ok((bytes[0] === 0xff && bytes[1] === 0xd8) || bytes.subarray(1, 4).toString() === 'PNG' || bytes.subarray(8, 12).toString() === 'WEBP', url);
    } finally { await file.close(); }
  }
});

test('new uploads and external media keep their configured origin without duplicate prefixes', () => {
  assert.equal(resolveMediaUrl('/uploads/projects/new.jpg', 'https://media.example/uploads/'), 'https://media.example/uploads/projects/new.jpg');
  assert.equal(resolveMediaUrl('https://images.example/photo.jpg'), 'https://images.example/photo.jpg');
  assert.equal(resolveMediaUrl('/static/studio.jpg'), '/static/studio.jpg');
  assert.equal(resolveMediaUrl(null), '');
});

test('each SSR render uses its own CMS snapshot and leaves cookie preference for hydration', async () => {
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
    for (const mobile of ['+971 50 111 1111', '+971 50 222 2222']) {
      const html = await render('/about', { webDetails: { mobile }, projects: [], posts: [] });
      assert.ok(html.includes(mobile), 'SSR must use the current render, not module initialization data');
      assert.ok(!html.includes('class="cookie-consent"'), 'Stored cookie preferences must not change the first client render');
    }
  } finally { await vite.close(); }
});

test('project and photo galleries do not share persisted cache keys', async () => {
  const { CACHE_KEYS } = await import('../src/lib/publicCache.js');
  assert.notEqual(CACHE_KEYS.PROJECTS, CACHE_KEYS.GALLERY);
  const project = await readFile(path.join(root, 'src/pages/public/projects/Project.jsx'), 'utf8');
  const gallery = await readFile(path.join(root, 'src/pages/public/media/PhotoGallery.jsx'), 'utf8');
  assert.ok(project.includes(CACHE_KEYS.PROJECTS));
  assert.ok(gallery.includes(CACHE_KEYS.GALLERY));
});

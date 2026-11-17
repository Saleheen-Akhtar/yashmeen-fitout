import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { verifyPrerenderOutput } from '../scripts/verify-prerender.mjs';

function withOutput(check) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'yashmeen-prerender-'));
  const html = '<html><head><title>Completed project</title><link rel="canonical" href="https://example.com/project"><script id="yashmeen-structured-data" type="application/ld+json">{}</script></head><body><main><h1>Completed fit-out project</h1><p>Completed site delivery with project details and photographs.</p></main><script>window.__YASHMEEN_PRERENDER__={"webDetails":{"pageCopy":{"loading_articles":"Loading articles…"}}}</script></body></html>';
  try {
    for (const file of ['index.html', 'about.html', 'services/interior-design.html', 'projects.html', 'blogs.html', 'project/details/fixture.html', 'blog/details/fixture.html']) {
      const target = path.join(directory, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html);
    }
    check(directory, html);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

test('completed CMS pages pass even when hydration data includes loading copy', () => {
  withOutput(directory => assert.doesNotThrow(() => verifyPrerenderOutput(directory)));
});

test('visible CMS loading states still fail verification', () => {
  withOutput((directory, html) => {
    fs.writeFileSync(path.join(directory, 'project/details/fixture.html'), html.replace(/<main>[\s\S]*?<\/main>/, '<main><div class="status">Loading project…</div></main>'));
    assert.throws(() => verifyPrerenderOutput(directory), /not crawler-readable/);
  });
});

test('hidden streaming placeholders still fail verification', () => {
  withOutput((directory, html) => {
    fs.writeFileSync(path.join(directory, 'blog/details/fixture.html'), html.replace('</body>', '<div hidden id="S:0">Deferred article</div></body>'));
    assert.throws(() => verifyPrerenderOutput(directory), /incomplete page content/);
  });
});

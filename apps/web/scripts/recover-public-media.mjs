// Recover exact, publicly published legacy assets. No CMS records are changed.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '../..');
const origin = 'https://www.yfbfitoutcontracting.com/backend/uploads';
const projects = JSON.parse(await readFile(path.join(repoRoot, 'audit/media-projects.json'), 'utf8')).data;
const gallery = JSON.parse(await readFile(path.join(repoRoot, 'audit/media-gallery.json'), 'utf8')).data;
const refs = [...new Set([...projects.flatMap(p => p.images || []), ...gallery.map(p => p.photo)].filter(Boolean))].sort();
const manifest = {};
const failures = [];
let cursor = 0;
async function worker() {
  while (cursor < refs.length) {
    const ref = refs[cursor++];
    const relative = ref.replace(/^\/+/, '').replace(/^uploads\//, '');
    if (!/^(projects|gallery)\/[\w.-]+\.(jpe?g|png|webp|heic|heif)$/i.test(relative)) { failures.push(ref); continue; }
    const needsConversion = /\.hei[cf]$/i.test(relative);
    const browserPath = needsConversion ? relative.replace(/\.hei[cf]$/i, '.jpg') : relative;
    const destination = path.join(webRoot, 'public/images/legacy', browserPath);
    try {
      let bytes;
      try { bytes = await readFile(destination); } catch {
        const response = await fetch(`${origin}/${relative}`, { signal: AbortSignal.timeout(30000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`HTTP ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer());
      }
      if (needsConversion && bytes.subarray(4, 8).toString() === 'ftyp') {
        const originals = path.join(repoRoot, 'audit/recovered-originals');
        await mkdir(originals, { recursive: true });
        const original = path.join(originals, path.basename(relative));
        await writeFile(original, bytes);
        await mkdir(path.dirname(destination), { recursive: true });
        await promisify(execFile)('ffmpeg', ['-v', 'error', '-y', '-i', original, '-frames:v', '1', '-q:v', '2', destination]);
        bytes = await readFile(destination);
      }
      const image = (bytes[0] === 0xff && bytes[1] === 0xd8) || bytes.subarray(1, 4).toString() === 'PNG' || bytes.subarray(8, 12).toString() === 'WEBP';
      if (!image) throw new Error('Invalid image signature');
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
      manifest[`/${relative}`] = `/images/legacy/${browserPath}`;
    } catch (error) { failures.push({ ref, error: error.message }); }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(path.join(webRoot, 'src/lib/legacyMedia.json'), `${JSON.stringify(sorted, null, 2)}\n`);
await writeFile(path.join(repoRoot, 'audit/media-recovery.json'), `${JSON.stringify({ origin, requested: refs.length, recovered: Object.keys(sorted).length, failures }, null, 2)}\n`);
console.log(JSON.stringify({ requested: refs.length, recovered: Object.keys(sorted).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;

// Reference inventory only. CMS snapshots can be stale, so this never deletes media.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const staticRoot = path.join(root, 'apps/web/public/static');
function collect(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(file) : /\.(?:js|jsx|ts|tsx|css|json|html|svg)$/.test(entry.name) ? [file] : [];
  });
}
const currentFiles = ['apps/web/src', 'shared', 'apps/web/tests/fixtures'].flatMap(directory => collect(path.join(root, directory)));
const snapshotFiles = ['media-gallery.json', 'media-projects.json', 'media-posts.json'].map(name => path.join(root, 'audit', name)).filter(file => fs.existsSync(file));
if (process.env.CMS_SNAPSHOT_FILE) snapshotFiles.push(path.resolve(process.env.CMS_SNAPSHOT_FILE));
const contents = [...currentFiles, ...snapshotFiles].map(file => ({ file: path.relative(root, file).replaceAll('\\', '/'), text: fs.readFileSync(file, 'utf8'), snapshot: snapshotFiles.includes(file) }));
const assets = fs.readdirSync(staticRoot).map(name => {
  const matches = contents.filter(item => item.text.includes(`/static/${name}`));
  const currentReferences = matches.filter(item => !item.snapshot).map(item => item.file);
  const snapshotReferences = matches.filter(item => item.snapshot).map(item => item.file);
  return { path: `/static/${name}`, bytes: fs.statSync(path.join(staticRoot, name)).size, status: currentReferences.length ? 'referenced' : snapshotReferences.length ? 'snapshot-reference' : 'unverified-candidate', currentReferences, snapshotReferences };
});
const report = { generatedAt: new Date().toISOString(), note: process.env.CMS_SNAPSHOT_FILE ? 'Reference check includes a current read-only CMS snapshot.' : 'No current CMS snapshot supplied; source-unreferenced assets still require a current CMS check.', counts: Object.fromEntries(['referenced', 'snapshot-reference', 'unverified-candidate'].map(status => [status, assets.filter(asset => asset.status === status).length])), assets };
fs.writeFileSync(path.join(root, 'audit/static-asset-inventory.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.counts));

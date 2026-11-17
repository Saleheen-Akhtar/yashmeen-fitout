import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const requiredRoutes = ['index.html', 'about.html', 'services/interior-design.html', 'projects.html', 'blogs.html'];
const renderedText = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const htmlFiles = directory => fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
  const file = path.join(directory,entry.name);
  return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
});
export function verifyPrerenderOutput(dist) {
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file,'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main || html.includes('id="S:') || (main.includes('aria-label="Loading content"') && !/<h[12]\b/i.test(main))) {
      throw new Error(`[prerender:verify] ${path.relative(dist,file)} contains incomplete page content`);
    }
  }

  for (const relative of requiredRoutes) {
    const file = path.join(dist, relative);
    if (!fs.existsSync(file)) throw new Error(`[prerender:verify] missing ${relative}`);
    const html = fs.readFileSync(file, "utf8");
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main || renderedText(main).length < 30 || !/<h[12]\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h[12]>/i.test(main)) throw new Error(`[prerender:verify] ${relative} has no meaningful rendered main content`);
    if (/Loading (?:projects|articles|article|gallery)/i.test(renderedText(main))) throw new Error(`[prerender:verify] ${relative} contains a loading placeholder`);
    if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`[prerender:verify] ${relative} has no title`);
    if (!/<link rel="canonical" href="https:\/\//i.test(html)) throw new Error(`[prerender:verify] ${relative} has no absolute canonical`);
    if (!/<meta name="robots" content="noindex/i.test(html) && !/<script id="yashmeen-structured-data" type="application\/ld\+json">/i.test(html)) throw new Error(`[prerender:verify] ${relative} has no route JSON-LD`);
    if (!/window\.__YASHMEEN_PRERENDER__=/.test(html)) throw new Error(`[prerender:verify] ${relative} has no hydration data`);
  }

  for (const group of ["project/details", "blog/details", "services"]) {
    const root = path.join(dist, group);
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      const file = path.join(root, entry.name);
      const html = fs.readFileSync(file, "utf8");
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
      if (!main || /Loading (?:project|article)/i.test(renderedText(main))) {
        throw new Error(`[prerender:verify] ${group}/${entry.name} is not crawler-readable`);
      }
      if (!/<meta name="robots" content="noindex/i.test(html) && !/application\/ld\+json/.test(html)) throw new Error(`[prerender:verify] ${group}/${entry.name} has no JSON-LD`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyPrerenderOutput(path.join(here, "..", "dist"));
  console.log(`[prerender:verify] verified ${requiredRoutes.length} core routes and crawler-readable CMS detail output`);
}

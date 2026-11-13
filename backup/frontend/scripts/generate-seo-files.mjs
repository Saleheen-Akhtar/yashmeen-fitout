// Generates public/sitemap.xml and public/robots.txt before every build.
// - Static routes come from ROUTE_SEO (anything not marked noindex).
// - Project and blog URLs are added when the API is reachable at build time
//   (set SITEMAP_API_URL, e.g. https://your-api.example.com/api). If it is not,
//   the build continues with static routes only.
// - The site origin comes from VITE_SITE_URL so moving to the real domain is one env var.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTE_SEO, SITE_URL as DEFAULT_SITE_URL } from "../src/lib/seoConfig.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "..", "public");
const SITE_URL = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
const API = (process.env.SITEMAP_API_URL || "").replace(/\/+$/, "");

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const today = new Date().toISOString().slice(0, 10);

const entries = [];
for (const [route, seo] of Object.entries(ROUTE_SEO)) {
  if (route.includes(":") || route.includes("*")) continue;
  if (/noindex/i.test(seo?.robots || "")) continue;
  entries.push({
    loc: route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`,
    priority: route === "/" ? "1.0" : route === "/projects" || route === "/contact" ? "0.9" : "0.7",
    changefreq: route === "/" || route === "/projects" || route === "/blogs" ? "weekly" : "monthly",
  });
}

async function fetchList(endpoint) {
  if (!API) return [];
  try {
    const res = await fetch(`${API}${endpoint}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (err) {
    console.warn(`[seo] skipped ${endpoint}: ${err.message}`);
    return [];
  }
}

const projects = await fetchList("/project/getAll");
const posts = await fetchList("/post/getActivePosts");
for (const p of projects) if (p?._id) entries.push({ loc: `${SITE_URL}/project/details/${p._id}`, priority: "0.6", changefreq: "monthly", lastmod: p.updatedAt?.slice?.(0, 10) });
for (const p of posts) if (p?._id) entries.push({ loc: `${SITE_URL}/blog/details/${p._id}`, priority: "0.5", changefreq: "monthly", lastmod: p.updatedAt?.slice?.(0, 10) });

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries
    .map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod || today}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`)
    .join("\n") +
  `\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /dashboard/\nDisallow: /login\nDisallow: /forgot-password\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);
console.log(`[seo] sitemap: ${entries.length} URLs (${projects.length} projects, ${posts.length} posts) -> ${SITE_URL}`);

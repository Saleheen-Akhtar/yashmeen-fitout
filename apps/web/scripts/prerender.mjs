import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { resolveMediaUrl } from '../src/lib/media.js';
import { ROUTE_SEO, SITE_NAME, SITE_URL as DEFAULT_SITE_URL, getRobotsDirective, getRouteJsonLd, getRouteSeo } from "../src/lib/seoConfig.js";
import { buildEnv } from './build-env.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(here, "..");
const distDir = path.join(webRoot, "dist");
const SITE_URL = (buildEnv.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
const API = buildEnv.SITEMAP_API_URL.replace(/\/+$/, "");
const forceNoindex = buildEnv.VITE_NOINDEX === "true";
const DATA_FILE = buildEnv.PRERENDER_DATA_FILE
  ? path.resolve(webRoot, buildEnv.PRERENDER_DATA_FILE)
  : "";
const fixtureData = DATA_FILE && fs.existsSync(DATA_FILE)
  ? JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
  : null;

const templatePath = path.join(distDir, "index.html");
if (!fs.existsSync(templatePath)) throw new Error("[prerender] dist/index.html not found");
const baseHtml = fs.readFileSync(templatePath, "utf8");

const fetchData = async (endpoint) => {
  if (!API) return null;
  try {
    const response = await fetch(`${API}${endpoint}`, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    return body?.data ?? body;
  } catch (error) {
    console.warn(`[prerender] ${endpoint} unavailable: ${error.message}`);
    return null;
  }
};

const [webDetails, projectList, postList] = fixtureData
  ? [fixtureData.webDetails || null, fixtureData.projects || [], fixtureData.posts || []]
  : await Promise.all([
      fetchData("/webDetails/details"),
      fetchData("/project/getAll"),
      fetchData("/post/getActivePosts"),
    ]);
const projects = Array.isArray(projectList) ? projectList : [];
const posts = Array.isArray(postList) ? postList.filter((post) => post?.status === true) : [];

const routes = [
  ...Object.keys(ROUTE_SEO).filter((route) => !route.includes(":") && !route.includes("*")),
  ...projects.filter((project) => project?._id).map((project) => `/project/details/${project._id}`),
  ...posts.filter((post) => post?._id).map((post) => `/blog/details/${post._id}`),
  ...(webDetails?.services || []).filter(service => service.active !== false && /^\/services\/[a-z0-9-]+$/.test(service.route || '')).map(service => service.route),
];

const escapeAttr = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
const plainText = (value = "") => String(value).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const absoluteImage = (value) => {
  const resolved = resolveMediaUrl(value) || '/static/hero-aperture-v2.webp';
  return /^https?:/i.test(resolved) ? resolved : `${SITE_URL}${resolved}`;
};
const serialize = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const metadataFor = (route, data) => {
  const configured = getRouteSeo(route, data.webDetails);
  if (data.project) {
    return {
      ...configured,
      title: `${data.project.title || "Project Case Study"} | Yashmeen Fit-Out Dubai`,
      description: plainText(data.project.description || data.project.scope || `Fit-out case study for ${data.project.title || "a completed project"} in Dubai.`).slice(0, 160),
      image: data.project.images?.[0],
    };
  }
  if (data.post) {
    return {
      ...configured,
      title: `${data.post.title || "Article"} | Yashmeen Fit-Out Dubai`,
      description: plainText(data.post.content).slice(0, 160),
      image: data.post.file,
    };
  }
  return configured;
};

const jsonLdFor = (route, data) => {
  if (route === "/") return getRouteJsonLd(route, data.webDetails, SITE_URL);
  if (data.project) return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: data.project.title,
    description: plainText(data.project.description || data.project.scope),
    image: (data.project.images || []).map(absoluteImage),
    url: `${SITE_URL}${route}`,
  };
  if (data.post) return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.post.title,
    description: plainText(data.post.content).slice(0, 160),
    image: absoluteImage(data.post.file),
    datePublished: data.post.createdAt,
    dateModified: data.post.updatedAt,
    mainEntityOfPage: `${SITE_URL}${route}`,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
  return getRouteJsonLd(route, data.webDetails, SITE_URL);
};

const applyHead = (html, route, seo, jsonLd) => {
  const canonicalUrl = `${SITE_URL}${route === "/" ? "/" : route}`;
  const title = seo.title || `${SITE_NAME} | Dubai`;
  const description = seo.description || "Turnkey fit-out contractor and interior architecture studio in Dubai.";
  const robots = getRobotsDirective(seo.robots, forceNoindex);
  const image = absoluteImage(seo.image);
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttr(description)}" />`);
  html = html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${robots}" />`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttr(title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttr(description)}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
  if (jsonLd) html = html.replace("</head>", `<script id="yashmeen-structured-data" type="application/ld+json">${serialize(jsonLd)}</script>\n</head>`);
  return html;
};

const writeRoute = (route, html) => {
  if (route === "/") {
    fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");
    return;
  }
  const clean = route.replace(/^\/+/, "");
  fs.mkdirSync(path.dirname(path.join(distDir, `${clean}.html`)), { recursive: true });
  fs.writeFileSync(path.join(distDir, `${clean}.html`), html, "utf8");
};

const vite = await createServer({ root: webRoot, mode: 'production', server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");
  for (const route of [...new Set(routes)]) {
    const data = {
      webDetails,
      projects,
      posts,
      project: projects.find((project) => route === `/project/details/${project._id}`) || null,
      post: posts.find((post) => route === `/blog/details/${post._id}`) || null,
    };
    const markup = await render(route, data);
    let html = baseHtml.replace('<div id="root"></div>', `<div id="root">${markup}</div>\n<script>window.__YASHMEEN_PRERENDER__=${serialize(data)}</script>`);
    const seo = metadataFor(route, data);
    html = applyHead(html, route, seo, jsonLdFor(route, data));
    writeRoute(route, html);
  }

  const notFoundData = { webDetails, projects, posts, project: null, post: null };
  const notFoundMarkup = await render("/__not-found__", notFoundData);
  let notFoundHtml = baseHtml.replace('<div id="root"></div>', `<div id="root">${notFoundMarkup}</div>\n<script>window.__YASHMEEN_PRERENDER__=${serialize(notFoundData)}</script>`);
  notFoundHtml = applyHead(notFoundHtml, "/404", {
    title: "404 - Page Not Found | Yashmeen Fit-Out Dubai",
    description: "The requested page does not exist.",
    robots: "noindex, follow",
  }, null);
  fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml, "utf8");
} finally {
  await vite.close();
}

console.log(`[prerender] generated ${new Set(routes).size + 1} hydrated HTML pages (${projects.length} projects, ${posts.length} posts)`);

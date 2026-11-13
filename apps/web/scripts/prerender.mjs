// Prerenders static HTML files for all public routes into dist/
// Allows AI agents, web crawlers, and search engines to read the complete website without executing JavaScript.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTE_SEO, HOME_JSON_LD, SITE_NAME, SITE_URL as DEFAULT_SITE_URL } from "../src/lib/seoConfig.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(here, "..", "dist");
const SITE_URL = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

if (!fs.existsSync(distDir)) {
  console.error("[prerender] dist/ directory not found. Please run vite build first.");
  process.exit(1);
}

const templatePath = path.join(distDir, "index.html");
if (!fs.existsSync(templatePath)) {
  console.error("[prerender] dist/index.html not found.");
  process.exit(1);
}

const baseHtml = fs.readFileSync(templatePath, "utf8");

function renderRouteHtml(route, seo) {
  const canonicalUrl = `${SITE_URL}${route === "/" ? "/" : route}`;
  const title = seo.title || `${SITE_NAME} | Dubai`;
  const description = seo.description || "Turnkey fit-out contractor and interior architecture studio in Dubai.";
  const image = seo.image ? (seo.image.startsWith("http") ? seo.image : `${SITE_URL}${seo.image}`) : `${SITE_URL}/static/hero-aperture-v2.webp`;
  const robots = seo.robots || "index, follow";

  let html = baseHtml;

  // Title
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);

  // Meta description & robots
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${robots}" />`);

  // Canonical link
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

  // Open Graph
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);

  // Structured Data (JSON-LD)
  const jsonLd = route === "/" ? `<script type="application/ld+json">${JSON.stringify(HOME_JSON_LD)}</script>` : "";
  if (jsonLd) {
    html = html.replace("</head>", `${jsonLd}\n</head>`);
  }

  // Fallback crawlable text for plain HTTP agents & non-JS scrapers
  const noscriptFallback = `
    <noscript>
      <div style="padding: 40px; font-family: sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <h1>${title}</h1>
        <p>${description}</p>
        <p>Operating an in-house 35,000 sq.ft Al Quoz manufacturing facility. One accountable contractor delivering turnkey architectural fit-out across Dubai and the UAE.</p>
        <p><strong>Official Hotline:</strong> +971 54 386 2870 | <strong>Email:</strong> info@yfbfitoutcontracting.com</p>
        <nav style="margin-top: 20px;">
          <a href="/">Home</a> · <a href="/projects">Selected Projects</a> · <a href="/about">About Studio</a> · <a href="/services/architecture">Architecture & Approvals</a> · <a href="/services/interior-design">Interior Design</a> · <a href="/services/construction">Construction & MEP</a> · <a href="/services/office-renovation">Office Renovation</a> · <a href="/contact">Contact</a> · <a href="/quote">Request Quote</a>
        </nav>
      </div>
    </noscript>`;

  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n${noscriptFallback}`);

  return html;
}

let generatedCount = 0;

for (const [route, seo] of Object.entries(ROUTE_SEO)) {
  if (route.includes(":") || route.includes("*")) continue;

  const targetHtml = renderRouteHtml(route, seo);
  let targetFile;

  if (route === "/") {
    targetFile = path.join(distDir, "index.html");
    fs.writeFileSync(targetFile, targetHtml, "utf8");
  } else {
    const cleanRoute = route.replace(/^\/+/, "");
    const routeDir = path.join(distDir, cleanRoute);
    fs.mkdirSync(routeDir, { recursive: true });
    targetFile = path.join(routeDir, "index.html");
    fs.writeFileSync(targetFile, targetHtml, "utf8");

    // Also write flat .html file for hosts/proxies that don't append /index.html automatically
    const flatFile = path.join(distDir, `${cleanRoute}.html`);
    fs.mkdirSync(path.dirname(flatFile), { recursive: true });
    fs.writeFileSync(flatFile, targetHtml, "utf8");
  }
  generatedCount += 1;
}

// Write 404.html
const notFoundSeo = {
  title: "404 - Page Not Found | Yashmeen Fit-Out Dubai",
  description: "The page or URL you requested does not exist on this site. Explore our completed fit-out works or return to the homepage.",
  robots: "noindex, follow",
};
fs.writeFileSync(path.join(distDir, "404.html"), renderRouteHtml("/404", notFoundSeo), "utf8");
generatedCount += 1;

console.log(`[prerender] Successfully generated ${generatedCount} static HTML pages in dist/`);

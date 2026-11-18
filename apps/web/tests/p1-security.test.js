import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeBlogHtml } from "../src/lib/sanitizeBlogHtml.js";
import { ROUTE_SEO, SITE_URL, getRobotsDirective, getRouteJsonLd, getRouteSeo } from "../src/lib/seoConfig.js";

const here = path.dirname(fileURLToPath(import.meta.url));

describe("P1 browser rendering defenses", () => {
  it("removes executable blog markup during server rendering too", () => {
    const clean = sanitizeBlogHtml(
      '<p>Safe copy</p><img src="https://example.com/image.jpg" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">bad</a>',
    );
    assert.match(clean, /Safe copy/);
    assert.doesNotMatch(clean, /onerror|<script|javascript:/i);
  });

  it("uses the official canonical default and excludes stale experience routes", () => {
    assert.equal(SITE_URL, "https://www.yfbfitoutcontracting.com");
    assert.equal(Object.hasOwn(ROUTE_SEO, "/experience"), false);
  });

  it("keeps reset tokens in the POST body contract", () => {
    const apiSource = fs.readFileSync(path.join(here, "..", "src", "services", "api.js"), "utf8");
    assert.match(apiSource, /resetPassword:\s*\(data\)\s*=>\s*api\.post\("\/account\/reset-password",\s*data\)/);
    assert.doesNotMatch(apiSource, /reset-password\?token/);
  });

  it("generates route-specific structured data for public pages", () => {
    assert.equal(getRouteJsonLd("/services/interior-design")?.["@type"], "Service");
    assert.equal(getRouteJsonLd("/projects")?.["@type"], "CollectionPage");
    assert.equal(getRouteJsonLd("/about")?.["@type"], "WebPage");
    assert.equal(getRouteJsonLd("/login"), null);
  });

  it("preview indexing protection overrides route and CMS directives without changing production rules", () => {
    for (const route of ["/", "/about", "/projects", "/project/details/fixture-project", "/blog/details/fixture-post", "/login", "/missing-page"]) {
      const robots = getRouteSeo(route).robots;
      assert.equal(getRobotsDirective(robots, true), "noindex, nofollow");
      assert.equal(getRobotsDirective(robots, false), robots);
    }
    assert.equal(getRobotsDirective("index, follow", true), "noindex, nofollow");
    assert.equal(getRobotsDirective("noindex, follow", false), "noindex, follow");
  });
});

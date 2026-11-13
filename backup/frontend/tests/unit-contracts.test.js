import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  formatDate,
  formatDateTime,
  truncateText,
  getInitials,
  calculateAverageRating,
  getRatingDistribution,
  tokenExpired,
  getDubaiAtelierStatus,
} from "../src/lib/helpers.js";
import { getRouteSeo, normalizePathname } from "../src/lib/seoConfig.js";
import {
  CACHE_KEYS,
  subscribeCacheInvalidation,
  clearProjectsCache,
  clearProjectDetailsCache,
  clearGalleryCache,
  clearVacancyCache,
  clearVideoGalleryCache,
  clearPostsCache,
} from "../src/lib/publicCache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const BACKEND_ROOT = path.resolve(__dirname, "../../backend");

const readFrontend = (rel) => fs.readFileSync(path.join(FRONTEND_ROOT, rel), "utf8");
const readBackend = (rel) => fs.readFileSync(path.join(BACKEND_ROOT, rel), "utf8");

describe("Layer 2A: libs/helpers.js pure unit tests", () => {
  it("formatDate formats ISO dates in long month format", () => {
    const out = formatDate("2026-03-15T12:00:00Z");
    assert.match(out, /2026/);
    assert.match(out, /March/);
    assert.match(out, /15/);
  });

  it("formatDateTime includes year, short month, day, and time", () => {
    const out = formatDateTime("2026-03-15T14:30:00Z");
    assert.match(out, /2026/);
    assert.match(out, /Mar/);
    assert.match(out, /15/);
  });

  it("truncateText keeps text <= maxLength unchanged and truncates longer strings", () => {
    assert.equal(truncateText("Short", 10), "Short");
    assert.equal(truncateText("ExactLen", 8), "ExactLen");
    assert.equal(truncateText("Architectural Fit-Out Studio", 13), "Architectural...");
  });

  it("getInitials computes up to 2 uppercase initials and handles empty inputs", () => {
    assert.equal(getInitials(""), "");
    assert.equal(getInitials(null), "");
    assert.equal(getInitials("Yashmeen"), "Y");
    assert.equal(getInitials("Yashmeen Future Building"), "YF");
  });

  it("calculateAverageRating handles empty inputs and averages numeric ratings", () => {
    assert.equal(calculateAverageRating([]), 0);
    assert.equal(calculateAverageRating(null), 0);
    assert.equal(calculateAverageRating([{ rating: 5 }, { rating: 4 }]), "4.5");
  });

  it("getRatingDistribution tallies ratings 1..5 and computes percentages", () => {
    const emptyDist = getRatingDistribution([]);
    assert.equal(emptyDist.length, 5);
    assert.ok(emptyDist.every((d) => d.count === 0 && d.percentage === 0));

    const dist = getRatingDistribution([
      { rating: 5 },
      { rating: 5 },
      { rating: 3 },
      { rating: 1 },
    ]);
    const five = dist.find((d) => d.rating === 5);
    const three = dist.find((d) => d.rating === 3);
    assert.equal(five.count, 2);
    assert.equal(five.percentage, 50);
    assert.equal(three.count, 1);
    assert.equal(three.percentage, 25);
  });

  it("tokenExpired clears stored user on real backend auth.js 401 messages", () => {
    const authSrc = readBackend("middlewares/auth.js");
    // Extract exact messages sent with 401 by middlewares/auth.js
    const backendAuthMessages = [
      "Not authorized, no token provided",
      "Account not found",
      "Session expired, please log in again",
      "Not authorized, invalid or expired token",
    ];
    for (const msg of backendAuthMessages) {
      assert.ok(authSrc.includes(msg), `Expected auth.js to emit "${msg}"`);
    }

    let removedKeys = [];
    const reloadState = { reloaded: false };
    globalThis.localStorage = {
      removeItem: (k) => removedKeys.push(k),
    };
    globalThis.window = {
      location: {
        reload: () => {
          reloadState.reloaded = true;
        },
      },
    };

    try {
      for (const msg of backendAuthMessages) {
        removedKeys = [];
        reloadState.reloaded = false;
        tokenExpired(msg);
        assert.ok(
          removedKeys.includes("user") && reloadState.reloaded,
          `tokenExpired failed to handle backend auth message: "${msg}"`
        );
      }
    } finally {
      delete globalThis.localStorage;
      delete globalThis.window;
    }
  });
});

describe("Layer 2B: Storage resilience & environment config parity", () => {
  it("store/index.js guards JSON.parse(localStorage.getItem('user')) against corrupt JSON", () => {
    const storeSrc = readFrontend("src/store/index.js");
    const hasTryCatch = /try\s*\{[\s\S]*localStorage\.getItem\(["']user["']\)/m.test(storeSrc);
    assert.ok(
      hasTryCatch,
      "store/index.js calls unguarded JSON.parse(localStorage.getItem('user')) which crashes app startup on malformed storage"
    );
  });

  it("services/api.js guards JSON.parse(localStorage.getItem('user')) in request interceptor", () => {
    const apiSrc = readFrontend("src/services/api.js");
    const hasTryCatch = /try\s*\{[\s\S]*localStorage\.getItem\(["']user["']\)/m.test(apiSrc);
    assert.ok(
      hasTryCatch,
      "services/api.js calls unguarded JSON.parse(localStorage.getItem('user')) in Axios interceptor"
    );
  });

  it("useWebsiteContent.js merges partial remote payloads cleanly with defaults", () => {
    const hookSrc = readFrontend("src/hooks/useWebsiteContent.js");
    assert.ok(hookSrc.includes("DEFAULT_WEBSITE_CONTENT"));
    assert.ok(hookSrc.includes("function mergeContent(remote)"));
    assert.match(hookSrc, /Array\.isArray\(remote\.services\)\s*&&\s*remote\.services\.length\s*>\s*0/);
    assert.match(hookSrc, /Array\.isArray\(remote\.processSteps\)\s*&&\s*remote\.processSteps\.length\s*>\s*0/);
  });

  it("backend .env.example documents the exact environment variable names read by server code", () => {
    const envExample = readBackend(".env.example");
    const exampleKeys = new Set(
      envExample
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => l.split("=")[0].trim())
    );

    const requiredRuntimeKeys = ["JWT_EXPIRES_IN", "CLIENT_URL", "JWT_SECRET", "MONGO_URI"];
    const missing = requiredRuntimeKeys.filter((k) => !exampleKeys.has(k));
    assert.deepEqual(
      missing,
      [],
      `.env.example is missing runtime keys actually read by backend code: ${missing.join(", ")} (example has: ${[...exampleKeys].join(", ")})`
    );
  });
});

describe("Layer 2C: Frontend <-> Backend schema & route contract parity", () => {
  it("Contact.jsx payload satisfies backend EnquiryModel schema and /enquiry/create route", () => {
    const contactSrc = readFrontend("src/pages/public/Contact.jsx");
    const enquiryRoute = readBackend("routes/enquiry.routes.js");
    const enquiryModel = readBackend("models/enquiry.model.js");

    assert.match(enquiryRoute, /router|enquiryRouter\.post\(['"]\/create['"]/);
    assert.match(enquiryModel, /name:\s*\{[\s\S]*required:\s*true/);
    assert.match(enquiryModel, /mobile:\s*\{[\s\S]*required:\s*true/);
    assert.match(enquiryModel, /email:\s*\{[\s\S]*required:\s*true/);
    assert.match(enquiryModel, /services:\s*\{[\s\S]*required:\s*true/);

    // Verify Contact.jsx sends name, email, mobile, services, message
    assert.match(contactSrc, /name:\s*formData\.name\.trim\(\)/);
    assert.match(contactSrc, /email:\s*formData\.email\.trim\(\)/);
    assert.match(contactSrc, /mobile:\s*formData\.mobile\.trim\(\)/);
    assert.match(contactSrc, /services:\s*formData\.services/);
    assert.match(contactSrc, /enquiryAPI\.create\(payload\)/);
  });

  it("Quote.jsx payload satisfies backend QuoteModel schema (including enum & array services)", () => {
    const quoteSrc = readFrontend("src/pages/public/Quote.jsx");
    const quoteModel = readBackend("models/quotes.model.js");

    assert.match(quoteModel, /PROJECT_TYPES\s*=\s*\["Residential",\s*"Commercial",\s*"Hospitality",\s*"Retail",\s*"Other"\]/);
    assert.match(quoteModel, /mobile:\s*\{[\s\S]*required:/);
    assert.match(quoteModel, /minlength:\s*\[10,/);

    assert.match(quoteSrc, /mobile:\s*form\.mobile\.trim\(\)/);
    assert.match(quoteSrc, /services:\s*form\.services/);
    assert.match(quoteSrc, /quoteAPI\.create\(data\)/);
    for (const pt of ["Residential", "Commercial", "Hospitality", "Retail", "Other"]) {
      assert.ok(quoteSrc.includes(`"${pt}"`), `Quote.jsx missing backend projectType "${pt}"`);
    }
  });

  it("QuestionnaireModal.jsx sends valid QuoteModel/EnquiryModel fields (mobile, services) and checks res.ok before success", () => {
    const modalSrc = readFrontend("src/components/layout/QuestionnaireModal.jsx");

    // 1. Must send `mobile` (not just `phone`) because both QuoteModel and EnquiryModel require `mobile`
    const quotePayloadMatch = modalSrc.match(/const\s+payload\s*=\s*\{([\s\S]*?)\};/);
    assert.ok(quotePayloadMatch, "Could not locate QuestionnaireModal payload object");
    const payloadBlock = quotePayloadMatch[1];

    assert.match(
      payloadBlock,
      /\bmobile\s*:/,
      "QuestionnaireModal payload sends `phone` instead of required QuoteModel field `mobile`"
    );
    assert.match(
      payloadBlock,
      /\bservices\s*:/,
      "QuestionnaireModal payload omits required QuoteModel non-empty array field `services`"
    );

    // 2. Fallback /api/enquiry/create must check res.ok and send `mobile` + `services`
    assert.ok(
      !/catch\s*\{\s*\/\/ Still show success[\s\S]*setSubmitted\(true\)/m.test(modalSrc),
      "QuestionnaireModal swallows network/validation errors and displays fake 'Thank You' confirmation"
    );
  });

  it("Career.jsx fetches public /vacancy/opens rather than admin-protected /vacancy/getAll", () => {
    const careerSrc = readFrontend("src/pages/public/Career.jsx");
    const vacancyRoute = readBackend("routes/vacancy.route.js");

    assert.match(vacancyRoute, /vacancyRouter\.get\(['"]\/getAll['"],\s*protect,\s*adminOnly/);
    assert.match(vacancyRoute, /vacancyRouter\.get\(['"]\/opens['"],\s*getOpenVacancies\)/);

    assert.ok(
      !careerSrc.includes("vacancyAPI.getAll()"),
      "Career.jsx calls vacancyAPI.getAll() which requires protect + adminOnly (causes 401 Unauthorized for public visitors); should call vacancyAPI.opens()"
    );
  });

  it("services/api.js categoryAPI.status uses PATCH matching backend category.routes.js", () => {
    const apiSrc = readFrontend("src/services/api.js");
    const categoryRoute = readBackend("routes/category.routes.js");

    assert.match(categoryRoute, /categoryRouter\.patch\(['"]\/status\/:id['"]/);
    const categoryStatusLine = apiSrc
      .split(/\r?\n/)
      .find((l) => l.includes("/category/status/"));
    assert.ok(categoryStatusLine, "Expected categoryAPI.status definition in api.js");
    assert.match(
      categoryStatusLine,
      /api\.patch\(/,
      `categoryAPI.status method mismatch: expected api.patch(...), found "${categoryStatusLine.trim()}"`
    );
  });

  it("App.jsx wraps dashboard routes inside AdminProtectedRoute (not bare empty Route)", () => {
    const appSrc = readFrontend("src/App.jsx");
    assert.ok(
      /<Route\s+element=\{<AdminProtectedRoute\s*\/>\}>\s*<Route\s+path="\/dashboard"/.test(appSrc),
      "App.jsx mounts <Route element={<AdminProtectedRoute />} /> as an empty self-closing tag while /dashboard/* sits only under PrivateRoute"
    );
  });

  it("Login.jsx email regex accepts valid modern TLDs longer than 4 chars (e.g. .design, .photography)", () => {
    const loginSrc = readFrontend("src/pages/auth/Login.jsx");
    const match = loginSrc.match(/const\s+emailRegex\s*=\s*(\/[^/]+\/[gimsuy]*);/);
    assert.ok(match, "Could not locate emailRegex in Login.jsx");
    const regex = eval(match[1]);
    assert.equal(regex.test("director@yashmeen.design"), true, "Login emailRegex rejected valid .design domain");
    assert.equal(regex.test("studio@yashmeen.photography"), true, "Login emailRegex rejected valid .photography domain");
  });

  it("Opening-hours logic in Header/MenuOverlay/Footer matches stated Mon-Fri 8:30am-6:00pm schedule", () => {
    const footerSrc = readFrontend("src/components/layout/Footer.jsx");
    assert.match(footerSrc, /Monday to Friday, 8:30am - 6:00pm/);

    // Verify computed `open` check does not evaluate to true on Saturday or at 8:10am Friday
    assert.ok(
      !/const\s+open\s*=\s*dayStr\s*!==\s*["']Sun["']/.test(footerSrc),
      "Footer.jsx opening-hours expression allows Saturday ('Sat' !== 'Sun') and >= 8:00am (contradicts Monday-Friday 8:30am-6:00pm copy)"
    );
  });

  it("ForgotPassword.jsx calls backend /account/forgot-password rather than faking success with setTimeout", () => {
    const fpSrc = readFrontend("src/pages/auth/ForgotPassword.jsx");
    assert.ok(
      /forgot-?password|authAPI\.forgotPassword/i.test(fpSrc) && !/setTimeout\(\(\) => \{\s*setStatus\(["']sent["']\)/m.test(fpSrc),
      "ForgotPassword.jsx does not call /api/account/forgot-password and instead fakes success after setTimeout(..., 1200)"
    );
  });

  it("api.js defines getVersion methods if caching hooks check projectAPI.getVersion / vacancyAPI.getVersion", () => {
    const apiSrc = readFrontend("src/services/api.js");
    assert.ok(
      /getVersion\s*:/.test(apiSrc),
      "services/api.js lacks getVersion endpoint wrappers expected by ProjectDetails/Career/cacheStore"
    );
  });
});

describe("Layer 2D: Atelier hours, SEO config, and public cache invalidation", () => {
  it("getDubaiAtelierStatus matches Mon-Fri 8:30am-6:00pm GST schedule", () => {
    assert.equal(getDubaiAtelierStatus(new Date("2026-11-13T04:10:00Z")).isOpen, false);
    assert.equal(getDubaiAtelierStatus(new Date("2026-11-13T04:30:00Z")).isOpen, true);
    assert.equal(getDubaiAtelierStatus(new Date("2026-11-13T14:00:00Z")).isOpen, false);
    assert.equal(getDubaiAtelierStatus(new Date("2026-11-14T08:00:00Z")).isOpen, false);
  });

  it("normalizePathname and getRouteSeo return clean per-route metadata and robots flags", () => {
    assert.equal(normalizePathname("/"), "/");
    assert.equal(normalizePathname("/projects///"), "/projects");
    assert.equal(getRouteSeo("/").robots, "index, follow");
    assert.equal(getRouteSeo("/login").robots, "noindex, nofollow");
    assert.equal(getRouteSeo("/dashboard/project-manager").robots, "noindex, nofollow");
    const projectSeo = getRouteSeo("/project/details/abc123");
    assert.equal(projectSeo.canonicalPath, "/project/details/abc123");
    assert.match(projectSeo.title, /Project Case Study/);
    const notFoundSeo = getRouteSeo("/non-existent-route-999");
    assert.equal(notFoundSeo.robots, "noindex, follow");
    assert.match(notFoundSeo.title, /Page Not Found/);
  });

  it("publicCache clears stored keys and notifies subscribers", () => {
    const rawStore = {
      [CACHE_KEYS.PROJECTS]: "{}",
      [CACHE_KEYS.GALLERY]: "{}",
      [`${CACHE_KEYS.PROJECT_DETAIL_PREFIX}p1`]: "{}",
      [CACHE_KEYS.VACANCIES]: "{}",
      [CACHE_KEYS.VIDEOS]: "{}",
      [`${CACHE_KEYS.POSTS_PREFIX}3`]: "{}",
    };

    const mockStorage = {};
    Object.setPrototypeOf(mockStorage, null);
    for (const [k, v] of Object.entries(rawStore)) {
      mockStorage[k] = v;
    }
    Object.defineProperties(mockStorage, {
      getItem: { value: (k) => (Object.hasOwn(mockStorage, k) ? mockStorage[k] : null) },
      setItem: { value: (k, v) => { mockStorage[k] = String(v); } },
      removeItem: { value: (k) => { delete mockStorage[k]; } },
    });
    globalThis.localStorage = mockStorage;

    const events = [];
    const unsubscribe = subscribeCacheInvalidation((scope, id) => {
      events.push([scope, id ?? null]);
    });

    try {
      clearProjectsCache();
      clearGalleryCache();
      clearProjectDetailsCache("p1");
      clearVacancyCache();
      clearVideoGalleryCache();
      clearPostsCache();
      unsubscribe();
      clearProjectsCache();

      assert.equal(Object.hasOwn(mockStorage, CACHE_KEYS.PROJECTS), false);
      assert.equal(Object.hasOwn(mockStorage, CACHE_KEYS.GALLERY), false);
      assert.equal(Object.hasOwn(mockStorage, `${CACHE_KEYS.PROJECT_DETAIL_PREFIX}p1`), false);
      assert.equal(Object.hasOwn(mockStorage, CACHE_KEYS.VACANCIES), false);
      assert.equal(Object.hasOwn(mockStorage, CACHE_KEYS.VIDEOS), false);
      assert.equal(Object.hasOwn(mockStorage, `${CACHE_KEYS.POSTS_PREFIX}3`), false);
      assert.deepEqual(events, [
        ["projects", null],
        ["gallery", null],
        ["project-details", "p1"],
        ["vacancies", null],
        ["videos", null],
        ["posts", null],
      ]);
    } finally {
      delete globalThis.localStorage;
    }
  });
});

describe("tidy + hardening regressions", () => {
  it("homepage Works never falls back to invented projects", () => {
    const src = readFrontend("src/components/home/Works.jsx");
    assert.ok(!src.includes("CURATED_PROJECTS"));
    assert.ok(src.includes("works-empty"));
  });

  it("stray demo routes are gone", () => {
    const app = readFrontend("src/App.jsx");
    assert.ok(!app.includes('"/svg"'));
    assert.ok(!app.includes("parallax-demo"));
  });

  it("src has no legacy libs/ or pages/website directories", () => {
    assert.ok(!fs.existsSync(path.join(FRONTEND_ROOT, "src/libs")));
    assert.ok(!fs.existsSync(path.join(FRONTEND_ROOT, "src/pages/website")));
  });

  it("password reset tokens are stored hashed", () => {
    const src = readBackend("controllers/account.controller.js");
    assert.ok(src.includes("hashToken(resetToken)"));
    assert.ok(src.includes("hashToken(token.trim())"));
  });

  it("server trusts the proxy on Vercel and gates preview CORS behind an env flag", () => {
    const src = readBackend("server.js");
    assert.ok(src.includes('app.set("trust proxy", 1)'));
    assert.ok(src.includes("ALLOW_VERCEL_PREVIEWS"));
    assert.ok(!/yashmeen-\[a-z0-9-\]\+\\\./.test(src));
  });

  it("canonical origin follows VITE_SITE_URL", () => {
    const cfg = readFrontend("vite.config.js");
    assert.ok(cfg.includes("VITE_SITE_URL"));
    assert.ok(fs.existsSync(path.join(FRONTEND_ROOT, "scripts/generate-seo-files.mjs")));
  });
});

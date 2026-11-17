# File structure and engineering audit

14 November 2026. Current checkout: 3719e4e. Companion to [the site audit](./site-audit-2026-11-14.md).

The apps/web + apps/api split is a useful improvement. The remaining problems are migration and configuration gaps, duplicated sources of truth, and incomplete engineering tooling. There is no need to rebuild the project structure from scratch. Website access and readability for AI agents are covered in [the live content audit](./ai-agent-readability-audit-2026-11-14.md).

## Current structure

```text
Dan/
  AGENT.md                   Manually discoverable engineering/design guide
  README.md, CHANGELOG.md
  package.json               Declares workspaces, delegates through --prefix
  vercel.json                Services and routing configuration
  .github/workflows/ci.yml
  docs/                      Brand brief and website workflow notes
  apps/
    web/
      package.json, package-lock.json
      vite.config.js, vercel.json, tsconfig.json
      public/                Fonts, static photographs, sitemap, robots
      scripts/               SEO generation, design locks, metadata prerender
      tests/
      src/
        pages/public/        Services, projects, media, blog and other pages
        pages/admin/         Dashboard and resource managers
        pages/auth/
        components/home/     Homepage sections
        components/layout/   Header, footer, menus, lead modal, consent
        components/ui/       Shared loading and 3D gallery
        components/seo/
        layouts/, routes/
        services/, store/, hooks/, lib/, motion/, styles/, data/
    api/
      server.js
      config/, routes/, controllers/, models/, middlewares/, utils/, tests/
      uploads/               Served local seed media
      .env.example
      package.json, package-lock.json
  backup/details.txt         Ignored local residue; contents not inspected
  uploads/                   Empty directories created by root-started middleware
  audit/, .taste-skill/       Artifacts created during this audit
```

The public/admin split, shared public layout, API routers/controllers/models and isolated admin editor imports are sensible. Do not restore the old backup/frontend structure.

## 1. P1: environment loading is too late for module-level configuration

server.js visibly calls dotenv.config with apps/api/.env near the top, but ES module imports execute their dependencies before the module body. sendEmail.js calls dotenv.config with the working directory and creates its transport at import time. With the documented root command, no root .env is present; the transport is created before apps/api/.env loads.

A no-send reproduction recorded smtpHostPresent=false, smtpUserPresent=false and smtpPasswordPresent=false at transport creation. Loading apps/api/.env afterwards made isEmailConfigured() return true, but it did not rebuild the transport. This can make local SMTP delivery fail while configuration checks claim it is ready. Vercel environment injection has different timing, so this is not a claim that production email has been tested or fails identically.

Evidence: apps/api/server.js:12, apps/api/middlewares/sendEmail.js:4 and 7, [safe reproduction results](./environment-load-order.json), [reproduction](./environment-load-order.mjs).

Fix: load validated environment configuration before importing modules that create configured clients, or initialize clients lazily from that configuration. Separate app creation from server startup. The same principle applies to any exported URL/configuration captured during import.

## 2. P2: the monorepo package workflow is only partly consolidated

Root package.json declares apps/* workspaces, but there is no root lockfile and no installed workspace links. npm ls --workspaces --depth=0 reports an empty root workspace tree. Child installs and CI use separate prefix installs and two child lockfiles. These child trees currently resolve without reported invalid/missing dependencies.

This setup can work, but it supports two different install conventions. A root npm install can create a new dependency layout/lockfile while existing CI still follows child manifests.

Fix: choose and document either a real npm workspace install with one root lockfile and workspace scripts, or explicitly independent child installs. For a monorepo, a root lockfile plus npm ci is the cleaner convention. Add an engines.node range and a pinned package-manager convention; CI uses Node 22 while local verification used Node 24.15.0. Do not regenerate locks as an incidental audit change.

Root dev also does not forward added flags through both npm layers: npm run dev -- --host 0.0.0.0 was interpreted incorrectly during the first audit. The direct child command works: npm --prefix apps/web run dev -- --host 127.0.0.1.

Evidence: package.json:6, both child package.json and package-lock.json files, .github/workflows/ci.yml:25 and 58.

## 3. P2: the backend's own dev script is broken

npm --prefix apps/api run dev fails with 'nodemon is not recognized'. The package script names nodemon, but the package does not declare it and no global command is available. The root dev:api command starts the server without reload and also triggers the working-directory upload issue described in the site audit.

Fix: use a declared nodemon dev dependency or the supported Node watch mode. Make root and child startup behavior agree and resolve local upload paths independently of the working directory.

Evidence: apps/api/package.json:8. The failed command was run; no dependency was installed.

## 4. Website access and readability for AI agents

The live site allows sampled public requests, including homepage probes identifying as GPTBot, OAI-SearchBot and ClaudeBot. JavaScript-enabled browsers recover substantial content, but initial HTML contains only metadata and a short fallback summary. Project details require API loading; the sampled blog displays literal embed code; the deployed sitemap omits CMS detail URLs.

Read [the dedicated live audit](./ai-agent-readability-audit-2026-11-14.md) for evidence, limitations and recommended fixes. The earlier host-tool assessment arose from a misunderstanding of the request and has been removed from this website audit.

## 5. P2: agent guidance needs a standard entry point and current facts

The repository has AGENT.md, singular, rather than the usual AGENTS.md discovery filename. I read it explicitly. Tools relying on standard AGENTS.md discovery may miss it unless instructed elsewhere.

Its current claims also disagree with implementation: bronze tokens are overridden to black, reduced-motion is disabled, styling uses parallax/glass, and several type sizes differ from its documented system. BRAND_BRIEF.md retains older dark/brass/three-font guidance while AGENT.md describes a light/two-font system. CHANGELOG's unreleased notes do not comprehensively record the latest monorepo/tooling changes; older versioned backup paths are historical entries and should remain historical.

Fix: provide a standard AGENTS.md entry point, make one current architecture/design source authoritative, and add child guidance only where behavior genuinely differs. Include safe test-database rules, exact startup commands, environment setup, upload storage and completed-check requirements. Update the current README's prerender count/claim and remove stale TODO comments only after their referenced implementation is verified.

## 6. P2: deployment/configuration sources overlap

Root vercel.json contains a frontend service rewrite; apps/web/vercel.json contains another fallback with different exclusions. The child pattern does not exclude robots.txt or sitemap.xml; neither pattern explicitly excludes fonts/. The site now has self-hosted fonts and generated route HTML.

The audit has not established Vercel's current deployed precedence between these files or filesystem routes, so asset breakage is a verification item, not a confirmed production outage.

Fix: document the active deployment root and authoritative config, remove redundant config after confirming deployment behavior, and directly check /fonts/*.woff2, /robots.txt, /sitemap.xml and generated subpage HTML on the deployment. Make sure the SPA fallback preserves assets and actual prerender outputs.

There is no apps/web/.env.example. The API example mixes used variables with unused legacy auth aliases and does not explain the import-time environment issue. PUBLIC_ITEM_PATH is read in control.js but not documented. Cloudinary keys are read by an unused module, not by the active upload path. Frontend api.js respects VITE_API_URL, while QuestionnaireModal hardcodes /api/quote/create and /api/enquiry/create, so the modal bypasses alternate API-origin configuration.

## 7. Dependencies: known-vulnerability check passes, cleanup remains

npm audit --json reported zero known vulnerabilities for both installed child dependency trees on this audit date. This does not assess application-level XSS, storage, auth or configuration flaws.

Evidence: [web dependency audit](./npm-audit-web.json), [API dependency audit](./npm-audit-api.json).

Cleanup candidates:

- API lists fs, path, stream and url npm packages even though Node provides the imports used here. They do not need third-party runtime dependencies for this code.
- body-parser is declared but unused; the server uses Express parsing middleware.
- config/cloudinary.js has no inbound application import. Having cloudinary in package.json does not mean uploads use persistent Cloudinary storage; active uploads use disk/temp files.
- config/mailer.js also has no inbound application import. Active email code creates a separate transport in middlewares/sendEmail.js with different secure-option logic.
- Frontend @gsap/react and framer-motion have no direct source imports in the current scan. jpeg-js and pngjs have no current JS/script imports. Verify intended tooling before removal.
- Tailwind, its Vite plugin, and clsx/tailwind-merge are used; do not remove them based solely on a JavaScript import scan. Tailwind itself is imported from CSS.

[Structure inventory](./structure-inventory.json) is a static candidate list, not permission to delete packages. No dependency versions or lockfiles were changed.

## 8. P2: two contact-content caches can disagree after admin updates

Most public UI uses hooks/useWebsiteContent.js. Quote uses lib/cacheStore.js, a separate memory/localStorage cache. Its clearWebDetailsCache export is not called by the admin update flow. That flow calls notifyWebsiteContentUpdated, which refreshes the other store.

cacheStore checks for webDetailsAPI.getVersion, but neither that method nor a corresponding backend route exists. It falls back to ten-minute freshness and does not subscribe to the website-content update event. A recently cached quote page can therefore keep old contact details after a dashboard update while header/footer display new data.

Evidence: apps/web/src/lib/cacheStore.js:37, 52 and 101; apps/web/src/services/api.js:152; apps/web/src/pages/admin/Dashboard.jsx:524; apps/api/routes/webDetails.routes.js.

Fix: use one website-content store or wire both stores to one explicit invalidation mechanism. Hook-like code such as cacheStore/cacheLatestBlog would also be easier to discover under hooks/ with descriptive names.

## 9. P2: automated-check boundaries need tightening

CI currently does not run ESLint or typecheck. ESLint found 10 errors in the first audit. Most frontend regressions inspect source strings; they do not guarantee actual consent state, email-link routes, image integrity or successful submission behavior.

The backend test suite loads apps/api/.env, connects to MONGO_URI, creates synthetic accounts/posts/leads and later deletes those records. It lacks a mandatory isolated-test-database guard. CI supplies a dedicated test MongoDB, but a local npm test can reach the configured business database.

Fix: require a deliberate test database/TEST_MONGO_URI before integration tests, separate pure tests from integration tests, add lint/typecheck to CI and use deterministic installs. Add behavior checks for the actual bugs rather than tests that only assert identifiers exist. Valid lead/email/admin workflows remain unverified by this audit.

Evidence: apps/api/tests/api-and-security.test.js:15 and 169, .github/workflows/ci.yml, previous browser reproduction results.

## 10. P2/P3: file size and leftover code reduce maintainability

The largest source files include Dashboard.jsx at 137,739 bytes, spatial-gallery-3d.tsx at 63,112 bytes, home.css at 57,170 bytes and InteractiveBrandLettering.jsx at 39,050 bytes. The service-page consolidation and motion modules improved organization, but Dashboard still carries too many responsibilities and home.css retains large atelier/glide rule families with no matching current JSX references in the search.

Fix: split Dashboard into its content/editor/CRM sections with stable helpers, keep gallery physics/rendering separate from controls, and remove old CSS only after route coverage confirms it is unused. Large files are maintainability findings, not proof of a runtime defect. Avoid creating more nested folders without reducing responsibilities.

backup/ contains an ignored details.txt residue, not a second active source tree. Its contents were deliberately not read. .env and details.txt are correctly ignored and are not in the tracked-file inventory. Keep sensitive local backups outside the deployable project. Audit artifacts are untracked and should be consciously retained or excluded; no files were deleted.

## 11. Serverless readiness needs more than the Vercel manifest

Media currently relies on local/temp disk and the rate limiter uses a process-local Map. On multiple serverless instances, counters are not shared and reset with process lifetime. That limiter is useful for local/basic protection but is not an across-instance quota.

Fix: choose durable media storage and a shared rate-limit store or deployment-level protection when production traffic requires it. Add startup configuration validation, health diagnostics and error reporting with secrets excluded. The existing MongoDB connection promise, administrative route guards and generic API error responses are useful foundations.

## Recommended target structure

```text
Dan/
  AGENTS.md
  package.json, package-lock.json   One chosen install convention
  vercel.json                      One authoritative deployment entry point
  .github/workflows/
  docs/
    architecture.md
    environment.md
    brand/                         Current approved brand facts
  apps/
    web/
      .env.example
      src/
        pages/, components/, layouts/, routes/
        hooks/, services/, store/, lib/, motion/, styles/, data/
      scripts/, tests/, public/
    api/
      .env.example
      app.js                       Configured Express app, no listen side effect
      server.js                    Local bootstrap and listen
      config/                      Validated environment, database, mail, storage
      routes/, controllers/, models/, middlewares/, services/, utils/
      tests/                       Pure and explicitly isolated integration checks
      uploads/                     Local development only
```

This is a recommendation, not a restructure performed in this turn. Preserve current working code while fixing environment bootstrap, upload paths, test isolation and package conventions first.

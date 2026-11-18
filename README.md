# Yashmeen Future Building & Fit-Out Contracting

Marketing site, enquiry pipeline and CMS for Yashmeen Fit-Out (Dubai).
React + Vite frontend, Express + MongoDB backend, with Vercel deployment configuration.

```
.
├── AGENTS.md                # discovery entry point; follow AGENT.md
├── AGENT.md                 # current design system + working rules for AI/dev agents
├── CHANGELOG.md
├── README.md
├── package.json             # root convenience scripts (child installs stay independent)
├── vercel.json              # Vercel Services configuration (apps/web + apps/api)
├── docs/                    # BRAND_BRIEF.md, workflow notes
├── shared/                  # typed website-content templates, defaults and validation
└── apps/
    ├── api/                 # Express + MongoDB backend
    │   ├── server.js        # app setup: headers, CORS, rate limits, routers
    │   ├── config/          # environment bootstrap and database
    │   ├── services/        # Cloudinary media and distributed rate limits
    │   ├── routes/          # one router per resource
    │   ├── controllers/     # request handlers
    │   ├── models/          # Mongoose schemas
    │   ├── middlewares/     # auth, upload, email
    │   ├── tests/           # unit tests plus isolated MongoDB integration tests
    │   └── uploads/         # legacy media retained until migration is verified
    └── web/                 # React 19 + Vite frontend
        ├── index.html
        ├── public/          # static assets, generated sitemap.xml + robots.txt
        ├── scripts/         # generate-seo-files.mjs (runs before every build)
        ├── tests/           # node --test contract/unit tests
        └── src/
            ├── main.jsx, App.jsx, index.css
            ├── layouts/     # Layout (public), AdminLayout
            ├── routes/      # AuthRoute guards
            ├── pages/
            │   ├── public/  # Home, About, Contact, Quote, Career, FAQ, WhyUs, ...
            │   │   ├── projects/  services/  media/  blog/
            │   ├── auth/    # Login, ForgotPassword, ResetPassword, VerifyEmail
            │   └── admin/   # dashboard + CMS managers
            ├── components/
            │   ├── layout/  # Header, Footer, MenuOverlay; brand-lettering physics/render/audio
            │   ├── home/    # Hero, Studio, Works, Process, Testimonial, CTA
            │   ├── admin/dashboard/ # cards, workspace tabs, editors and shared helpers
            │   ├── seo/     # SeoHead
            │   ├── ui/      # primitives; spatial-gallery layout/geometry/rendering
            ├── lib/         # helpers, seoConfig, publicCache, uploader, utils
            ├── services/    # api.js (axios client + endpoint wrappers)
            ├── store/       # auth store
            ├── hooks/       # useWebsiteContent
            ├── motion/      # MotionProvider (GSAP, Lenis)
            ├── data/  styles/
```

## Commands

Use Node.js 22 through 24 and npm 10 or newer. Install each application from its own lockfile:

```bash
npm --prefix apps/web ci
npm --prefix apps/api ci
```

```bash
# Root convenience commands:
npm run dev:web      # http://localhost:3000 (proxies /api to :8000)
npm run dev:api      # http://localhost:8000
npm run test         # frontend regressions and API unit tests; no database writes
npm run build        # production bundle, real route HTML and prerender verification
npm run check:locks  # verifies 0 em-dashes and strict 2-font design system

# Backend test layers:
npm --prefix apps/api run test:unit
# Starts and stops its own disposable MongoDB and local SMTP receiver:
npm run test:api:integration:local
# TEST_MONGO_URI must point to a disposable, dedicated database.
$env:TEST_MONGO_URI="mongodb://127.0.0.1:27017/yashmeen-test"
npm --prefix apps/api run test:integration
```

The API child dev command, `npm --prefix apps/api run dev`, uses Node watch mode. Frontend flags can be passed directly, for example `npm --prefix apps/web run dev -- --host 127.0.0.1`.

The build generates 22 route/404 pages by default. With `SITEMAP_API_URL`, it adds CMS project/blog details and custom active services. Rendering resolves lazy modules before the final pass, so completed content sits inside `<main>` without hidden streaming placeholders. Build output embeds preloaded data for hydration. Authentication pages use `noindex, nofollow`; inactive or removed services are excluded from the sitemap. Non-root pages use `route.html`, with `cleanUrls: true` and `trailingSlash: false`. Root Services and standalone frontend Vercel manifests share the same asset-safe fallback; choose the manifest matching the deployment root. A local build does not verify deployed routing.

## Environment

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SITE_URL` | frontend | Public origin: canonical, OG tags, sitemap, robots |
| `SITEMAP_API_URL` | frontend build | API base used to add project and blog URLs to the sitemap (optional) |
| `VITE_API_URL` | frontend | API base (defaults to `/api`) |
| `VITE_NOINDEX` | frontend build | `true` prevents indexing of preview output |
| `PRERENDER_DATA_FILE` | frontend build | Optional local JSON fixture for deterministic CMS page verification |
| `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` | backend | Database and auth |
| `TEST_MONGO_URI` | backend tests | Required disposable database for integration tests; never falls back to `.env` |
| `CLIENT_URL` | backend | Allowed CORS origin |
| `ALLOW_VERCEL_PREVIEWS` | backend | `true` lets `yashmeen-fitout*.vercel.app` previews call the API |
| `TRUST_PROXY` | backend | `true` behind your own proxy (automatic on Vercel) |

Copy `apps/web/.env.example` and `apps/api/.env.example` to each application's local `.env` and configure the values there. Cloudinary, Upstash and SMTP settings are documented in the API example. Keep credentials outside Git.

## Maintenance and launch status

`AGENT.md` is the current implementation/design authority; older brand/workflow documents retain historical proposals. The user requested preservation of the current business content and dashboard editing. Dashboard > Website content edits business/contact details, displayed and structured hours, public copy/images, certifications, testimonials, FAQs, services, delivery process and SEO. Existing project, media, blog and vacancy managers remain available. Project editing includes duration and video URL.

`shared/siteContent.js` supplies the existing defaults and validates editable content for both applications. Missing fields inherit defaults; deliberately empty lists stay empty. The public content API/cache excludes private CRM tasks and appointments. Dashboard reads use protected `/api/webDetails/admin-details`; updates use validated dotted fields to preserve nested siblings. Failed saves retain the draft. Confirm facts and image rights before publishing changes to the existing claims.

Run `npm --prefix apps/api run audit:readonly` to refresh the read-only CMS report and ignored local snapshot. It reads the configured database without migrations or business-record writes. To include that snapshot in the static reference inventory, set `CMS_SNAPSHOT_FILE` to its absolute path before running `node apps/web/scripts/inventory-static-assets.mjs`. The 17 November check confirmed that the eight candidate images were unused. They are now excluded from public output, with recoverable originals in `.audit-recovery/unused-static-2026-11-17/` and Git history. All 23 remaining static assets are referenced. All 260 legacy images have local recovery evidence and are ready in the media migration dry-run.

See `audit/audit-continuation-2026-11-17.md` for the latest verification and remaining gates; `audit/p3-maintenance-2026-11-16.md` records the earlier cleanup and browser checks. Current checks pass: 58 frontend tests, 14 API unit tests, 47 disposable-DB integration tests, ESLint, TypeScript, design locks and the CMS-backed production build. The integration suite exercises real dashboard persistence, private/public separation, verification/resend/reset emails, session revocation, saved lead notifications and SMTP rejection recovery using local test infrastructure. The CMS build includes 21 projects and one published blog post: 44 completed pages and 39 sitemap URLs. On 17 November 2026, the reviewed account-verification and blog-sanitization migrations were applied with backups; the follow-up audit reports zero legacy accounts and zero posts requiring sanitation. Real provider delivery, production Cloudinary/Upstash configuration and deployment sign-off remain separate work.

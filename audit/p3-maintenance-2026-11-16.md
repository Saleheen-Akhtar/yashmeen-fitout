# Audit repair status: 16 November 2026

Follow-up: `audit/audit-continuation-2026-11-17.md` records the completed disposable database/SMTP checks, current CMS reference inventory, asset cleanup and CMS snapshot build. The open-item list below describes the state at the end of 16 November.

Workspace: `C:/Users/sahil/Projects/IT/Dan`. Branch: `codex/p1-launch-blockers`. Work is local and uncommitted; no deployment was performed. Existing P1/P2/UI changes were preserved.

The user requested: "keep it same, in the dashboard everything should be editable." Current business wording and facts remain the defaults. Confirmation of replacement claims is not a blocker to making existing content editable.

## Local P3 and content fixes completed

| Finding | Result |
| --- | --- |
| Dashboard size | Cards, workspace tabs, editors and helpers moved into `components/admin/dashboard/`. Dashboard retains state and mutation orchestration. Initial and populated fixture HTML matched the baseline during extraction. |
| Editable business/public content | Shared content covers identity/contact, full address, separate phone/WhatsApp, display/structured hours, social links, hero, studio, footer/certifications, testimonials, FAQ groups, process, detailed services, public page copy/images and SEO. Existing project/media/blog/vacancy managers remain. Projects persist duration and video URL. Floating WhatsApp and careers email use saved content. |
| Editing and persistence | Searchable grouped editor supports list addition/removal/reordering and labelled fields. Validation rejects unknown/operator fields, wrong types, unsafe URLs, malformed hours and slugs. Empty lists survive reads; missing legacy fields inherit defaults. Reads do not seed the database. Dotted updates preserve nested siblings; failed saves keep drafts open. |
| Private content exposure | Public content API and visitor cache select only public fields. Admin tasks/appointments use the protected admin-details endpoint. |
| Large interaction components | Gallery geometry, layout, renderer, types and header extracted. Lettering physics, renderer and audio extracted with cleanup. Gallery keyboard controls now open the named item without pointer events selecting an underlying photo. |
| Dead CSS/dependencies/configuration | Removed unused cinematic/Glide/Atelier hero CSS, `@gsap/react`, `framer-motion`, `jpeg-js`, `pngjs`, unused API mail/Cloudinary compatibility files and orphaned contact cache. Active Aperture hero, gallery, lettering and calm reduced motion are preserved. |
| Logging/residue | API error logs retain operation/type/safe code and omit full error messages, objects and stacks. No remaining commented schema residue was identified. Task-owned one-off edit/extraction scripts were removed. |
| Prerender/routing | Completed page content is emitted inside main after lazy modules resolve, without hidden streaming replacement segments. Verifier checks meaningful content instead of fixed default headings. Only root index and route.html outputs remain. Both Vercel manifests use clean URLs, no trailing slash and matching asset-safe fallbacks. Official Vercel documentation supports these configuration fields and filesystem precedence; deployed precedence/HTTP behavior remains a rollout check. |
| Sitemap | Active custom services and published project/blog details enter build output and sitemap. Inactive/removed services are excluded from sitemap and marked noindex in generated HTML. Auth pages remain noindex. |
| Static-media inventory | Reviewed all 31 static files against source/shared defaults/editor presets, fixtures and saved CMS media snapshots. 23 are referenced; eight are unverified candidates. No media deleted, because current CMS webDetails references are unavailable. See static-asset-inventory.json. |

## Verification

- **53 frontend tests and 13 API unit tests pass.** Windows process restrictions required normal process access for Node test workers. API tests mock storage and exercise real Mongoose schema/update casting without database connections.
- **ESLint, TypeScript and API syntax checks pass.** API syntax checked 15 modified modules. Design locks pass: two-font compliance and no em/en dashes in checked user-facing source.
- **Default production build passes:** 22 completed route/404 pages, 17 sitemap URLs. No build API configured; no business CMS details were fetched.
- **Edited CMS fixture build passes:** 25 completed pages and 19 sitemap URLs, with edited homepage/About/journal headings, a custom service, inactive-service exclusion and crawler-readable project/blog details. Default output was restored afterward. See prerender-fixture-verification.json.
- All **19 checked components have identical default initial SSR HTML and visible text** compared with the pre-content-editing baseline. See content-baseline-equivalence.json.
- Browser fixture checks covered all **17 public routes at 1440, 768 and 375px**, plus the dashboard content modal. Main content present and no document horizontal overflow. Failed email save retained its draft; successful saved phone appeared publicly after navigation. Gallery grid/3D filters, controls, named keyboard lightbox selection and lettering keyboard/reset actions worked. No captured console errors/warnings in this fixture pass.
- Final **built-page hydration** check displayed edited About content, opened the enquiry modal and captured no browser errors/warnings. This verifies interactive hydration of local built fixture output.
- Browser fixture API is in memory; these checks do **not** establish business authentication, real MongoDB persistence, uploads, lead submission or email delivery.
- Existing local recovery evidence remains **260/260 legacy images restored**. Media tests validate their browser-compatible files.
- CKEditor remains lazy and admin-only; Three.js remains lazy with the gallery. Build reports the existing large CKEditor chunk warning; deployed loading/CWV measurements remain open.
- Diff whitespace check passes with Windows carriage-return handling. Temporary fixture previews are stopped. Gallery/video/vacancy data still refreshes from the API after hydration; this build does not verify live records for those lists.

## Static asset candidates

Retained pending a current CMS reference check: atelier-render.jpg, Custom-Furniture.jpg, hero-banner.jpg, hero-cinematic.jpg, hero.jpg, Residential-Fit-Out.jpg, yashmeen-layer-counter.webp, yashmeen-studio.jpg. This is an evidence-based candidate list, not a confirmed deletion list.

## Remaining external or environment-dependent work

1. **Deployment:** the read-only official-domain check returned an older 992-byte LiteSpeed client-only page with an empty root and old assets. The repaired build is not deployed. Verify the chosen deployment root, canonical/robots/sitemap/font/asset URLs, clean routes, crawler-visible CMS pages and distributed rate limits in preview/production.
2. **Build CMS configuration:** `SITEMAP_API_URL` is absent. Configure the build API and verify its content/sitemap coverage on deployment. `VITE_SITE_URL` is absent; the code's official-domain default is used.
3. **Database integration:** `TEST_MONGO_URI` is absent. Run guarded integration tests against an explicitly disposable database. Never substitute the configured business `MONGO_URI`.
4. **Live operations:** review/apply account-verification and unsafe-blog migration reports, validate email verification/reset delivery, Cloudinary migration/backups, durable uploads and successful test lead persistence.
5. **Content/SEO operations:** preserve current claims as requested. Verify facts and image rights before changing/publishing those claims; supply detailed case studies through the editor. Manually review media alt text, measure deployed Core Web Vitals, and complete Search Console/Bing/Business Profile/listing/review work.
6. **Candidate assets:** verify current CMS settings/media usage before removing the eight static candidates above.

Local actionable P3 code and content-editing work is completed. The remaining items require current CMS/deployment access, an isolated test database, verified business evidence or off-site operations.

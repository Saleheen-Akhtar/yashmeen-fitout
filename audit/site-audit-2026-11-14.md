# Site audit: Yashmeen Fit-Out

Audit date: 14 November 2026. Checkout: `3719e4e`, branch `main`.
Workspace: `C:/Users/sahil/Projects/IT/Dan`.

The current site has a strong homepage hero and a working public route structure, but it is not ready for a clean launch sign-off. The largest gaps are media integrity, account recovery, upload storage, HTML sanitization, and consistency of customer-facing information. A successful build and passing source-contract tests do not catch these problems.

This initial audit covers the current local checkout using its configured CMS database. A subsequent [live AI-agent readability audit](./ai-agent-readability-audit-2026-11-14.md) separately verifies deployed HTTP access, initial HTML, rendered content and sitemap coverage. Application sources and CMS records were not changed.

## Updates reviewed

Read the current README, CHANGELOG, AGENT.md, brand brief, workflow audit/build notes, recent commit history, and implementation of the affected features. The current Git tree was clean before creating audit artifacts.

| Update | Current implementation and audit result |
| --- | --- |
| PR #10: security, lead flows, accessibility, SEO and performance remediation | Administrative mutation routes have guards; nine unauthenticated POST probes returned 401. Empty quote/enquiry submissions return 400. Account email completion routes are still missing. |
| PR #11: structure and hardening | Public/admin pages are separated. Reset tokens are hashed. Homepage no longer creates fictional fallback project records, although missing images still receive unrelated fallback photography. |
| PR #12: lead UX, fonts, services and prerender | Three-step modal, mobile Call/WhatsApp/Enquire bar, self-hosted fonts and data-driven services are present. Prerender generates metadata and generic noscript content rather than complete page markup. |
| PR #13: motion modularization | Lenis, magnetic, parallax and reveal modules exist. The shared provider permanently sets reducedMotion to false. |
| PR #14: tokens, dropdown, consent and CI | All features exist. Tokens are overridden elsewhere; dropdown state disagrees with keyboard visibility; saved consent is not restored; CI omits ESLint. |
| PR #15: asset optimization and CSS cleanup | Main hero WebP is 264,520 bytes; editorial hero WebP is 298,016 bytes. The main bundle still loads 98.08 kB of CSS before compression. |
| PR #16: monorepo | apps/web and apps/api build correctly. Root API startup exposes a mismatch between upload destination and served directory. |
| PR #17: remove experience | /experience renders Page Not Found at both checked widths. Removed code is absent from routing. |
| PR #18: test globs and Node 22 | Frontend tests run and pass on this Windows host after normal process access is allowed. CI configuration uses Node 22 and Linux-compatible globs. CI execution itself was not checked. |

## Verification performed

| Check | Result |
| --- | --- |
| npm run build | PASS. Vite production build plus 20 generated route/404 outputs. README currently says 22. |
| npm run test:web | PASS. 39 tests, 5 suites. Initial sandbox spawn EPERM was environmental; rerun passed. |
| npm --prefix apps/web run typecheck | PASS. |
| npm --prefix apps/web run lint | FAIL. 10 errors. |
| Design locks | PASS. No em/en dashes; permitted font-family declarations. |
| Browser route scan | 21 URLs at 1440px and 375px: no captured JavaScript exceptions or document horizontal overflow. This includes the removed experience URL and an invalid service URL. |
| Homepage visual inspector | 1440px, 768px, 390px; repeated after API connection. Final result: 13 taste-rule FAIL groups, 6 WARN groups. These are not 13 functional failures. |
| Public API reads | HTTP 200 for website details, projects, published posts, open vacancies and gallery. 21 projects, 1 published post, 0 open vacancies, 71 gallery records at audit time. |
| Unauthenticated administrative POST requests | Nine probes: project, banner, gallery, popup, video, vacancy, category, account creation and editor upload all returned 401. No records created. |
| Invalid public form requests | Empty quote/enquiry requests returned 400. No leads submitted. |
| Modal validation | Opening focuses the name field; an empty Next action shows an inline alert. |
| Quote validation | Empty first step displays name, mobile and email errors. |
| Backend integration suite | Not run: it creates accounts/posts/leads in the configured database. No isolated test MongoDB is available in this workspace. |
| Production deployment, real email delivery, successful lead persistence, real applicant submission and Core Web Vitals | Not verified. Careers currently directs applications to email. |

## Findings in priority order

### 1. P1: current CMS media is missing locally and fallback photos conceal it

The CMS references 189 project images; 179 are absent from apps/api/uploads. All 71 gallery images are absent. Browser requests return 404, but onError handling replaces many of them with stock/editorial images, so a broken-image count alone reports zero. A project titled Luxury Kitchen Design displays the exterior hero photograph; the studio narrative describes a joinery bench while showing an office lounge.

Evidence: [content audit](./content-audit.json), [network errors](./browser-audit.json), [homepage mobile sheets](../.taste-skill/inspect/mobile-page-01.jpg), [project screenshot](./1440-_projects.jpg). Relevant code: apps/web/src/components/home/Works.jsx:19, apps/web/src/components/home/Studio.jsx:35.

Fix: recover the media belonging to these CMS records or store it in durable object storage. Use an explicit image-unavailable state when actual project media cannot be recovered. Keep editorial imagery visibly separate from evidence of completed client work. These counts describe the local media store; production storage was not inspected.

### 2. P1: upload destination and static serving diverge

npm run dev:api starts server.js from the repository root. Multer writes to relative uploads/projects and uploads/posts, resolving under Dan/uploads. Express serves Dan/apps/api/uploads. A successful new upload therefore cannot be retrieved at its advertised /uploads URL with the documented root command.

On Vercel, upload middleware writes to the temporary directory, while Express still serves the repository uploads directory. Temporary storage also cannot provide durable CMS media across instances or deployments.

Evidence: apps/api/middlewares/multer.js:19, apps/api/middlewares/postUpload.js:14, apps/api/server.js:129 and 138; absolute path comparison in [content-audit.json](./content-audit.json). This mismatch was established from code and resolved paths; an authenticated upload was not performed.

Fix: share an absolute upload root for local serving/deletion. Use persistent object storage for deployment and store retrievable URLs. Review deletion paths too. The development fallback still references ../frontend/public/static after the move and needs correction.

### 3. P1: verification and password-reset emails point to missing pages

The mailer generates /verify-email?token=... and /reset-password?token=..., but App.jsx defines neither route. Both URLs render Page Not Found in the browser. ForgotPassword can request an email, but the recipient cannot complete the flow through the site.

Evidence: apps/api/middlewares/sendEmail.js:44 and 56, apps/web/src/App.jsx, [targeted audit](./targeted-audit.json).

Fix: implement both token-handling pages and connect them to the existing API endpoints. Verify valid, expired and already-used tokens using isolated test accounts. No emails were sent during this audit.

### 4. P2: published blog HTML can execute scripts

BlogDetails only removes empty paragraphs before passing CMS HTML to dangerouslySetInnerHTML. No sanitizer exists on that path; the backend stores supplied content. In a browser-only intercepted response, an image onerror handler executed successfully. The fixture was never written to MongoDB.

Evidence: apps/web/src/pages/public/blog/BlogDetails.jsx:29 and 187, apps/api/controllers/post.controller.js:52, [targeted audit](./targeted-audit.json), [reproduction script](./targeted-audit.mjs).

Fix: sanitize rich HTML with an explicit allowlist before storage/rendering, remove event-handler attributes and unsafe URL schemes, and retain only the editor markup required by the product. Post creation is admin-protected, which limits the entry point; unsafe published/imported HTML still executes for readers.

### 5. P2: accepting cookies lasts only until reload in the analytics state

Accept writes granted to localStorage and updates Consent Mode. After reload, index.html sets analytics_storage to denied, while CookieConsentBar sees the saved value and disappears without restoring consent. The stored preference and active analytics state disagree. No visible preference-reset control is provided.

Evidence: apps/web/index.html:23, apps/web/src/components/layout/CookieConsentBar.jsx:10, apps/web/src/lib/analytics.js:12, consentAfterAccept and consentAfterReload in [browser-audit.json](./browser-audit.json).

Fix: read the stored preference at initialization and apply it before analytics configuration; add a reachable cookie-preferences control. Confirm route pageviews and lead events separately: trackEvent is currently exported but unused in application code.

### 6. P2: the cookie banner covers the mobile conversion bar

At 375px, the 61px contact bar occupies y=751..812. The cookie banner occupies y=673..812 and has a higher z-index. Hit testing confirms the banner covers the contact actions. First-time visitors cannot reach those buttons until dismissing the banner; the hero CTA remains available.

Evidence: [first-visit screenshot](./mobile-first-visit.jpg), firstVisit in [browser-audit.json](./browser-audit.json), apps/web/src/styles/shell.css:835, CookieConsentBar.jsx:42.

Fix: coordinate fixed-bottom components so the consent controls and contact bar have separate reserved space, or collapse the contact bar while consent is shown. Check small heights and safe-area insets.

### 7. P2: reduced-motion preferences are bypassed

MotionProvider uses useState(false) for reducedMotion and always adds html.motion. The standalone Hero timeline also has no preference check. A browser emulating prefers-reduced-motion: reduce still showed a translated, partially transparent hero word during its entrance. Carousel reducedMotionRef is also initialized false.

Evidence: apps/web/src/motion/MotionProvider.jsx:38 and 42, apps/web/src/components/home/Hero.jsx:34, apps/web/src/components/home/EditorialCarousel3D.jsx:157; reducedMotion in [browser-audit.json](./browser-audit.json).

Fix: use a shared live matchMedia preference and gate all animation paths, including Hero and the carousel. Keep immediate content visibility when travel is disabled. This also resolves the mismatch with AGENT.md and workflow notes claiming support.

### 8. P2: customer address and hours are inconsistent

The configured CMS returns a Deira/Muraqqabat address. The contact map, brand brief and structured data point to Business Bay. The quote page concatenates street, city, state, zipCode and country, reproducing duplicated Dubai/UAE text. Quote hours say Sat-Thu 9am-6pm; the shared header/footer schedule says Mon-Fri 8:30am-6pm.

Evidence: [CMS contact snapshot](./content-audit.json), [mobile contact](./375-_contact.jpg), [mobile quote](./375-_quote.jpg), apps/web/src/pages/public/Contact.jsx:11 and 24, apps/web/src/pages/public/Quote.jsx:19 and 71, apps/web/src/lib/seoConfig.js.

Fix: confirm the correct office address and schedule, then use one source for visible text, map, mail links and structured data. The audit does not assume which of the conflicting addresses is correct.

### 9. P2: unknown service URLs silently render Architecture

/services/does-not-exist renders the Architecture title and content while retaining the invalid URL. This creates misleading pages for broken links and possible duplicate search content.

Evidence: apps/web/src/pages/public/services/ServiceDetail.jsx:14, both viewport entries in [browser-audit.json](./browser-audit.json).

Fix: validate against the actual service registry and return NotFound for unknown slugs. Use explicit redirects for legitimate aliases.

### 10. P2: prerender does not generate the complete site content

The build leaves div#root empty and appends a noscript block containing title, description, a shared facility paragraph and links. Service content, actual projects, FAQs and blog bodies are not rendered into the initial HTML. README promises complete static pre-rendering more strongly than the implementation delivers. The current build generates 20 route/404 outputs, not the documented 22.

The sitemap has 17 static URLs and no project/post detail URLs even though the running CMS contains 21 projects and a published post. Adding detail URLs requires SITEMAP_API_URL; CI does not set it. Deployment behavior of generated route files versus the SPA rewrite needs direct verification.

Evidence: apps/web/scripts/prerender.mjs:57 and 70, apps/web/scripts/generate-seo-files.mjs:16, apps/web/public/sitemap.xml, .github/workflows/ci.yml:34.

Fix: render actual route content to HTML, verify route-specific output is served, configure CMS sitemap generation, and add coverage for metadata/content parity. The imported HOME_JSON_LD also needs checking when VITE_SITE_URL differs from the default deployment domain.

### 11. P2: CI allows the current lint errors through

ESLint reports 10 errors: CookieConsentBar's synchronous state update in an effect; MotionProvider's non-component export; unused variables in parallax/reveal; and unused imports in WhyUs/servicesData. The frontend CI job is named Lint, Locks, Tests & Prerender Build but never runs lint. Typecheck is also omitted.

Evidence: apps/web/src/components/layout/CookieConsentBar.jsx:12, apps/web/src/motion/MotionProvider.jsx:34, .github/workflows/ci.yml:11 and 24..34.

Fix: clean up the 10 errors and add lint/typecheck to the job. Use lockfile-driven reproducible installs; both CI jobs currently use npm install.

### 12. P2: dropdown visibility and accessibility state disagree

Focusing Services opens the submenu through CSS focus-within, but aria-expanded remains false. Escape leaves the submenu visible. This contradicts the reported accessible dropdown behavior. Keyboard users can reach the links, but state announcements and closing behavior are incomplete.

Evidence: servicesKeyboard and servicesEscape in [browser-audit.json](./browser-audit.json), apps/web/src/components/layout/Header.jsx:132, apps/web/src/styles/shell.css:205.

Fix: use one controlled disclosure state for focus, pointer and keyboard interactions; synchronize aria-expanded and visibility and support Escape consistently.

### 13. P2: readability and subpage hierarchy need another pass

Homepage body text measures 14px; 22 text blocks are below 13px, including 9px hero/footer details and small testimonial labels. The testimonial secondary location uses #545454 on a nearly black card, approximately 2.5:1 contrast. Mobile contact/service headlines occupy four or five lines and repeat the full company name. The quote page has low-contrast serif text and a lengthy information panel before the form.

Evidence: final [visual inspector report](../.taste-skill/inspect/report.json), [contact](./375-_contact.jpg), [quote](./375-_quote.jpg), [service](./375-_services_interior-design.jpg), apps/web/src/styles/home.css:1861 and 2070.

Fix: set body text to at least 16px, secondary text to a readable size with sufficient contrast, shorten mobile headings, and bring the quote form forward. The inspector's covered-text flags include intentionally overlapping carousel cards and the cookie banner; they should not all be treated as independent layout bugs. A targeted check did not reproduce a persistent testimonial text mask.

### 14. P2: proof content and design-system documentation are not aligned

Service pages hardcode project examples and large delivery metrics rather than sourcing them from the CMS. The anonymous Emirates Hills testimonial has no linked case study; View Commission goes to the project list. The repository workflow notes explicitly say these claims and images still need client verification.

Meanwhile tokens.css defines a bronze accent, but index.css later overrides it to black. The browser computes --accent as #080807. The homepage uses oversized sans typography and a playful, draggable blob-letter footer while service/quote pages retain a different visual vocabulary. AGENT.md, BRAND_BRIEF.md and the active CSS describe different systems.

Evidence: apps/web/src/pages/public/services/servicesData.js:32 and 101, apps/web/src/components/home/Testimonial.jsx:4, docs/ai-website-workflow/01-brain-document.md:40, apps/web/src/styles/tokens.css:26, apps/web/src/index.css:37, [targeted audit](./targeted-audit.json).

Fix: confirm proof claims and image rights, connect testimonials to actual case studies, and decide the approved visual system. Consolidate tokens after that decision. Do not remove brand choices solely to satisfy an external taste scanner.

## Visual review

ROUND 1: final connected-CMS screenshots.

Seen in one second: the large From brief to built headline over warm architectural photography.
Idea: one accountable Dubai fit-out team carries a brief through delivery. The message is clear; the image does not yet prove this team's work.
Live thing: switchable/drag-enabled work carousel and interactive footer lettering. The footer interaction contributes little to choosing a fit-out contractor.
Layout words: hero=full-bleed / studio=editorial / services=cards / work=carousel or grid / process=split-list / testimonial=quote-card / contact=centered / footer=columns and lettering.
Scores: design 7.0, usability 6.0, creativity 5.5, content 5.0; weighted score 6.2. Under the skill's remaining-FAIL cap, reported rubric score is 6.0/10. This is a subjective design rubric, not a Lighthouse or accessibility score.

Top three visual improvements:
1. Restore authentic project/workshop media; the fallback photographs weaken trust more than spacing tweaks do.
2. Keep the strong hero, shorten subpage headings and increase reading sizes/contrast.
3. Unify the service/quote/home compositions and simplify fixed-bottom layers. Review whether the playful footer lettering fits the intended studio identity.

The source taste scanner found 232 FAIL and 194 WARN occurrences across public and admin CSS/JS. Many concern numbering, hairlines, eyebrows and glass, which the repository design guidelines themselves allow. Treat those totals as a style inventory; the functional findings above have separate evidence.

## Recommended repair order

1. Recover media and fix durable upload storage.
2. Implement email-link completion pages and sanitize blog HTML.
3. Correct contact data and consent initialization; remove the mobile bar collision.
4. Restore reduced-motion handling, invalid-service behavior and dropdown state.
5. Implement actual prerender content and CMS sitemap coverage; enforce lint/typecheck in CI.
6. Finish the readability, proof-content and design-system pass, then verify successful leads and emails against isolated test data and inspect the real deployment.

## Evidence files

- [Browser route and interaction results](./browser-audit.json)
- [Content and media inventory](./content-audit.json)
- [Targeted route/HTML reproductions](./targeted-audit.json)
- [Homepage visual report](../.taste-skill/inspect/report.json)
- [Source style scan](./design-lint.txt)
- Reproduction scripts: browser-audit.mjs, api-readonly-audit.mjs, content-audit.mjs, targeted-audit.mjs.

Audit scripts use browser-only fixtures or read-only/invalid/unauthenticated API requests. No successful lead, account, content or upload mutations were sent. The generated screenshots and reports are the only new tracked-workspace artifacts; normal build outputs and empty upload directories may also exist locally.

## Expanded architecture and tooling audit

The follow-up covers file structure, package/lockfile conventions, environment bootstrap, SMTP, deployment config, cache invalidation, dependencies, test isolation and maintainability. Read [the companion report](./project-structure-and-tooling-audit-2026-11-14.md). A new isolated reproduction confirms SMTP transport initialization before the API environment loads. Both child npm audits report zero known vulnerabilities.

For whether AI agents can reach and read the website, see [the live readability report](./ai-agent-readability-audit-2026-11-14.md). Public access succeeds on sampled routes; full content depends on JavaScript and API loading. Plain readers receive short summaries, the sampled blog contains literal embed code, and CMS detail URLs are missing from the deployed sitemap.

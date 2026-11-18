# AGENT.md — Engineering & Design Directives

Operational manual for AI agents and developers maintaining and evolving the **Yashmeen Future Building & Fit-Out Contracting Co. L.L.C** platform.

---

## 1. Project Overview & Architecture

* **Repository:** `Saleheen-Akhtar/yashmeen-fitout` (default branch `main`; inspect the current working branch before editing)
* **Workspace Root:** `C:\Users\sahil\Projects\IT\Dan`
* **Frontend:** `apps/web` - React 19, Vite, React Router DOM, plain CSS. Dashboard orchestration is in `pages/admin/Dashboard.jsx`; its cards, editors and shared helpers are in `components/admin/dashboard/`.
* **Backend:** `apps/api` - Node.js, Express, MongoDB Atlas (`mongoose`), JWT auth, memory uploads to Cloudinary, lazy Nodemailer SMTP and Upstash rate limits. `config/env.js` loads configuration; `services/` owns media/rate-limit clients.
* **Website content:** `shared/siteContent.js` owns existing defaults, merge rules, public-field selection and patch validation. Dashboard `SiteSettingsModal`/`ContentFields` edit public settings; protected `/api/webDetails/admin-details` also returns private tasks/calendar. Public API/cache output must exclude those fields. Save validated dotted fields, keep deliberately empty arrays empty and retain drafts on save failure.
* **Rendering modules:** `components/ui/spatial-gallery/` owns gallery geometry, layout and rendering. `components/layout/brand-lettering/` owns physics, rendering and audio cleanup. `entry-server.jsx` resolves lazy modules before its final render so initial HTML contains completed main content without hidden replacement segments.

This file is the current implementation and design authority. `docs/BRAND_BRIEF.md` and the website workflow notes are historical planning references; their older palette, fonts and business claims do not override current code or user decisions. Confirm office details, hours, certifications, client proof and image rights before publishing changes to those facts.

### Local Development Commands
```bash
# Frontend dev server (Port 3000)
npm run dev:web
# or: npm --prefix apps/web run dev

# Backend API server (Port 8000)
npm run dev:api
# or: node apps/api/server.js

# Production bundle check & static prerender
npm run build
# or: npm --prefix apps/web run build
```

---

## 2. Design System (Light Editorial)

Source of truth: `apps/web/src/styles/tokens.css` (tokens + primitives), `styles/shell.css` (header/footer), `styles/home.css` (homepage).

* **Theme:** light, warm white (`--bg #fbfaf7`), alt surface `--surface-alt #f4f1ea`, ink `#1b1a17`, muted `#6b665c`, hairlines `#e6e1d6`. Footer is light too. No dark/light zebra sections.
* **One accent:** bronze `--accent #8a6a28` (4.9:1 on white). No other golds. Photo overlays may use light text only on a dark gradient.
* **Type:** two fonts only. `--font-serif` Cormorant Garamond for display, `--font-sans` Plus Jakarta Sans for body. Scale 12/14/16/18/20/24/30/36/48/60. Body 16px, line-height 1.65. No text under 12px.
* **Space:** 4/8/16/24/32/48/64/96 (`--s-1` to `--s-8`). Sections use `.section` (96px, 64px on mobile).
* **Depth:** flat cards with 1px border; shadow only on hover or for popovers. Preserve the active Aperture hero, gallery and interactive lettering when doing maintenance.
* **Components:** `.btn .btn-primary|.btn-outline`, `.link-arrow`, `.card`, `.field`, `.eyebrow`, `.section-head`. Buttons and links are at least 44px tall.
* **Hierarchy rules:** max one eyebrow per section head. One primary button per view. Left-align body copy; center only short headings.
* **Accessibility:** visible focus ring, skip link in `Layout`, labelled form fields, `prefers-reduced-motion` honored, alt text on every `<img>`.
* **Em/en dashes:** still banned in user-facing copy. Use hyphen, colon, comma or period.
* **Images:** project/gallery `<img>` keep an `onError` fallback.
* **Motion (visitor site only):** `src/motion/MotionProvider.jsx` mounts in `Layout`. Lenis smooth scroll runs off the GSAP ticker. Tag markup instead of writing per-page code: `data-split` (line mask reveal), `data-words` (scrub-lit words), `data-reveal`, `data-stagger`, `data-in` (+`.line-draw`), `data-parallax`, `data-clip`, `data-count`, `data-magnetic`, `data-nomotion` (opt out), `data-manual` (opt a page out of the generic fade-up). Untagged pages get automatic heading splits and fade-ups.
* **Motion rules:** easing is `expo.out` / `power3.out`, never linear except scrub. Only animate `transform`, `opacity`, `clip-path`. Use the shared live `useReducedMotionPreference` hook, which honors the system preference and the visitor's motion toggle. Reduced mode keeps calm fades and smooth interactions while disabling large travel and automatic carousel rotation. The Hero owns its entrance. Never put a transform on `#main`.
* **Subpages:** each page keeps its own scoped variable block (`--archpg-*`, `--conspg-*`, etc.), now mapped to the light palette. When touching one, prefer the global tokens above.

---

## 3. Security & Backend Protocols

1. **Authentication Gate:**
   * All administrative mutations (`POST`, `PUT`, `DELETE` on `/api/projects`, `/api/banners`, `/api/popups`, `/api/gallery`, `/api/videos`, `/api/vacancies`, `/api/enquiries`) MUST use `protect, adminOnly` middleware.
2. **Credential Safety:**
   * Never commit `.env` or `details.txt`. Verify `.gitignore` before every commit.
   * Document new configuration keys in `apps/api/.env.example`.
3. **Uploads Handling:**
   * New project, gallery, banner, popup and blog images use memory uploads with Cloudinary storage.
   * Validate JPEG, PNG and WebP file signatures before any Cloudinary upload.
   * `apps/api/uploads/` and `/uploads` exist only for recoverable legacy-media migration until launch verification is complete.
4. **Tests and live operations:**
   * Install applications independently with `npm --prefix apps/web ci` and `npm --prefix apps/api ci`; use the two child lockfiles.
   * `npm test` runs frontend regressions and API unit tests. Integration tests require an explicit disposable `TEST_MONGO_URI`; never fall back to the business `MONGO_URI`.
   * Migration scripts are dry-run by default. Live migrations, uploads, email delivery and deployment need their own verification; static tests and builds do not establish launch readiness.

---

## 4. Quality Assurance Checklist Before Shipping

- [ ] Zero console errors or unhandled promise rejections in Chrome DevTools MCP.
- [ ] `npm run build` (or `npm --prefix apps/web run build`) exits with code 0.
- [ ] Zero em-dashes in modified components.
- [ ] Responsive inspection on desktop (1440px), tablet (768px), and mobile (375px).
- [ ] All forms (Quote, Contact, Career) validate inputs cleanly and provide visual feedback.

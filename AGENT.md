# AGENT.md — Engineering & Design Directives

Operational manual for AI agents and developers maintaining and evolving the **Yashmeen Future Building & Fit-Out Contracting Co. L.L.C** platform.

---

## 1. Project Overview & Architecture

* **Repository:** `Saleheen-Akhtar/yashmeen-fitout` (Git branch `main`)
* **Workspace Root:** `C:\Users\sahil\Projects\IT\Dan`
* **Frontend:** `backup/frontend` — React 19, Vite, React Router DOM, plain CSS (no Tailwind)
* **Backend:** `backup/backend` — Node.js, Express, MongoDB Atlas (`mongoose`), JWT auth, Multer file uploads, Nodemailer SMTP

### Local Development Commands
```bash
# Frontend dev server (Port 3000)
npm --prefix backup/frontend run dev

# Backend API server (Port 8000)
node backup/backend/server.js

# Production bundle check
npm --prefix backup/frontend run build
```

---

## 2. Design System (Light Editorial)

Source of truth: `backup/frontend/src/index.css` (tokens + primitives), `styles/shell.css` (header/footer), `styles/home.css` (homepage).

* **Theme:** light, warm white (`--bg #fbfaf7`), alt surface `--surface-alt #f4f1ea`, ink `#1b1a17`, muted `#6b665c`, hairlines `#e6e1d6`. Footer is light too. No dark/light zebra sections.
* **One accent:** bronze `--accent #8a6a28` (4.9:1 on white). No other golds. Photo overlays may use light text only on a dark gradient.
* **Type:** two fonts only. `--font-serif` Cormorant Garamond for display, `--font-sans` Plus Jakarta Sans for body. Scale 12/14/16/18/20/24/30/36/48/60. Body 16px, line-height 1.65. No text under 12px.
* **Space:** 4/8/16/24/32/48/64/96 (`--s-1` to `--s-8`). Sections use `.section` (96px, 64px on mobile).
* **Depth:** flat cards with 1px border; shadow only on hover or for popovers. No glassmorphism, no parallax.
* **Components:** `.btn .btn-primary|.btn-outline`, `.link-arrow`, `.card`, `.field`, `.eyebrow`, `.section-head`. Buttons and links are at least 44px tall.
* **Hierarchy rules:** max one eyebrow per section head. One primary button per view. Left-align body copy; center only short headings.
* **Accessibility:** visible focus ring, skip link in `Layout`, labelled form fields, `prefers-reduced-motion` honored, alt text on every `<img>`.
* **Em/en dashes:** still banned in user-facing copy. Use hyphen, colon, comma or period.
* **Images:** project/gallery `<img>` keep an `onError` fallback.
* **Motion (visitor site only):** `src/motion/MotionProvider.jsx` mounts in `Layout`. Lenis smooth scroll runs off the GSAP ticker. Tag markup instead of writing per-page code: `data-split` (line mask reveal), `data-words` (scrub-lit words), `data-reveal`, `data-stagger`, `data-in` (+`.line-draw`), `data-parallax`, `data-clip`, `data-count`, `data-magnetic`, `data-nomotion` (opt out), `data-manual` (opt a page out of the generic fade-up). Untagged pages get automatic heading splits and fade-ups.
* **Motion rules:** easing is `expo.out` / `power3.out`, never linear except scrub. Only animate `transform`, `opacity`, `clip-path`. Always respect `prefers-reduced-motion` (provider and `html.motion` class are skipped). Never put a transform on `#main`.
* **Subpages:** each page keeps its own scoped variable block (`--archpg-*`, `--conspg-*`, etc.), now mapped to the light palette. When touching one, prefer the global tokens above.

---

## 3. Security & Backend Protocols

1. **Authentication Gate:**
   * All administrative mutations (`POST`, `PUT`, `DELETE` on `/api/projects`, `/api/banners`, `/api/popups`, `/api/gallery`, `/api/videos`, `/api/vacancies`, `/api/enquiries`) MUST use `protect, adminOnly` middleware.
2. **Credential Safety:**
   * Never commit `.env` or `details.txt`. Verify `.gitignore` before every commit.
   * Document new configuration keys in `backup/backend/.env.example`.
3. **Uploads Handling:**
   * Disk storage uses `backup/backend/uploads/`.
   * Static route: `app.use("/uploads", express.static(path.join(__dirname, "uploads")))`.

---

## 4. Quality Assurance Checklist Before Shipping

- [ ] Zero console errors or unhandled promise rejections in Chrome DevTools MCP.
- [ ] `npm --prefix backup/frontend run build` exits with code 0.
- [ ] Zero em-dashes (`—`) in modified components.
- [ ] Responsive inspection on desktop (1440px), tablet (768px), and mobile (375px).
- [ ] All forms (Quote, Contact, Career) validate inputs cleanly and provide visual feedback.

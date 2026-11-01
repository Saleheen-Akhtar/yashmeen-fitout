# AGENT.md — Engineering & Design Directives

Operational manual for AI agents and developers maintaining and evolving the **Yashmeen Future Building & Fit-Out Contracting Co. L.L.C** platform.

---

## 1. Project Overview & Architecture

* **Repository:** `Saleheen-Akhtar/yashmeen-fitout` (Git branch `main`)
* **Workspace Root:** `C:\Users\sahil\Projects\IT\Dan`
* **Frontend:** `backup/frontend` — React 19, Vite, React Router DOM, Tailwind CSS
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

## 2. Design System & Anti-Slop Directives

Every design modification must align with `design-taste-frontend-v2-experimental` and `antigravity-design-expert`.

### Core Dial Configuration
* **`DESIGN_VARIANCE: 7`** — Asymmetric editorial rhythm, balanced white space, strict `< 768px` mobile collapse.
* **`MOTION_INTENSITY: 6`** — Smooth scroll reveal, tactile button depression, glassmorphic refraction, spring physics.
* **`VISUAL_DENSITY: 3`** — Airy, gallery-grade pacing (`py-28` to `py-36`), expansive photography, no cramped cards.

### Hard Rules & Constraints (Non-Negotiable)

1. **ZERO EM-DASH RULE (Section 9.G)**
   * **Banned:** Em-dash (`—`) and en-dash (`–`) are completely banned across the entire user-facing interface (headlines, body copy, quotes, tags, buttons, attributions, alt text).
   * **Approved:** Use standard hyphen (`-`), colon, period, or comma.

2. **PAGE THEME LOCK (Section 4.11)**
   * **No Zebra-Striping:** The page must not alternate back and forth between dark obsidian and light beige every section. Sections must transition smoothly within a coherent architectural theme.

3. **EYEBROW RESTRAINT (Section 4.7 & 9.F)**
   * **Cap:** Maximum 1 uppercase tracking eyebrow tag per 3 sections (at most 4 across the homepage). Never place an eyebrow above every single section.

4. **COLOR CONSISTENCY LOCK (Section 4.2)**
   * **Allowed Palette:** Obsidian (`#0d0c0a`, `#141311`), Satin Brass (`#c5a059`, `#dfba73`, `#8a6a28`), Warm Stone Linen (`#f7f5f0`, `#eae5dc`), and Crisp White (`#ffffff`).
   * **Banned:** Legacy bright blue (`#0077ff`), corporate navy (`#254184`), and stark red (`#cf332a`).

5. **IMAGE & BADGE DISCIPLINE (Section 4.8 & 9.F)**
   * **No Image Overlays:** Do not place floating `.rb-tag` or `.rb-label` badges directly on top of photos. Let the architectural photography speak; place captions cleanly underneath.
   * **Mandatory Fallback:** MongoDB records may reference filenames not on disk. Always provide `FALLBACK_IMAGES` and `onError={(e) => { e.currentTarget.src = fallbackUrl; }}` on project/gallery `<img>` tags.

6. **ANTIGRAVITY SPATIAL DEPTH**
   * Use frosted glassmorphic surfaces (`backdrop-filter: blur(16px)` + `border: 1px solid rgba(255,255,255,0.08)` + inner highlight `box-shadow: inset 0 1px 0 rgba(255,255,255,0.12)`).
   * Provide tactile button depression: `:active { transform: scale(0.98); }`.
   * Stagger entrances on card grids by `0.08s`.

7. **ACCESSIBILITY & REDUCED MOTION (Section 6.B)**
   * Always wrap continuous or complex transitions with `@media (prefers-reduced-motion: reduce)` fallbacks.
   * Ensure text passes WCAG AA contrast (minimum 4.5:1 for body copy).

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

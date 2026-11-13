# Changelog

All notable changes to the **Yashmeen Future Building & Fit-Out Contracting Co. L.L.C** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- **Structure tidy:** `pages/website` split into `pages/public/{projects,services,media,blog}`, `components/` grouped (`layout`, `home`, `seo`, `ui`, `experiments`), `libs` and cache helpers merged into `lib/`, `layouts/` and `routes/` split out of `pages/`. Root README added; brand brief moved to `docs/`. Dead demo routes (`/svg`, `/parallax-demo`) removed.
- **Homepage Works:** no invented fallback projects (honest empty state); desktop opens on the 3D carousel, small screens on the bento grid.
- **SEO:** `scripts/generate-seo-files.mjs` builds `sitemap.xml` and `robots.txt` (adds project and blog URLs when `SITEMAP_API_URL` is set); `VITE_SITE_URL` drives canonical and OG tags in `index.html` too.
- **Backend:** `trust proxy` on Vercel so rate limits are per visitor; password-reset tokens stored hashed; preview-origin CORS is opt-in (`ALLOW_VERCEL_PREVIEWS`); HSTS header.
- `/login` and `/forgot-password` now render inside `<main>`.
- **Light editorial redesign (all pages):** new token system in `index.css` (single bronze accent, two fonts, 4/8 spacing scale, flat cards, 44px+ targets).
- **Header/Footer:** rewritten with CSS classes, keyboard-accessible dropdowns, active-route state, Escape to close, light footer, skip link.
- **Homepage:** reduced from 8 sections to 6 (hero, services, projects, process, client words, contact). Removed auto-opening offer modal, scope configurator, client logo strip, GSAP hero.
- **Subpages:** per-page variable blocks mapped to the light palette; overlays on photos keep light text; gallery/video/projects pages converted; Google font imports unified to two families.

### Added (motion pass)
- Lenis smooth scroll synced to GSAP ScrollTrigger, scroll progress bar, route fade, header that hides on scroll down.
- Reusable data-attribute motion system (split-text line reveals, scrub-lit words, stagger, parallax, count-up, magnetic buttons) applied site-wide.
- Homepage v2: oversized hero with expanding image mask, service marquee, scroll-lit statement, hover-preview service list, pinned horizontal projects gallery, dark count-up numbers band, drawn-line process, footer wordmark.
- New dependency: `lenis`.

### Unused after redesign (safe to delete once confirmed)
`About, Beforeafter, Blog, Certifications, Clients, FAQ, Factory, Offer, OfferModal, ProjectLanding, ScopeConfigurator, Services, Why` in `src/components`.

---

## [1.1.0] - 2026-11-01

### Added
- **Private GitHub Repository**: Initialized Git and created the remote repository [`Saleheen-Akhtar/yashmeen-fitout`](https://github.com/Saleheen-Akhtar/yashmeen-fitout) on branch `main`.
- **Credential Protection**: Implemented a comprehensive root `.gitignore` shielding database connection strings, passwords in `details.txt`, environment files (`.env`), build outputs (`dist/`), and large media archives (`*.rar`, `*.mp4`).
- **Environment Template**: Created `backup/backend/.env.example` with documented configuration parameters for MongoDB, JWT secrets, Nodemailer SMTP, and frontend origins.
- **Architectural Typography**: Imported Google Fonts `Cormorant Garamond` (editorial serif) and `Plus Jakarta Sans` in `backup/frontend/index.html`.
- **Luxury Design Tokens**: Added `--brass`, `--brass-light`, `--brass-dim`, `--font-serif`, and smooth button interaction tokens to `backup/frontend/src/index.css`.
- **Architectural Fallback System**: Added fallback image mapping and `onError` image handlers to `ProjectLanding.jsx`, `Project.jsx`, and `PhotoGallery.jsx` so missing uploaded images gracefully load high-res photography.
- **Curated Editorial Journal**: Added structured architectural articles with cover photography and reading times to `Blog.jsx`, resolving the empty database black box.

### Changed
- **Header & Navigation**:
  - Restyled into frosted glass navigation with `backdrop-filter: blur(16px)` and `rgba(255, 255, 255, 0.94)`.
  - Added formatted studio hotline `+971 54 386 2870` with `"CALL THE STUDIO"` subtext.
  - Upgraded `"GET A QUOTE"` button with satin brass gradient styling and hover micro-interactions.
- **Hero Section**:
  - Updated headline to Cormorant Garamond: *"Dubai's fit-out partner for considered interiors."* with italicized gold typography on *"considered"*.
  - Refined architectural metric counters and primary/secondary CTA buttons.
- **Client Social Proof**:
  - Replaced generic placeholder labels in `Clients.jsx` with verified UAE developers and operators (*Emaar Hospitality, Sobha Realty, Damac Properties, Al Habtoor Group, Meraas Dubai, Nakheel Properties, Dnata Retail, Omniyat Living*).
- **About vs Services Deduplication**:
  - Removed duplicate 4-service cards from `About.jsx` that replicated `Services.jsx`.
  - Re-architected `About.jsx` into 4 Studio Operational Pillars:
    1. *Single-Source Accountability* (zero subcontractor blame-shifting)
    2. *In-House Al Quoz Facility* (35,000 sq.ft joinery, upholstery, metal and glass)
    3. *ISO-Audited Standards* (ISO 9001 · 14001 · 45001)
    4. *Guaranteed 60-90 Day Handover* (strict milestone scheduling)
- **Testimonials Section**:
  - Replaced brittle direct-DOM manipulation carousel in `Testimonials.jsx` with native React state (`useState`, auto-play interval timer, accessible indicators).
- **Contact & Footer Clean-up**:
  - Sanitized buggy repeated address string (`"Dubai , Dubai , 67 Dubai UAE"` $\rightarrow$ `"Bay Square, Building 12 - Office G01, Marasi Dr - Business Bay, Bay Square - Dubai - UAE"`).
  - Fixed broken footer service anchor links (`/architecture` $\rightarrow$ `/services/architecture`).

### Fixed
- **Critical Backend Route Security**:
  - Secured all 11 vulnerable backend routes (`enquiry`, `project`, `vacancy`, `video`, `banner`, `popup`, `gallery`, etc.) with `protect, adminOnly` middleware.
  - Verified 11/11 endpoints reject unauthenticated mutation requests with `401 Unauthorized`.
- **Runtime Crashes & Bugs**:
  - Fixed `ReferenceError: a is not defined` runtime exception in `Footer.jsx` line 76.
  - Fixed solid pitch-black empty rectangle bug in `Blog.jsx`.
  - Fixed broken image placeholder boxes in `ProjectLanding.jsx` caused by missing disk files.

---

## [1.0.0] - 2026-10-15

### Initial State
- Initial delivery of Yashmeen Future Building fit-out contracting application.
- Frontend: React 19 + Vite with Tailwind CSS.
- Backend: Node.js, Express, MongoDB Atlas, Multer, Nodemailer.

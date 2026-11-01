# Changelog

All notable changes to the **Yashmeen Future Building & Fit-Out Contracting Co. L.L.C** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned & In-Progress (Design Engineering & Antigravity Motion)
- **Theme Lock Harmonization**: Eliminate the 6x zebra-striping between dark and light sections on the homepage to comply with Page Theme Lock (Section 4.11).
- **Global Zero Em-Dash Sweep**: Eliminate all em-dashes (`—`) and en-dashes (`–`) across all user-facing strings to comply with Anti-Slop Section 9.G.
- **Eyebrow Rationing**: Reduce uppercase tracking eyebrow tags from 10 down to 4 focused architectural moments across the homepage.
- **Before/After Renovation Slider**: Activate and integrate `Beforeafter.jsx` between Services and Projects with a brushed brass tactile drag control.
- **Antigravity Spatial Depth**: Add subtle glassmorphism (`backdrop-filter: blur(16px)` + layered 1px borders + inner top-edge highlights) and tactile active button depression.

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

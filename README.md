# Yashmeen Future Building & Fit-Out Contracting

Marketing site, enquiry pipeline and CMS for Yashmeen Fit-Out (Dubai).
React + Vite frontend, Express + MongoDB backend, deployed on Vercel.

```
.
├── AGENT.md                 # design system + working rules for AI/dev agents
├── CHANGELOG.md
├── README.md
├── package.json             # monorepo workspaces and scripts
├── vercel.json              # Vercel Services configuration (apps/web + apps/api)
├── docs/                    # BRAND_BRIEF.md, workflow notes
└── apps/
    ├── api/                 # Express + MongoDB backend
    │   ├── server.js        # app setup: headers, CORS, rate limits, routers
    │   ├── config/          # db, cloudinary, mailer
    │   ├── routes/          # one router per resource
    │   ├── controllers/     # request handlers
    │   ├── models/          # Mongoose schemas
    │   ├── middlewares/     # auth, upload, email
    │   ├── tests/           # node --test (needs a TEST database)
    │   └── uploads/         # committed seed images
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
            │   ├── auth/    # Login, ForgotPassword
            │   └── admin/   # dashboard + CMS managers
            ├── components/
            │   ├── layout/  # Header, Footer, MenuOverlay, QuestionnaireModal, ...
            │   ├── home/    # Hero, Studio, Works, Process, Testimonial, CTA
            │   ├── seo/     # SeoHead
            │   ├── ui/      # Loading, shared primitives
            │   └── experiments/
            ├── lib/         # helpers, seoConfig, publicCache, uploader, utils
            ├── services/    # api.js (axios client + endpoint wrappers)
            ├── store/       # auth store
            ├── hooks/       # useWebsiteContent
            ├── motion/      # MotionProvider (GSAP, Lenis)
            ├── data/  styles/
```

## Commands

```bash
# Root monorepo commands:
npm run dev:web      # http://localhost:3000 (proxies /api to :8000)
npm run dev:api      # http://localhost:8000
npm run test         # runs all frontend and backend tests
npm run build        # builds frontend and pre-renders 22 static HTML pages
npm run check:locks  # verifies 0 em-dashes and strict 2-font design system
```

## Environment

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SITE_URL` | frontend | Public origin: canonical, OG tags, sitemap, robots |
| `SITEMAP_API_URL` | frontend build | API base used to add project and blog URLs to the sitemap (optional) |
| `VITE_API_URL` | frontend | API base (defaults to `/api`) |
| `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` | backend | Database and auth |
| `CLIENT_URL` | backend | Allowed CORS origin |
| `ALLOW_VERCEL_PREVIEWS` | backend | `true` lets `yashmeen-fitout*.vercel.app` previews call the API |
| `TRUST_PROXY` | backend | `true` behind your own proxy (automatic on Vercel) |

Full list: `apps/api/.env.example`.

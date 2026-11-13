# Yashmeen Future Building & Fit-Out Contracting

Marketing site, enquiry pipeline and CMS for Yashmeen Fit-Out (Dubai).
React + Vite frontend, Express + MongoDB backend, deployed on Vercel.

```
.
├── AGENT.md                 # design system + working rules for AI/dev agents
├── CHANGELOG.md
├── README.md
├── docs/                    # BRAND_BRIEF.md, workflow notes
└── backup/                  # Vercel root directory (see vercel.json)
    ├── vercel.json          # frontend + backend services, rewrites
    ├── backend/
    │   ├── server.js        # app setup: headers, CORS, rate limits, routers
    │   ├── config/          # db, cloudinary, mailer
    │   ├── routes/          # one router per resource
    │   ├── controllers/     # request handlers
    │   ├── models/          # Mongoose schemas
    │   ├── middlewares/     # auth, upload, email
    │   ├── utils/
    │   ├── tests/           # node --test (needs a TEST database, never production)
    │   └── uploads/         # committed seed images (ephemeral on Vercel)
    └── frontend/
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
cd backup/frontend
npm install
npm run dev          # http://localhost:3000, proxies /api to :8000
npm run lint && npm run typecheck && npm test
npm run build        # runs the SEO generator first (sitemap.xml, robots.txt)

cd ../backend
npm install
npm start            # needs MONGO_URI etc., see .env.example
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

Full list: `backup/backend/.env.example`.

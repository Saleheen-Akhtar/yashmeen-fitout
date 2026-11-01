import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { projectAPI, itemPath } from "../services/api";

const MAX_PROJECTS = 6;

const FALLBACK_PROJECT_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
];

const toList = (res) => {
  if (Array.isArray(res)) return res;
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  const list =
    body?.data ?? body?.projects ?? body?.items ?? body?.results ?? body;
  if (Array.isArray(list)) return list;
  const inner =
    list?.projects ?? list?.items ?? list?.results ?? list?.data ?? null;
  return Array.isArray(inner) ? inner : [];
};

const isActive = (p) => {
  const s = p?.status;
  if (s === undefined || s === null || s === "") return true;
  const v = typeof s === "string" ? s.trim().toLowerCase() : s;
  return [true, "true", 1, "1", "active"].includes(v);
};

const fileUrl = (path = "") =>
  /^https?:\/\//i.test(path)
    ? path
    : `${itemPath}/${String(path).replace(/^\/+/, "")}`;

const buildProject = (p, idx) => {
  const cat = p.categoryId ?? p.category;
  const catName =
    typeof cat === "object" ? (cat?.categoryName ?? cat?.name ?? "") : (cat ?? "");
  const catKey = typeof cat === "object" ? String(cat?._id ?? catName) : String(cat ?? "");
  const imagePath =
    p.file ?? p.image ?? p.thumbnail ?? p.coverImage ?? p.images?.[0] ?? "";

  return {
    id: p._id,
    label: p.title ?? p.name ?? p.projectName ?? "Luxury Interior Project",
    tag: catName || "Fit-Out",
    cat: catKey || "all",
    location: p.location || "Dubai, UAE",
    scope: p.scope || "Turnkey Fit-Out",
    img: imagePath ? fileUrl(imagePath) : FALLBACK_PROJECT_IMAGES[idx % FALLBACK_PROJECT_IMAGES.length],
  };
};

export default function ProjectsSection() {
  const rootRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await projectAPI.getAll();
        const all = toList(res);
        const list = all
          .filter(isActive)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, MAX_PROJECTS)
          .map((p, i) => buildProject(p, i));
        if (!cancelled) setProjects(list);
      } catch (err) {
        console.error("Failed to load projects:", err);
        if (!cancelled) {
          setError(err?.response?.data?.message || "Could not load projects.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useMemo(() => {
    const seen = new Map();
    projects.forEach((p) => {
      if (p.cat && p.tag && !seen.has(p.cat)) {
        seen.set(p.cat, p.tag);
      }
    });
    return Array.from(seen.entries()).map(([cat, tag]) => ({ cat, tag }));
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter((p) => p.cat === activeFilter);
  }, [projects, activeFilter]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealEls = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [visibleProjects]);

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ PROJECTS ============ */
        .projects {
            padding: 110px 0;
            background: #110f0c;
            color: #ffffff;
            position: relative;
            overflow: hidden;
        }

        .projects .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .projects .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .projects .eyebrow {
            color: var(--brass-light, #dfba73);
        }

        .projects .eyebrow::before {
            background: var(--brass-light, #dfba73);
        }

        .projects h2.section-title {
            color: #ffffff;
            font-family: var(--font-serif);
            font-size: clamp(34px, 4.5vw, 54px);
            letter-spacing: -0.01em;
            margin-top: 14px;
        }

        .filter-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin: 36px 0 44px;
        }

        .filter-btn {
            padding: 10px 22px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: transparent;
            color: rgba(255, 255, 255, 0.75);
            font-size: 12.5px;
            font-weight: 600;
            letter-spacing: .06em;
            text-transform: uppercase;
            transition: all .25s ease;
            border-radius: 4px;
            cursor: pointer;
        }

        .filter-btn:hover {
            border-color: var(--brass-light, #dfba73);
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
        }

        .filter-btn.active {
            background: var(--brass, #c5a059);
            border-color: var(--brass, #c5a059);
            color: #17140f;
            font-weight: 700;
            box-shadow: 0 4px 16px rgba(197, 160, 89, 0.3);
        }

        .proj-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 26px;
        }

        .proj-status {
            grid-column: 1 / -1;
            padding: 60px 0;
            text-align: center;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.6);
        }

        .proj-card {
            display: block;
            aspect-ratio: 4/5;
            color: inherit;
            text-decoration: none;
            cursor: pointer;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: transform .4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color .35s, box-shadow .35s;
            position: relative;
        }

        .proj-card:hover {
            transform: translateY(-6px);
            border-color: rgba(197, 160, 89, 0.45);
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
        }

        .proj-card .room-block {
            height: 100%;
            width: 100%;
            position: relative;
            overflow: hidden;
            background: #1a1713;
        }

        .proj-card .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform .65s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .proj-card:hover .room-block img {
            transform: scale(1.06);
        }

        .proj-card .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 35%, rgba(17,15,12,0.85) 80%, rgba(17,15,12,0.98) 100%);
            pointer-events: none;
        }

        .proj-card .rb-tag {
            position: absolute;
            top: 18px;
            left: 18px;
            z-index: 2;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--brass-light, #dfba73);
            background: rgba(17, 15, 12, 0.65);
            padding: 6px 12px;
            border-radius: 3px;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(197, 160, 89, 0.2);
        }

        .proj-card .rb-content {
            position: absolute;
            left: 20px;
            right: 20px;
            bottom: 20px;
            z-index: 2;
        }

        .proj-card .rb-label {
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 500;
            line-height: 1.25;
            color: #ffffff;
            margin: 0;
        }

        .proj-card .rb-sub {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.65);
            letter-spacing: 0.04em;
        }

        .proj-card .view-pill {
            font-size: 11.5px;
            font-weight: 700;
            color: var(--brass-light);
            display: inline-flex;
            align-items: center;
            gap: 4px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            opacity: 0;
            transform: translateX(-4px);
            transition: all 0.25s ease;
        }

        .proj-card:hover .view-pill {
            opacity: 1;
            transform: translateX(0);
        }

        .projects-footer {
            margin-top: 50px;
            text-align: center;
        }

        @media(max-width:960px) {
            .proj-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media(max-width:600px) {
            .proj-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <section className="projects" id="projects">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Flagship Commissions</span>
            <h2 className="section-title">Recently completed fit-outs</h2>
            <p className="lede" style={{ color: "rgba(255, 255, 255, 0.72)" }}>
              Explore our curated portfolio of delivered luxury villas, corporate offices,
              and hospitality venues across Dubai and the UAE.
            </p>
          </div>

          {filters.length > 0 && (
            <div className="filter-row reveal">
              <button
                type="button"
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Projects
              </button>
              {filters.map((f) => (
                <button
                  key={f.cat}
                  type="button"
                  className={`filter-btn ${activeFilter === f.cat ? "active" : ""}`}
                  onClick={() => setActiveFilter(f.cat)}
                >
                  {f.tag}
                </button>
              ))}
            </div>
          )}

          <div className="proj-grid reveal">
            {loading ? (
              <div className="proj-status">Loading projects…</div>
            ) : error ? (
              <div className="proj-status error">{error}</div>
            ) : visibleProjects.length === 0 ? (
              <div className="proj-status">No projects found.</div>
            ) : (
              visibleProjects.map((p, idx) => {
                const href = `/project/details/${p.id}`;
                return (
                  <Link
                    key={p.id}
                    to={href}
                    className="proj-card"
                    aria-label={`View project: ${p.label}`}
                  >
                    <div className="room-block">
                      <img
                        src={p.img}
                        alt={p.label}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            FALLBACK_PROJECT_IMAGES[idx % FALLBACK_PROJECT_IMAGES.length];
                        }}
                      />
                      {p.tag && <span className="rb-tag">{p.tag}</span>}
                      <div className="rb-content">
                        <h3 className="rb-label">{p.label}</h3>
                        <div className="rb-sub">
                          <span>{p.location}</span>
                          <span className="view-pill">Explore &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="projects-footer reveal">
            <Link to="/projects" className="btn btn-brass">
              View Entire Portfolio &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

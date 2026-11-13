import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { projectAPI, itemPath } from "../../services/api";
import { subscribeCacheInvalidation } from "../../lib/publicCache";
import Loading from "../ui/Loading";

const EditorialCarousel3D = lazy(() => import("./EditorialCarousel3D"));

const BENTO_CLASSES = [
  "is-landscape",
  "is-portrait is-monumental offset-top",
  "is-portrait is-monumental",
  "is-landscape offset-top",
  "is-landscape",
  "is-portrait is-monumental offset-top",
];

const FALLBACK_IMAGES = [
  "/static/hero-aperture-v2.webp",
  "/static/work-oh-office.jpg",
  "/static/Office-fit-out.jpg",
  "/static/joinery-bay.jpg",
  "/static/hero-editorial.webp",
  "/static/studio.jpg",
];

const resolveProjectImage = (img, idx) => {
  if (!img) return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
  if (/^https?:\/\//i.test(img) || /^\/static\//i.test(img) || /^\/images\//i.test(img)) {
    return img;
  }
  return `${itemPath ?? "/uploads"}/${String(img).replace(/^\/+/, "")}`;
};

export default function Works() {
  const navigate = useNavigate();
  // Desktop opens on the 3D carousel; small screens keep the lighter bento grid.
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
      ? "carousel"
      : "grid"
  );
  const [status, setStatus] = useState("loading");
  const [liveProjects, setLiveProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const res = await projectAPI.getAll({ limit: 12 });
        const items = res?.data?.data ?? [];
        if (!cancelled && Array.isArray(items) && items.length > 0) {
          const mapped = items.slice(0, 6).map((p, idx) => {
            const catLabel =
              typeof p.categoryId === "object" && p.categoryId?.categoryName
                ? p.categoryId.categoryName
                : p.sector || "FIT-OUT";
            const locLabel = p.location || "DUBAI";
            const yearStr = p.createdAt
              ? String(new Date(p.createdAt).getFullYear())
              : "2026";
            return {
              id: p._id,
              num: `(${String(idx + 1).padStart(2, "0")})`,
              name: p.title,
              tag: `${catLabel.toUpperCase()} · ${locLabel.toUpperCase()}`,
              year: yearStr,
              img: resolveProjectImage(p.images?.[0], idx),
              imgAlt: `${p.title} - ${locLabel}`,
              className: BENTO_CLASSES[idx % BENTO_CLASSES.length],
            };
          });
          setLiveProjects(mapped);
        }
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("ready");
      }
    };

    void loadProjects();

    const onRefresh = () => {
      void loadProjects();
    };
    const unsubscribeCache = subscribeCacheInvalidation((scope) => {
      if (scope === "projects") onRefresh();
    });
    window.addEventListener("site-content-updated", onRefresh);
    window.addEventListener("projects-updated", onRefresh);
    return () => {
      cancelled = true;
      unsubscribeCache();
      window.removeEventListener("site-content-updated", onRefresh);
      window.removeEventListener("projects-updated", onRefresh);
    };
  }, []);

  // Only real projects from the CMS are shown; no invented placeholders.
  const displayedProjects = liveProjects;
  const carouselProjects = displayedProjects.map((project, idx) => ({
    id: project.id,
    src: project.img,
    fallbackSrc: FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
    alt: project.imgAlt,
    category: project.tag,
    title: project.name,
  }));

  return (
    <section className="works-bento-section wrap" id="works" aria-label="Selected Works">
      {/* Section Header */}
      <div className="works-bento-header">
        <div>
          <span className="eyebrow">(SPACES WE HAVE MADE)</span>
          <h2 className="u-text-h2">Selected work</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div className="works-view-switcher">
            <button
              type="button"
              aria-pressed={viewMode === "grid"}
              className={`works-switch-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Editorial Bento
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "carousel"}
              className={`works-switch-btn ${viewMode === "carousel" ? "active" : ""}`}
              onClick={() => setViewMode("carousel")}
            >
              3D Carousel
            </button>
          </div>
          <span className="works-bento-count" aria-label="Featured projects count">
            ({String(displayedProjects.length).padStart(2, "0")})
          </span>
        </div>
      </div>

      {displayedProjects.length === 0 ? (
        <p className="works-empty" role="status">
          {status === "loading"
            ? "Loading projects..."
            : "Our latest projects will appear here shortly."}
        </p>
      ) : viewMode === "grid" ? (
        <div className="works-bento-grid">
          {displayedProjects.map((proj, idx) => (
            <Link
              key={proj.id}
              to={`/project/details/${proj.id}`}
              className={`works-card ${proj.className}`}
            >
              <div className="works-card-image-wrap">
                <div className="works-card-image-inner">
                  <img
                    src={proj.img}
                    alt={proj.imgAlt}
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallbackApplied) {
                        e.currentTarget.dataset.fallbackApplied = "1";
                        e.currentTarget.src = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                      }
                    }}
                  />
                </div>
              </div>

              <div className="works-card-meta">
                <div>
                  <span className="works-card-tag">
                    {proj.num} / {proj.tag}
                  </span>
                  <h3 className="works-card-title">{proj.name}</h3>
                </div>
                <span>{proj.year}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="works-carousel-bleed">
          <Suspense fallback={<Loading />}>
            <EditorialCarousel3D
              items={carouselProjects}
              ariaLabel="Selected work 3D carousel"
              onCardClick={(item) => {
                if (item?.id) navigate(`/project/details/${item.id}`);
              }}
            />
          </Suspense>
        </div>
      )}

      {/* Archive Link */}
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <Link to="/projects" className="btn-pill btn-pill-dark">
          <span>VIEW FULL PROJECT ARCHIVE</span>
          <span className="g-circle" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

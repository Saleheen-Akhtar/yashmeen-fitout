import useWebsiteContent from "../../hooks/useWebsiteContent";
import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { projectAPI } from "../../services/api";
import { resolveMediaUrl } from "../../lib/media";
import { subscribeCacheInvalidation } from "../../lib/publicCache";
import Loading from "../ui/Loading";
import { getPrerenderData } from "../../lib/prerenderData";

const EditorialCarousel3D = lazy(() => import("./EditorialCarousel3D"));

const BENTO_CLASSES = [
  "is-landscape",
  "is-portrait is-monumental offset-top",
  "is-portrait is-monumental",
  "is-landscape offset-top",
  "is-landscape",
  "is-portrait is-monumental offset-top",
];

const resolveProjectImage = resolveMediaUrl;

const mapProjects = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  // Dynamically prioritize projects marked as isFeatured, sorted by featuredOrder then createdAt
  const featured = items
    .filter((p) => p && p.isFeatured === true)
    .sort((a, b) => {
      const orderA = a.featuredOrder && a.featuredOrder > 0 ? Number(a.featuredOrder) : 999;
      const orderB = b.featuredOrder && b.featuredOrder > 0 ? Number(b.featuredOrder) : 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  const nonFeatured = items.filter((p) => p && !p.isFeatured);
  const ordered = [...featured, ...nonFeatured].slice(0, 6);

  return ordered.map((p, idx) => {
    const catLabel = typeof p.categoryId === "object" && p.categoryId?.categoryName
      ? p.categoryId.categoryName
      : p.sector || "FIT-OUT";
    const locLabel = p.location || "DUBAI";
    const yearStr = p.createdAt ? String(new Date(p.createdAt).getFullYear()) : "2026";
    return {
      id: p._id || p.id,
      num: `(${String(idx + 1).padStart(2, "0")})`,
      name: p.title,
      tag: `${catLabel.toUpperCase()} · ${locLabel.toUpperCase()}`,
      year: yearStr,
      img: resolveProjectImage(p.images?.[0]),
      imgAlt: `${p.title} - ${locLabel}`,
      className: BENTO_CLASSES[idx % BENTO_CLASSES.length],
    };
  });
};

export default function Works() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.Works;

  const navigate = useNavigate();
  const prerenderData = getPrerenderData();
  const hasPrerenderedProjects = Array.isArray(prerenderData.projects);
  const prerenderedProjects = hasPrerenderedProjects ? prerenderData.projects : [];
  const [viewMode, setViewMode] = useState("grid");
  const [status, setStatus] = useState(hasPrerenderedProjects ? "ready" : "loading");
  const [liveProjects, setLiveProjects] = useState(() => mapProjects(prerenderedProjects));

  useEffect(() => {
    let cancelled = false;
    let viewRaf = 0;

    if (window.matchMedia("(min-width: 1024px)").matches) {
      viewRaf = window.requestAnimationFrame(() => setViewMode("carousel"));
    }

    const loadProjects = async () => {
      try {
        const res = await projectAPI.getAll({ limit: 50 });
        const items = res?.data?.data ?? [];
        if (!cancelled && Array.isArray(items) && items.length > 0) {
          setLiveProjects(mapProjects(items));
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
      if (viewRaf) window.cancelAnimationFrame(viewRaf);
      unsubscribeCache();
      window.removeEventListener("site-content-updated", onRefresh);
      window.removeEventListener("projects-updated", onRefresh);
    };
  }, []);

  useEffect(() => {
    // Warm browser image cache for top 3 showcase projects during idle time
    if (typeof window !== "undefined" && Array.isArray(liveProjects) && liveProjects.length > 0) {
      const topImages = liveProjects.slice(0, 3).map((p) => p.img).filter(Boolean);
      topImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        link.fetchPriority = "high";
        document.head.appendChild(link);
      });
    }
  }, [liveProjects]);

  // Only real projects from the CMS are shown; no invented placeholders.
  const displayedProjects = liveProjects;
  const carouselProjects = displayedProjects.filter((project) => project.img).map((project) => ({
    id: project.id,
    src: project.img,
    fallbackSrc: undefined,
    alt: project.imgAlt,
    category: project.tag,
    title: project.name,
  }));

  return (
    <section className="works-bento-section wrap" id="works" aria-label="Selected Works">
      {/* Section Header */}
      <div className="works-bento-header">
        <div>
          <span className="eyebrow">{pageCopy.spaces_we_have_made}</span>
          <h2 className="u-text-h2">{pageCopy.selected_work}</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div className="works-view-switcher">
            <button
              type="button"
              aria-pressed={viewMode === "grid"}
              className={`works-switch-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >{pageCopy.grid}</button>
            <button
              type="button"
              aria-pressed={viewMode === "carousel"}
              className={`works-switch-btn ${viewMode === "carousel" ? "active" : ""}`}
              onClick={() => setViewMode("carousel")}
            >{pageCopy.gallery}</button>
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
          {displayedProjects.map((proj) => (
            <Link
              key={proj.id}
              to={`/project/details/${proj.id}`}
              className={`works-card ${proj.className}`}
            >
              <div className="works-card-image-wrap">
                <div className="works-card-image-inner">
                  {proj.img ? (
                    <img
                      src={proj.img}
                      alt={proj.imgAlt}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/static/media-unavailable.svg"; }}
                    />
                  ) : (
                    <div className="project-media-unavailable">{pageCopy.project_media_unavailable}</div>
                  )}
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
          <span>{pageCopy.view_full_project_archive}</span>
          <span className="g-circle" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

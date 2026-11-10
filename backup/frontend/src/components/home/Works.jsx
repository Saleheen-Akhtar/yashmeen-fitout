import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import EditorialCarousel3D from "../EditorialCarousel3D";
import { projectAPI, itemPath } from "../../services/api";

const CURATED_PROJECTS = [
  {
    id: 1,
    num: "(01)",
    name: "Palm Jumeirah Atelier",
    tag: "RESIDENTIAL · DUBAI",
    year: "2026",
    img: "/static/hero-aperture.png",
    imgAlt: "Dubai villa with a reflecting pool, sandstone facade, and palms at sunset",
    className: "is-landscape",
  },
  {
    id: 2,
    num: "(02)",
    name: "Emirates Hills Residence",
    tag: "VILLA · DESIGN & FIT-OUT",
    year: "2025",
    img: "/static/work-oh-office.jpg",
    imgAlt: "Contemporary residence nestled beneath a mature tree with illuminated glazing",
    className: "is-portrait is-monumental offset-top",
  },
  {
    id: 3,
    num: "(03)",
    name: "DIFC Corporate Headquarters",
    tag: "COMMERCIAL · DIFC",
    year: "2026",
    img: "/static/Office-fit-out.jpg",
    imgAlt: "Contemporary office fit-out with warm timber detailing and meeting spaces",
    className: "is-portrait is-monumental",
  },
  {
    id: 4,
    num: "(04)",
    name: "Al Quoz Design Pavilion",
    tag: "ATELIER · AL QUOZ",
    year: "2025",
    img: "/static/joinery-bay.jpg",
    imgAlt: "Craftsman building custom joinery in a fit-out workshop",
    className: "is-landscape offset-top",
  },
  {
    id: 5,
    num: "(05)",
    name: "Dubai Hills Modern Sanctuary",
    tag: "RESIDENTIAL · DUBAI HILLS",
    year: "2026",
    img: "/static/hero-editorial.png",
    imgAlt: "Warm modern residence with timber screens and a landscaped palm garden",
    className: "is-landscape",
  },
  {
    id: 6,
    num: "(06)",
    name: "Downtown Fashion Concept Store",
    tag: "RETAIL · DOWNTOWN DUBAI",
    year: "2025",
    img: "/static/studio.jpg",
    imgAlt: "Bright commercial interior with lounge seating, meeting tables, and feature lighting",
    className: "is-portrait is-monumental offset-top",
  },
];

const BENTO_CLASSES = [
  "is-landscape",
  "is-portrait is-monumental offset-top",
  "is-portrait is-monumental",
  "is-landscape offset-top",
  "is-landscape",
  "is-portrait is-monumental offset-top",
];

const FALLBACK_IMAGES = [
  "/static/hero-aperture.png",
  "/static/work-oh-office.jpg",
  "/static/Office-fit-out.jpg",
  "/static/joinery-bay.jpg",
  "/static/hero-editorial.png",
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
  const [viewMode, setViewMode] = useState("grid");
  const [liveProjects, setLiveProjects] = useState([]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await projectAPI.getAll({ limit: 12 });
      const items = res?.data?.data ?? [];
      if (Array.isArray(items) && items.length > 0) {
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
    } catch {
      /* fallback smoothly */
    }
  }, []);

  useEffect(() => {
    loadProjects();
    const onRefresh = () => loadProjects();
    window.addEventListener("site-content-updated", onRefresh);
    window.addEventListener("projects-updated", onRefresh);
    window.addEventListener("focus", onRefresh);
    return () => {
      window.removeEventListener("site-content-updated", onRefresh);
      window.removeEventListener("projects-updated", onRefresh);
      window.removeEventListener("focus", onRefresh);
    };
  }, [loadProjects]);

  const displayedProjects = liveProjects.length > 0 ? liveProjects : CURATED_PROJECTS;
  const carouselProjects = displayedProjects.map((project) => ({
    id: project.id,
    src: project.img,
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
              className={`works-switch-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Editorial Bento
            </button>
            <button
              type="button"
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

      {viewMode === "grid" ? (
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
                      e.currentTarget.src = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
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
          <EditorialCarousel3D
            items={carouselProjects}
            ariaLabel="Selected work 3D carousel"
          />
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

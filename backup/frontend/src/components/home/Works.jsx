import { useState } from "react";
import { Link } from "react-router-dom";
import EditorialCarousel3D from "../EditorialCarousel3D";

const FEATURED_PROJECTS = [
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

const CAROUSEL_PROJECTS = FEATURED_PROJECTS.map((project) => ({
  id: project.id,
  src: project.img,
  alt: project.imgAlt,
  category: project.tag,
  title: project.name,
}));

export default function Works() {
  const [viewMode, setViewMode] = useState("grid");

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
            <button type="button" className={`works-switch-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>Editorial Bento</button>
            <button type="button" className={`works-switch-btn ${viewMode === "carousel" ? "active" : ""}`} onClick={() => setViewMode("carousel")}>3D Carousel</button>
          </div>
          <span className="works-bento-count" aria-label="Six featured projects">(06)</span>
        </div>
      </div>

      {viewMode === "grid" ? <div className="works-bento-grid">
          {FEATURED_PROJECTS.map((proj) => (
            <Link
              key={proj.id}
              to={`/project/details/${proj.id}`}
              className={`works-card ${proj.className}`}
            >
              <div className="works-card-image-wrap">
                <img
                  src={proj.img}
                  alt={proj.imgAlt}
                  loading="lazy"
                />
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
      </div> : <div style={{ margin: "2rem -2rem 0" }}>
        <EditorialCarousel3D
          items={CAROUSEL_PROJECTS}
          ariaLabel="Selected work 3D carousel"
        />
      </div>}

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

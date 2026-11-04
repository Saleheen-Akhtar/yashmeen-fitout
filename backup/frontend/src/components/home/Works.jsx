import { useState } from "react";
import { Link } from "react-router-dom";
import EditorialCarousel3D from "../EditorialCarousel3D";

const FEATURED_PROJECTS = [
  {
    id: 1,
    num: "(01)",
    name: "Palm Jumeirah Atelier",
    tag: "RESIDENTIAL",
    year: "2026",
    img: "/static/work-oh-office.jpg",
    className: "is-landscape",
  },
  {
    id: 2,
    num: "(02)",
    name: "Emirates Hills Residence",
    tag: "LUXURY VILLA",
    year: "2025",
    img: "/static/work-myrtle.jpg",
    className: "is-portrait is-monumental offset-top",
  },
  {
    id: 3,
    num: "(03)",
    name: "DIFC Corporate Headquarters",
    tag: "COMMERCIAL HQ",
    year: "2026",
    img: "/static/work-clifton.jpg",
    className: "is-portrait is-monumental",
  },
  {
    id: 4,
    num: "(04)",
    name: "Al Quoz Design Pavilion",
    tag: "ATELIER & BENCH",
    year: "2025",
    img: "/static/work-runic.jpg",
    className: "is-landscape offset-top",
  },
  {
    id: 5,
    num: "(05)",
    name: "Dubai Hills Modern Sanctuary",
    tag: "PENTHOUSE",
    year: "2026",
    img: "/static/work-stanley.jpg",
    className: "is-landscape",
  },
  {
    id: 6,
    num: "(06)",
    name: "Downtown Fashion Concept Store",
    tag: "HIGH-END RETAIL",
    year: "2025",
    img: "/static/work-samford.jpg",
    className: "is-portrait is-monumental offset-top",
  },
];

export default function Works() {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "carousel"

  return (
    <section className="works-bento-section wrap" id="works" aria-label="Selected Works">
      {/* Section Header */}
      <div className="works-bento-header">
        <div>
          <span className="eyebrow">(FEATURED WORKS)</span>
          <h2 className="u-text-h2">Selected Commissions</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Mode Switcher */}
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

          <span className="works-bento-count" aria-label="Six featured projects">
            (06)
          </span>
        </div>
      </div>

      {/* View Mode 1: Asymmetric Editorial Bento Grid */}
      {viewMode === "grid" ? (
        <div className="works-bento-grid">
          {FEATURED_PROJECTS.map((proj) => (
            <Link
              key={proj.id}
              to={`/project/details/${proj.id}`}
              className={`works-card ${proj.className}`}
            >
              <div className="works-card-image-wrap">
                <img
                  src={proj.img}
                  alt={`${proj.name} architectural fit-out in Dubai`}
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
        </div>
      ) : (
        /* View Mode 2: Reusable 3D Endless Looping Editorial Carousel */
        <div style={{ margin: "2rem -2rem 0" }}>
          <EditorialCarousel3D />
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

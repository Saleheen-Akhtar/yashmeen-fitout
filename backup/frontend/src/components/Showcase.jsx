import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import EditorialCarousel3D from "./EditorialCarousel3D";
import { DEFAULT_EDITORIAL_ITEMS } from "../data/editorialItems";

export default function ShowcaseSection() {
  const root = useRef(null);

  return (
    <section className="hs hs-editorial-stage" id="projects" ref={root}>
      <div className="hs-inner" style={{ gap: 24 }}>
        <div className="wrap hs-head" style={{ marginBottom: 8 }}>
          <div>
            <p className="eyebrow" data-reveal>Curated Portfolio</p>
            <h2 className="section-title" data-split>Projects & editorial gallery.</h2>
          </div>
          <Link to="/projects" className="link-arrow">
            All projects <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* 3D Endless Looping Luxury Editorial Carousel */}
        <EditorialCarousel3D
          items={DEFAULT_EDITORIAL_ITEMS}
          ariaLabel="Projects 3D Editorial Gallery"
        />

        <div
          className="wrap hs-foot"
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--muted)",
              letterSpacing: "0.04em",
            }}
          >
            Drag left or right, or use keyboard arrows to rotate through the 3D gallery
          </p>
          <Link to="/projects" className="link-arrow" style={{ fontSize: 13 }}>
            View project archives <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

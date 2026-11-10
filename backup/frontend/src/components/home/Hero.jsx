import { Link } from "react-router-dom";
import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function Hero() {
  const { content } = useWebsiteContent();
  const hero = content?.hero || {};
  const rawTitle = hero.title || "From brief\nto built.";

  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section className="aperture-hero" aria-labelledby="aperture-hero-title">
      <div className="aperture-hero-stage" data-parallax-layers>
        <div className="aperture-hero-photo" aria-hidden="true">
          <img
            src="/static/hero-aperture-v2.png"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div className="aperture-parallax-layer aperture-parallax-architecture" data-parallax-layer="1" aria-hidden="true">
          <img src="/static/yashmeen-studio.jpg" alt="" loading="eager" decoding="async" />
        </div>
        <div className="aperture-parallax-layer aperture-parallax-ateliers" data-parallax-layer="2" aria-hidden="true">
          <img src="/static/joinery-bay.jpg" alt="" loading="eager" decoding="async" />
        </div>

        <div className="aperture-copy" data-parallax-layer="4">
          <p className="aperture-kicker">{hero.kicker || "DUBAI · DESIGN / ENGINEERING / FIT-OUT"}</p>
          <h1
            key={rawTitle}
            id="aperture-hero-title"
            data-parallax-layer="3"
            className="no-split"
            style={{ whiteSpace: "pre-line" }}
          >
            {rawTitle}
          </h1>
          <p className="aperture-intro">
            {hero.intro || "One team shapes the space, makes the details and delivers the finished interior."}
          </p>
          <div className="aperture-actions">
            <button type="button" className="aperture-cta" onClick={openEnquiry}>
              {hero.ctaText || "START A PROJECT"} <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
        <p className="aperture-proof">
          <strong>{hero.proofMetric || "35,000 sq. ft."}</strong>
          <span>{hero.proofLabel || "Al Quoz atelier"}</span>
        </p>
        <Link className="aperture-project-link" to="/projects" aria-label="Explore selected projects">
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </Link>
      </div>
    </section>
  );
}

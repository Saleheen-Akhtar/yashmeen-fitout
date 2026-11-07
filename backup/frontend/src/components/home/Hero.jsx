import { Link } from "react-router-dom";

export default function Hero() {
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
          <p className="aperture-kicker">DUBAI · DESIGN / ENGINEERING / FIT-OUT</p>
          <h1 id="aperture-hero-title" data-parallax-layer="3">From brief<br />to built.</h1>
          <p className="aperture-intro">One team shapes the space, makes the details and delivers the finished interior.</p>
          <div className="aperture-actions">
            <button type="button" className="aperture-cta" onClick={openEnquiry}>
              START A PROJECT <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
        <p className="aperture-proof"><strong>35,000 sq. ft.</strong><span>Al Quoz atelier</span></p>
        <Link className="aperture-project-link" to="/projects" aria-label="Explore selected projects">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></Link>
      </div>
    </section>
  );
}

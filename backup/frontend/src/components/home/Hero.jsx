import { Link } from "react-router-dom";

export default function Hero() {
  const scrollToNext = () => {
    const el = document.getElementById("manifesto");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-editorial wrap" aria-label="Featured Architectural Fit-Out">
      {/* Visual Container */}
      <div className="hero-media-wrap">
        <img
          src="/static/hero.jpg"
          alt="Yashmeen signature luxury interior commission in Dubai"
          loading="eager"
        />

        {/* Floating Telemetry Micro-Bar */}
        <div className="hero-telemetry-bar">
          <div className="hero-telemetry-left">
            <span>FEATURED PROJECT</span>
            <span>|</span>
            <span style={{ fontWeight: 600 }}>EMIRATES HILLS VILLA</span>
            <span>|</span>
            <span>2026</span>
          </div>

          <Link to="/projects" className="hero-telemetry-btn">
            <span>VIEW COMMISSION</span>
            <span className="g-circle" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Lower Hero Manifesto & Scroll Cue */}
      <div className="hero-lower-row">
        <div className="hero-philosophy">
          The Yashmeen style is defined by strong, solid forms with subtle elegance, natural
          balance and enduring appeal.
        </div>

        <button
          type="button"
          onClick={scrollToNext}
          className="hero-scroll-cue"
          aria-label="Scroll down to studio manifesto"
        >
          <span>(SCROLL DOWN)</span>
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}

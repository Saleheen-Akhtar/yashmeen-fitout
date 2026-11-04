import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero() {
  const [isInteriorRevealed, setIsInteriorRevealed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const wrapRef = useRef(null);
  const facadeRef = useRef(null);
  const interiorImgRef = useRef(null);
  const facadeImgRef = useRef(null);

  const openEnquiry = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  const toggleManualReveal = (e) => {
    e.stopPropagation();
    const willReveal = !isInteriorRevealed && scrollProgress < 0.5;
    setIsInteriorRevealed(willReveal);
    if (window.__lenis) {
      window.__lenis.scrollTo(willReveal ? window.innerHeight : 0, { duration: 1.2 });
    }
  };

  // ScrollTrigger Pinned Scrub: Peels back the facade to reveal the interior
  useEffect(() => {
    const wrap = wrapRef.current;
    const facade = facadeRef.current;
    const interiorImg = interiorImgRef.current;
    const facadeImg = facadeImgRef.current;
    if (!wrap || !facade) return;

    // Entrance animation: subtle de-blur and scale settle
    if (facadeImg) {
      gsap.fromTo(
        facadeImg,
        { scale: 1.12, filter: "blur(10px)" },
        { scale: 1.0, filter: "blur(0px)", duration: 1.8, ease: "cubic-bezier(0.16, 1, 0.35, 1)" }
      );
    }

    // Scroll scrub timeline across the 200vh container
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        // Wipe facade upward as user scrolls
        gsap.set(facade, {
          yPercent: -p * 105,
        });

        // Subtle parallax zoom on interior image beneath
        if (interiorImg) {
          gsap.set(interiorImg, {
            scale: 1.08 - p * 0.08,
            yPercent: (1 - p) * 6,
          });
        }
      },
    });

    return () => st.kill();
  }, []);

  // When manual toggle button is clicked, animate smoothly
  useEffect(() => {
    const facade = facadeRef.current;
    if (!facade) return;
    if (scrollProgress === 0) {
      gsap.to(facade, {
        yPercent: isInteriorRevealed ? -100 : 0,
        duration: 1.2,
        ease: "cubic-bezier(0.16, 1, 0.35, 1)",
      });
    }
  }, [isInteriorRevealed, scrollProgress]);

  return (
    <section
      className="hero-fullbleed-wrap"
      ref={wrapRef}
      aria-label="Full-Bleed Architectural Fit-Out Showcase"
    >
      {/* 100vh Sticky Viewport Screen */}
      <div className="hero-fullbleed-sticky">
        {/* Layer 1 (Underneath): Handcrafted Interior Fit-Out */}
        <div className="hero-fullbleed-canvas hero-canvas-interior">
          <img
            ref={interiorImgRef}
            src="/static/work-clifton.jpg"
            alt="Yashmeen bespoke luxury interior fit-out in Dubai"
            className="hero-fullbleed-img"
            loading="eager"
          />
          <div className="hero-fullbleed-scrim" />

          {/* Top-Left Telemetry Tag */}
          <div className="hero-corner-tag top-left">
            <span className="g-circle is-red" aria-hidden="true" />
            <span>INTERIOR FIT-OUT: BESPOKE EXECUTIVE SUITE &amp; JOINERY</span>
          </div>
        </div>

        {/* Layer 2 (Top Cover): Architectural Exterior Facade (Peels Up on Scroll) */}
        <div className="hero-fullbleed-canvas hero-canvas-facade" ref={facadeRef}>
          <img
            ref={facadeImgRef}
            src="/static/pages-bg.webp"
            alt="Yashmeen signature architectural exterior facade"
            className="hero-fullbleed-img"
            loading="eager"
          />
          <div className="hero-fullbleed-scrim" />

          {/* Top-Left Telemetry Tag */}
          <div className="hero-corner-tag top-left">
            <span className="g-circle" aria-hidden="true" />
            <span>ARCHITECTURAL FACADE: SIGNATURE COMMISSION</span>
          </div>
        </div>

        {/* Top-Right Geographic Telemetry */}
        <div className="hero-corner-tag top-right">
          <span>[25.1872° N, 55.2638° E] · DUBAI, UAE</span>
        </div>

        {/* Floating Telemetry & Manifesto Overlay */}
        <div className="hero-fullbleed-overlay">
          {/* Telemetry Pill Bar Across Lower Third */}
          <div className="hero-telemetry-pill-strip">
            <div className="hero-telemetry-meta">
              <span className="hero-pill-badge">(01/03)</span>
              <span className="hero-pill-title">EMIRATES HILLS RESIDENCE</span>
              <span className="hero-pill-sep">|</span>
              <span className="hero-pill-scope">TURNKEY ARCHITECTURE &amp; JOINERY</span>
              <span className="hero-pill-sep">|</span>
              <span className="hero-pill-year">2026</span>
            </div>

            <div className="hero-telemetry-actions">
              <button
                type="button"
                onClick={toggleManualReveal}
                className="hero-toggle-layer-btn"
                aria-label="Toggle between exterior facade and interior fit-out"
              >
                <span>{isInteriorRevealed || scrollProgress > 0.5 ? "SHOW FACADE" : "REVEAL INTERIOR"}</span>
                <span aria-hidden="true">↕</span>
              </button>

              <button
                type="button"
                onClick={openEnquiry}
                className="btn-pill btn-pill-light"
                style={{ height: 38, padding: "0 18px", fontSize: 12 }}
              >
                <span>EXPLORE SPACE</span>
                <span className="g-circle is-dark" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Lower Hero Manifesto & Interactive Progress */}
          <div className="hero-lower-manifesto-grid">
            <div className="hero-manifesto-column">
              <span className="hero-meta-label">(OUR PHILOSOPHY)</span>
              <p className="hero-manifesto-quote">
                The Yashmeen style is defined by strong, solid forms with subtle elegance,
                natural balance and enduring appeal.
              </p>
            </div>

            {/* Center Reveal Progress Scrub Indicator */}
            <div className="hero-progress-scrub-column">
              <div className="hero-progress-labels">
                <span className={scrollProgress < 0.5 && !isInteriorRevealed ? "active" : ""}>
                  FACADE
                </span>
                <span className={scrollProgress >= 0.5 || isInteriorRevealed ? "active" : ""}>
                  INTERIOR FIT-OUT
                </span>
              </div>
              <div className="hero-progress-track">
                <div
                  className="hero-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, (isInteriorRevealed ? 1 : scrollProgress) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Right Scroll Indicator */}
            <div className="hero-scroll-cue-column">
              <div className="hero-accreditation-line">
                <span>DUBAI MUNICIPALITY</span>
                <span>·</span>
                <span>DCD APPROVED</span>
              </div>
              <div className="hero-scroll-prompt">
                <span>(SCROLL TO REVEAL)</span>
                <span className="hero-scroll-arrow" aria-hidden="true">
                  ↓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

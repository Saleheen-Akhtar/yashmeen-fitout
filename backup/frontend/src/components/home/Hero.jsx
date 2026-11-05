import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const [dubaiTime, setDubaiTime] = useState("20:00");
  const heroRef = useRef(null);
  const leftWordRef = useRef(null);
  const rightWordWrapRef = useRef(null);
  const apertureSlotRef = useRef(null);
  const buttonRef = useRef(null);
  const descRef = useRef(null);
  const topBarRef = useRef(null);

  // Live Dubai GST clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Dubai",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setDubaiTime(timeStr);
      } catch (e) {
        setDubaiTime("20:00");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll to next section (Studio / Manifesto)
  const scrollToNextSection = () => {
    const target = document.getElementById("manifesto") || document.querySelector(".studio-manifesto-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  // Open inquiry modal
  const openEnquiry = (e) => {
    if (e) e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("open-questionnaire", {
        detail: { initialScope: "Turnkey Architecture & Interior Fit-Out" },
      })
    );
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="colonia-hero-section"
      aria-label="Yashmeen Turnkey Fit-Out & Bespoke Joinery Atelier"
    >
      {/* 1. Top Architectural Telemetry Row */}
      <div ref={topBarRef} className="hero-top-telemetry">
        <div className="hero-telemetry-left">
          <span className="hero-pulse-dot" aria-hidden="true" />
          <span className="hero-brand-name">YASHMEEN ATELIER</span>
          <span className="hero-sep">/</span>
          <span className="hero-time">{dubaiTime} GST</span>
          <span className="hero-coords">25.2048 N, 55.2708 E</span>
        </div>

        {/* Quick Anchor Links to Sections on the Page */}
        <nav className="hero-nav-anchors" aria-label="Page sections">
          <a href="#manifesto" className="hero-anchor-link">
            <span>(01) STUDIO</span>
          </a>
          <span className="hero-anchor-sep">·</span>
          <a href="#works" className="hero-anchor-link">
            <span>(02) WORKS</span>
          </a>
          <span className="hero-anchor-sep">·</span>
          <a href="#process" className="hero-anchor-link">
            <span>(03) PROCESS</span>
          </a>
        </nav>

        {/* Actions Right */}
        <div className="hero-telemetry-right">
          <span className="hero-lang-tag">[EN / AR]</span>
          <button
            type="button"
            className="hero-rfq-pill-btn"
            onClick={openEnquiry}
          >
            <span>INQUIRE [RFQ]</span>
            <span className="hero-rfq-dot" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hero-menu-pill-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("open-menu"))}
            aria-label="Open navigation menu"
          >
            MENU
          </button>
        </div>
      </div>

      {/* 2. Main Monolithic Composition (Exact Replica) */}
      <div className="hero-monolith-stage">
        <div className="hero-title-row">
          {/* Left Wordmark: YASHMEEN as a single intact word */}
          <div ref={leftWordRef} className="hero-word hero-word-left">
            <span>YASHMEEN</span>
          </div>

          {/* Center Aperture Window */}
          <div ref={apertureSlotRef} className="hero-aperture-slot">
            <div className="hero-aperture-frame">
              <img
                src="/static/hero.jpg"
                alt="Yashmeen Luxury Fit-Out Interior Atelier"
                className="hero-aperture-img"
              />
              <div className="hero-aperture-scrim" />
              <div className="hero-aperture-badge">
                <span className="hero-badge-dot" />
                <span className="hero-badge-text">DUBAI ATELIER · 35,000 SQ. FT.</span>
              </div>
            </div>
          </div>

          {/* Right Wordmark: FIT-OUT with badge above */}
          <div ref={rightWordWrapRef} className="hero-word hero-word-right-wrap">
            <div className="hero-powered-badge">
              [EST. DUBAI • <b>35,000 SQ. FT. ATELIER</b>]
            </div>
            <span className="hero-word-right">FIT-OUT</span>
          </div>
        </div>

        {/* 3. Tactile Black Pill Button with sliding target circle */}
        <button
          ref={buttonRef}
          type="button"
          className="button-with-circle"
          onClick={scrollToNextSection}
          aria-label="Discover Yashmeen Fit-Out Atelier"
        >
          <span>Discover</span>
          <div className="button-circle-w" aria-hidden="true">
            <div className="button-circle" />
          </div>
        </button>

        {/* 4. Literary Serif Description */}
        <p ref={descRef} className="hero-literary-desc">
          Yashmeen is more than just spaces. Activate vision for the full experience.
        </p>

        {/* 5. Subtle Scroll Down Prompt */}
        <button
          type="button"
          className="hero-scroll-invite"
          onClick={scrollToNextSection}
          aria-label="Scroll down to explore studio"
        >
          <span className="hero-scroll-label">SCROLL TO EXPLORE</span>
          <svg
            className="hero-scroll-arrow"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1V11M6 11L1.5 6.5M6 11L10.5 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

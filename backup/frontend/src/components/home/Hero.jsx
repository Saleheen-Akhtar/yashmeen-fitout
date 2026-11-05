import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const ATELIER_PREVIEWS = [
  {
    id: "01",
    specLabel: "MATERIAL SPECIFICATION",
    val: "01 / AMERICAN WALNUT · 35,000 SQ. FT. JOINERY",
    tag: "AL QUOZ PRODUCTION ATELIER",
    title: "35,000 SQ. FT. IN-HOUSE JOINERY FACILITY",
    location: "Al Quoz Industrial 1, Dubai",
    img: "/static/atelier-render.jpg",
  },
  {
    id: "02",
    specLabel: "MATERIAL SPECIFICATION",
    val: "02 / TRAVERTINE & BRONZE · BESPOKE RESIDENTIAL",
    tag: "EMIRATES HILLS PRIVATE VILLA",
    title: "PRIVATE LUXURY RESIDENTIAL ATELIER",
    location: "Sector E, Emirates Hills, Dubai",
    img: "/static/work-myrtle.jpg",
  },
  {
    id: "03",
    specLabel: "MATERIAL SPECIFICATION",
    val: "03 / FLUTED OAK & SMOKED GLASS · EXECUTIVE SUITE",
    tag: "DIFC GATE PRECINCT",
    title: "EXECUTIVE HEADQUARTERS FIT-OUT",
    location: "DIFC Gate Tower, Dubai",
    img: "/static/work-clifton.jpg",
  },
  {
    id: "04",
    specLabel: "MATERIAL SPECIFICATION",
    val: "04 / ARABESCATO MARBLE & BRASS · WATERFRONT",
    tag: "PALM JUMEIRAH PENTHOUSE",
    title: "SIGNATURE RESIDENTIAL PENTHOUSE",
    location: "Palm Jumeirah Crescent, Dubai",
    img: "/static/work-oh-office.jpg",
  },
];

export default function Hero() {
  const [dubaiTime, setDubaiTime] = useState("20:00");
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);

  const heroRef = useRef(null);
  const leftWordRef = useRef(null);
  const rightWordRef = useRef(null);
  const apertureSlotRef = useRef(null);
  const buttonRef = useRef(null);
  const descRef = useRef(null);
  const topBarRef = useRef(null);
  const trustBarRef = useRef(null);
  const descriptorRef = useRef(null);

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

  // Smooth scroll down to Studio Manifesto
  const scrollToNextSection = () => {
    const target =
      document.getElementById("manifesto") ||
      document.querySelector(".studio-manifesto-section");
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

  const activeProject = ATELIER_PREVIEWS[activePreviewIdx];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="yashmeen-monolith-hero"
      aria-label="Yashmeen Turnkey Fit-Out & Bespoke Joinery Atelier"
    >
      {/* 0. Ambient Architectural Glow & Subtle CAD Precision Grid */}
      <div className="hero-ambient-glow" aria-hidden="true" />
      <div className="hero-cad-grid" aria-hidden="true">
        <span className="cad-crosshair cad-top-left">+</span>
        <span className="cad-crosshair cad-top-right">+</span>
        <span className="cad-crosshair cad-bottom-left">+</span>
        <span className="cad-crosshair cad-bottom-right">+</span>
      </div>

      {/* 1. Top Architectural Telemetry Row */}
      <div ref={topBarRef} className="hero-top-telemetry">
        <div className="hero-telemetry-left">
          <span className="hero-pulse-dot" aria-hidden="true" />
          <span className="hero-brand-name">YASHMEEN ATELIER</span>
          <span className="hero-sep">/</span>
          <span className="hero-time">{dubaiTime} GST</span>
          <span className="hero-coords">25.2048 N, 55.2708 E</span>
          <span className="hero-facility-tag">[AL QUOZ 35,000 SQ. FT. BENCH]</span>
        </div>

        {/* Quick Anchor Links to Sections on the Page */}
        <nav className="hero-nav-anchors" aria-label="Page chapters">
          <a href="#manifesto" className="hero-anchor-link">
            <span>(01) STUDIO</span>
          </a>
          <span className="hero-anchor-sep">·</span>
          <a href="#works" className="hero-anchor-link">
            <span>(02) COMMISSIONS</span>
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

      {/* 2. Main Monolithic Stage */}
      <div className="hero-monolith-stage">
        {/* Brand Classification & Architectural Scope Tag */}
        <div ref={descriptorRef} className="hero-brand-descriptor">
          <span className="descriptor-bracket">[</span>
          <span className="descriptor-core">TURNKEY ARCHITECTURAL FIT-OUT &amp; BESPOKE JOINERY · DUBAI</span>
          <span className="descriptor-sep">•</span>
          <span className="descriptor-facility">35,000 SQ. FT. IN-HOUSE ATELIER</span>
          <span className="descriptor-bracket">]</span>
        </div>

        {/* Iconic Centered Aperture Monolith: YASH [Aperture Card] MEEN */}
        <div className="hero-title-row">
          {/* Left Wordmark: YASH */}
          <div ref={leftWordRef} className="hero-word hero-word-left">
            <span>YASH</span>
          </div>

          {/* Center Aperture Window (Portrait Aspect Ratio ~3:4) */}
          <div ref={apertureSlotRef} className="hero-aperture-slot">
            <div className="hero-aperture-frame">
              <img
                src={activeProject.img}
                alt={activeProject.title}
                className="hero-aperture-img"
              />
              <div className="hero-aperture-scrim" />

              {/* Top Corner Sub-Badge */}
              <div className="hero-aperture-top-badge">
                <span className="hero-badge-dot" />
                <span className="hero-badge-tag">{activeProject.tag}</span>
              </div>

              {/* Bottom Inset Specification Box (matching Reference Image) */}
              <div className="hero-aperture-spec-box">
                <div className="hero-spec-header">{activeProject.specLabel}</div>
                <div className="hero-spec-value">{activeProject.val}</div>

                {/* Interactive Multi-Project Switchers */}
                <div className="hero-aperture-dots" aria-label="Select architectural commission">
                  {ATELIER_PREVIEWS.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`aperture-dot-btn ${idx === activePreviewIdx ? "is-active" : ""}`}
                      onClick={() => setActivePreviewIdx(idx)}
                      aria-label={`View project ${item.id}: ${item.tag}`}
                    >
                      <span className="dot-num">{item.id}</span>
                      <span className="dot-circle" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Wordmark: MEEN */}
          <div ref={rightWordRef} className="hero-word hero-word-right">
            <span>MEEN</span>
          </div>
        </div>

        {/* 3. Tactile Gold/Black Pill Button with sliding target circle */}
        <button
          ref={buttonRef}
          type="button"
          className="button-with-circle"
          onClick={scrollToNextSection}
          aria-label="Discover Yashmeen Fit-Out Atelier"
        >
          <span>Discover Atelier</span>
          <div className="button-circle-w" aria-hidden="true">
            <div className="button-circle" />
          </div>
        </button>

        {/* 4. Literary Serif Manifesto Description */}
        <p ref={descRef} className="hero-literary-desc">
          Architecture engineered from within. 35,000 sq. ft. of bespoke joinery,
          statutory precision, and turnkey mastery across Dubai.
        </p>

        {/* 5. Trust Credentials Band */}
        <div ref={trustBarRef} className="hero-trust-datum">
          <div className="hero-trust-chip">
            <span className="trust-chip-dot" />
            <span>150+ COMPLETED COMMISSIONS</span>
          </div>
          <span className="hero-trust-sep">·</span>
          <div className="hero-trust-chip">
            <span className="trust-chip-dot" />
            <span>DM &amp; CIVIL DEFENCE APPROVED</span>
          </div>
          <span className="hero-trust-sep">·</span>
          <div className="hero-trust-chip">
            <span className="trust-chip-dot" />
            <span>ZERO SUB-CONTRACTOR RISK</span>
          </div>
        </div>

        {/* 6. Subtle Scroll Down Prompt */}
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

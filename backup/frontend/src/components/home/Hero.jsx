import { useState, useEffect, useRef } from "react";

const PROJECTS = [
  {
    id: "01",
    label: "01 ATELIER",
    title: "AL QUOZ PRODUCTION ATELIER",
    spec: "35,000 SQ. FT. IN-HOUSE JOINERY & METAL FACILITY",
    location: "Al Quoz Industrial 1, Dubai",
    img: "/static/atelier-render.jpg",
  },
  {
    id: "02",
    label: "02 EMIRATES HILLS",
    title: "EMIRATES HILLS PRIVATE RESIDENCE",
    spec: "BESPOKE ARCHITECTURAL JOINERY & MARBLE FIT-OUT",
    location: "Sector E, Emirates Hills, Dubai",
    img: "/static/work-myrtle.jpg",
  },
  {
    id: "03",
    label: "03 DIFC HQ",
    title: "DIFC GATE PRECINCT EXECUTIVE FIT-OUT",
    spec: "TURNKEY COMMERCIAL HEADQUARTERS & ACOUSTIC GLAZING",
    location: "DIFC Gate Tower, Dubai",
    img: "/static/work-clifton.jpg",
  },
  {
    id: "04",
    label: "04 PALM PENTHOUSE",
    title: "PALM JUMEIRAH WATERFRONT PENTHOUSE",
    spec: "SIGNATURE RESIDENTIAL FIT-OUT & CUSTOM MILLWORK",
    location: "Palm Jumeirah Crescent, Dubai",
    img: "/static/work-oh-office.jpg",
  },
];

export default function Hero() {
  const [dubaiTime, setDubaiTime] = useState("20:00");
  const [activeIdx, setActiveIdx] = useState(0);

  const heroRef = useRef(null);

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

  // Open inquiry questionnaire
  const openEnquiry = (e) => {
    if (e) e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("open-questionnaire", {
        detail: { initialScope: "Turnkey Architecture & Interior Fit-Out" },
      })
    );
  };

  const activeProject = PROJECTS[activeIdx];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="minimal-hero"
      aria-label="Yashmeen Turnkey Fit-Out & Bespoke Joinery Atelier"
    >
      {/* 1. Minimal Top Telemetry Header */}
      <header className="minimal-hero-top">
        <div className="minimal-hero-top-left">
          <span className="minimal-status-dot" aria-hidden="true" />
          <span className="minimal-brand-title">YASHMEEN</span>
          <span className="minimal-sep">/</span>
          <span className="minimal-meta">DUBAI</span>
          <span className="minimal-sep">·</span>
          <span className="minimal-time">{dubaiTime} GST</span>
          <span className="minimal-coords">25.2048 N, 55.2708 E</span>
        </div>

        <nav className="minimal-hero-nav" aria-label="Page navigation">
          <a href="#manifesto" className="minimal-nav-link">
            (01) STUDIO
          </a>
          <span className="minimal-nav-sep">·</span>
          <a href="#works" className="minimal-nav-link">
            (02) COMMISSIONS
          </a>
          <span className="minimal-nav-sep">·</span>
          <a href="#process" className="minimal-nav-link">
            (03) PROCESS
          </a>
        </nav>

        <div className="minimal-hero-top-right">
          <button
            type="button"
            className="minimal-btn-rfq"
            onClick={openEnquiry}
          >
            <span>INQUIRE [RFQ]</span>
            <span className="minimal-btn-dot" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="minimal-btn-menu"
            onClick={() => window.dispatchEvent(new CustomEvent("open-menu"))}
            aria-label="Open menu"
          >
            MENU
          </button>
        </div>
      </header>

      {/* 2. Monumental Minimalist Stage */}
      <div className="minimal-hero-stage">
        {/* Overline Tag */}
        <div className="minimal-hero-tag">
          TURNKEY ARCHITECTURAL FIT-OUT · 35,000 SQ. FT. IN-HOUSE ATELIER
        </div>

        {/* Grand Single-Word Headline */}
        <h1 className="minimal-hero-wordmark">
          YASHMEEN
        </h1>

        {/* Refined Literary Manifesto Description */}
        <p className="minimal-hero-manifesto">
          Interior architecture engineered from within. 35,000 sq. ft. of bespoke
          joinery, statutory precision, and turnkey fit-out contracting across Dubai.
        </p>

        {/* 3. Grand Cinematic Showcase Viewport */}
        <div className="minimal-showcase-frame">
          <img
            key={activeProject.id}
            src={activeProject.img}
            alt={activeProject.title}
            className="minimal-showcase-img"
          />
          <div className="minimal-showcase-scrim" />

          {/* Project Details Overlay */}
          <div className="minimal-showcase-info">
            <div className="minimal-info-left">
              <span className="minimal-info-badge">{activeProject.id} / PROJECT</span>
              <h2 className="minimal-info-title">{activeProject.title}</h2>
              <p className="minimal-info-spec">{activeProject.spec} · {activeProject.location}</p>
            </div>

            {/* Interactive Minimalist Switcher Tabs */}
            <div className="minimal-project-tabs" role="tablist" aria-label="Select commission">
              {PROJECTS.map((proj, idx) => (
                <button
                  key={proj.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIdx}
                  className={`minimal-tab-btn ${idx === activeIdx ? "is-active" : ""}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  <span className="tab-dot" />
                  <span className="tab-label">{proj.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Minimalist Action & Trust Band */}
        <div className="minimal-hero-footer">
          <button
            type="button"
            className="minimal-explore-btn"
            onClick={scrollToNextSection}
            aria-label="Explore Yashmeen studio and commissions"
          >
            <span>Explore Atelier</span>
            <svg
              className="explore-arrow"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 1.5V12.5M7 12.5L2.5 8M7 12.5L11.5 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="minimal-trust-chips">
            <span className="trust-chip">150+ COMPLETED COMMISSIONS</span>
            <span className="trust-sep">·</span>
            <span className="trust-chip">DM &amp; CIVIL DEFENCE APPROVED</span>
            <span className="trust-sep">·</span>
            <span className="trust-chip">ZERO SUB-CONTRACTOR RISK</span>
          </div>
        </div>
      </div>
    </section>
  );
}

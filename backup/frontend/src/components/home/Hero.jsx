import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const PLACEHOLDERS = [
  "I need a turnkey commercial office in DIFC with custom acoustic joinery...",
  "I need a luxury residential fit-out in Emirates Hills with authority permits...",
  "I need 35,000 sq.ft factory bespoke millwork and fluted timber paneling...",
  "I need a beachfront luxury villa fit-out on Palm Jumeirah...",
];

const QUICK_CHIPS = [
  { icon: "🏢", label: "Commercial HQ", query: "Turnkey commercial office fit-out with Dubai authority approvals" },
  { icon: "🏡", label: "Luxury Villa", query: "High-end residential architectural fit-out and joinery" },
  { icon: "🪵", label: "Joinery Atelier", query: "35,000 sq.ft factory bespoke millwork and executive cabinetry" },
  { icon: "🍽️", label: "Hospitality & Retail", query: "Curved joinery, bespoke lighting, and boutique retail fit-out" },
];

const STAGES = [
  {
    id: "approvals",
    num: "01",
    title: "Approvals & Permits",
    stepName: "PERMIT SPECIFICATION",
    location: "DIFC Gate Precinct, Dubai",
    scope: "DDA, Civil Defence & Authority Approvals",
    area: "18,000 SQ. FT.",
    permits: "DIFC / Dubai Civil Defence Sign-Off",
    bench: "CAD Blueprint Engineering",
    img: "/static/hero.jpg",
    alt: "DIFC modern commercial interior fit-out with glass partitions and polished concrete",
    description: "End-to-end statutory approvals from Dubai Municipality, Civil Defence, and free zone authorities.",
  },
  {
    id: "joinery",
    num: "02",
    title: "35,000 SQ. FT. Atelier",
    stepName: "IN-HOUSE PRODUCTION",
    location: "Al Quoz Industrial Atelier, Dubai",
    scope: "Bespoke Millwork Direct from the Bench",
    area: "35,000 SQ. FT. Bench",
    permits: "Al Quoz Industrial Atelier License",
    bench: "5-Axis CNC & Bookmatched Veneers",
    img: "/static/work-clifton.jpg",
    alt: "Bespoke luxury office fit-out with fluted desk and warm architectural lighting",
    description: "Precision CNC timber routing, artisanal book-matched veneers, and custom metalwork crafted under one roof.",
  },
  {
    id: "turnkey",
    num: "03",
    title: "Turnkey MEP & Build",
    stepName: "ON-SITE EXECUTION",
    location: "Emirates Hills Residence, Dubai",
    scope: "Structural Engineering & Turnkey Architecture",
    area: "14,500 SQ. FT.",
    permits: "Dubai Municipality Building Permit",
    bench: "Architectural Fit-Out & Joinery",
    img: "/static/pages-bg.webp",
    alt: "Emirates Hills luxury architectural residence and landscape in Dubai",
    description: "Coordinated MEP installations, acoustic partitions, and white-glove site delivery managed by dedicated site engineers.",
  },
  {
    id: "handover",
    num: "04",
    title: "Handover & Living",
    stepName: "WHITE-GLOVE DELIVERY",
    location: "Palm Jumeirah Waterfront, Dubai",
    scope: "Curved Joinery & White-Glove Handover",
    area: "11,800 SQ. FT.",
    permits: "Trakhees Complete Handover Sign-Off",
    bench: "Custom Furniture & Millwork",
    img: "/static/work-myrtle.jpg",
    alt: "Palm Jumeirah luxury villa interior joinery and custom sculptural furniture",
    description: "Zero-defect snagging, complete operation manuals, and post-occupancy warranty support across Dubai.",
  },
];

const AUTOPLAY_DURATION = 6500; // ms per stage

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [promptValue, setPromptValue] = useState("");
  const [activeChip, setActiveChip] = useState(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [viewMode, setViewMode] = useState("gallery"); // "gallery" | "cad"

  const heroRef = useRef(null);
  const stageViewportRef = useRef(null);
  const tabsBarRef = useRef(null);
  const slidesRef = useRef([]);
  const tabRefs = useRef([]);
  const progressTimerRef = useRef(null);
  const placeholderTimerRef = useRef(null);

  const activeStage = STAGES[activeIdx];

  const goToStage = useCallback((targetIdx, byUser = false) => {
    const nextIdx = (targetIdx + STAGES.length) % STAGES.length;
    if (byUser) {
      setUserHasInteracted(true);
    }
    setActiveIdx(nextIdx);
  }, []);

  // Auto-scroll active stage tab into center inside its horizontal bar ONLY
  useEffect(() => {
    const bar = tabsBarRef.current;
    const tab = tabRefs.current[activeIdx];
    if (bar && tab) {
      const scrollTarget = tab.offsetLeft - (bar.clientWidth / 2) + (tab.clientWidth / 2);
      bar.scrollTo({ left: scrollTarget, behavior: "smooth" });
    }
  }, [activeIdx]);

  // Cycle placeholder text gently
  useEffect(() => {
    if (promptValue.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4200);
    placeholderTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [promptValue]);

  // Stage cross-fade animation with GSAP
  useEffect(() => {
    if (viewMode !== "gallery") return;
    const currentSlide = slidesRef.current[activeIdx];
    if (!currentSlide) return;
    const currentImg = currentSlide.querySelector("img");

    gsap.to(currentSlide, {
      autoAlpha: 1,
      duration: 0.75,
      ease: "power2.out",
    });

    if (currentImg) {
      gsap.fromTo(
        currentImg,
        { scale: 1.03 },
        { scale: 1.0, duration: 1.1, ease: "power2.out" }
      );
    }

    slidesRef.current.forEach((slide, idx) => {
      if (slide && idx !== activeIdx) {
        gsap.to(slide, {
          autoAlpha: 0,
          duration: 0.55,
          ease: "power2.out",
        });
      }
    });
  }, [activeIdx, viewMode]);

  // Autoplay progression timer
  useEffect(() => {
    if (isPaused || userHasInteracted) return;

    const timer = setInterval(() => {
      goToStage(activeIdx + 1, false);
    }, AUTOPLAY_DURATION);

    progressTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [activeIdx, isPaused, userHasInteracted, goToStage]);

  // Seamless Docking entrance animation when preloader finishes or on mount
  useEffect(() => {
    if (heroRef.current && document.querySelector(".monolith-preloader")) {
      const items = heroRef.current.querySelectorAll(".glide-hero-anim");
      gsap.set(items, { y: 28, opacity: 0 });
    }

    const runEntrance = () => {
      if (heroRef.current) {
        const items = heroRef.current.querySelectorAll(".glide-hero-anim");
        gsap.fromTo(
          items,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.05, stagger: 0.1, ease: "power3.out", delay: 0.05 }
        );
      }
    };

    window.addEventListener("preloader-docked", runEntrance);

    const fallbackTimer = setTimeout(() => {
      if (!document.querySelector(".monolith-preloader")) {
        runEntrance();
      }
    }, 300);

    return () => {
      window.removeEventListener("preloader-docked", runEntrance);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleChipClick = (chip) => {
    if (activeChip === chip.label) {
      setActiveChip(null);
      setPromptValue("");
    } else {
      setActiveChip(chip.label);
      setPromptValue(chip.query);
    }
  };

  const openEnquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("open-questionnaire", {
        detail: { initialScope: promptValue || activeStage.scope },
      })
    );
  };

  return (
    <section
      ref={heroRef}
      className="glide-hero-section is-dark"
      aria-label="Yashmeen Turnkey Fit-Out & Bespoke Joinery Atelier"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Monolithic Centered Spine Container */}
      <div className="glide-hero-container">
        {/* Top Whisper Announcement Pill Badge */}
        <div className="glide-hero-anim">
          <a href="#about" className="glide-hero-badge group">
            <span className="glide-badge-tag">DUBAI ATELIER</span>
            <span className="glide-badge-text">In-House 35,000 SQ. FT. Bench &amp; Approvals</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="glide-badge-arrow"
              aria-hidden="true"
            >
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Declarative Monumental Headline */}
        <h1 className="glide-hero-headline glide-hero-anim">
          <span className="glide-headline-row">Stop settling for blueprints.</span>
          <span className="glide-headline-row">
            We build what <span className="glide-accent-serif font-serif">others</span> only draw<span className="glide-accent-dot">.</span>
          </span>
        </h1>

        {/* Centered Balanced Subtitle */}
        <p className="glide-hero-sub glide-hero-anim">
          Yashmeen is Dubai&apos;s turnkey fit-out contractor and bespoke joinery atelier. We turn architectural concepts and authority approvals into built reality, direct from our 35,000 sq.ft factory floor.
        </p>

        {/* 2. The Smoked Obsidian Space Prompt Card (Glide Power + Monolith Luxury) */}
        <div className="glide-prompt-card glide-hero-anim">
          <div className="glide-prompt-top">
            <div className="glide-prompt-input-row">
              <span className="glide-prompt-cursor" aria-hidden="true">|</span>
              <textarea
                className="glide-prompt-textarea"
                rows={2}
                value={promptValue}
                onChange={(e) => {
                  setPromptValue(e.target.value);
                  if (activeChip) setActiveChip(null);
                }}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                aria-label="Describe your space or fit-out requirement"
              />
            </div>

            {/* Quick Intent Filter Chips */}
            <div className="glide-prompt-chips">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={`glide-prompt-chip ${activeChip === chip.label ? "is-active" : ""}`}
                  onClick={() => handleChipClick(chip)}
                >
                  <span className="glide-chip-icon">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glide-prompt-bottom">
            <button
              type="button"
              onClick={openEnquiry}
              className="glide-prompt-upload-btn"
              aria-label="Upload CAD floor plans"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="glide-upload-svg"
                aria-hidden="true"
              >
                <path
                  d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Upload drawings / CAD</span>
            </button>

            <button
              type="button"
              onClick={openEnquiry}
              className="glide-prompt-build-btn"
            >
              <span>Build Your Space</span>
              <span className="g-circle is-red" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Physical Architectural Space Showcase Foundation */}
      <div className="glide-stage-wrap">
        {/* Stage Controls: Mode Switcher (Gallery vs CAD Spec Ledger) & Walkthrough Tabs */}
        <div className="glide-stage-header-row">
          {/* Monolith-Style View Toggle: IMG / TXT */}
          <div className="glide-view-mode-toggle" role="group" aria-label="Display View Mode">
            <button
              type="button"
              className={`glide-view-toggle-btn ${viewMode === "gallery" ? "is-active" : ""}`}
              onClick={() => setViewMode("gallery")}
            >
              GALLERY [IMG]
            </button>
            <span className="glide-view-toggle-sep">/</span>
            <button
              type="button"
              className={`glide-view-toggle-btn ${viewMode === "cad" ? "is-active" : ""}`}
              onClick={() => setViewMode("cad")}
            >
              CAD LEDGER [TXT]
            </button>
          </div>

          {/* Architectural Process Stage OS Tabs */}
          <div ref={tabsBarRef} className="glide-stage-tabs-bar" role="tablist" aria-label="Craftsmanship lifecycle stages">
            {STAGES.map((stage, idx) => (
              <button
                key={stage.id}
                ref={(el) => (tabRefs.current[idx] = el)}
                type="button"
                role="tab"
                aria-selected={idx === activeIdx}
                className={`glide-stage-tab ${idx === activeIdx ? "is-active" : ""}`}
                onClick={() => goToStage(idx, true)}
              >
                <span className="glide-tab-header">
                  <span className="glide-tab-num">{stage.num}</span>
                  <span className="glide-tab-title">{stage.title}</span>
                </span>
                <span className="glide-tab-line" />
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display Mode */}
        {viewMode === "gallery" ? (
          /* The Architectural 3D Space Viewport Window */
          <div ref={stageViewportRef} className="glide-stage-viewport">
            {STAGES.map((stage, idx) => (
              <div
                key={stage.id}
                ref={(el) => (slidesRef.current[idx] = el)}
                className={`glide-stage-slide ${idx === activeIdx ? "is-active" : ""}`}
                style={{ zIndex: idx === activeIdx ? 2 : 1 }}
              >
                <img
                  src={stage.img}
                  alt={stage.alt}
                  className="glide-stage-img"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                <div className="glide-stage-scrim" />

                {/* Stage Context Capsule */}
                <div className="glide-stage-capsule">
                  <div className="glide-capsule-meta">
                    <span className="glide-capsule-tag">{stage.stepName}</span>
                    <span className="glide-capsule-location">{stage.location}</span>
                    <span className="glide-capsule-sep">·</span>
                    <span className="glide-capsule-scope">{stage.scope}</span>
                    <span className="glide-capsule-sep">·</span>
                    <span className="glide-capsule-area">{stage.area}</span>
                  </div>
                  <button
                    type="button"
                    onClick={openEnquiry}
                    className="glide-capsule-btn"
                  >
                    <span>Explore Project</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Monolith-Style CAD Specification Ledger Table */
          <div className="glide-cad-ledger-viewport">
            <div className="glide-cad-ledger-header">
              <span className="glide-cad-col is-num">NUMBER</span>
              <span className="glide-cad-col is-project">COMMISSION</span>
              <span className="glide-cad-col is-location">DUBAI LOCATION</span>
              <span className="glide-cad-col is-permits">STATUTORY PERMITS</span>
              <span className="glide-cad-col is-bench">ATELIER PRODUCTION</span>
              <span className="glide-cad-col is-action">ACTION</span>
            </div>
            <div className="glide-cad-ledger-body">
              {STAGES.map((item, idx) => (
                <div
                  key={item.id}
                  className={`glide-cad-row ${idx === activeIdx ? "is-active" : ""}`}
                  onClick={() => goToStage(idx, true)}
                >
                  <span className="glide-cad-cell is-num">{item.num} / M_0{idx + 1}</span>
                  <span className="glide-cad-cell is-project">{item.title}</span>
                  <span className="glide-cad-cell is-location">{item.location}</span>
                  <span className="glide-cad-cell is-permits">{item.permits}</span>
                  <span className="glide-cad-cell is-bench">{item.bench}</span>
                  <span className="glide-cad-cell is-action">
                    <button
                      type="button"
                      onClick={openEnquiry}
                      className="glide-cad-inspect-btn"
                    >
                      [ INQUIRE ]
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Monochrome Authority & Client Trust Baseline */}
        <div className="glide-trust-baseline">
          <p className="glide-trust-title">
            DUBAI AUTHORITY ACCREDITED &amp; TRUSTED ACROSS PREMIER ESTATES
          </p>
          <div className="glide-trust-logos">
            <span className="glide-trust-item">DUBAI MUNICIPALITY</span>
            <span className="glide-trust-dot">·</span>
            <span className="glide-trust-item">CIVIL DEFENCE</span>
            <span className="glide-trust-dot">·</span>
            <span className="glide-trust-item">DIFC GATE PRECINCT</span>
            <span className="glide-trust-dot">·</span>
            <span className="glide-trust-item">TECOM DDA</span>
            <span className="glide-trust-dot">·</span>
            <span className="glide-trust-item">EMAAR HILLS</span>
            <span className="glide-trust-dot">·</span>
            <span className="glide-trust-item">DAMAC LAGOONS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

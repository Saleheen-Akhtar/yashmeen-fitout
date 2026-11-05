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

const HOTSPOT_PINS = [
  {
    id: "joinery-bench",
    name: "35,000 SQ. FT. Joinery Bench",
    category: "IN-HOUSE PRODUCTION",
    desc: "5-Axis CNC routing and bookmatched fluted walnut fabricated in Al Quoz.",
    x: 44,
    y: 45,
  },
  {
    id: "authority-permit",
    name: "DM & Civil Defence Approvals",
    category: "STATUTORY PERMITS",
    desc: "Complete architectural engineering sign-off with zero site delays.",
    x: 65,
    y: 33,
  },
  {
    id: "stone-materials",
    name: "Calacatta Gold & Travertine",
    category: "MATERIAL SELECTION",
    desc: "Direct-quarried Italian honed marble with continuous vein matching.",
    x: 26,
    y: 58,
  },
  {
    id: "precision-millwork",
    name: "Curved Architectural Panels",
    category: "BESPOKE MILLWORK",
    desc: "Precision acoustic fluted timber and executive boardroom casework.",
    x: 77,
    y: 62,
  },
];

const AUTOPLAY_DURATION = 7000;

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [promptValue, setPromptValue] = useState("");
  const [activeChip, setActiveChip] = useState(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [activePin, setActivePin] = useState(null);
  const [isNightMode, setIsNightMode] = useState(true);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);

  const heroRef = useRef(null);
  const slidesRef = useRef([]);
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

  // Cycle placeholder text
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
    const currentSlide = slidesRef.current[activeIdx];
    if (!currentSlide) return;
    const currentImg = currentSlide.querySelector("img");

    gsap.to(currentSlide, {
      autoAlpha: 1,
      duration: 0.85,
      ease: "power2.out",
    });

    if (currentImg) {
      gsap.fromTo(
        currentImg,
        { scale: 1.05 },
        { scale: 1.0, duration: 1.4, ease: "power2.out" }
      );
    }

    slidesRef.current.forEach((slide, idx) => {
      if (slide && idx !== activeIdx) {
        gsap.to(slide, {
          autoAlpha: 0,
          duration: 0.65,
          ease: "power2.out",
        });
      }
    });
  }, [activeIdx]);

  // Autoplay progression timer
  useEffect(() => {
    if (isPaused || userHasInteracted) return;

    const timer = setInterval(() => {
      goToStage(activeIdx + 1, false);
    }, AUTOPLAY_DURATION);

    progressTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [activeIdx, isPaused, userHasInteracted, goToStage]);

  // Seamless entrance animation when preloader finishes or on mount
  useEffect(() => {
    if (heroRef.current && document.querySelector(".monolith-preloader")) {
      const items = heroRef.current.querySelectorAll(".zacamil-anim");
      gsap.set(items, { y: 24, opacity: 0 });
    }

    const runEntrance = () => {
      if (heroRef.current) {
        const items = heroRef.current.querySelectorAll(".zacamil-anim");
        gsap.fromTo(
          items,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "power3.out", delay: 0.1 }
        );
      }
    };

    window.addEventListener("preloader-docked", runEntrance);

    const fallbackTimer = setTimeout(() => {
      if (!document.querySelector(".monolith-preloader")) {
        runEntrance();
      }
    }, 400);

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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.dispatchEvent(
      new CustomEvent("open-questionnaire", {
        detail: { initialScope: promptValue || activeStage.scope },
      })
    );
  };

  return (
    <section
      ref={heroRef}
      className={`zacamil-hero-section ${isNightMode ? "is-night" : "is-day"}`}
      aria-label="Yashmeen Turnkey Fit-Out & Bespoke Joinery Atelier"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Fullscreen Architectural Stage Viewport */}
      <div className="zacamil-hero-viewport">
        {STAGES.map((stage, idx) => (
          <div
            key={stage.id}
            ref={(el) => (slidesRef.current[idx] = el)}
            className={`zacamil-hero-slide ${idx === activeIdx ? "is-active" : ""}`}
            style={{ zIndex: idx === activeIdx ? 2 : 1 }}
          >
            <img
              src={stage.img}
              alt={stage.alt}
              className="zacamil-hero-bg-img"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="zacamil-hero-scrim" />
          </div>
        ))}

        {/* 2. Interactive Hotspot Pins Floating on the Space (Exact Colonia Zacamil Replica) */}
        <div className="zacamil-pins-layer" aria-label="Architectural Specifications">
          {HOTSPOT_PINS.map((pin) => (
            <div
              key={pin.id}
              className={`zacamil-pin ${activePin === pin.id ? "is-active" : ""}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <button
                type="button"
                className="zacamil-pin-hitbox"
                onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                aria-label={`View ${pin.name}`}
              >
                <div className="zacamil-pin-svg-w">
                  <svg width="34" height="34" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="3" fill="#ebe6e0" />
                    <circle cx="18" cy="18" r="14" stroke="#ebe6e0" strokeWidth="1.5" strokeDasharray="3 3" className="zacamil-pin-ring" />
                  </svg>
                </div>
                <span className="zacamil-pin-title">{pin.name}</span>
              </button>

              {/* Pin Detail Glass Tooltip */}
              {activePin === pin.id && (
                <div className="zacamil-pin-card">
                  <div className="zacamil-pin-card-tag">{pin.category}</div>
                  <div className="zacamil-pin-card-name">{pin.name}</div>
                  <div className="zacamil-pin-card-desc">{pin.desc}</div>
                  <button
                    type="button"
                    onClick={openEnquiry}
                    className="zacamil-pin-inquire-btn"
                  >
                    <span>INQUIRE COMMISSION</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. Floating Top Bar Navigation Pills (Exact Zacamil Header) */}
        <div className="zacamil-top-nav zacamil-anim">
          {/* Left Pill: Atelier Tour */}
          <button
            type="button"
            onClick={openEnquiry}
            className="zacamil-nav-pill zacamil-pill-btn"
            aria-label="Explore Atelier Overview"
          >
            <span className="zacamil-play-dot" aria-hidden="true" />
            <span>EXPLORE ATELIER</span>
          </button>

          {/* Center Pill: Stages OS Navigation */}
          <div className="zacamil-nav-pill zacamil-stages-pill" role="tablist" aria-label="Stages">
            {STAGES.map((stage, idx) => (
              <button
                key={stage.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIdx}
                className={`zacamil-stage-tab ${idx === activeIdx ? "is-active" : ""}`}
                onClick={() => goToStage(idx, true)}
              >
                <span className="zacamil-stage-num">{stage.num}</span>
                <span className="zacamil-stage-name">{stage.title}</span>
              </button>
            ))}
          </div>

          {/* Right Group: Inquire & Lighting Toggle */}
          <div className="zacamil-top-right">
            <button
              type="button"
              onClick={openEnquiry}
              className="zacamil-nav-pill zacamil-inquire-pill"
            >
              <span>INQUIRE [RFQ]</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNightMode(!isNightMode)}
              className="zacamil-nav-pill zacamil-light-toggle"
              aria-label={isNightMode ? "Switch to Travertine Day Lighting" : "Switch to Obsidian Evening Lighting"}
            >
              <span className="zacamil-light-icon">{isNightMode ? "☼" : "☾"}</span>
            </button>
          </div>
        </div>

        {/* 4. Floating Bottom Stage Navigator (Exact Zacamil < [STAGE] > Replica) */}
        <div className="zacamil-bottom-bar zacamil-anim">
          <div className="zacamil-bottom-left-meta">
            <div className="zacamil-meta-client">[COMMISSION: {activeStage.location}]</div>
            <div className="zacamil-meta-spec">{activeStage.scope}</div>
          </div>

          {/* Center Stage Navigator Pill */}
          <div className="zacamil-stage-selector-w">
            <button
              type="button"
              onClick={() => goToStage(activeIdx - 1, true)}
              className="zacamil-nav-arrow"
              aria-label="Previous Stage"
            >
              <svg width="10" height="14" viewBox="0 0 7 13" fill="none">
                <path d="M7 6.5 1.243 0 0 1.18l4.03 4.477.765.843-.765.843L0 11.82 1.243 13 7 6.5Z" fill="currentColor" />
              </svg>
            </button>

            <div className="zacamil-stage-current-capsule">
              <img src={activeStage.img} alt="" className="zacamil-current-thumb" />
              <span className="zacamil-current-tag">[{activeStage.num} / {activeStage.title.toUpperCase()}]</span>
            </div>

            <button
              type="button"
              onClick={() => goToStage(activeIdx + 1, true)}
              className="zacamil-nav-arrow"
              aria-label="Next Stage"
            >
              <svg width="10" height="14" viewBox="0 0 7 13" fill="none" style={{ transform: "rotate(180deg)" }}>
                <path d="M7 6.5 1.243 0 0 1.18l4.03 4.477.765.843-.765.843L0 11.82 1.243 13 7 6.5Z" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Prompt Configurator Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPromptDrawerOpen(!isPromptDrawerOpen)}
            className="zacamil-nav-pill zacamil-build-toggle"
          >
            <span>BUILD YOUR SPACE</span>
            <span className="zacamil-red-pulse" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 5. Seamless Architectural Scope Drawer (Opens directly or docks smoothly) */}
      <div className={`zacamil-scope-drawer ${isPromptDrawerOpen ? "is-open" : ""}`}>
        <div className="zacamil-drawer-backdrop" onClick={() => setIsPromptDrawerOpen(false)} />
        <div className="zacamil-drawer-content">
          <div className="zacamil-drawer-header">
            <div>
              <div className="zacamil-drawer-tag">ATELIER SCOPE CONFIGURATOR</div>
              <h2 className="zacamil-drawer-title">Stop settling for blueprints. We build what others only draw.</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsPromptDrawerOpen(false)}
              className="zacamil-drawer-close"
              aria-label="Close Scope Configurator"
            >
              ✕
            </button>
          </div>

          <div className="zacamil-drawer-body">
            <div className="zacamil-prompt-input-row">
              <span className="zacamil-cursor" aria-hidden="true">|</span>
              <textarea
                className="zacamil-prompt-textarea"
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

            {/* Quick Intent Chips */}
            <div className="zacamil-prompt-chips">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={`zacamil-chip ${activeChip === chip.label ? "is-active" : ""}`}
                  onClick={() => handleChipClick(chip)}
                >
                  <span className="zacamil-chip-icon">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            <div className="zacamil-drawer-actions">
              <button
                type="button"
                onClick={openEnquiry}
                className="zacamil-upload-btn"
              >
                <span>Upload drawings / CAD</span>
              </button>
              <button
                type="button"
                onClick={openEnquiry}
                className="zacamil-submit-btn"
              >
                <span>Inquire Custom Fit-Out</span>
                <span className="zacamil-btn-dot" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const COMMISSIONS = [
  {
    id: "01",
    index: "(01/04)",
    title: "Emirates Hills Residence",
    shortTitle: "Emirates Hills",
    scope: "Turnkey Architecture & Joinery",
    location: "Emirates Hills, Dubai",
    year: "2026",
    area: "14,500 SQ. FT.",
    img: "/static/pages-bg.webp",
    alt: "Emirates Hills luxury architectural residence and landscape",
  },
  {
    id: "02",
    index: "(02/04)",
    title: "Al Quoz Executive Atelier",
    shortTitle: "Al Quoz Atelier",
    scope: "Bespoke Millwork & Executive Suite",
    location: "Al Quoz Design District, Dubai",
    year: "2026",
    area: "6,200 SQ. FT.",
    img: "/static/work-clifton.jpg",
    alt: "Bespoke luxury office fit-out with fluted desk and warm architectural lighting",
  },
  {
    id: "03",
    index: "(03/04)",
    title: "Gate Precinct Commercial HQ",
    shortTitle: "DIFC Gate Precinct",
    scope: "Corporate Fit-Out & Authority Approvals",
    location: "DIFC, Dubai",
    year: "2025",
    area: "18,000 SQ. FT.",
    img: "/static/hero.jpg",
    alt: "DIFC modern commercial interior fit-out with glass partitions and polished concrete",
  },
  {
    id: "04",
    index: "(04/04)",
    title: "Palm Jumeirah Waterfront Villa",
    shortTitle: "Palm Jumeirah",
    scope: "Curved Joinery & Luxury Residential",
    location: "Palm Jumeirah, Dubai",
    year: "2026",
    area: "11,800 SQ. FT.",
    img: "/static/work-myrtle.jpg",
    alt: "Palm Jumeirah luxury villa interior joinery and custom sculptural furniture",
  },
];

const AUTOPLAY_DURATION = 6500; // ms per slide

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });

  const stageRef = useRef(null);
  const cursorRef = useRef(null);
  const slidesRef = useRef([]);
  const textMetaRef = useRef(null);
  const progressTimerRef = useRef(null);
  const dragStartXRef = useRef(null);
  const isDraggingRef = useRef(false);

  const activeCommission = COMMISSIONS[activeIdx];

  const openEnquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  const goToCommission = useCallback((targetIdx, byUser = false) => {
    const nextIdx = (targetIdx + COMMISSIONS.length) % COMMISSIONS.length;
    if (byUser) {
      setUserHasInteracted(true);
    }
    setActiveIdx(nextIdx);
  }, []);

  // Animate image transitions with signature GreenSock de-blur and scale settle
  useEffect(() => {
    const currentSlide = slidesRef.current[activeIdx];
    if (!currentSlide) return;
    const currentImg = currentSlide.querySelector("img");

    // Smoothly bring active slide to opacity 1
    gsap.to(currentSlide, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
    });

    if (currentImg) {
      gsap.fromTo(
        currentImg,
        {
          scale: 1.08,
          filter: "blur(10px)",
        },
        {
          scale: 1.0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "cubic-bezier(0.16, 1, 0.35, 1)",
        }
      );
    }

    // Fade out sibling slides
    slidesRef.current.forEach((slide, idx) => {
      if (slide && idx !== activeIdx) {
        gsap.to(slide, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      }
    });

    // Reveal active commission typography
    if (textMetaRef.current) {
      gsap.fromTo(
        textMetaRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: "cubic-bezier(0.16, 1, 0.35, 1)" }
      );
    }
  }, [activeIdx]);

  // Auto-advance scrubber timer (pauses if user interacted or hovers)
  useEffect(() => {
    if (isPaused || userHasInteracted) return;

    const timer = setInterval(() => {
      goToCommission(activeIdx + 1, false);
    }, AUTOPLAY_DURATION);

    progressTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [activeIdx, isPaused, userHasInteracted, goToCommission]);

  // Interactive mousemove cursor puck
  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        x,
        y,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  };

  const handleMouseEnter = () => {
    setCursorPos((prev) => ({ ...prev, visible: true }));
  };

  const handleMouseLeave = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
    setIsPaused(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        goToCommission(activeIdx + 1, true);
      } else if (e.key === "ArrowLeft") {
        goToCommission(activeIdx - 1, true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx, goToCommission]);

  // Drag / Swipe handling
  const handlePointerDown = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    dragStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;
    const diff = e.clientX - dragStartXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        goToCommission(activeIdx + 1, true);
      } else {
        goToCommission(activeIdx - 1, true);
      }
    }
    isDraggingRef.current = false;
    dragStartXRef.current = null;
  };

  return (
    <section
      ref={stageRef}
      className="hero-scrubber-stage"
      aria-label="Full-Bleed Architectural Commission Scrubber"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 100vw x 100vh Full-Bleed Imagery Canvas */}
      <div className="hero-scrubber-canvas">
        {COMMISSIONS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => (slidesRef.current[idx] = el)}
            className={`hero-scrubber-slide ${idx === activeIdx ? "is-active" : ""}`}
            style={{ zIndex: idx === activeIdx ? 2 : 1 }}
          >
            <img
              src={item.img}
              alt={item.alt}
              className="hero-scrubber-img"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Subtle cinematic gradient scrim */}
        <div className="hero-scrubber-scrim" />
      </div>

      {/* Floating Interactive Custom Cursor Puck (Desktop Only) */}
      <div
        ref={cursorRef}
        className={`hero-custom-cursor-puck ${cursorPos.visible ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <span>EXPLORE</span>
        <span className="hero-cursor-arrows">⇄</span>
      </div>

      {/* Top Floating Telemetry Hairline HUD */}
      <div className="hero-hud-top">
        <div className="hero-hud-pill">
          <span className="g-circle is-red" aria-hidden="true" />
          <span>COMMISSION ARCHIVE: {activeCommission.index}</span>
        </div>
        <div className="hero-hud-coords">
          <span>[25.1872° N, 55.2638° E] · DUBAI, UAE</span>
        </div>
      </div>

      {/* Bottom Architectural Presentation & Scrubber Strip */}
      <div className="hero-hud-bottom">
        {/* Active Commission Header Row */}
        <div className="hero-commission-meta-row">
          <div className="hero-commission-info" ref={textMetaRef}>
            <span className="hero-commission-eyebrow">
              {activeCommission.index} · {activeCommission.location}
            </span>
            <h1 className="hero-commission-title no-split" key={activeCommission.id}>
              {activeCommission.title}
            </h1>
            <div className="hero-commission-specs">
              <span>{activeCommission.scope}</span>
              <span className="hero-specs-dot">·</span>
              <span>{activeCommission.area}</span>
              <span className="hero-specs-dot">·</span>
              <span>{activeCommission.year}</span>
            </div>
          </div>

          <div className="hero-commission-actions">
            <button
              type="button"
              onClick={openEnquiry}
              className="btn-pill btn-pill-light"
              style={{ height: 44, padding: "0 22px", fontSize: 13 }}
            >
              <span>EXPLORE SPACE</span>
              <span className="g-circle is-dark" aria-hidden="true" />
            </button>

            <a
              href="#manifesto"
              className="hero-scroll-cue-link"
              aria-label="Scroll down to studio manifesto"
            >
              <span>(SCROLL DOWN)</span>
              <span className="hero-cue-arrow" aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* 4-Item Architectural Interactive Scrubber Track */}
        <div
          className="hero-interactive-scrubber-bar"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          role="tablist"
          aria-label="Commission Navigator"
        >
          {COMMISSIONS.map((item, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  goToCommission(idx, true);
                }}
                onMouseEnter={() => {
                  goToCommission(idx, true);
                }}
                className={`hero-scrubber-tab ${isActive ? "is-active" : ""}`}
              >
                <div className="hero-tab-progress-line">
                  <div
                    className="hero-tab-progress-fill"
                    style={{
                      width: isActive && !isPaused && !userHasInteracted ? "100%" : isActive ? "100%" : "0%",
                      transition: isActive && !isPaused && !userHasInteracted ? `width ${AUTOPLAY_DURATION}ms linear` : "none",
                    }}
                  />
                </div>
                <div className="hero-tab-content">
                  <span className="hero-tab-num">{item.id}</span>
                  <span className="hero-tab-title">{item.shortTitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
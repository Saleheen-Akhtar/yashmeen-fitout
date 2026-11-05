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
    alt: "Emirates Hills luxury architectural residence and landscape in Dubai",
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

const AUTOPLAY_DURATION = 7000; // ms per slide

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: true });

  const stageRef = useRef(null);
  const cursorRef = useRef(null);
  const xToRef = useRef(null);
  const yToRef = useRef(null);
  const stageRectRef = useRef(null);
  const slidesRef = useRef([]);
  const headlineRef = useRef(null);
  const progressTimerRef = useRef(null);
  const dragStartXRef = useRef(null);
  const isDraggingRef = useRef(false);

  const activeCommission = COMMISSIONS[activeIdx];

  const goToCommission = useCallback((targetIdx, byUser = false) => {
    const nextIdx = (targetIdx + COMMISSIONS.length) % COMMISSIONS.length;
    if (byUser) {
      setUserHasInteracted(true);
    }
    setActiveIdx(nextIdx);
  }, []);

  // Smooth GreenSock image cross-fade with subtle scale settle
  useEffect(() => {
    const currentSlide = slidesRef.current[activeIdx];
    if (!currentSlide) return;
    const currentImg = currentSlide.querySelector("img");

    // Fade in active slide and ensure visibility
    gsap.to(currentSlide, {
      autoAlpha: 1,
      duration: 0.8,
      ease: "power2.out",
    });

    if (currentImg) {
      gsap.fromTo(
        currentImg,
        { scale: 1.04 },
        { scale: 1.0, duration: 1.2, ease: "power2.out" }
      );
    }

    // Fade out and cull sibling slides to liberate GPU memory
    slidesRef.current.forEach((slide, idx) => {
      if (slide && idx !== activeIdx) {
        gsap.to(slide, {
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    });
  }, [activeIdx]);

  // Autoplay progression timer (pauses if user hovers or interacts)
  useEffect(() => {
    if (isPaused || userHasInteracted) return;

    const timer = setInterval(() => {
      goToCommission(activeIdx + 1, false);
    }, AUTOPLAY_DURATION);

    progressTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [activeIdx, isPaused, userHasInteracted, goToCommission]);

  // Entrance animation on mount
  useEffect(() => {
    if (headlineRef.current) {
      const items = headlineRef.current.children;
      gsap.fromTo(
        items,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "cubic-bezier(0.16, 1, 0.35, 1)", delay: 0.15 }
      );
    }

    // High-performance quickTo cursor puck initialization
    if (cursorRef.current && stageRef.current) {
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
      xToRef.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.18, ease: "power2.out" });
      yToRef.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.18, ease: "power2.out" });

      const rect = stageRef.current.getBoundingClientRect();
      stageRectRef.current = rect;
      gsap.set(cursorRef.current, {
        x: rect.width * 0.52,
        y: rect.height * 0.48,
      });
    }

    const handleResize = () => {
      if (stageRef.current) {
        stageRectRef.current = stageRef.current.getBoundingClientRect();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Frictionless, zero-layout-thrash mousemove cursor puck
  const handleMouseMove = (e) => {
    if (!xToRef.current || !yToRef.current) return;
    if (!stageRectRef.current && stageRef.current) {
      stageRectRef.current = stageRef.current.getBoundingClientRect();
    }
    const rect = stageRectRef.current;
    if (!rect) return;
    xToRef.current(e.clientX - rect.left);
    yToRef.current(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    if (stageRef.current) {
      stageRectRef.current = stageRef.current.getBoundingClientRect();
    }
    setCursorPos((p) => ({ ...p, visible: true }));
  };
  const handleMouseLeave = () => {
    setCursorPos((p) => ({ ...p, visible: true }));
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
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        goToCommission(activeIdx + 1, true);
      } else {
        goToCommission(activeIdx - 1, true);
      }
    }
    isDraggingRef.current = false;
    dragStartXRef.current = null;
  };

  const openEnquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section
      ref={stageRef}
      className="hero-provocative-stage"
      aria-label="Yashmeen Turnkey Fit-Out Atelier"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 100vw x 100vh Full-Bleed Imagery Canvas */}
      <div className="hero-provocative-canvas">
        {COMMISSIONS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => (slidesRef.current[idx] = el)}
            className={`hero-provocative-slide ${idx === activeIdx ? "is-active" : ""}`}
            style={{ zIndex: idx === activeIdx ? 2 : 1 }}
          >
            <img
              src={item.img}
              alt={item.alt}
              className="hero-provocative-img"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Filmic dark vignette scrim for contrast */}
        <div className="hero-provocative-scrim" />
      </div>

      {/* Floating Interactive Custom Cursor Puck (Desktop Only) */}
      <div
        ref={cursorRef}
        className={`hero-custom-cursor-puck ${cursorPos.visible ? "is-visible" : ""}`}
        onClick={openEnquiry}
        role="button"
        tabIndex={0}
        aria-label="Explore active commission space"
      >
        <span>EXPLORE</span>
        <span className="hero-cursor-arrows">⇄</span>
      </div>

      {/* Center-Left Provocative Hook Content */}
      <div className="hero-provocative-content wrap">
        <div className="hero-provocative-inner" ref={headlineRef}>
          {/* Eyebrow Tag */}
          <div className="hero-provocative-eyebrow">
            <span className="g-circle is-red" aria-hidden="true" />
            <span>DUBAI TURNKEY FIT-OUT &amp; BESPOKE JOINERY</span>
          </div>

          {/* Monumental Provocative Headline */}
          <h1 className="hero-provocative-headline no-split">
            WE BUILD WHAT<br />OTHERS ONLY DRAW
          </h1>

          {/* Subtitle Value Proposition */}
          <p className="hero-provocative-sub">
            Complete turnkey commercial &amp; luxury residential fit-out, Dubai authority approvals,
            and 35,000 sq.ft in-house factory joinery direct from the bench.
          </p>

          {/* Magnetic Action Triggers */}
          <div className="hero-provocative-actions">
            <button
              type="button"
              onClick={openEnquiry}
              className="btn-pill btn-pill-light hero-cta-pill"
            >
              <span>EXPLORE SPACE</span>
              <span className="g-circle is-dark" aria-hidden="true" />
            </button>

            <a href="#manifesto" className="hero-secondary-link">
              <span>OUR CRAFT PHILOSOPHY</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

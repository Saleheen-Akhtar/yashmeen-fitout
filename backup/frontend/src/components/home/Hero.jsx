import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const COMMISSIONS = [
  {
    id: "01",
    index: "(01)",
    title: "Emirates Hills Residence",
    location: "Emirates Hills, Dubai",
    scope: "Turnkey Architecture & Bespoke Joinery",
    img: "/static/pages-bg.webp",
    alt: "Emirates Hills luxury architectural residence and landscape in Dubai",
  },
  {
    id: "02",
    index: "(02)",
    title: "Al Quoz Executive Atelier",
    location: "Al Quoz Design District, Dubai",
    scope: "Bespoke Millwork & Executive Suite",
    img: "/static/work-clifton.jpg",
    alt: "Bespoke luxury office fit-out with fluted desk and warm architectural lighting",
  },
  {
    id: "03",
    index: "(03)",
    title: "Gate Precinct Commercial HQ",
    location: "DIFC, Dubai",
    scope: "Corporate Fit-Out & Authority Approvals",
    img: "/static/hero.jpg",
    alt: "DIFC modern commercial interior fit-out with glass partitions and polished concrete",
  },
  {
    id: "04",
    index: "(04)",
    title: "Palm Jumeirah Waterfront Villa",
    location: "Palm Jumeirah, Dubai",
    scope: "Curved Joinery & Luxury Residential",
    img: "/static/work-myrtle.jpg",
    alt: "Palm Jumeirah luxury villa interior joinery and custom sculptural furniture",
  },
];

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);

  const stageRef = useRef(null);
  const slidesRef = useRef([]);
  const textRef = useRef(null);
  const dragStartXRef = useRef(null);
  const isDraggingRef = useRef(false);

  const activeCommission = COMMISSIONS[activeIdx];

  const goToCommission = useCallback((targetIdx) => {
    const nextIdx = (targetIdx + COMMISSIONS.length) % COMMISSIONS.length;
    setActiveIdx(nextIdx);
  }, []);

  // Smooth GreenSock image cross-fade with subtle scale settle
  useEffect(() => {
    const currentSlide = slidesRef.current[activeIdx];
    if (!currentSlide) return;
    const currentImg = currentSlide.querySelector("img");

    // Fade in active slide
    gsap.to(currentSlide, {
      opacity: 1,
      duration: 0.9,
      ease: "power2.out",
    });

    if (currentImg) {
      gsap.fromTo(
        currentImg,
        { scale: 1.06, filter: "blur(8px)" },
        { scale: 1.0, filter: "blur(0px)", duration: 1.4, ease: "cubic-bezier(0.16, 1, 0.35, 1)" }
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

    // Subtle typography reveal
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "cubic-bezier(0.16, 1, 0.35, 1)" }
      );
    }
  }, [activeIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        goToCommission(activeIdx + 1);
      } else if (e.key === "ArrowLeft") {
        goToCommission(activeIdx - 1);
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
        goToCommission(activeIdx + 1);
      } else {
        goToCommission(activeIdx - 1);
      }
    }
    isDraggingRef.current = false;
    dragStartXRef.current = null;
  };

  const openEnquiry = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section
      ref={stageRef}
      className="hero-minimal-stage"
      aria-label="Architectural Portfolio Showcase"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 100vw x 100vh Full-Bleed Imagery Canvas */}
      <div className="hero-minimal-canvas">
        {COMMISSIONS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => (slidesRef.current[idx] = el)}
            className={`hero-minimal-slide ${idx === activeIdx ? "is-active" : ""}`}
            style={{ zIndex: idx === activeIdx ? 2 : 1 }}
          >
            <img
              src={item.img}
              alt={item.alt}
              className="hero-minimal-img"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Soft lower scrim for pure typographic contrast */}
        <div className="hero-minimal-scrim" />
      </div>

      {/* Quiet, Minimalist Bottom Baseline (Max Negative Space) */}
      <div className="hero-minimal-baseline">
        <div className="hero-minimal-meta" ref={textRef}>
          <h1 className="hero-minimal-title no-split" onClick={openEnquiry}>
            <span className="hero-minimal-idx">{activeCommission.index}</span>
            <span>{activeCommission.title}</span>
          </h1>
          <p className="hero-minimal-sub">
            <span>{activeCommission.location}</span>
            <span className="hero-minimal-dot">·</span>
            <span>{activeCommission.scope}</span>
          </p>
        </div>

        {/* Quiet Numerical Scrubber & Scroll Prompt */}
        <div className="hero-minimal-nav">
          <div className="hero-minimal-numbers" role="tablist" aria-label="Commission Index">
            {COMMISSIONS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  goToCommission(idx);
                }}
                className={`hero-num-btn ${idx === activeIdx ? "is-active" : ""}`}
                aria-label={`View commission ${item.id}: ${item.title}`}
              >
                {item.id}
              </button>
            ))}
          </div>

          <span className="hero-minimal-sep">·</span>

          <a href="#manifesto" className="hero-minimal-scroll" aria-label="Scroll down to studio">
            <span>(SCROLL)</span>
            <span className="hero-minimal-arrow" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
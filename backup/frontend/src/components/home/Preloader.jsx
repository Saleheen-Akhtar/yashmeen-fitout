import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

const CRAFT_CARDS = [
  {
    id: "01",
    tag: "MATERIAL SPECIFICATION",
    caption: "01 / AMERICAN WALNUT · 35,000 SQ. FT. BENCH",
    material: "MAT: AMERICAN_WALNUT_FLUTED_CNC",
    img: "/static/work-clifton.jpg",
  },
  {
    id: "02",
    tag: "AUTHORITY APPROVAL",
    caption: "02 / STATUTORY CAD · DUBAI MUNICIPALITY SIGN-OFF",
    material: "SPEC: DM_CIVIL_DEFENCE_PERMIT_08",
    img: "/static/hero.jpg",
  },
  {
    id: "03",
    tag: "NATURAL STONE",
    caption: "03 / BOOKMATCHED CALACATTA & TRAVERTINE",
    material: "MAT: CALACATTA_GOLD_HONED_MARBLE",
    img: "/static/pages-bg.webp",
  },
  {
    id: "04",
    tag: "BESPOKE JOINERY",
    caption: "04 / CURVED ARCHITECTURAL MILLWORK",
    material: "MAT: CURVED_TIMBER_PALM_WATERFRONT",
    img: "/static/work-myrtle.jpg",
  },
  {
    id: "05",
    tag: "ATELIER FABRICATION",
    caption: "05 / 5-AXIS CNC PRECISION MILLING",
    material: "SPEC: 35,000_SQFT_INHOUSE_FABRICATION",
    img: "/static/work-clifton.jpg",
  },
  {
    id: "06",
    tag: "TURNKEY HANDOVER",
    caption: "06 / WHITE-GLOVE RESIDENTIAL HANDOVER",
    material: "SPEC: ZERO_DEFECT_EXECUTIVE_SUITE",
    img: "/static/work-myrtle.jpg",
  },
];

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [dubaiTime, setDubaiTime] = useState("18:00");

  const preloaderRef = useRef(null);
  const topBarRef = useRef(null);
  const stageRef = useRef(null);
  const logoLeftRef = useRef(null);
  const logoRightRef = useRef(null);
  const apertureSlotRef = useRef(null);
  const apertureCardRef = useRef(null);
  const cardsRef = useRef([]);
  const bottomBarRef = useRef(null);
  const percentTextRef = useRef(null);
  const progressFillRef = useRef(null);
  const materialTextRef = useRef(null);

  const isFinishedRef = useRef(false);
  const timelineRef = useRef(null);
  const xQuickTo = useRef(null);
  const yQuickTo = useRef(null);

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

  // Set up 120fps hardware-accelerated mouse tracking using gsap.quickTo
  useEffect(() => {
    if (!apertureCardRef.current) return;

    xQuickTo.current = gsap.quickTo(apertureCardRef.current, "rotateY", {
      duration: 0.5,
      ease: "power2.out",
    });
    yQuickTo.current = gsap.quickTo(apertureCardRef.current, "rotateX", {
      duration: 0.5,
      ease: "power2.out",
    });

    const handleMouseMove = (e) => {
      if (isFinishedRef.current) return;
      const { clientX, clientY } = e;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (clientX - cx) / cx;
      const dy = (clientY - cy) / cy;

      if (xQuickTo.current && yQuickTo.current) {
        xQuickTo.current(dx * 12);
        yQuickTo.current(-dy * 12);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [replayKey]);

  // Expose replay for DevTools or live demonstration
  useEffect(() => {
    window.__replayPreloader = () => {
      isFinishedRef.current = false;
      setIsVisible(true);
      setReplayKey((k) => k + 1);
    };
    window.__pausePreloader = () => {
      if (timelineRef.current) timelineRef.current.pause();
    };
    return () => {
      delete window.__replayPreloader;
      delete window.__pausePreloader;
    };
  }, []);

  useEffect(() => {
    // Lock scrolling on mount
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let heroTriggered = false;

    // Fluid Dissolve Exit Sequence (Seamlessly Reveals Hero)
    const finishPreloader = () => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      const exitTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = originalOverflow || "";
          if (onComplete) onComplete();
          setIsVisible(false);
        },
      });

      // 1. Split words slide gently outward and dissolve
      if (logoLeftRef.current && logoRightRef.current) {
        exitTl.to(
          logoLeftRef.current,
          {
            x: -50,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.65,
            ease: "power3.inOut",
          },
          0
        );
        exitTl.to(
          logoRightRef.current,
          {
            x: 50,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.65,
            ease: "power3.inOut",
          },
          0
        );
      }

      // 2. Central aperture blooms slightly and dissolves
      if (apertureCardRef.current) {
        exitTl.to(
          apertureCardRef.current,
          {
            scale: 1.08,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.65,
            ease: "power3.inOut",
          },
          0
        );
      }

      // 3. Telemetry bars fade out
      if (topBarRef.current && bottomBarRef.current) {
        exitTl.to(
          [topBarRef.current, bottomBarRef.current],
          {
            opacity: 0,
            y: 8,
            duration: 0.45,
            ease: "power2.out",
          },
          0
        );
      }

      // 4. Trigger hero entrance while preloader dissolves into the same dark background
      exitTl.add(() => {
        if (!heroTriggered) {
          heroTriggered = true;
          window.dispatchEvent(new CustomEvent("preloader-docked"));
        }
      }, 0.22);

      // 5. Complete preloader backdrop dissolve
      if (preloaderRef.current) {
        exitTl.to(
          preloaderRef.current,
          {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
          },
          0.2
        );
      }
    };

    // Calculate responsive slot expansion width & margins
    const isMobile = window.innerWidth < 768;
    const targetSlotWidth = isMobile
      ? Math.min(160, Math.floor(window.innerWidth * 0.32))
      : Math.min(240, Math.max(170, Math.floor(window.innerWidth * 0.175)));
    const targetMargin = isMobile ? 12 : 32;

    const ctx = gsap.context(() => {
      // 1. Reset all elements to clean starting states
      gsap.set(preloaderRef.current, { opacity: 1, visibility: "visible" });
      gsap.set(topBarRef.current, { opacity: 1, y: 0 });
      gsap.set(bottomBarRef.current, { opacity: 1, y: 0 });
      gsap.set([logoLeftRef.current, logoRightRef.current], {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(apertureSlotRef.current, {
        width: 0,
        marginLeft: 0,
        marginRight: 0,
        opacity: 0,
      });
      if (apertureCardRef.current) {
        gsap.set(apertureCardRef.current, {
          scale: 1,
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          filter: "blur(0px)",
        });
      }

      // Reset cards stack
      cardsRef.current.forEach((el, idx) => {
        if (el) {
          gsap.set(el, { opacity: idx === 0 ? 1 : 0, scale: 1 });
        }
      });

      if (percentTextRef.current) percentTextRef.current.innerText = "00%";
      if (progressFillRef.current) progressFillRef.current.style.width = "0%";
      if (materialTextRef.current) {
        materialTextRef.current.innerText = CRAFT_CARDS[0].material;
      }

      // Master Animation Timeline
      const masterTl = gsap.timeline();
      timelineRef.current = masterTl;

      // Small introductory rest
      masterTl.to({}, { duration: 0.25 });

      // Phase 1: Smoothly expand aperture slot between YASH and MEEN
      // Flexbox naturally glides YASH left and MEEN right with guaranteed 32px negative space
      masterTl.to(
        apertureSlotRef.current,
        {
          width: targetSlotWidth,
          marginLeft: targetMargin,
          marginRight: targetMargin,
          opacity: 1,
          duration: 1.05,
          ease: "power3.inOut",
        },
        0.25
      );

      // Phase 2: Counter progression and hardware-accelerated card flipping
      // Using direct DOM manipulation (0 React re-renders) for 60fps/120fps locked motion
      const counterState = { p: 0 };
      let lastCardIndex = 0;

      masterTl.to(
        counterState,
        {
          p: 100,
          duration: 2.3,
          ease: "power2.inOut",
          onUpdate: () => {
            const num = Math.round(counterState.p);
            const formatted = num < 10 ? `0${num}%` : `${num}%`;

            if (percentTextRef.current) {
              percentTextRef.current.innerText = formatted;
            }
            if (progressFillRef.current) {
              progressFillRef.current.style.width = `${num}%`;
            }

            // Flip craft cards directly via GPU opacity & scale
            const nextCardIndex = Math.min(
              CRAFT_CARDS.length - 1,
              Math.floor((num / 100) * CRAFT_CARDS.length)
            );

            if (nextCardIndex !== lastCardIndex) {
              const prevCardEl = cardsRef.current[lastCardIndex];
              const nextCardEl = cardsRef.current[nextCardIndex];

              if (prevCardEl && nextCardEl) {
                gsap.to(prevCardEl, {
                  opacity: 0,
                  scale: 0.96,
                  duration: 0.32,
                  ease: "power2.out",
                });
                gsap.fromTo(
                  nextCardEl,
                  { opacity: 0, scale: 1.04 },
                  {
                    opacity: 1,
                    scale: 1,
                    duration: 0.32,
                    ease: "power2.out",
                  }
                );
              }

              if (materialTextRef.current && CRAFT_CARDS[nextCardIndex]) {
                materialTextRef.current.innerText =
                  CRAFT_CARDS[nextCardIndex].material;
              }

              lastCardIndex = nextCardIndex;
            }
          },
          onComplete: () => {
            if (percentTextRef.current) percentTextRef.current.innerText = "100%";
            if (progressFillRef.current) progressFillRef.current.style.width = "100%";
            finishPreloader();
          },
        },
        0.55
      );
    }, preloaderRef);

    // Keyboard shortcut (ESC) to skip instantly
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        finishPreloader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "";
      window.removeEventListener("keydown", handleKeyDown);
      ctx.revert();
    };
  }, [onComplete, replayKey]);

  if (!isVisible) return null;

  return (
    <div
      ref={preloaderRef}
      className="monolith-preloader"
      aria-label="Yashmeen Atelier Initializing"
    >
      {/* 1. Top Telemetry Bar with Live Dubai GST Time */}
      <div ref={topBarRef} className="preloader-top-bar">
        <div className="preloader-brand-label">
          <span className="preloader-red-dot" aria-hidden="true" />
          <span className="preloader-brand-text">YASHMEEN · DUBAI</span>
          <span className="preloader-time-sep">/</span>
          <span className="preloader-time-val">{dubaiTime} GST</span>
          <span className="preloader-coords-val">25.2048° N, 55.2708° E</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (preloaderRef.current) {
              gsap.to(preloaderRef.current, {
                opacity: 0,
                duration: 0.45,
                ease: "power2.inOut",
                onComplete: () => {
                  document.body.style.overflow = "";
                  if (onComplete) onComplete();
                  window.dispatchEvent(new CustomEvent("preloader-docked"));
                  setIsVisible(false);
                },
              });
            }
          }}
          className="preloader-skip-btn"
          aria-label="Skip introduction animation"
        >
          SKIP [ESC]
        </button>
      </div>

      {/* 2. Center Stage: Split Monolith Typography & Expanding Zero-Overlap Aperture */}
      <div ref={stageRef} className="preloader-center-stage">
        <div className="preloader-monolith-row">
          {/* Left Half: YASH */}
          <div ref={logoLeftRef} className="preloader-logo-half preloader-logo-left">
            YASH
          </div>

          {/* Center Expanding Aperture Slot (Flex layout guarantees ZERO overlap) */}
          <div ref={apertureSlotRef} className="preloader-aperture-slot">
            <div ref={apertureCardRef} className="preloader-aperture-card">
              <div className="preloader-cards-stack">
                {CRAFT_CARDS.map((card, idx) => (
                  <div
                    key={card.id}
                    ref={(el) => (cardsRef.current[idx] = el)}
                    className={`preloader-craft-card ${idx === 0 ? "is-initial" : ""}`}
                  >
                    <img
                      src={card.img}
                      alt={card.caption}
                      className="preloader-craft-img"
                      loading="eager"
                    />
                    <div className="preloader-craft-scrim" />
                    <div className="preloader-card-badge">
                      <span className="preloader-card-tag">{card.tag}</span>
                      <span className="preloader-card-caption">{card.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Half: MEEN */}
          <div ref={logoRightRef} className="preloader-logo-half preloader-logo-right">
            MEEN
          </div>
        </div>
      </div>

      {/* 3. Bottom Telemetry Datum Bar */}
      <div ref={bottomBarRef} className="preloader-bottom-bar">
        <div className="preloader-meta-wrap">
          <div className="preloader-meta-label">ATELIER SPECIFICATION</div>
          <div ref={materialTextRef} className="preloader-status-text">
            {CRAFT_CARDS[0].material}
          </div>
        </div>

        <div className="preloader-counter-wrap">
          <div ref={percentTextRef} className="preloader-counter-number">
            00%
          </div>
          <div className="preloader-progress-track">
            <div ref={progressFillRef} className="preloader-progress-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

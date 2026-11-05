import { useState, useEffect, useRef, useCallback } from "react";
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
  const [activeCard, setActiveCard] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [dubaiTime, setDubaiTime] = useState("18:00");

  const preloaderRef = useRef(null);
  const stageRef = useRef(null);
  const logoLeftRef = useRef(null);
  const logoRightRef = useRef(null);
  const leftMaskRef = useRef(null);
  const rightMaskRef = useRef(null);
  const apertureRef = useRef(null);
  const percentTextRef = useRef(null);
  const progressFillRef = useRef(null);
  const bottomBarRef = useRef(null);
  const isFinishedRef = useRef(false);
  const timelineRef = useRef(null);

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

  // 3D Mouse Parallax on Aperture Window
  const handleMouseMove = useCallback((e) => {
    if (!apertureRef.current || isFinishedRef.current) return;
    const { clientX, clientY } = e;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    gsap.to(apertureRef.current, {
      rotateY: dx * 14,
      rotateX: -dy * 14,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.45,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

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

    const finishPreloader = () => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      // Animate split logo halves smoothly
      if (logoLeftRef.current && logoRightRef.current) {
        gsap.to([logoLeftRef.current, logoRightRef.current], {
          x: "0%",
          duration: 0.65,
          ease: "power3.inOut",
        });
      }

      // Smooth bloom of the aperture into the hero space
      if (apertureRef.current) {
        gsap.to(apertureRef.current, {
          scale: 1.15,
          opacity: 0,
          duration: 0.65,
          ease: "power3.inOut",
        });
      }

      // Fade bottom telemetry
      if (bottomBarRef.current) {
        gsap.to(bottomBarRef.current, {
          opacity: 0,
          y: 14,
          duration: 0.35,
        });
      }

      // Fluid curtain wipe up revealing hero
      if (preloaderRef.current) {
        gsap.to(preloaderRef.current, {
          yPercent: -100,
          duration: 1.05,
          ease: "power4.inOut",
          delay: 0.1,
          onUpdate: function () {
            // At 40% curtain lift, trigger hero entrance
            if (this.progress() > 0.4 && !heroTriggered) {
              heroTriggered = true;
              document.body.style.overflow = originalOverflow || "";
              if (onComplete) onComplete();
              window.dispatchEvent(new CustomEvent("preloader-docked"));
            }
          },
          onComplete: () => {
            setIsVisible(false);
          },
        });
      }
    };

    // Phase 1: Reset elements, split typography and open vault masks
    const ctx = gsap.context(() => {
      // Ensure clean initial positions
      gsap.set(preloaderRef.current, { yPercent: 0, opacity: 1, visibility: "visible" });
      gsap.set([logoLeftRef.current, logoRightRef.current], { x: "0%" });
      gsap.set([leftMaskRef.current, rightMaskRef.current], { x: "0%" });
      if (apertureRef.current) gsap.set(apertureRef.current, { scale: 1, opacity: 1, rotateX: 0, rotateY: 0 });
      if (bottomBarRef.current) gsap.set(bottomBarRef.current, { opacity: 1, y: 0 });

      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Initial pause
      tl.to({}, { duration: 0.2 });

      // Split "YASH" left, "MEEN" right, open center masks
      tl.add(() => {
        gsap.to(logoLeftRef.current, {
          x: "-25%",
          duration: 0.9,
          ease: "power3.inOut",
        });
        gsap.to(logoRightRef.current, {
          x: "22%",
          duration: 0.9,
          ease: "power3.inOut",
        });
        gsap.to(leftMaskRef.current, {
          x: "-100%",
          duration: 0.9,
          ease: "power3.inOut",
        });
        gsap.to(rightMaskRef.current, {
          x: "100%",
          duration: 0.9,
          ease: "power3.inOut",
        });
      });

      // Phase 2: Animate progress counter and flip craft cards
      const counterObj = { p: 0 };
      tl.to(counterObj, {
        p: 99,
        duration: 2.6,
        ease: "power4.inOut",
        onUpdate: () => {
          const num = Math.round(counterObj.p);
          const formatted = num < 10 ? `0${num}%` : `${num}%`;
          if (percentTextRef.current) {
            percentTextRef.current.innerText = formatted;
          }
          if (progressFillRef.current) {
            progressFillRef.current.style.width = `${num}%`;
          }
          // Compute card shuffle index based on percentage
          const cardIdx = Math.min(
            CRAFT_CARDS.length - 1,
            Math.floor((num / 100) * CRAFT_CARDS.length)
          );
          setActiveCard(cardIdx);
        },
        onComplete: () => {
          if (percentTextRef.current) {
            percentTextRef.current.innerText = "100%";
          }
          if (progressFillRef.current) {
            progressFillRef.current.style.width = "100%";
          }
          // Phase 3: Morph & dock into hero
          finishPreloader();
        },
      });
    }, preloaderRef);

    // Keyboard shortcut (ESC) to skip
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

  const currentMaterial = CRAFT_CARDS[activeCard]?.material || "";

  return (
    <div
      ref={preloaderRef}
      className="monolith-preloader"
      aria-label="Yashmeen Atelier Initializing"
    >
      {/* 1. Top Telemetry Bar with Live Dubai GST Time */}
      <div className="preloader-top-bar">
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
                yPercent: -100,
                duration: 0.55,
                ease: "power3.inOut",
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

      {/* 2. Center Stage: Split Monolith Typography & 3D Shutter Aperture */}
      <div ref={stageRef} className="preloader-center-stage">
        <div className="preloader-wordmark-container">
          {/* Left Half: YASH */}
          <div ref={logoLeftRef} className="preloader-logo-half preloader-logo-left">
            YASH
          </div>

          {/* Center Aperture with Vault Mask Doors & Rapid Card Stack */}
          <div ref={apertureRef} className="preloader-aperture-wrap">
            <div ref={leftMaskRef} className="preloader-mask-door is-left" aria-hidden="true" />
            <div ref={rightMaskRef} className="preloader-mask-door is-right" aria-hidden="true" />

            <div className="preloader-cards-stack">
              {CRAFT_CARDS.map((card, idx) => (
                <div
                  key={card.id}
                  className={`preloader-craft-card ${idx === activeCard ? "is-active" : ""}`}
                >
                  <img
                    src={card.img}
                    alt={card.caption}
                    className="preloader-craft-img"
                    loading="eager"
                  />
                  <div className="preloader-card-badge">
                    <span className="preloader-card-tag">{card.tag}</span>
                    <span className="preloader-card-caption">{card.caption}</span>
                  </div>
                </div>
              ))}
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
          <div className="preloader-status-text">
            {currentMaterial}
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

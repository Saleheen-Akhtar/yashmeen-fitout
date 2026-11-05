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
  const [dubaiTime, setDubaiTime] = useState("20:00");

  const preloaderRef = useRef(null);
  const topBarRef = useRef(null);
  const stageRef = useRef(null);
  const logoLeftRef = useRef(null);
  const logoRightRef = useRef(null);
  const logoRightWrapRef = useRef(null);
  const apertureSlotRef = useRef(null);
  const apertureCardRef = useRef(null);
  const clipPortalRef = useRef(null);
  const cardsRef = useRef([]);
  const thresholdRef = useRef(null);
  const bottomBarRef = useRef(null);
  const percentTextRef = useRef(null);
  const progressFillRef = useRef(null);
  const materialTextRef = useRef(null);

  const isFinishedRef = useRef(false);
  const finishPreloaderRef = useRef(null);
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

  // 120fps hardware-accelerated 3D mouse tracking & mobile gyro
  useEffect(() => {
    if (!apertureCardRef.current) return;

    xQuickTo.current = gsap.quickTo(apertureCardRef.current, "rotationY", {
      duration: 0.5,
      ease: "power2.out",
    });
    yQuickTo.current = gsap.quickTo(apertureCardRef.current, "rotationX", {
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
        xQuickTo.current(dx * 10);
        yQuickTo.current(-dy * 10);
      }
    };

    const handleOrientation = (e) => {
      if (isFinishedRef.current || !xQuickTo.current || !yQuickTo.current) return;
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      const clampedGamma = Math.max(-20, Math.min(20, gamma));
      const clampedBeta = Math.max(-20, Math.min(20, beta - 45));
      xQuickTo.current((clampedGamma / 20) * 10);
      yQuickTo.current(-(clampedBeta / 20) * 10);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [replayKey]);

  // Expose replay for DevTools demonstration
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
    // Lock scrolling during preloader
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let heroTriggered = false;

    // Exact Colonia Zacamil Clip-Path Morph Exit Sequence into Fullscreen Hero
    const finishPreloader = () => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;
      if (timelineRef.current) {
        timelineRef.current.pause();
      }

      const isMobile = window.innerWidth <= 767;

      const exitTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = originalOverflow || "";
          if (onComplete) onComplete();
          setIsVisible(false);
        },
      });

      // 1. Typography slides outward and dissolves
      if (isMobile) {
        if (logoLeftRef.current) {
          exitTl.to(
            logoLeftRef.current,
            {
              y: -50,
              opacity: 0,
              filter: "blur(6px)",
              duration: 0.7,
              ease: "power3.inOut",
            },
            0
          );
        }
        if (logoRightWrapRef.current) {
          exitTl.to(
            logoRightWrapRef.current,
            {
              y: 50,
              opacity: 0,
              filter: "blur(6px)",
              duration: 0.7,
              ease: "power3.inOut",
            },
            0
          );
        }
      } else {
        if (logoLeftRef.current) {
          exitTl.to(
            logoLeftRef.current,
            {
              x: -120,
              opacity: 0,
              filter: "blur(8px)",
              duration: 0.75,
              ease: "power3.inOut",
            },
            0
          );
        }
        if (logoRightWrapRef.current) {
          exitTl.to(
            logoRightWrapRef.current,
            {
              x: 120,
              opacity: 0,
              filter: "blur(8px)",
              duration: 0.75,
              ease: "power3.inOut",
            },
            0
          );
        }
      }

      // Threshold button & description subtitle fade out
      if (thresholdRef.current) {
        exitTl.to(
          thresholdRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: "power2.in",
          },
          0
        );
      }

      // 2. Central aperture pill seamlessly expands into fullscreen 100vw x 100vh hero
      if (apertureSlotRef.current && clipPortalRef.current) {
        const r = apertureSlotRef.current.getBoundingClientRect();
        const initialClip = {
          top: r.top,
          right: Math.max(0, window.innerWidth - r.right),
          bottom: Math.max(0, window.innerHeight - r.bottom),
          left: r.left,
          round: 20,
        };

        if (apertureCardRef.current) {
          gsap.set(apertureCardRef.current, { opacity: 0 });
        }

        exitTl.fromTo(
          initialClip,
          {
            top: initialClip.top,
            right: initialClip.right,
            bottom: initialClip.bottom,
            left: initialClip.left,
            round: 20,
          },
          {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            round: 0,
            duration: 0.95,
            ease: "power3.inOut",
            onUpdate: () => {
              if (clipPortalRef.current) {
                clipPortalRef.current.style.clipPath = `inset(${initialClip.top}px ${initialClip.right}px ${initialClip.bottom}px ${initialClip.left}px round ${initialClip.round}px)`;
              }
            },
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

      // 4. Trigger hero entrance while preloader dissolves
      exitTl.add(() => {
        if (!heroTriggered) {
          heroTriggered = true;
          window.dispatchEvent(new CustomEvent("preloader-docked"));
        }
      }, 0.25);

      // 5. Complete preloader backdrop dissolve
      if (preloaderRef.current) {
        exitTl.to(
          preloaderRef.current,
          {
            opacity: 0,
            duration: 0.65,
            ease: "power2.inOut",
          },
          0.35
        );
      }
    };

    finishPreloaderRef.current = finishPreloader;

    const isMobile = window.innerWidth <= 767;

    const ctx = gsap.context(() => {
      // 1. Clean starting states
      gsap.set(preloaderRef.current, { opacity: 1, visibility: "visible" });
      gsap.set(topBarRef.current, { opacity: 1, y: 0 });
      gsap.set(bottomBarRef.current, { opacity: 1, y: 0 });
      if (thresholdRef.current) {
        gsap.set(thresholdRef.current, { opacity: 1, y: 0 });
      }

      gsap.set(logoLeftRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(logoRightWrapRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      });

      if (apertureSlotRef.current) {
        gsap.set(apertureSlotRef.current, {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
        });
      }

      if (apertureCardRef.current) {
        gsap.set(apertureCardRef.current, {
          scale: 1,
          opacity: 1,
          rotationX: 0,
          rotationY: 0,
        });
      }

      // Initialize clip-path of portal canvas to match aperture slot precisely
      setTimeout(() => {
        if (apertureSlotRef.current && clipPortalRef.current) {
          const r = apertureSlotRef.current.getBoundingClientRect();
          const top = r.top;
          const right = Math.max(0, window.innerWidth - r.right);
          const bottom = Math.max(0, window.innerHeight - r.bottom);
          const left = r.left;
          clipPortalRef.current.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 20px)`;
        }
      }, 50);

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

      // Subtle entrance glide
      if (isMobile) {
        masterTl.fromTo(
          logoLeftRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          0
        );
        masterTl.fromTo(
          logoRightWrapRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          0
        );
      } else {
        masterTl.fromTo(
          logoLeftRef.current,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          0
        );
        masterTl.fromTo(
          logoRightWrapRef.current,
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          0
        );
      }

      masterTl.fromTo(
        apertureSlotRef.current,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" },
        0.1
      );

      masterTl.fromTo(
        thresholdRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        0.2
      );

      // Phase 2: Counter progression and hardware-accelerated card flipping
      const counterState = { p: 0 };
      let lastCardIndex = 0;

      masterTl.to(
        counterState,
        {
          p: 100,
          duration: 2.4,
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
                  scale: 0.98,
                  duration: 0.32,
                  ease: "power2.out",
                });
                gsap.fromTo(
                  nextCardEl,
                  { opacity: 0, scale: 1.02 },
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
        0.45
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
      finishPreloaderRef.current = null;
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
      {/* 1. Inset Portal Canvas: Fullscreen image clipped to aperture pill, expanding to 100vw x 100vh on exit */}
      <div ref={clipPortalRef} className="preloader-portal-canvas">
        <img
          src={CRAFT_CARDS[0].img}
          alt="Yashmeen Atelier Turnkey Architectural Space"
          className="preloader-portal-bg-img"
          loading="eager"
        />
      </div>

      {/* 2. Top Telemetry Bar with Live Dubai GST Time */}
      <div ref={topBarRef} className="preloader-top-bar">
        <div className="preloader-brand-label">
          <span className="preloader-red-dot" aria-hidden="true" />
          <span className="preloader-brand-text">YASHMEEN · DUBAI</span>
          <span className="preloader-time-sep">/</span>
          <span className="preloader-time-val">{dubaiTime} GST</span>
          <span className="preloader-coords-val">25.2048° N, 55.2708° E</span>
        </div>
        <div className="preloader-top-actions">
          <span className="preloader-lang-tag">[EN / AR]</span>
          <button
            type="button"
            onClick={() => finishPreloaderRef.current?.()}
            className="preloader-skip-btn"
            aria-label="Skip introduction animation"
          >
            SKIP [ESC]
          </button>
        </div>
      </div>

      {/* 3. Center Stage: Monolith Typography & Expanding Horizontal Aperture (Colonia Zacamil Exact Replica) */}
      <div ref={stageRef} className="preloader-center-stage">
        <div className="preloader-monolith-row">
          {/* Left Wordmark: YASHMEEN (Intact single word) */}
          <div ref={logoLeftRef} className="preloader-logo-half preloader-logo-left">
            YASHMEEN
          </div>

          {/* Center Aperture Panorama Slot: Aspect Ratio 16 / 5.6 */}
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

          {/* Right Wordmark: FIT-OUT with [35,000 SQ. FT. ATELIER] Badge */}
          <div ref={logoRightWrapRef} className="preloader-logo-right-wrap">
            <div className="preloader-powered-badge">
              [35,000 SQ. FT. <b>ATELIER</b>]
            </div>
            <div ref={logoRightRef} className="preloader-logo-half preloader-logo-right">
              FIT-OUT
            </div>
          </div>
        </div>

        {/* Colonia Zacamil-Style Interactive Threshold Button & Literary Description */}
        <div ref={thresholdRef} className="preloader-threshold-wrap">
          <button
            type="button"
            onClick={() => finishPreloaderRef.current?.()}
            className="preloader-enter-btn"
            aria-label="Enter Yashmeen Atelier"
          >
            <span>ENTER ATELIER</span>
            <div className="preloader-btn-circle-w" aria-hidden="true">
              <div className="preloader-btn-circle" />
            </div>
          </button>
          <p className="preloader-description-text">
            Yashmeen is more than just blueprints.
            <br />
            Dubai turnkey contracting &amp; bespoke joinery.
          </p>
        </div>
      </div>

      {/* 4. Bottom Telemetry Datum Bar */}
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

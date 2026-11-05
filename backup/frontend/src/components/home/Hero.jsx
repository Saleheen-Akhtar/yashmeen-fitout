import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const [dubaiTime, setDubaiTime] = useState("23:12");

  const heroRef = useRef(null);
  const leftWordRef = useRef(null);
  const rightWordWrapRef = useRef(null);
  const apertureSlotRef = useRef(null);
  const poweredRef = useRef(null);
  const buttonRef = useRef(null);
  const descRef = useRef(null);
  const topBarRef = useRef(null);

  const hasAnimatedRef = useRef(false);

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
        setDubaiTime("23:12");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll down to Studio section
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

  // GSAP Entrance Timeline: triggers as preloader finishes
  useEffect(() => {
    const playHeroEntrance = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const isMobile = window.innerWidth < 768;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (isMobile) {
        tl.fromTo(
          leftWordRef.current,
          { opacity: 0, y: -40 },
          { opacity: 1, y: 0, duration: 1.1 },
          0
        );
        tl.fromTo(
          apertureSlotRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.1 },
          0.1
        );
        tl.fromTo(
          rightWordWrapRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.1 },
          0.2
        );
      } else {
        tl.fromTo(
          leftWordRef.current,
          { opacity: 0, x: -320 },
          { opacity: 1, x: 0, duration: 1.3 },
          0
        );
        tl.fromTo(
          apertureSlotRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.25 },
          0.05
        );
        tl.fromTo(
          rightWordWrapRef.current,
          { opacity: 0, x: 320 },
          { opacity: 1, x: 0, duration: 1.3 },
          0
        );
      }

      if (poweredRef.current) {
        tl.fromTo(
          poweredRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "linear" },
          0.35
        );
      }

      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" },
          0.4
        );
      }

      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.9, ease: "linear" },
          0.5
        );
      }
    };

    window.addEventListener("preloader-complete", playHeroEntrance);

    // Fallback: if preloader was already dismissed or skipped before listener
    const timer = setTimeout(() => {
      playHeroEntrance();
    }, 1100);

    return () => {
      window.removeEventListener("preloader-complete", playHeroEntrance);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="colonia-hero-section"
      aria-label="Yashmeen Fit-Out Atelier"
    >
      {/* 1. Top Telemetry Bar */}
      <header ref={topBarRef} className="hero-top-telemetry">
        <div className="hero-telemetry-left">
          <span className="hero-pulse-dot" aria-hidden="true" />
          <span className="hero-brand-name">YASHMEEN ATELIER</span>
          <span className="hero-sep">/</span>
          <span className="hero-time">{dubaiTime} GST</span>
          <span className="hero-coords">25.2048 N, 55.2708 E</span>
        </div>

        <div className="hero-telemetry-right">
          <span className="hero-lang-tag">[EN / AR]</span>
          <button
            type="button"
            className="hero-skip-pill"
            onClick={scrollToNextSection}
            aria-label="Skip to studio section"
          >
            SKIP [ESC]
          </button>
        </div>
      </header>

      {/* 2. Main Monolithic Composition (Exact Replica of Reference) */}
      <div className="hero-monolith-stage">
        <div className="hero-title-row">
          {/* Left word: YASHMEEN as a single intact word */}
          <div ref={leftWordRef} className="hero-word hero-word-left">
            <span>YASHMEEN</span>
          </div>

          {/* Center Aperture Window */}
          <div ref={apertureSlotRef} className="hero-aperture-slot">
            <div className="hero-aperture-frame">
              <img
                src="/static/hero.jpg"
                alt="Yashmeen Luxury Turnkey Fit-Out Atelier"
                className="hero-aperture-img"
              />
            </div>
          </div>

          {/* Right word: FIT-OUT with badge above */}
          <div ref={rightWordWrapRef} className="hero-word hero-word-right-wrap">
            <div ref={poweredRef} className="hero-powered-badge">
              [EST. DUBAI • <b>35,000 SQ. FT. ATELIER</b>]
            </div>
            <span className="hero-word-right">FIT-OUT</span>
          </div>
        </div>

        {/* 3. Tactile Black Pill Button with sliding target circle */}
        <button
          ref={buttonRef}
          type="button"
          className="button-with-circle"
          onClick={scrollToNextSection}
          aria-label="Discover Yashmeen Fit-Out Atelier"
        >
          <span>Discover</span>
          <div className="button-circle-w" aria-hidden="true">
            <div className="button-circle" />
          </div>
        </button>

        {/* 4. Literary Serif Description */}
        <p ref={descRef} className="hero-literary-desc">
          Yashmeen is more than just spaces. Activate vision
          <br />
          for the full experience.
        </p>
      </div>
    </section>
  );
}

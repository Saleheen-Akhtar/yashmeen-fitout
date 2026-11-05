import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [dubaiTime, setDubaiTime] = useState("20:00");

  const loaderRef = useRef(null);
  const backgroundWRef = useRef(null);
  const bgImgRef = useRef(null);
  const titleRef = useRef(null);
  const leftWordRef = useRef(null);
  const rightWordWrapRef = useRef(null);
  const rightWordRef = useRef(null);
  const poweredRef = useRef(null);
  const pictureWRef = useRef(null);
  const buttonRef = useRef(null);
  const descRef = useRef(null);
  const topBarRef = useRef(null);

  const isExitingRef = useRef(false);
  const exitTimelineRef = useRef(null);
  const masterTimelineRef = useRef(null);

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

  // Expose replay for testing
  useEffect(() => {
    window.__replayPreloader = () => {
      isExitingRef.current = false;
      setIsVisible(true);
      setReplayKey((k) => k + 1);
    };
    return () => {
      delete window.__replayPreloader;
    };
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    isExitingRef.current = false;

    // Helper: update exact --inset based on .picture-w bounding client rect
    const updateInset = () => {
      if (!pictureWRef.current || !backgroundWRef.current) return;
      const r = pictureWRef.current.getBoundingClientRect();
      const top = r.top;
      const right = Math.max(0, window.innerWidth - (r.left + r.width));
      const bottom = Math.max(0, window.innerHeight - (r.top + r.height));
      const left = r.left;
      backgroundWRef.current.style.setProperty(
        "--inset",
        `${top}px ${right}px ${bottom}px ${left}px`
      );
    };

    updateInset();
    window.addEventListener("resize", updateInset);

    // EXACT COLONIA ZACAMIL "OUT" ANIMATION
    const triggerExit = () => {
      if (isExitingRef.current) return;
      isExitingRef.current = true;

      if (masterTimelineRef.current) {
        masterTimelineRef.current.pause();
      }

      const isMobile = window.innerWidth < 768;
      const exitTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = originalOverflow || "";
          if (onComplete) onComplete();
          setIsVisible(false);
        },
      });
      exitTimelineRef.current = exitTl;

      // 1. Words slide outward smoothly (matching Zacamil's power3.inOut)
      if (isMobile) {
        if (leftWordRef.current) {
          exitTl.to(
            leftWordRef.current,
            { y: -70, opacity: 0, duration: 1.1, ease: "power3.inOut" },
            0
          );
        }
        if (rightWordWrapRef.current) {
          exitTl.to(
            rightWordWrapRef.current,
            { y: 70, opacity: 0, duration: 1.1, ease: "power3.inOut" },
            0
          );
        }
      } else {
        if (leftWordRef.current) {
          exitTl.to(
            leftWordRef.current,
            {
              x: -window.innerWidth * 0.22,
              opacity: 0,
              duration: 1.25,
              ease: "power3.inOut",
            },
            0
          );
        }
        if (rightWordWrapRef.current) {
          exitTl.to(
            rightWordWrapRef.current,
            {
              x: window.innerWidth * 0.22,
              opacity: 0,
              duration: 1.25,
              ease: "power3.inOut",
            },
            0
          );
        }
      }

      // 2. Button, powered badge, description and top bar fade out
      const fadeElements = [
        buttonRef.current,
        descRef.current,
        poweredRef.current,
        topBarRef.current,
      ].filter(Boolean);

      if (fadeElements.length > 0) {
        exitTl.to(
          fadeElements,
          { opacity: 0, duration: 0.5, ease: "power2.in" },
          0
        );
      }

      // 3. Central aperture smoothly expands back to fullscreen 100vw x 100vh
      // By removing .animate, the CSS transition takes over with 1.3s cubic-bezier(0.645, 0.045, 0.355, 1)
      exitTl.add(() => {
        if (backgroundWRef.current) {
          backgroundWRef.current.classList.remove("animate");
        }
      }, 0.05);

      // 4. Trigger hero section entrance
      exitTl.add(() => {
        window.dispatchEvent(new CustomEvent("preloader-docked"));
      }, 0.7);

      // 5. Complete loader backdrop dissolve
      if (loaderRef.current) {
        exitTl.to(
          loaderRef.current,
          { opacity: 0, duration: 0.5, ease: "power2.inOut" },
          1.1
        );
      }
    };

    // EXACT COLONIA ZACAMIL "IN" ANIMATION
    const ctx = gsap.context(() => {
      // Starting clean states
      gsap.set(loaderRef.current, { opacity: 1, visibility: "visible" });
      gsap.set(topBarRef.current, { opacity: 0, y: -10 });
      gsap.set(leftWordRef.current, { opacity: 0, x: 0, y: 0 });
      gsap.set(rightWordWrapRef.current, { opacity: 0, x: 0, y: 0 });
      if (poweredRef.current) gsap.set(poweredRef.current, { opacity: 0 });
      if (buttonRef.current) {
        gsap.set(buttonRef.current, { opacity: 0, y: 15, pointerEvents: "none" });
      }
      if (descRef.current) gsap.set(descRef.current, { opacity: 0 });

      // Make sure background-w starts fullscreen without .animate
      if (backgroundWRef.current) {
        backgroundWRef.current.classList.remove("animate");
      }

      const isMobile = window.innerWidth < 768;
      const b = gsap.timeline({
        defaults: { ease: "power3.inOut" },
      });
      masterTimelineRef.current = b;

      // 0.0s: Background image starts fullscreen, subtle zoom settle
      b.fromTo(
        backgroundWRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power2.out" },
        0
      );
      if (bgImgRef.current) {
        b.fromTo(
          bgImgRef.current,
          { scale: 1.1 },
          { scale: 1, duration: 1.8, ease: "power2.out" },
          0
        );
      }

      // 0.4s: Top bar fades in gently
      b.to(
        topBarRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        0.4
      );

      // 1.4s: Inset calculated and background-w contracts down into centered aperture pill
      b.add(() => {
        updateInset();
        if (backgroundWRef.current) {
          backgroundWRef.current.classList.add("animate");
        }
      }, 1.4);

      // 1.8s: Words slide in from edges with authentic Zacamil momentum
      if (isMobile) {
        b.fromTo(
          leftWordRef.current,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" },
          1.8
        );
        b.fromTo(
          rightWordWrapRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" },
          1.8
        );
      } else {
        b.fromTo(
          leftWordRef.current,
          { opacity: 0, x: -350 },
          { opacity: 1, x: 0, duration: 1.5, ease: "power3.out" },
          1.8
        );
        b.fromTo(
          rightWordWrapRef.current,
          { opacity: 0, x: 350 },
          { opacity: 1, x: 0, duration: 1.5, ease: "power3.out" },
          1.8
        );
      }

      // 2.4s: Powered badge fades in
      if (poweredRef.current) {
        b.fromTo(
          poweredRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "linear" },
          2.4
        );
      }

      // 2.6s: Discover pill button fades in and becomes clickable
      if (buttonRef.current) {
        b.fromTo(
          buttonRef.current,
          { opacity: 0, y: 15, pointerEvents: "none" },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            pointerEvents: "auto",
          },
          2.6
        );
      }

      // 2.8s: Description text fades in
      if (descRef.current) {
        b.fromTo(
          descRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.9, ease: "linear" },
          2.8
        );
      }
    }, loaderRef);

    // Keyboard ESC to skip
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        triggerExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Expose triggerExit on window for programmatic testing
    window.__triggerPreloaderExit = triggerExit;

    return () => {
      document.body.style.overflow = originalOverflow || "";
      window.removeEventListener("resize", updateInset);
      window.removeEventListener("keydown", handleKeyDown);
      delete window.__triggerPreloaderExit;
      ctx.revert();
    };
  }, [onComplete, replayKey]);

  if (!isVisible) return null;

  return (
    <div
      id="loader"
      ref={loaderRef}
      className="colonia-loader"
      aria-label="Yashmeen Fit-Out Atelier Monolith Preloader"
    >
      {/* 1. Background Inset Canvas (Exact Colonia Zacamil .background-w) */}
      <div ref={backgroundWRef} className="background-w">
        <picture className="background">
          <source media="(min-width: 768px)" srcSet="/static/hero.jpg" />
          <img
            ref={bgImgRef}
            src="/static/hero.jpg"
            alt="Yashmeen Luxury Fit-Out Interior"
          />
        </picture>
      </div>

      {/* 2. Top Minimal Telemetry Bar */}
      <div ref={topBarRef} className="colonia-top-bar">
        <div className="colonia-brand-status">
          <span className="colonia-status-dot" aria-hidden="true" />
          <span className="colonia-brand-title">YASHMEEN ATELIER</span>
          <span className="colonia-time-sep">/</span>
          <span className="colonia-time-val">{dubaiTime} GST</span>
          <span className="colonia-coords">25.2048 N, 55.2708 E</span>
        </div>
        <div className="colonia-top-actions">
          <span className="colonia-lang">[EN / AR]</span>
          <button
            type="button"
            className="colonia-skip-btn"
            onClick={() => window.__triggerPreloaderExit?.()}
          >
            SKIP [ESC]
          </button>
        </div>
      </div>

      {/* 3. Introduction Stage (Exact Colonia Zacamil .introduction) */}
      <div className="introduction">
        <div ref={titleRef} className="title">
          {/* Left word: YASHMEEN as a single intact word */}
          <div ref={leftWordRef} className="title-left">
            <span>YASHMEEN</span>
          </div>

          {/* Center Aperture Pill: defines --inset rectangle */}
          <div ref={pictureWRef} className="picture-w" aria-hidden="true" />

          {/* Right word: FIT-OUT business identifier with badge above */}
          <div ref={rightWordWrapRef} className="title-right">
            <div ref={poweredRef} className="powered">
              [EST. DUBAI • <b>35,000 SQ. FT. ATELIER</b>]
            </div>
            <span ref={rightWordRef}>FIT-OUT</span>
          </div>
        </div>

        {/* Tactile Black Pill Button with sliding target circle */}
        <button
          ref={buttonRef}
          type="button"
          className="button-with-circle"
          onClick={() => window.__triggerPreloaderExit?.()}
          aria-label="Discover Yashmeen Fit-Out Atelier"
        >
          <span>Discover</span>
          <div className="button-circle-w" aria-hidden="true">
            <div className="button-circle" />
          </div>
        </button>

        {/* Literary Serif Description */}
        <div ref={descRef} className="description">
          Yashmeen is more than just spaces. Activate vision for the full experience.
        </div>
      </div>
    </div>
  );
}

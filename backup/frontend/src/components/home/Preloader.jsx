import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [dubaiTime, setDubaiTime] = useState("20:00");
  const [progress, setProgress] = useState(0);

  const loaderRef = useRef(null);
  const backgroundWRef = useRef(null);
  const bgImgRef = useRef(null);
  const topBarRef = useRef(null);
  const counterWrapRef = useRef(null);

  const isExitingRef = useRef(false);
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

  // Expose replay for testing
  useEffect(() => {
    window.__replayPreloader = () => {
      isExitingRef.current = false;
      setIsVisible(true);
      setProgress(0);
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

    // Helper: update exact --inset matching the Hero aperture slot in the DOM
    const updateInset = () => {
      if (!backgroundWRef.current) return;
      const heroSlot = document.querySelector(".hero-aperture-slot");
      if (heroSlot) {
        const r = heroSlot.getBoundingClientRect();
        const top = r.top;
        const right = Math.max(0, window.innerWidth - (r.left + r.width));
        const bottom = Math.max(0, window.innerHeight - (r.top + r.height));
        const left = r.left;
        backgroundWRef.current.style.setProperty(
          "--inset",
          `${top}px ${right}px ${bottom}px ${left}px`
        );
      } else {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          const w = Math.min(300, window.innerWidth * 0.82);
          const h = w / 0.75;
          const top = Math.max(20, (window.innerHeight - h) / 2);
          const left = Math.max(0, (window.innerWidth - w) / 2);
          backgroundWRef.current.style.setProperty(
            "--inset",
            `${top}px ${left}px ${top}px ${left}px`
          );
        } else {
          const w = Math.min(360, window.innerWidth * 0.25);
          const h = w / 0.75;
          const top = Math.max(40, (window.innerHeight - h) / 2);
          const left = Math.max(0, (window.innerWidth - w) / 2);
          backgroundWRef.current.style.setProperty(
            "--inset",
            `${top}px ${left}px ${top}px ${left}px`
          );
        }
      }
    };

    updateInset();
    window.addEventListener("resize", updateInset);

    // Sequence: Fullscreen image -> smooth contraction into Hero aperture slot -> unmount preloader
    const ctx = gsap.context(() => {
      gsap.set(loaderRef.current, { opacity: 1, visibility: "visible" });
      gsap.set(topBarRef.current, { opacity: 1, y: 0 });
      gsap.set(counterWrapRef.current, { opacity: 1, y: 0 });

      if (backgroundWRef.current) {
        backgroundWRef.current.classList.remove("animate");
      }

      const tl = gsap.timeline();
      timelineRef.current = tl;

      // 0.0s - 1.2s: Progress counter climbs to 100%
      const counterState = { val: 0 };
      tl.to(
        counterState,
        {
          val: 100,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: () => {
            setProgress(Math.round(counterState.val));
          },
        },
        0
      );

      // 1.2s: Inset calculated and background-w smoothly contracts into Hero's aperture
      tl.add(() => {
        updateInset();
        if (backgroundWRef.current) {
          backgroundWRef.current.classList.add("animate");
        }
      }, 1.2);

      // 1.3s: Counter fades out
      tl.to(
        counterWrapRef.current,
        { opacity: 0, y: 15, duration: 0.45, ease: "power2.in" },
        1.3
      );

      // 1.4s: Top bar fades out
      tl.to(
        topBarRef.current,
        { opacity: 0, duration: 0.45, ease: "power2.in" },
        1.4
      );

      // 2.2s: Preloader backdrop dissolves away, unveiling the identical Hero underneath
      tl.to(
        loaderRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            document.body.style.overflow = originalOverflow || "";
            if (onComplete) onComplete();
            setIsVisible(false);
          },
        },
        2.1
      );
    }, loaderRef);

    // Instant Skip with ESC
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        document.body.style.overflow = originalOverflow || "";
        if (onComplete) onComplete();
        setIsVisible(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "";
      window.removeEventListener("resize", updateInset);
      window.removeEventListener("keydown", handleKeyDown);
      ctx.revert();
    };
  }, [onComplete, replayKey]);

  if (!isVisible) return null;

  return (
    <div
      id="loader"
      ref={loaderRef}
      className="colonia-loader"
      aria-label="Yashmeen Fit-Out Atelier Preloader"
    >
      {/* 1. Background Inset Canvas (starts 100% fullscreen, then contracts into Hero aperture) */}
      <div ref={backgroundWRef} className="background-w">
        <picture className="background">
          <source media="(min-width: 768px)" srcSet="/static/atelier-render.jpg" />
          <img
            ref={bgImgRef}
            src="/static/atelier-render.jpg"
            alt="Yashmeen Luxury Fit-Out Interior"
          />
        </picture>
      </div>

      {/* 2. Top Telemetry Bar */}
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
            onClick={() => setIsVisible(false)}
          >
            SKIP [ESC]
          </button>
        </div>
      </div>

      {/* 3. Minimal Center Loading Counter */}
      <div ref={counterWrapRef} className="colonia-loader-counter-wrap">
        <div className="colonia-loader-counter-num">
          {progress < 10 ? `0${progress}%` : `${progress}%`}
        </div>
        <div className="colonia-loader-track">
          <div
            className="colonia-loader-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="colonia-loader-tag">
          [35,000 SQ. FT. ATELIER • FABRICATING ARCHITECTURAL SPACES]
        </div>
      </div>
    </div>
  );
}

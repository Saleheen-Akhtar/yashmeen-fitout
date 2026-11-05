import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dubaiTime, setDubaiTime] = useState("23:12");

  const loaderRef = useRef(null);
  const counterWrapRef = useRef(null);
  const topBarRef = useRef(null);
  const isDoneRef = useRef(false);

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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finishPreloader = () => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;

      window.dispatchEvent(new CustomEvent("preloader-complete"));
      if (onComplete) onComplete();

      if (loaderRef.current) {
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            document.body.style.overflow = originalOverflow || "";
            setIsVisible(false);
          },
        });
      } else {
        document.body.style.overflow = originalOverflow || "";
        setIsVisible(false);
      }
    };

    const ctx = gsap.context(() => {
      const counterState = { val: 0 };
      const tl = gsap.timeline();

      // Count smoothly 0 to 100% in 0.85s
      tl.to(
        counterState,
        {
          val: 100,
          duration: 0.85,
          ease: "power2.inOut",
          onUpdate: () => {
            setProgress(Math.round(counterState.val));
          },
        },
        0.1
      );

      // Trigger finish at 0.9s
      tl.add(() => {
        finishPreloader();
      }, 0.9);
    }, loaderRef);

    // Instant Skip with ESC key
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
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      id="loader"
      ref={loaderRef}
      className="colonia-site-loader"
      aria-label="Yashmeen Fit-Out Atelier Loading"
    >
      {/* 1. Top Telemetry Bar */}
      <div ref={topBarRef} className="colonia-loader-top">
        <div className="colonia-loader-top-left">
          <span className="colonia-status-dot" aria-hidden="true" />
          <span className="colonia-brand-mono">YASHMEEN ATELIER</span>
          <span className="colonia-mono-sep">/</span>
          <span className="colonia-time-mono">{dubaiTime} GST</span>
          <span className="colonia-coords-mono">25.2048 N, 55.2708 E</span>
        </div>

        <div className="colonia-loader-top-right">
          <span className="colonia-lang-mono">[EN / AR]</span>
          <button
            type="button"
            className="colonia-skip-pill"
            onClick={() => {
              isDoneRef.current = true;
              window.dispatchEvent(new CustomEvent("preloader-complete"));
              if (onComplete) onComplete();
              setIsVisible(false);
            }}
            aria-label="Skip preloader"
          >
            SKIP [ESC]
          </button>
        </div>
      </div>

      {/* 2. Centered Architectural Hairline Counter */}
      <div ref={counterWrapRef} className="colonia-loader-center">
        <div className="colonia-loader-badge">
          [EST. DUBAI • 35,000 SQ. FT. ATELIER]
        </div>
        <div className="colonia-loader-num">
          {progress < 10 ? `0${progress}%` : `${progress}%`}
        </div>
        <div className="colonia-loader-track">
          <div
            className="colonia-loader-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="colonia-loader-status">
          FABRICATING ARCHITECTURAL SPACES
        </div>
      </div>
    </div>
  );
}

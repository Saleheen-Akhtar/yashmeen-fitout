import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const loaderRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const counterState = { val: 0 };
      const tl = gsap.timeline();

      // Gentle entrance
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );

      // Smooth progress count 0 to 100% in 0.9s
      tl.to(
        counterState,
        {
          val: 100,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: () => {
            setProgress(Math.round(counterState.val));
          },
        },
        0.15
      );

      // Smooth fade out
      tl.to(
        loaderRef.current,
        {
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            document.body.style.overflow = originalOverflow || "";
            if (onComplete) onComplete();
            setIsVisible(false);
          },
        },
        1.15
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
      window.removeEventListener("keydown", handleKeyDown);
      ctx.revert();
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      id="loader"
      ref={loaderRef}
      className="site-preloader"
      aria-label="Yashmeen Future Building Loading"
    >
      <div ref={contentRef} className="site-preloader-inner">
        <span className="eyebrow">(YASHMEEN FUTURE BUILDING)</span>
        <h1 className="preloader-brand">YASHMEEN</h1>
        <div className="preloader-track">
          <div
            className="preloader-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="preloader-meta">
          <span>DUBAI · 35,000 SQ. FT. ATELIER</span>
          <span className="preloader-num">{progress < 10 ? `0${progress}%` : `${progress}%`}</span>
        </div>
      </div>

      <button
        type="button"
        className="preloader-skip-btn"
        onClick={() => setIsVisible(false)}
        aria-label="Skip preloader"
      >
        SKIP [ESC]
      </button>
    </div>
  );
}

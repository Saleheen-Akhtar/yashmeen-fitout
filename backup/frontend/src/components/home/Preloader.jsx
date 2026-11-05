import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const loaderRef = useRef(null);
  const wordmarkRef = useRef(null);
  const subtitleRef = useRef(null);
  const trackRef = useRef(null);
  const numRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      // Smooth 0 to 100% progress counter
      const counterState = { val: 0 };
      const tl = gsap.timeline();

      // Entrance animation of minimalist brandmark
      gsap.fromTo(
        wordmarkRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power2.out" }
      );
      gsap.fromTo(
        [trackRef.current, numRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 0.25, ease: "power2.out" }
      );

      // Progress animation (0 to 100 over 1.0s)
      tl.to(
        counterState,
        {
          val: 100,
          duration: 1.0,
          ease: "power2.inOut",
          onUpdate: () => {
            setProgress(Math.round(counterState.val));
          },
        },
        0.2
      );

      // Graceful exit transition: smooth fade and subtle lift
      tl.to(
        [wordmarkRef.current, subtitleRef.current, trackRef.current, numRef.current],
        {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: "power2.in",
        },
        1.25
      );

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
        1.45
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
      className="minimal-loader"
      aria-label="Yashmeen Atelier Loading"
    >
      <div className="minimal-loader-center">
        {/* Minimal Wordmark */}
        <h1 ref={wordmarkRef} className="minimal-loader-wordmark">
          YASHMEEN
        </h1>

        {/* Minimal Subtitle */}
        <p ref={subtitleRef} className="minimal-loader-sub">
          DUBAI · FIT-OUT &amp; JOINERY ATELIER
        </p>

        {/* Minimalist 1px Hairline Progress Bar */}
        <div ref={trackRef} className="minimal-loader-track">
          <div
            className="minimal-loader-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Minimal Numeric Counter */}
        <div ref={numRef} className="minimal-loader-num">
          {progress < 10 ? `0${progress}%` : `${progress}%`}
        </div>
      </div>

      {/* Top Right Skip Button */}
      <button
        type="button"
        className="minimal-loader-skip"
        onClick={() => setIsVisible(false)}
        aria-label="Skip introduction"
      >
        SKIP [ESC]
      </button>
    </div>
  );
}

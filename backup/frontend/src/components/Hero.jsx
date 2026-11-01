import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FiArrowRight, FiShield, FiLayers, FiCompass } from "react-icons/fi";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isNormal: "(prefers-reduced-motion: no-preference)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isNormal } = context.conditions;

          if (isNormal) {
            // Master entrance sequence
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.from(".hero-badge", {
              y: 24,
              opacity: 0,
              duration: 0.8,
              delay: 0.15,
            })
              .from(
                ".hero-title-line",
                {
                  y: 45,
                  opacity: 0,
                  duration: 1,
                  stagger: 0.15,
                },
                "-=0.5"
              )
              .from(
                ".hero-lede",
                {
                  y: 25,
                  opacity: 0,
                  duration: 0.8,
                },
                "-=0.6"
              )
              .from(
                ".hero-cta-pill",
                {
                  y: 20,
                  opacity: 0,
                  stagger: 0.1,
                  duration: 0.7,
                },
                "-=0.5"
              )
              .from(
                ".hero-trust-item",
                {
                  opacity: 0,
                  y: 15,
                  stagger: 0.08,
                  duration: 0.6,
                },
                "-=0.4"
              )
              .from(
                ".hero-telemetry-dock",
                {
                  y: 35,
                  opacity: 0,
                  duration: 0.9,
                },
                "-=0.4"
              )
              .from(
                ".hero-scroll-cue",
                {
                  opacity: 0,
                  duration: 0.6,
                },
                "-=0.3"
              );

            // Counter ticker animation
            const statNumbers = rootRef.current.querySelectorAll(".hero-stat-num");
            statNumbers.forEach((el) => {
              const target = parseInt(el.dataset.count, 10);
              const suffix = el.dataset.suffix || "";
              const obj = { val: 0 };
              gsap.to(obj, {
                val: target,
                duration: 1.8,
                ease: "power2.out",
                delay: 0.6,
                onUpdate: () => {
                  el.textContent = Math.round(obj.val).toLocaleString() + suffix;
                },
              });
            });

            // GSAP ScrollTrigger: Parallax zoom on hero media
            gsap.to(".hero-bg-media", {
              scale: 1.18,
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: rootRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            });

            // GSAP ScrollTrigger: Smooth fade & recede on content
            gsap.to(".hero-content-wrapper", {
              y: -40,
              opacity: 0.2,
              ease: "none",
              scrollTrigger: {
                trigger: rootRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            });
          }
        },
        rootRef
      );
    },
    { scope: rootRef }
  );

  // Subtle 3D mouse parallax on the telemetry dock (desktop only)
  const handleMouseMove = (e) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 1024) return;

    const dock = rootRef.current?.querySelector(".hero-telemetry-dock");
    if (!dock) return;

    const rect = dock.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    gsap.to(dock, {
      rotationY: x * 4,
      rotationX: -y * 4,
      transformPerspective: 1200,
      ease: "power2.out",
      duration: 0.5,
    });
  };

  const handleMouseLeave = () => {
    const dock = rootRef.current?.querySelector(".hero-telemetry-dock");
    if (!dock) return;
    gsap.to(dock, {
      rotationY: 0,
      rotationX: 0,
      ease: "power2.out",
      duration: 0.8,
    });
  };

  const handleScrollCueClick = () => {
    const target = document.querySelector("#clients") || document.querySelector("#about");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={rootRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <style>{`
        /* ============ REDESIGNED ARCHITECTURAL HERO ============ */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 130px 24px 48px;
          background: #0d0c0a;
          color: var(--paper, #faf7f0);
          overflow: hidden;
          isolation: isolate;
        }

        @media (min-width: 768px) {
          .hero {
            padding: 150px 32px 56px;
          }
        }

        /* Ambient Background & Blueprint Mesh */
        .hero-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .hero-bg-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 38%;
          filter: brightness(0.42) contrast(1.15) saturate(0.9);
          transform: scale(1.05);
          will-change: transform;
        }

        .hero-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 90% 65% at 50% 35%, rgba(13, 12, 10, 0.45) 0%, rgba(13, 12, 10, 0.88) 75%, #0d0c0a 100%),
            linear-gradient(180deg, rgba(13, 12, 10, 0.7) 0%, transparent 30%, transparent 70%, #0d0c0a 100%);
        }

        .hero-blueprint-grid {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background-image:
            linear-gradient(rgba(197, 160, 89, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(197, 160, 89, 0.08) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%);
        }

        .hero-ambient-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 450px;
          background: radial-gradient(circle, rgba(197, 160, 89, 0.14) 0%, transparent 65%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        /* Central Content Container */
        .hero-content-wrapper {
          position: relative;
          z-index: 2;
          max-width: 1180px;
          width: 100%;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Badge / Origin Pill */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 18px;
          border-radius: 100px;
          background: rgba(20, 19, 17, 0.72);
          border: 1px solid rgba(197, 160, 89, 0.32);
          box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          margin-bottom: 24px;
        }

        .hero-badge-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brass, #c5a059);
          box-shadow: 0 0 10px var(--brass, #c5a059);
        }

        .hero-badge-text {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
        }

        /* Massive 2-Line Editorial Headline */
        .hero-heading {
          margin: 0 auto;
          max-width: 1080px;
          font-family: var(--font-serif);
          font-size: clamp(2.6rem, 5.2vw, 4.8rem);
          font-weight: 500;
          line-height: 1.12;
          letter-spacing: -0.015em;
          color: #ffffff;
        }

        .hero-title-line {
          display: block;
        }

        .hero-title-italic {
          font-style: italic;
          color: var(--brass-light, #dfba73);
          font-weight: 400;
        }

        /* Subtitle / Lede */
        .hero-lede {
          margin-top: 24px;
          max-width: 64ch;
          font-family: var(--font-sans);
          font-size: clamp(15px, 1.4vw, 17.5px);
          line-height: 1.75;
          color: rgba(250, 247, 240, 0.78);
        }

        /* CTA Row */
        .hero-cta-group {
          margin-top: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 4px;
          background: linear-gradient(135deg, #dfba73 0%, #c5a059 100%);
          color: #0d0c0a;
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 12px 28px -6px rgba(197, 160, 89, 0.35);
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
          border: none;
        }

        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px -6px rgba(197, 160, 89, 0.5);
          filter: brightness(1.05);
        }

        .hero-btn-primary:active {
          transform: scale(0.98);
        }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--paper, #faf7f0);
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(10px);
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }

        .hero-btn-secondary:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(197, 160, 89, 0.45);
          color: #ffffff;
        }

        .hero-btn-secondary:active {
          transform: scale(0.98);
        }

        /* Trust Points (Direct, non-spammy) */
        .hero-trust-bar {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .hero-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(250, 247, 240, 0.68);
          letter-spacing: 0.02em;
        }

        .hero-trust-icon {
          color: var(--brass-light, #dfba73);
          flex-shrink: 0;
        }

        /* Spatial Antigravity Telemetry Dock */
        .hero-telemetry-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1080px;
          margin: 56px auto 0;
          perspective: 1200px;
        }

        .hero-telemetry-dock {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          background: rgba(20, 19, 17, 0.76);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          overflow: hidden;
          transition: transform 0.2s ease-out, border-color 0.3s ease;
        }

        .hero-telemetry-dock:hover {
          border-color: rgba(197, 160, 89, 0.28);
        }

        @media (min-width: 820px) {
          .hero-telemetry-dock {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .hero-stat-cell {
          padding: 24px 20px;
          text-align: center;
          position: relative;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        @media (min-width: 820px) {
          .hero-stat-cell {
            border-bottom: none;
          }
          .hero-stat-cell:last-child {
            border-right: none;
          }
        }

        .hero-stat-num {
          font-family: var(--font-serif);
          font-size: clamp(28px, 3vw, 38px);
          font-weight: 600;
          color: var(--brass-light, #dfba73);
          line-height: 1;
        }

        .hero-stat-label {
          margin-top: 8px;
          font-family: var(--font-sans);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(250, 247, 240, 0.65);
        }

        .hero-stat-sub {
          margin-top: 4px;
          font-size: 11px;
          color: rgba(250, 247, 240, 0.4);
        }

        /* Minimalist Scroll Cue */
        .hero-scroll-cue {
          position: relative;
          z-index: 2;
          margin-top: 40px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          background: none;
          border: none;
          color: rgba(250, 247, 240, 0.5);
          transition: color 0.25s ease;
        }

        .hero-scroll-cue:hover {
          color: var(--brass-light, #dfba73);
        }

        .hero-scroll-text {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .hero-scroll-line {
          width: 1px;
          height: 32px;
          background: linear-gradient(180deg, var(--brass, #c5a059), transparent);
          position: relative;
          overflow: hidden;
        }

        .hero-scroll-line::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 40%;
          background: #ffffff;
          animation: heroScrollPulse 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        @keyframes heroScrollPulse {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(280%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-line::after {
            animation: none;
          }
          .hero-bg-media {
            transform: none !important;
          }
        }
      `}</style>

      <section className="hero" id="home">
        {/* Background Visual Layer */}
        <div className="hero-bg-container" aria-hidden="true">
          <img
            className="hero-bg-media"
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85"
            alt="Yashmeen bespoke architectural interior fit-out in Dubai"
            loading="eager"
          />
          <div className="hero-vignette" />
          <div className="hero-blueprint-grid" />
          <div className="hero-ambient-glow" />
        </div>

        {/* Central Content */}
        <div className="hero-content-wrapper">
          {/* Origin Eyebrow */}
          <div className="hero-badge">
            <span className="hero-badge-bullet" />
            <span className="hero-badge-text">Dubai - Established 2016</span>
          </div>

          {/* 2-Line Master Headline */}
          <h1 className="hero-heading">
            <span className="hero-title-line">Architecture of distinction.</span>
            <span className="hero-title-line hero-title-italic">
              Turnkey fit-out contracting in Dubai.
            </span>
          </h1>

          {/* Editorial Lede */}
          <p className="hero-lede">
            Yashmeen Future Building engineers and delivers bespoke commercial,
            hospitality, and private residential fit-outs across the UAE. A single,
            accountable in-house team from design and municipal approvals to final handover.
          </p>

          {/* Action CTAs */}
          <div className="hero-cta-group">
            <a href="#contact" className="hero-btn-primary hero-cta-pill">
              Schedule Consultation <FiArrowRight size={15} />
            </a>
            <a href="#projects" className="hero-btn-secondary hero-cta-pill">
              Explore Selected Works
            </a>
          </div>

          {/* Subtle Trust Indicators */}
          <div className="hero-trust-bar">
            <span className="hero-trust-item">
              <FiCompass size={14} className="hero-trust-icon" />
              Bay Square Studio, Business Bay
            </span>
            <span className="hero-trust-item">
              <FiLayers size={14} className="hero-trust-icon" />
              35,000 Sq.Ft Al Quoz Workshop
            </span>
            <span className="hero-trust-item">
              <FiShield size={14} className="hero-trust-icon" />
              ISO 9001 · 14001 · 45001 Certified
            </span>
          </div>
        </div>

        {/* Antigravity Spatial Telemetry Dock */}
        <div className="hero-telemetry-container">
          <div className="hero-telemetry-dock">
            <div className="hero-stat-cell">
              <div className="hero-stat-num" data-count="9" data-suffix="+">
                9+
              </div>
              <div className="hero-stat-label">Years of Heritage</div>
              <div className="hero-stat-sub">Established in Dubai</div>
            </div>
            <div className="hero-stat-cell">
              <div className="hero-stat-num" data-count="640" data-suffix="+">
                640+
              </div>
              <div className="hero-stat-label">Commissions Delivered</div>
              <div className="hero-stat-sub">Villas, Offices &amp; F&amp;B</div>
            </div>
            <div className="hero-stat-cell">
              <div className="hero-stat-num" data-count="35000" data-suffix=" SF">
                35,000 SF
              </div>
              <div className="hero-stat-label">In-House Workshop</div>
              <div className="hero-stat-sub">Al Quoz Industrial 4</div>
            </div>
            <div className="hero-stat-cell">
              <div className="hero-stat-num" data-count="200" data-suffix="+">
                200+
              </div>
              <div className="hero-stat-label">Craftsmen &amp; Engineers</div>
              <div className="hero-stat-sub">Single Accountability</div>
            </div>
          </div>
        </div>

        {/* Minimalist Scroll Cue */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <button
            type="button"
            className="hero-scroll-cue"
            onClick={handleScrollCueClick}
            aria-label="Scroll to explore Yashmeen fit-out services"
          >
            <span className="hero-scroll-text">Scroll to explore</span>
            <span className="hero-scroll-line" />
          </button>
        </div>
      </section>
    </div>
  );
}

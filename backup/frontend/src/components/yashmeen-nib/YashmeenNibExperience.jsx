import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { FiArrowRight, FiRotateCcw } from "react-icons/fi";
import "../../styles/yashmeen-nib.css";

export default function YashmeenNibExperience() {
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState("en"); // "en" or "es"
  const [isPreloading, setIsPreloading] = useState(true);
  const containerRef = useRef(null);
  const backdropRef = useRef(null);
  const logoBoxRef = useRef(null);
  const timelineRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const initialLogoWidth = isMobile ? "270px" : "390px";
  const initialLogoHeight = isMobile ? "110px" : "155px";

  const runSequence = useCallback(() => {
    setIsPreloading(true);
    // Kill any active GSAP tweens
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    gsap.killTweensOf([
      ".nib-header__logo",
      ".nib-char-logo",
      ".nib-preloader-backdrop",
      ".nib-preloader-counter",
      ".nib-preloader-bar",
      ".nib-preloader-label",
      ".nib-header__controls",
      ".nib-hero-char",
      ".nib-hero__copy",
      ".nib-hero__actions",
      ".nib-hero__vert-nav",
      ".nib-hero__vert-link",
      ".nib-hero__image-wrap",
      ".nib-hero__image"
    ]);

    setProgress(0);

    // 1. Reset all elements to initial state
    document.querySelector('.nib-logo__group')?.classList.remove('is-docked');
    if (backdropRef.current) {
      backdropRef.current.style.display = "block";
    }
    gsap.set(".nib-preloader-backdrop", { opacity: 1 });
    gsap.set(".nib-preloader-counter, .nib-preloader-label, .nib-preloader-bar", { opacity: 1 });
    gsap.set(".nib-header__controls", { opacity: 0, y: -25 });

    // Logo box starts compact in the center
    gsap.set(".nib-header__logo", {
      width: initialLogoWidth,
      height: initialLogoHeight
    });

    // Logo letters start masked (slid to the right)
    gsap.set(".nib-char-logo", { xPercent: 120 });

    // Hero title characters start masked (alternating up and down)
    gsap.set(".nib-title-line-1 .nib-hero-char", { yPercent: 110 });
    gsap.set(".nib-title-line-2 .nib-hero-char", { yPercent: -110 });
    gsap.set(".nib-title-line-3 .nib-hero-char", { yPercent: 110 });

    // Hero content & right column initial states
    gsap.set(".nib-hero__copy", { opacity: 0, y: 35 });
    gsap.set(".nib-hero__actions", { opacity: 0, y: 25 });
    gsap.set(".nib-hero__vert-nav", { opacity: 0, x: -30 });
    gsap.set(".nib-hero__vert-link", { opacity: 0, y: 15 });
    gsap.set(".nib-hero__image-wrap", { clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set(".nib-hero__image", { scale: 1.18, yPercent: 4 });

    // 2. Entrance wave of letters in the center logo box
    gsap.to(".nib-char-logo", {
      xPercent: 0,
      duration: 0.55,
      stagger: 0.038,
      ease: "power3.out",
      delay: 0.2
    });

    // 3. Simulated progress countdown 00% -> 100%
    const progressObj = { val: 0 };
    gsap.to(progressObj, {
      val: 100,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.round(progressObj.val));
      },
      onComplete: () => {
        // 4. THE TRADEMARK EXPANSION & HERO REVEAL CEREMONY
        const masterTl = gsap.timeline();
        timelineRef.current = masterTl;

        // A. Fade telemetry (counter, bar, label)
        masterTl.to(
          ".nib-preloader-counter, .nib-preloader-bar, .nib-preloader-label",
          {
            opacity: 0,
            duration: 0.35,
            ease: "linear"
          },
          0
        );

        // B. The Expanding Logo Box: from compact 390x155 (or 270x110) to 100% viewport width and height!
        masterTl.to(
          ".nib-header__logo",
          {
            width: isMobile ? "auto" : "100%",
            height: isMobile ? "60px" : "100%",
            duration: 1.35,
            ease: "power3.inOut",
            onStart: () => {
              setIsPreloading(false);
              document.querySelector('.nib-logo__group')?.classList.add('is-docked');
            },
            onComplete: () => {
              if (isMobile) {
                gsap.set(".nib-header__logo", { clearProps: "width,height" });
              }
            }
          },
          0.12
        );

        // C. Dissolve preloader backdrop
        masterTl.to(
          ".nib-preloader-backdrop",
          {
            opacity: 0,
            duration: 0.95,
            ease: "power2.inOut",
            onComplete: () => {
              if (backdropRef.current) {
                backdropRef.current.style.display = "none";
              }
            }
          },
          0.25
        );

        // D. Header controls reveal
        masterTl.to(
          ".nib-header__controls",
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
          },
          0.7
        );

        // E. Alternating Line Reveals for Hero Headline (exact Normal is Boring formula)
        // Line 1: yPercent 110 -> 0 (from below)
        masterTl.to(
          ".nib-title-line-1 .nib-hero-char",
          {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.025,
            ease: "power3.out"
          },
          0.55
        );

        // Line 2: yPercent -110 -> 0 (from above, alternating!)
        masterTl.to(
          ".nib-title-line-2 .nib-hero-char",
          {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.025,
            ease: "power3.out"
          },
          0.7
        );

        // Line 3: yPercent 110 -> 0 (from below)
        masterTl.to(
          ".nib-title-line-3 .nib-hero-char",
          {
            yPercent: 0,
            duration: 0.75,
            stagger: 0.025,
            ease: "power3.out"
          },
          0.85
        );

        // F. Body copy & Call to Action
        masterTl.to(
          ".nib-hero__copy",
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out"
          },
          0.95
        );

        masterTl.to(
          ".nib-hero__actions",
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out"
          },
          1.05
        );

        // G. Sideways Vertical Navigation Strip
        masterTl.to(
          ".nib-hero__vert-nav",
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out"
          },
          0.65
        );

        masterTl.to(
          ".nib-hero__vert-link",
          {
            y: 0,
            opacity: 1,
            stagger: 0.07,
            duration: 0.55,
            ease: "power2.out"
          },
          0.8
        );

        // H. Architectural Vertical Portal Curtain Unmask (clip-path inset & image scale)
        masterTl.to(
          ".nib-hero__image-wrap",
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.45,
            ease: "power3.inOut"
          },
          0.6
        );

        masterTl.to(
          ".nib-hero__image",
          {
            scale: 1.0,
            yPercent: 0,
            duration: 1.8,
            ease: "power2.out"
          },
          0.6
        );
      }
    });
  }, [initialLogoWidth, initialLogoHeight]);

  useEffect(() => {
    runSequence();
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      gsap.killTweensOf("*");
    };
  }, [runSequence]);

  // Language texts
  const texts = {
    en: {
      line1: "CONSIDERED SPACES",
      line2: "THAT CHALLENGE",
      line3Lead: "THE",
      line3Climax: "ORDINARY.",
      copy: "In a city of rushed handovers and fragmented subcontractors, Yashmeen operates under single-source accountability. Bespoke joinery from our 35,000 sq.ft Al Quoz facility, architectural engineering, and handover certainty.",
      ctaPrimary: "Request a Quote",
      ctaSecondary: "View Projects",
      navPortfolio: "PORTFOLIO",
      navStudio: "STUDIO",
      navFacility: "AL QUOZ FACILITY",
      navEnquiry: "ENQUIRY"
    },
    es: {
      line1: "ESPACIOS DE VIDA",
      line2: "QUE DESAFÍAN",
      line3Lead: "LO",
      line3Climax: "ORDINARIO.",
      copy: "En una metrópoli de entregas apresuradas y contratistas fragmentados, Yashmeen asume la responsabilidad integral de principio a fin. Ebanistería a medida en nuestra nave de 35.000 pies cuadrados en Al Quoz, ingeniería arquitectónica y certeza de entrega.",
      ctaPrimary: "Solicitar Presupuesto",
      ctaSecondary: "Ver Proyectos",
      navPortfolio: "PORTAFOLIO",
      navStudio: "ESTUDIO",
      navFacility: "INSTALACIÓN AL QUOZ",
      navEnquiry: "CONTACTO"
    }
  };

  const currentText = texts[lang];
  const line1Chars = currentText.line1.split("");
  const line2Chars = currentText.line2.split("");
  const line3LeadChars = currentText.line3Lead.split("");
  const line3ClimaxChars = currentText.line3Climax.split("");

  return (
    <div className={`nib-root ${isPreloading ? "is-preloading" : ""}`} ref={containerRef}>
      {/* ------------------------------------------------------------------
          1. FIXED HEADER OVERLAY (Contains the Expanding Logo Box)
         ------------------------------------------------------------------ */}
      <header className="nib-header">
        <div className="nib-header__wrapper">
          {/* Centered logo box: 360x145 in preloader, expands to 100%x100% on exit */}
          <div className="nib-header__logo" ref={logoBoxRef}>
            {/* Top-Left: YASHMEEN DUBAI */}
            <Link to="/" className="nib-logo__normal" aria-label="Yashmeen Dubai">
              <div className="nib-logo__title">
                {["Y", "A", "S", "H", "M", "E", "E", "N"].map((c, i) => (
                  <span key={i} className="nib-char-mask">
                    <span className="nib-char-span nib-char-logo">{c}</span>
                  </span>
                ))}
              </div>
              <span className="nib-logo__badge">DUBAI</span>
            </Link>

            {/* Bottom-Right: considered INTERIORS ® (upside-down) */}
            <div className="nib-logo__group">
              <div className="nib-logo__is">
                {["c", "o", "n", "s", "i", "d", "e", "r", "e", "d"].map((c, i) => (
                  <span key={i} className="nib-char-mask">
                    <span className="nib-char-span nib-char-logo">{c}</span>
                  </span>
                ))}
              </div>
              <div className="nib-logo__boring">
                {["I", "N", "T", "E", "R", "I", "O", "R", "S"].map((c, i) => (
                  <span key={i} className="nib-char-mask">
                    <span className="nib-char-span nib-char-logo">{c}</span>
                  </span>
                ))}
                <span className="nib-logo__reg">®</span>
              </div>
            </div>
          </div>

          {/* Top-Right Floating Controls (Language toggle & Replay) */}
          <div className="nib-header__controls">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="nib-ctrl-btn"
              title="Toggle Language"
            >
              {lang === "en" ? "ES" : "EN"}
            </button>

            <button
              type="button"
              onClick={runSequence}
              className="nib-ctrl-btn"
              title="Replay Preloader Ceremony"
            >
              <FiRotateCcw size={12} />
              <span>Replay</span>
            </button>

            <Link to="/contact" className="nib-menu-pill">
              Menú
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          2. PRELOADER BACKDROP & COUNTER
         ------------------------------------------------------------------ */}
      <div className="nib-preloader-backdrop" ref={backdropRef}>
        <div className="nib-preloader-meta">
          <span className="nib-preloader-label">Fit-Out Contracting Co. L.L.C</span>
        </div>
        <div className="nib-preloader-counter">
          {String(progress).padStart(2, "0")}%
        </div>
        <div className="nib-preloader-bar" style={{ width: `${progress}%` }}></div>
      </div>

      {/* ------------------------------------------------------------------
          3. EDITORIAL ASYMMETRIC HERO SECTION
         ------------------------------------------------------------------ */}
      <section className="nib-hero">
        {/* Left Column: Typographic Manifesto */}
        <div className="nib-hero__left">
          <div className="nib-hero__headline">
            {/* Line 1: Unmasks from bottom */}
            <div className="nib-line-mask nib-title-line-1">
              <span className="nib-line-inner">
                {line1Chars.map((c, i) => (
                  <span key={i} className="nib-char-mask">
                    <span className="nib-char-span nib-hero-char">
                      {c === " " ? "\u00A0" : c}
                    </span>
                  </span>
                ))}
              </span>
            </div>

            {/* Line 2: Unmasks from top (alternating!) with asymmetric margin */}
            <div className="nib-line-mask nib-title-line-2">
              <span className="nib-line-inner">
                {line2Chars.map((c, i) => (
                  <span key={i} className="nib-char-mask">
                    <span className="nib-char-span nib-hero-char">
                      {c === " " ? "\u00A0" : c}
                    </span>
                  </span>
                ))}
              </span>
            </div>

            {/* Line 3: Sans lead + Giant italic climax with bronze dot */}
            <div className="nib-line-mask nib-title-line-3">
              <div className="nib-hero__h-line3-wrap">
                <span className="nib-hero__h-line3-lead">
                  {line3LeadChars.map((c, i) => (
                    <span key={i} className="nib-char-mask">
                      <span className="nib-char-span nib-hero-char">
                        {c === " " ? "\u00A0" : c}
                      </span>
                    </span>
                  ))}
                </span>
                <span className="nib-hero__h-line3-climax">
                  {line3ClimaxChars.map((c, i) => (
                    <span key={i} className="nib-char-mask">
                      <span className="nib-char-span nib-hero-char">
                        {c === " " ? "\u00A0" : c}
                      </span>
                    </span>
                  ))}
                  <span className="nib-hero__accent-dot" aria-hidden="true"></span>
                </span>
              </div>
            </div>
          </div>

          <p className="nib-hero__copy">{currentText.copy}</p>

          <div className="nib-hero__actions">
            <Link
              to="/quote"
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>{currentText.ctaPrimary}</span>
              <FiArrowRight />
            </Link>
            <Link to="/projects" className="btn btn-outline">
              {currentText.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Right Column: Architectural Vertical Portal & Sideways Navigation */}
        <div className="nib-hero__right">
          {/* Sideways Vertical Navigation Strip */}
          <nav className="nib-hero__vert-nav" aria-label="Quick Navigation">
            <Link to="/projects" className="nib-hero__vert-link">
              {currentText.navPortfolio}
            </Link>
            <Link to="/about" className="nib-hero__vert-link">
              {currentText.navStudio}
            </Link>
            <Link to="/why-us" className="nib-hero__vert-link">
              {currentText.navFacility}
            </Link>
            <Link to="/contact" className="nib-hero__vert-link">
              {currentText.navEnquiry}
            </Link>
          </nav>

          {/* Vertical Architectural Image with Curtain Clip-Path Unmasking */}
          <div className="nib-hero__image-wrap">
            <img
              src="/static/hero-editorial.png"
              alt="Yashmeen bespoke interior architectural finish overlooking Dubai skyline"
              className="nib-hero__image"
              loading="eager"
            />
            <div className="nib-hero__image-scrim"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

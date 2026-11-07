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
    document.querySelector(".nib-logo__group")?.classList.remove("is-docked");
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

    // 3. Progress countdown 00% -> 100%
    const progressObj = { val: 0 };
    gsap.to(progressObj, {
      val: 100,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.round(progressObj.val));
      },
      onComplete: () => {
        // 4. THE TRADEMARK EXPANSION & HERO REVEAL CEREMONY (exact Normal is Boring formula)
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

        // B. The Expanding Logo Box: from compact to full viewport bounds!
        masterTl.to(
          ".nib-header__logo",
          {
            width: isMobile ? "auto" : "100%",
            height: isMobile ? "60px" : "100%",
            duration: 1.35,
            ease: "power3.inOut",
            onStart: () => {
              setIsPreloading(false);
              document.querySelector(".nib-logo__group")?.classList.add("is-docked");
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

        // E. Alternating Line Reveals for Hero Headline
        // Line 1: yPercent 110 -> 0 (from below)
        masterTl.to(
          ".nib-title-line-1 .nib-hero-char",
          {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.025,
            ease: "power3.out"
          },
          0.65
        );

        // Line 2: yPercent -110 -> 0 (from ABOVE - alternating hallmark!)
        masterTl.to(
          ".nib-title-line-2 .nib-hero-char",
          {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.025,
            ease: "power3.out"
          },
          0.78
        );

        // Line 3: yPercent 110 -> 0 (from below)
        masterTl.to(
          ".nib-title-line-3 .nib-hero-char",
          {
            yPercent: 0,
            duration: 0.75,
            stagger: 0.028,
            ease: "power3.out"
          },
          0.92
        );

        // F. Narrative Copy & Actions reveal
        masterTl.to(
          ".nib-hero__copy",
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
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
            duration: 1.45,
            ease: "power3.out"
          },
          0.6
        );
      }
    });
  }, [initialLogoWidth, initialLogoHeight, isMobile]);

  useEffect(() => {
    runSequence();
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      gsap.killTweensOf("*");
    };
  }, [runSequence]);

  useEffect(() => {
    const sections = document.querySelectorAll(".nib-story-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.18 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Language texts (English & Spanish matching normalisboring.es structure)
  const texts = {
    en: {
      line1_a: "CONSIDERED",
      line1_b: "SPACES",
      line2_a: "THAT",
      line2_b: "CHALLENGE",
      line3_lead: "THE",
      line3_climax: "ORDINARY",
      copy: "In a city of rushed handovers and fragmented subcontractors, Yashmeen operates under single-source accountability. Bespoke joinery from our 35,000 sq.ft Al Quoz facility, architectural engineering, and handover certainty.",
      ctaPrimary: "Request a Quote",
      ctaSecondary: "View Projects",
      navPortfolio: "PORTFOLIO",
      navStudio: "STUDIO",
      navFacility: "AL QUOZ FACILITY",
      navEnquiry: "ENQUIRY",
      copyright: "YASHMEEN FIT-OUT CONTRACTING ©2026"
    },
    es: {
      line1_a: "ESPACIOS",
      line1_b: "DE VIDA",
      line2_a: "QUE",
      line2_b: "DESAFÍAN",
      line3_lead: "LO",
      line3_climax: "ORDINARIO",
      copy: "En una metrópoli de entregas apresuradas y contratistas fragmentados, Yashmeen asume la responsabilidad integral de principio a fin. Ebanistería a medida en nuestra nave de 35.000 pies cuadrados en Al Quoz, ingeniería arquitectónica y certeza de entrega.",
      ctaPrimary: "Solicitar Presupuesto",
      ctaSecondary: "Ver Proyectos",
      navPortfolio: "PORTAFOLIO",
      navStudio: "ESTUDIO",
      navFacility: "INSTALACIÓN AL QUOZ",
      navEnquiry: "CONTACTO",
      copyright: "YASHMEEN CONTRATACIÓN DE INTERIORES ©2026"
    }
  };

  const currentText = texts[lang];

  // Helper for masking individual characters
  const renderChars = (str, className = "nib-hero-char") =>
    str.split("").map((c, i) => (
      <span key={i} className={`nib-char-mask${c === " " ? " nib-space" : ""}`}>
        <span className={`nib-char-span ${className}`}>
          {c === " " ? "\u00A0" : c}
        </span>
      </span>
    ));

  return (
    <div className={`nib-root ${isPreloading ? "is-preloading" : ""}`} ref={containerRef}>
      {/* ------------------------------------------------------------------
          1. FIXED HEADER OVERLAY (Contains the Expanding Logo Box)
         ------------------------------------------------------------------ */}
      <header className="nib-header">
        <div className="nib-header__wrapper">
          {/* Centered logo box: 390x155 in preloader, expands to 100%x100% on exit */}
          <div className="nib-header__logo" ref={logoBoxRef}>
            {/* Top-Left: YASHMEEN DUBAI */}
            <Link to="/" className="nib-logo__normal" aria-label="Yashmeen Dubai">
              <div className="nib-logo__title">
                {renderChars("YASHMEEN", "nib-char-logo")}
              </div>
              <span className="nib-logo__badge">DUBAI</span>
            </Link>

            {/* Bottom-Right: considered INTERIORS ® (upside-down) */}
            <div className="nib-logo__group">
              <div className="nib-logo__is">
                {renderChars("considered", "nib-char-logo")}
              </div>
              <div className="nib-logo__boring">
                {renderChars("INTERIORS", "nib-char-logo")}
                <span className="nib-logo__reg">®</span>
              </div>
            </div>
          </div>

          {/* Top-Right Floating Controls (Language toggle, Replay, Menu) */}
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
          3. EDITORIAL ASYMMETRIC HERO SECTION (Direct Normal is Boring formula)
         ------------------------------------------------------------------ */}
      <section className="nib-hero">
        {/* Left Column: Typographic Manifesto & Asymmetric 2-Column Headline Grid */}
        <div className="nib-hero__left">
          <div className="nib-hero__wrap-titles">
            {/* Grid Column 1, Row 1: CONSIDERED / SPACES */}
            <div className="nib-hero__title-block nib-title-line-1">
              <div className="nib-line-mask">
                <div className="nib-line-inner">{renderChars(currentText.line1_a)}</div>
              </div>
              <div className="nib-line-mask">
                <div className="nib-line-inner">{renderChars(currentText.line1_b)}</div>
              </div>
            </div>

            {/* Grid Column 2, Row 1: THAT / CHALLENGE (Alternating Reveal) */}
            <div className="nib-hero__title-block nib-title-line-2">
              <div className="nib-line-mask">
                <div className="nib-line-inner">{renderChars(currentText.line2_a)}</div>
              </div>
              <div className="nib-line-mask">
                <div className="nib-line-inner">{renderChars(currentText.line2_b)}</div>
              </div>
            </div>

            {/* Grid Column 1, Row 2: THE / ORDINARY • */}
            <div className="nib-hero__title-block nib-title-line-3">
              <div className="nib-line-mask">
                <div className="nib-line-inner nib-hero__h-line3-lead">
                  {renderChars(currentText.line3_lead)}
                </div>
              </div>
              <div className="nib-line-mask">
                <div className="nib-line-inner nib-hero__h-line3-climax">
                  <em>{renderChars(currentText.line3_climax)}</em>
                  <span className="nib-hero__accent-dot" aria-hidden="true">•</span>
                </div>
              </div>
            </div>

            {/* Grid Column 2, Row 2: Narrative Copy & Call to Action (stacked beneath THAT CHALLENGE) */}
            <div className="nib-hero__narrative-block">
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
          </div>

          {/* Bottom Left Copyright Indicator */}
          <div className="nib-hero__copyright">
            {currentText.copyright}
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

      {/* ------------------------------------------------------------------
          4. EDITORIAL STORYTELLING SECTIONS BELOW THE HERO
         ------------------------------------------------------------------ */}
      <main className="nib-story">
        <section className="nib-story-section nib-intro-story">
          <div className="nib-story-kicker">01 / STUDIO</div>
          <div className="nib-story-grid">
            <h2>
              Spaces that invite
              <br />
              <em>you to pause.</em>
            </h2>
            <div className="nib-story-copy">
              <p>
                Yashmeen creates considered environments for the way people live, work, gather and recharge.
              </p>
              <p>
                From first sketch to final handover, one team carries the detail through every decision.
              </p>
            </div>
          </div>
          <div className="nib-story-image-wrap">
            <img src="/static/studio.jpg" alt="Yashmeen studio and design workspace" />
          </div>
        </section>

        <section className="nib-story-section nib-values-story">
          <div className="nib-story-kicker">02 / THE METHOD</div>
          <div className="nib-values-heading">
            <span>Built on</span>
            <em>three beliefs.</em>
          </div>
          <div className="nib-values-grid">
            <article>
              <span>01</span>
              <h3>Precision</h3>
              <p>Every junction, material and finish is resolved before it reaches site.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Materiality</h3>
              <p>Timber, stone, metal and light are composed to feel calm, tactile and lasting.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Certainty</h3>
              <p>A single accountable team keeps design, engineering and delivery moving together.</p>
            </article>
          </div>
          <div className="nib-values-image">
            <img src="/static/production-facility.jpg" alt="Yashmeen production facility" />
          </div>
        </section>

        <section className="nib-story-section nib-projects-story">
          <div className="nib-story-kicker">03 / SELECTED WORK</div>
          <div className="nib-projects-intro">
            <h2>
              Spaces made
              <br />
              <em>to be lived in.</em>
            </h2>
            <p>Quiet architecture. Exacting fit-out. A finished space that feels inevitable.</p>
          </div>
          <div className="nib-project-list">
            {[
              ["/static/work-clifton.jpg", "01", "Clifton Residence", "Private Residence / Dubai"],
              ["/static/work-myrtle.jpg", "02", "Myrtle House", "Hospitality / Al Quoz"],
              ["/static/work-oh-office.jpg", "03", "OH Office", "Workplace / Dubai"]
            ].map(([image, number, title, type]) => (
              <Link to="/projects" className="nib-project-card" key={title}>
                <div className="nib-project-card__image">
                  <img src={image} alt={title} />
                </div>
                <div className="nib-project-card__meta">
                  <span>{number}</span>
                  <span>{type}</span>
                </div>
                <h3>{title}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="nib-story-section nib-manifesto-story">
          <div className="nib-story-kicker">04 / THE ORDINARY, RECONSIDERED</div>
          <h2>
            Luxury is not loud.
            <br />
            <em>It is felt.</em>
          </h2>
          <p>
            We build spaces that resist the disposable. Places with a clear point of view, made with local craft, disciplined engineering and room for life to unfold.
          </p>
        </section>

        <section className="nib-story-section nib-contact-story">
          <div className="nib-story-kicker">05 / START A CONVERSATION</div>
          <div className="nib-contact-grid">
            <h2>
              Bring the
              <br />
              <em>ordinary</em>
              <br />
              to life.
            </h2>
            <div>
              <p>Tell us what you are shaping. We will bring the people, process and precision to make it real.</p>
              <Link to="/contact" className="nib-story-button">
                Start a project <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

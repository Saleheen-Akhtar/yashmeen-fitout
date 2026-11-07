import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { FiArrowRight, FiRotateCcw, FiExternalLink } from "react-icons/fi";
import "../../styles/yashmeen-nib.css";

// Register GreenSock ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function YashmeenNibExperience() {
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState("en"); // "en" or "es"
  const [isPreloading, setIsPreloading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState("00 / INTRO");
  const [isHeaderDark, setIsHeaderDark] = useState(false);

  const containerRef = useRef(null);
  const backdropRef = useRef(null);
  const logoBoxRef = useRef(null);
  const timelineRef = useRef(null);
  const trackRef = useRef(null);
  const stripRef = useRef(null);
  const lenisRef = useRef(null);
  const horizontalTweenRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 991;
  const initialLogoWidth = isMobile ? "270px" : "390px";
  const initialLogoHeight = isMobile ? "110px" : "155px";

  // Bilingual text definitions (matching normalisboring.es editorial voice)
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
      copyright: "YASHMEEN FIT-OUT CONTRACTING ©2026",

      // Chapter 01: The Studio
      studioChapter: "01 / THE STUDIO",
      studioTitle1: "Spaces that invite",
      studioTitle2: "you to pause.",
      studioParagraph: "Yashmeen creates considered environments for the way people live, work, gather and recharge. From first sketch to final handover, one dedicated team carries the detail through every decision.",
      statAtelier: "35,000 sq.ft Manufacturing",
      statLocation: "Al Quoz Industrial Area 3",
      statCertainty: "Guaranteed Turnkey Handover",

      // Chapter 02: The Atelier
      atelierChapter: "02 / THE METHOD & ATELIER",
      atelierTitle: "Single-source discipline. Zero subcontractor blame.",
      belief1Num: "01",
      belief1Title: "Precision Engineering",
      belief1Desc: "Every millimeter, junction and joinery detail is fully resolved in-house before components reach the site.",
      belief2Num: "02",
      belief2Title: "Material Honesty",
      belief2Desc: "Natural French oak, porous travertine, brushed bronze and tactile linen composed to endure with quiet dignity.",
      belief3Num: "03",
      belief3Title: "Handover Certainty",
      belief3Desc: "One studio from municipal approvals and bespoke fabrication to pristine site installation and handover.",

      // Chapter 03: Craftsmanship
      craftChapter: "03 / TACTILE CRAFTSMANSHIP",
      craftTitle: "Details made to be touched.",
      craft1Title: "Illuminated Travertine Consoles",
      craft1Desc: "Monolithic travertine stone with bespoke curved waterfall returns and integrated warm ambient illumination.",
      craft2Title: "Bespoke Acoustic Fluted Joinery",
      craft2Desc: "Dark walnut battens precision-milled with champagne gold architectural reveals and concealed acoustic backing.",

      // Chapter 04: Projects
      workChapter: "04 / SELECTED WORK",
      workTitle1: "Spaces made",
      workTitle2: "to be lived in.",
      workSubtitle: "Quiet architecture. Exacting fit-out. A finished space that feels inevitable.",
      proj1Name: "Clifton Residence",
      proj1Type: "Private Luxury Villa / Emirates Hills",
      proj2Name: "Myrtle House",
      proj2Type: "Boutique Hospitality / Al Quoz",
      proj3Name: "OH Workplace",
      proj3Type: "Executive Headquarters / DIFC",
      proj4Name: "Al Quoz Atelier",
      proj4Type: "Industrial Craftsmanship Hub / Dubai",
      exploreProject: "View Case Study",

      // Chapter 05: Contact Finale
      contactChapter: "05 / START A CONVERSATION",
      contactTitle1: "Bring the",
      contactTitle2: "ordinary",
      contactTitle3: "to life.",
      contactParagraph: "Tell us what you are shaping. We bring the people, 35,000 sq.ft facility and precision to make it real.",
      contactCta: "Start a Project",
      contactAddress: "Al Quoz Industrial Area 3, Dubai, UAE",
      contactEmail: "info@yashmeen.ae",
      contactPhone: "+971 4 000 0000"
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
      copyright: "YASHMEEN CONTRATACIÓN DE INTERIORES ©2026",

      // Chapter 01: El Estudio
      studioChapter: "01 / EL ESTUDIO",
      studioTitle1: "Espacios que invitan",
      studioTitle2: "a detenerse.",
      studioParagraph: "Yashmeen crea entornos cuidados para la forma en que las personas viven, trabajan, se reúnen y descansan. Desde el primer boceto hasta la entrega final, un único equipo traslada el detalle a cada decisión.",
      statAtelier: "35.000 pies² Fabricación Propia",
      statLocation: "Zona Industrial Al Quoz 3",
      statCertainty: "Entrega Llave en Mano Garantizada",

      // Chapter 02: El Método
      atelierChapter: "02 / EL MÉTODO Y TALLER",
      atelierTitle: "Disciplina de fuente única. Sin culpar a subcontratas.",
      belief1Num: "01",
      belief1Title: "Ingeniería de Precisión",
      belief1Desc: "Cada milímetro, encuentro y detalle de carpintería se resuelve internamente antes de que las piezas lleguen a la obra.",
      belief2Num: "02",
      belief2Title: "Honestidad Material",
      belief2Desc: "Roble francés natural, travertino poroso, bronce cepillado y lino táctil compuestos para perdurar con silenciosa dignidad.",
      belief3Num: "03",
      belief3Title: "Certeza de Entrega",
      belief3Desc: "Un único estudio desde las aprobaciones municipales y fabricación a medida hasta la instalación impecable en obra.",

      // Chapter 03: Artesanía
      craftChapter: "03 / ARTESANÍA TÁCTIL",
      craftTitle: "Detalles hechos para ser tocados.",
      craft1Title: "Consolas de Travertino Iluminadas",
      craft1Desc: "Piedra travertino monolítica con frentes curvos tipo cascada e iluminación ambiental cálida integrada.",
      craft2Title: "Ebanistería Acústica Ranurada a Medida",
      craft2Desc: "Listones de nogal oscuro fresados con precisión con remates arquitectónicos de oro champán y soporte acústico oculto.",

      // Chapter 04: Proyectos
      workChapter: "04 / PROYECTOS SELECCIONADOS",
      workTitle1: "Espacios hechos",
      workTitle2: "para ser vividos.",
      workSubtitle: "Arquitectura serena. Ajustes exactos. Un espacio final que parece inevitable.",
      proj1Name: "Residencia Clifton",
      proj1Type: "Villa Privada de Lujo / Emirates Hills",
      proj2Name: "Casa Myrtle",
      proj2Type: "Hospitalidad Exclusiva / Al Quoz",
      proj3Name: "Sede Corporativa OH",
      proj3Type: "Oficinas Ejecutivas / DIFC",
      proj4Name: "Atelier Al Quoz",
      proj4Type: "Centro de Fabricación Artesanal / Dubái",
      exploreProject: "Ver Caso de Estudio",

      // Chapter 05: Contacto
      contactChapter: "05 / INICIAR CONVERSACIÓN",
      contactTitle1: "Dar vida a",
      contactTitle2: "lo ordinario",
      contactTitle3: "con arte.",
      contactParagraph: "Cuéntenos qué está proyectando. Aportaremos el equipo, nuestras instalaciones de 35.000 pies² y la precisión necesaria.",
      contactCta: "Iniciar un Proyecto",
      contactAddress: "Zona Industrial Al Quoz 3, Dubái, EAU",
      contactEmail: "info@yashmeen.ae",
      contactPhone: "+971 4 000 0000"
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

  // --------------------------------------------------------------------------
  // 1. PRELOADER & ENTRANCE SEQUENCE (Continuous expanding logo box)
  // --------------------------------------------------------------------------
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

    // Reset initial states
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

    // Logo letters start masked
    gsap.set(".nib-char-logo", { xPercent: 120 });

    // Hero title characters start masked (alternating kinematics)
    gsap.set(".nib-title-line-1 .nib-hero-char", { yPercent: 110 });
    gsap.set(".nib-title-line-2 .nib-hero-char", { yPercent: -110 });
    gsap.set(".nib-title-line-3 .nib-hero-char", { yPercent: 110 });

    // Hero content & image portal initial states
    gsap.set(".nib-hero__copy", { opacity: 0, y: 35 });
    gsap.set(".nib-hero__actions", { opacity: 0, y: 25 });
    gsap.set(".nib-hero__vert-nav", { opacity: 0, x: -30 });
    gsap.set(".nib-hero__vert-link", { opacity: 0, y: 15 });
    gsap.set(".nib-hero__image-wrap", { clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set(".nib-hero__image", { scale: 1.18, yPercent: 4 });

    // Stagger letters into center logo box
    gsap.to(".nib-char-logo", {
      xPercent: 0,
      duration: 0.55,
      stagger: 0.038,
      ease: "power3.out",
      delay: 0.2
    });

    // Progress counter 00% -> 100%
    const progressObj = { val: 0 };
    gsap.to(progressObj, {
      val: 100,
      duration: 2.0,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.round(progressObj.val));
      },
      onComplete: () => {
        const masterTl = gsap.timeline();
        timelineRef.current = masterTl;

        // A. Fade counter and telemetry
        masterTl.to(
          ".nib-preloader-counter, .nib-preloader-bar, .nib-preloader-label",
          {
            opacity: 0,
            duration: 0.35,
            ease: "linear"
          },
          0
        );

        // B. The Expanding Logo Box
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

        // H. Architectural Vertical Portal Curtain Unmask
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

  // --------------------------------------------------------------------------
  // 2. BUTTERY HORIZONTAL SCROLL ENGINE (exact normalisboring.es formula)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const strip = stripRef.current;
    const track = trackRef.current;

    // Mobile fallback: natural vertical flow
    if (window.innerWidth <= 991) {
      if (horizontalTweenRef.current?.scrollTrigger) {
        horizontalTweenRef.current.scrollTrigger.kill();
        horizontalTweenRef.current.kill();
      }
      return;
    }

    if (!strip || !track) return;

    // A. Initialize Lenis for momentum wheel scrolling
    let localLenis = null;
    let rafCallback = null;

    try {
      localLenis = new Lenis({
        lerp: 0.075,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });
      lenisRef.current = localLenis;

      localLenis.on("scroll", ScrollTrigger.update);
      rafCallback = (time) => localLenis.raf(time * 1000);
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn("Lenis initialization skipped:", e);
    }

    // B. Setup Horizontal Pinning Timeline
    const getScrollDistance = () => strip.scrollWidth - window.innerWidth;

    const horizontalTween = gsap.to(strip, {
      x: () => -getScrollDistance(),
      ease: "none",
      scrollTrigger: {
        id: "nib-horizontal-scroll",
        trigger: track,
        pin: true,
        scrub: 1, // Buttery scrub matching normalisboring.es
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const pct = Math.round(p * 100);
          setScrollProgress(pct);

          // Smoothly fade out the inverted logo hallmark once we leave the intro hero
          const logoGroup = document.querySelector(".nib-logo__group");
          if (logoGroup) {
            logoGroup.style.opacity = p > 0.03 ? "0" : "1";
            logoGroup.style.pointerEvents = p > 0.03 ? "none" : "auto";
            logoGroup.style.transform = p > 0.03 ? "translateY(15px)" : "translateY(0)";
          }

          // Exact pixel coordinate detection for header contrast
          const currentX = self.scroll();
          const isAtelierUnderLogo = currentX >= 2900 && currentX <= 4250;
          const isCierreUnderLogo = currentX >= 7400;
          setIsHeaderDark(isAtelierUnderLogo || isCierreUnderLogo);

          // Update active chapter
          if (p < 0.16) {
            setActiveChapter("00 / INTRO");
          } else if (p < 0.38) {
            setActiveChapter("01 / STUDIO");
          } else if (p < 0.58) {
            setActiveChapter("02 / ATELIER");
          } else if (p < 0.72) {
            setActiveChapter("03 / CRAFT");
          } else if (p < 0.90) {
            setActiveChapter("04 / WORK");
          } else {
            setActiveChapter("05 / CONTACT");
          }
        }
      }
    });

    horizontalTweenRef.current = horizontalTween;

    // C. Internal Parallax scrubbing for architectural photo layers
    const parallaxImgs = strip.querySelectorAll("[data-parallax-x]");
    parallaxImgs.forEach((img) => {
      gsap.fromTo(
        img,
        { xPercent: -15 },
        {
          xPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".nib-scroll-section"),
            containerAnimation: horizontalTween,
            start: "left right",
            end: "right left",
            scrub: 0.5
          }
        }
      );
    });

    ScrollTrigger.refresh();

    return () => {
      if (horizontalTween.scrollTrigger) {
        horizontalTween.scrollTrigger.kill();
      }
      horizontalTween.kill();
      if (localLenis && rafCallback) {
        gsap.ticker.remove(rafCallback);
        localLenis.destroy();
      }
    };
  }, []);

  // Jump smoothly to a specific section along the horizontal track
  const jumpToSection = (index) => {
    const strip = stripRef.current;
    if (!strip) return;
    const sections = strip.querySelectorAll(".nib-scroll-section");
    if (!sections[index]) return;

    if (window.innerWidth <= 991 || !lenisRef.current) {
      sections[index].scrollIntoView({ behavior: "smooth" });
      return;
    }

    const targetOffset = sections[index].offsetLeft;
    const totalDist = strip.scrollWidth - window.innerWidth;
    const trigger = horizontalTweenRef.current?.scrollTrigger;
    if (trigger && totalDist > 0) {
      const targetScroll = trigger.start + (targetOffset / totalDist) * (trigger.end - trigger.start);
      lenisRef.current.scrollTo(targetScroll, { duration: 1.2 });
    }
  };

  return (
    <div
      className={`nib-root ${isPreloading ? "is-preloading" : ""} ${
        isHeaderDark ? "theme-dark-active" : ""
      }`}
      ref={containerRef}
    >
      {/* ------------------------------------------------------------------
          1. FIXED HEADER OVERLAY (Contains Expanding Logo & Global Controls)
         ------------------------------------------------------------------ */}
      <header className={`nib-header ${isHeaderDark ? "nib-header--light-text" : ""}`}>
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

            {/* Bottom-Right: considered INTERIORS ® (inverted hallmark) */}
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
          3. FULL HORIZONTAL SCROLL TRACK (Continuous Side-by-Side Journey)
         ------------------------------------------------------------------ */}
      <div className="nib-scroll-track" ref={trackRef}>
        <div className="nib-scroll-strip" ref={stripRef}>
          {/* =================================================================
              SECTION 0: THE INTRO / HERO (Warm White #fbfaf7)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-hero bg-warm-white">
            <div className="nib-hero__left">
              <div className="nib-hero__wrap-titles">
                {/* Col 1, Row 1: CONSIDERED / SPACES */}
                <div className="nib-hero__title-block nib-title-line-1">
                  <div className="nib-line-mask">
                    <div className="nib-line-inner">{renderChars(currentText.line1_a)}</div>
                  </div>
                  <div className="nib-line-mask">
                    <div className="nib-line-inner">{renderChars(currentText.line1_b)}</div>
                  </div>
                </div>

                {/* Col 2, Row 1: THAT / CHALLENGE (Alternating Reveal) */}
                <div className="nib-hero__title-block nib-title-line-2">
                  <div className="nib-line-mask">
                    <div className="nib-line-inner">{renderChars(currentText.line2_a)}</div>
                  </div>
                  <div className="nib-line-mask">
                    <div className="nib-line-inner">{renderChars(currentText.line2_b)}</div>
                  </div>
                </div>

                {/* Col 1, Row 2: THE / ORDINARY • */}
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

                {/* Col 2, Row 2: Narrative Copy & Call to Action */}
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

              {/* Bottom Left Copyright */}
              <div className="nib-hero__copyright">{currentText.copyright}</div>
            </div>

            {/* Quick Sideways Navigation Strip */}
            <div className="nib-hero__right">
              <nav className="nib-hero__vert-nav" aria-label="Quick Navigation">
                <button type="button" onClick={() => jumpToSection(5)} className="nib-hero__vert-link">
                  {currentText.navPortfolio}
                </button>
                <button type="button" onClick={() => jumpToSection(2)} className="nib-hero__vert-link">
                  {currentText.navStudio}
                </button>
                <button type="button" onClick={() => jumpToSection(3)} className="nib-hero__vert-link">
                  {currentText.navFacility}
                </button>
                <button type="button" onClick={() => jumpToSection(6)} className="nib-hero__vert-link">
                  {currentText.navEnquiry}
                </button>
              </nav>

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

          {/* =================================================================
              SECTION 1: ARCHITECTURAL PORTAL (Primary Media Column)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-media-primary bg-warm-white">
            <div className="nib-media-card-primary">
              <div className="nib-media-frame">
                <img
                  src="/static/studio.jpg"
                  alt="Yashmeen Architectural Studio"
                  className="nib-media-img"
                  data-parallax-x="true"
                  loading="lazy"
                />
              </div>
              <div className="nib-media-caption">
                <span className="nib-media-badge">DUBAI, UAE</span>
                <p>Considered architecture shaped from brief to handover.</p>
              </div>
            </div>

            <div className="nib-media-floating-card">
              <img
                src="/static/design-desk.jpg"
                alt="Architectural Material Selection"
                className="nib-floating-img"
                loading="lazy"
              />
              <span className="nib-floating-tag">MATERIAL LABORATORY</span>
            </div>
          </section>

          {/* =================================================================
              SECTION 2: THE STUDIO & MANIFESTO (Editorial Typography)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-manifesto bg-warm-white">
            <div className="nib-section-kicker">{currentText.studioChapter}</div>
            <div className="nib-manifesto-content">
              <h2 className="nib-manifesto-title">
                {currentText.studioTitle1}
                <br />
                <em>{currentText.studioTitle2}</em>
              </h2>
              <p className="nib-manifesto-p">{currentText.studioParagraph}</p>

              <div className="nib-stats-row">
                <div className="nib-stat-pill">
                  <strong>35,000 sq.ft</strong>
                  <span>{currentText.statAtelier}</span>
                </div>
                <div className="nib-stat-pill">
                  <strong>Al Quoz 3</strong>
                  <span>{currentText.statLocation}</span>
                </div>
                <div className="nib-stat-pill">
                  <strong>60-90 Days</strong>
                  <span>{currentText.statCertainty}</span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              SECTION 3: THE ATELIER & METHOD (Inverted Ink Luxury #11100e)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-atelier bg-ink c-light">
            <div className="nib-section-kicker c-gold">{currentText.atelierChapter}</div>

            <div className="nib-atelier-layout">
              {/* Left Column: Workshop Imagery */}
              <div className="nib-atelier-visuals">
                <div className="nib-atelier-main-frame">
                  <img
                    src="/static/joinery-bay.jpg"
                    alt="Al Quoz Joinery Bay"
                    className="nib-atelier-img"
                    data-parallax-x="true"
                    loading="lazy"
                  />
                  <div className="nib-atelier-badge">AL QUOZ JOINERY BAY 04</div>
                </div>
                <div className="nib-atelier-sub-frame">
                  <img
                    src="/static/production-facility.jpg"
                    alt="Bespoke Metalwork & Stonework"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right Column: 3 Core Beliefs Cards */}
              <div className="nib-atelier-content">
                <h3 className="nib-atelier-lead">{currentText.atelierTitle}</h3>

                <div className="nib-beliefs-stack">
                  <div className="nib-belief-row">
                    <span className="nib-belief-num">{currentText.belief1Num}</span>
                    <div className="nib-belief-body">
                      <h4>{currentText.belief1Title}</h4>
                      <p>{currentText.belief1Desc}</p>
                    </div>
                  </div>

                  <div className="nib-belief-row">
                    <span className="nib-belief-num">{currentText.belief2Num}</span>
                    <div className="nib-belief-body">
                      <h4>{currentText.belief2Title}</h4>
                      <p>{currentText.belief2Desc}</p>
                    </div>
                  </div>

                  <div className="nib-belief-row">
                    <span className="nib-belief-num">{currentText.belief3Num}</span>
                    <div className="nib-belief-body">
                      <h4>{currentText.belief3Title}</h4>
                      <p>{currentText.belief3Desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              SECTION 4: VERTICAL TYPOGRAPHY TICKER RIBBON
             ================================================================= */}
          <section className="nib-scroll-section nib-section-ticker bg-gold c-ink">
            <div className="nib-ticker-strip">
              <span className="nib-ticker-text">
                • 35,000 SQ.FT ATELIER • BESPOKE JOINERY • ARCHITECTURAL CERTAINTY • ISO 9001 CERTIFIED • DUBAI MUNICIPALITY APPROVED • ZERO SUBCONTRACTOR BLAME • HANDOVER CERTAINTY •
              </span>
            </div>
          </section>

          {/* =================================================================
              SECTION 5: TACTILE MATERIALITY & CRAFT (Warm Limestone #f3efe8)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-craft bg-limestone">
            <div className="nib-section-kicker">{currentText.craftChapter}</div>

            <div className="nib-craft-layout">
              <div className="nib-craft-header">
                <h3 className="nib-craft-h3">{currentText.craftTitle}</h3>
              </div>

              <div className="nib-craft-cards-grid">
                <div className="nib-craft-card">
                  <div className="nib-craft-card__media">
                    <img
                      src="/static/Custom-Furniture.jpg"
                      alt="Illuminated Travertine Waterfall Console"
                      loading="lazy"
                    />
                  </div>
                  <div className="nib-craft-card__info">
                    <h4>{currentText.craft1Title}</h4>
                    <p>{currentText.craft1Desc}</p>
                  </div>
                </div>

                <div className="nib-craft-card">
                  <div className="nib-craft-card__media">
                    <img
                      src="/static/Residential-Fit-Out.jpg"
                      alt="Bespoke Acoustic Fluted Joinery"
                      loading="lazy"
                    />
                  </div>
                  <div className="nib-craft-card__info">
                    <h4>{currentText.craft2Title}</h4>
                    <p>{currentText.craft2Desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              SECTION 6: SELECTED WORK (Horizontal Gallery Showcase)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-projects bg-warm-white">
            <div className="nib-section-kicker">{currentText.workChapter}</div>

            <div className="nib-projects-header">
              <h2 className="nib-projects-h2">
                {currentText.workTitle1}
                <br />
                <em>{currentText.workTitle2}</em>
              </h2>
              <p className="nib-projects-sub">{currentText.workSubtitle}</p>
            </div>

            <div className="nib-projects-track">
              {[
                {
                  img: "/static/work-clifton.jpg",
                  num: "01",
                  name: currentText.proj1Name,
                  type: currentText.proj1Type,
                  link: "/projects"
                },
                {
                  img: "/static/work-myrtle.jpg",
                  num: "02",
                  name: currentText.proj2Name,
                  type: currentText.proj2Type,
                  link: "/projects"
                },
                {
                  img: "/static/work-oh-office.jpg",
                  num: "03",
                  name: currentText.proj3Name,
                  type: currentText.proj3Type,
                  link: "/projects"
                },
                {
                  img: "/static/atelier-render.jpg",
                  num: "04",
                  name: currentText.proj4Name,
                  type: currentText.proj4Type,
                  link: "/about"
                }
              ].map((proj, idx) => (
                <Link to={proj.link} className="nib-project-tile" key={idx}>
                  <div className="nib-tile-media">
                    <img src={proj.img} alt={proj.name} loading="lazy" />
                    <div className="nib-tile-hover-cue">
                      <span>{currentText.exploreProject}</span>
                      <FiExternalLink />
                    </div>
                  </div>
                  <div className="nib-tile-meta">
                    <span className="nib-tile-num">{proj.num}</span>
                    <span className="nib-tile-type">{proj.type}</span>
                  </div>
                  <h4 className="nib-tile-title">{proj.name}</h4>
                </Link>
              ))}
            </div>
          </section>

          {/* =================================================================
              SECTION 7: CLOSING FINALE & CONTACT (Inverted Ink Luxury)
             ================================================================= */}
          <section className="nib-scroll-section nib-section-cierre bg-ink c-light">
            <div className="nib-section-kicker c-gold">{currentText.contactChapter}</div>

            <div className="nib-cierre-wrap">
              <h2 className="nib-cierre-heading">
                {currentText.contactTitle1}{" "}
                <em>{currentText.contactTitle2}</em>
                <br />
                {currentText.contactTitle3}
              </h2>

              <p className="nib-cierre-desc">{currentText.contactParagraph}</p>

              <div className="nib-cierre-actions">
                <Link to="/contact" className="btn btn-gold btn-large">
                  <span>{currentText.contactCta}</span>
                  <FiArrowRight />
                </Link>
                <Link to="/quote" className="btn btn-outline-white">
                  {currentText.ctaPrimary}
                </Link>
              </div>

              <div className="nib-cierre-details">
                <div className="nib-detail-block">
                  <span className="nib-detail-label">STUDIO & ATELIER</span>
                  <p>{currentText.contactAddress}</p>
                </div>
                <div className="nib-detail-block">
                  <span className="nib-detail-label">DIRECT ENQUIRY</span>
                  <p>
                    <a href={`mailto:${currentText.contactEmail}`}>{currentText.contactEmail}</a>
                    <br />
                    <a href="tel:+97140000000">{currentText.contactPhone}</a>
                  </p>
                </div>
              </div>

              <div className="nib-cierre-bottom">
                <span>YASHMEEN FIT-OUT CONTRACTING CO. L.L.C © 2026</span>
                <span>DUBAI • UNITED ARAB EMIRATES</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          4. HORIZONTAL HEADS-UP DISPLAY (Progress Bar & Chapter Selector)
         ------------------------------------------------------------------ */}
      <div className="nib-horizontal-hud" aria-hidden="true">
        <div className="nib-hud-chapters">
          {[
            { label: "INTRO", idx: 0 },
            { label: "STUDIO", idx: 2 },
            { label: "ATELIER", idx: 3 },
            { label: "CRAFT", idx: 5 },
            { label: "WORK", idx: 6 },
            { label: "CONTACT", idx: 7 }
          ].map((ch) => (
            <button
              type="button"
              key={ch.label}
              onClick={() => jumpToSection(ch.idx)}
              className={`nib-hud-chip ${activeChapter.includes(ch.label) ? "is-active" : ""}`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <div className="nib-hud-timeline">
          <div className="nib-hud-bar" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <div className="nib-hud-metrics">
          <span className="nib-hud-current-chapter">{activeChapter}</span>
          <span className="nib-hud-percentage">{String(scrollProgress).padStart(2, "0")}%</span>
        </div>
      </div>
    </div>
  );
}

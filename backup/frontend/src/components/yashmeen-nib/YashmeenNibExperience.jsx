import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { FiArrowRight, FiRotateCcw } from "react-icons/fi";
import "../../styles/yashmeen-nib.css";

// Register GreenSock ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function YashmeenNibExperience() {
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState("en"); // "en" or "es"
  const [isPreloading, setIsPreloading] = useState(true);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [hoveredTermImage, setHoveredTermImage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHeaderDark, setIsHeaderDark] = useState(false);

  const containerRef = useRef(null);
  const backdropRef = useRef(null);
  const timelineRef = useRef(null);
  const modScrollRef = useRef(null);
  const termsRef = useRef(null);
  const headerLogoRef = useRef(null);
  const lenisRef = useRef(null);

  // Bilingual text dictionary (exact matching structure of normalisboring.es)
  const texts = {
    en: {
      navStudio: "STUDIO",
      navProjects: "PROJECTS",
      navContact: "CONTACT",
      sectionHome: "Home",
      copyright: "YASHMEEN FIT-OUT CONTRACTING ©2026",

      // Hero Intro
      line1_a: "CONSIDERED",
      line1_b: "SPACES",
      line2_a: "THAT",
      line2_b: "CHALLENGE",
      line3_lead: "THE",
      line3_climax: "ORDINARY",
      heroCopy:
        "In a world where everything has become disposable, Yashmeen builds interiors to endure. Bespoke joinery from our 35,000 sq.ft Al Quoz atelier, architectural engineering and single-source certainty.",

      // Section 2: Text / Studio
      textSectionLabel: "The Studio",
      textLine1: "SPACES THAT INVITE",
      textLine2: "TO HOLD AND ENJOY",
      textLine3: "TIME IN STILLNESS",
      textLine4: "AND DISCONNECT",
      textParagraph:
        "Every space must be singular and meaningful, just like the people who inhabit it. We are the benchmark for quiet architectural luxury, where design discipline, sustainable engineering and craftsmanship unite to offer something truly exceptional.",

      // Section 3: Dark Atelier
      imagesTextParagraph:
        "At Yashmeen, we shape spaces that stand apart through bespoke joinery craftsmanship and disciplined execution. Contemporary volumes, tactile materiality, open to light. Environments that elevate daily life with more comfort, more permanence and genuine emotion.",

      // Section 4: Carousel
      carouselText: "VALUES",

      // Section 6: Terms
      term1Num: "01",
      term1Title: "ELEGANCE",
      term1Desc:
        "A quiet, sober architecture and aesthetic sensitivity manifested in natural French oak, limestone and earthy tones.",
      term2Num: "02",
      term2Title: "AUTHENTICITY",
      term2Desc:
        "Combination of elegant, sustainable architecture and in-house bespoke manufacturing creating refined, enduring spaces.",
      term3Num: "03",
      term3Title: "FUNCTIONALITY",
      term3Desc:
        "Open, harmonious spaces with pragmatic engineering. Versatile environments crafted for seamless daily living.",

      // Section 7: Projects
      projectsLabel: "Projects",
      projectsIntro:
        "We shape prime residences, bespoke hospitality and commercial spaces with single-source accountability.",
      proj1Title: "CLIFTON RESIDENCE",
      proj1Year: "2025",
      proj1Loc: "EMIRATES HILLS",
      proj1Num: "01",
      proj2Title: "MYRTLE HOUSE",
      proj2Year: "2025",
      proj2Loc: "AL QUOZ",
      proj2Num: "02",
      proj3Title: "OH WORKPLACE",
      proj3Year: "2024",
      proj3Loc: "DIFC DUBAI",
      proj3Num: "03",
      proj4Title: "JUNO PAVILION",
      proj4Year: "2025",
      proj4Loc: "JUMEIRAH",
      proj4Num: "04",
      proj5Title: "AL QUOZ ATELIER",
      proj5Year: "2026",
      proj5Loc: "MANUFACTURING",
      proj5Num: "05",

      // Unpinned Vertical Finale
      finaleChapter: "(Contact)",
      finaleTitle: "UNLOCK YOUR VISION",
      finaleSubtitle: "EXCLUSIVITY IN ITS HIGHEST EXPRESSION",
      finaleParagraph:
        "At Yashmeen, our priority is offering a personalized, dedicated partnership to bring your architectural vision into reality. Our team is at your disposal to guide you through every milestone.",
      finaleCta: "Request Consultation",
      footerTagline: "BESPOKE INTERIORS & ARCHITECTURAL FIT-OUT • DUBAI, UAE"
    },
    es: {
      navStudio: "ESTUDIO",
      navProjects: "PROYECTOS",
      navContact: "CONTACTO",
      sectionHome: "Inicio",
      copyright: "YASHMEEN CONTRATACIÓN DE INTERIORES ©2026",

      // Hero Intro
      line1_a: "ESPACIOS",
      line1_b: "DE VIDA",
      line2_a: "QUE",
      line2_b: "DESAFÍAN",
      line3_lead: "LO",
      line3_climax: "ORDINARIO",
      heroCopy:
        "En un mundo fugaz en el que lo efímero lo ha empapado todo, construimos interiores para durar más y más, preservando la artesanía a medida y la certeza arquitectónica.",

      // Section 2: Text / Studio
      textSectionLabel: "Nosotros",
      textLine1: "CASAS QUE INVITAN",
      textLine2: "A  DETENER",
      textLine3: "EL TIEMPO",
      textLine4: "Y DESCONECTAR",
      textParagraph:
        "Cada vivienda debe ser única y especial, al igual que las personas que la habitan. Somos el referente del lujo aspiracional, donde diseño, sostenibilidad y calidad de vida se unen para ofrecer algo verdaderamente excepcional.",

      // Section 3: Dark Atelier
      imagesTextParagraph:
        "En Yashmeen construimos espacios que sobresalen por la calidad y el diseño, de volúmenes contemporáneos, impolutos y abiertos al exterior. Espacios que mejoran la calidad de vida de quienes los habitan, ofreciendo más confort, más belleza y más emoción.",

      // Section 4: Carousel
      carouselText: "VALORES",

      // Section 6: Terms
      term1Num: "01",
      term1Title: "ELEGANCIA",
      term1Desc:
        "Una arquitectura sobria y silenciosa y una sensibilidad estética que se manifiesta en materiales como el roble o la piedra caliza.",
      term2Num: "02",
      term2Title: "AUTENTICIDAD",
      term2Desc:
        "Combinación de arquitectura elegante, sostenible y serena, creando espacios refinados que promueven un lujo sosegado.",
      term3Num: "03",
      term3Title: "FUNCIONALIDAD",
      term3Desc:
        "Espacios abiertos, menos jerarquizados y con un enfoque más pragmático. Zonas multifuncionales para un confort diario.",

      // Section 7: Projects
      projectsLabel: "Proyectos",
      projectsIntro:
        "Desarrollamos proyectos residenciales y corporativos exclusivos con una visión integral de principio a fin.",
      proj1Title: "RESIDENCIA CLIFTON",
      proj1Year: "2025",
      proj1Loc: "EMIRATES HILLS",
      proj1Num: "01",
      proj2Title: "CASA MYRTLE",
      proj2Year: "2025",
      proj2Loc: "AL QUOZ",
      proj2Num: "02",
      proj3Title: "SEDE CORPORATIVA OH",
      proj3Year: "2024",
      proj3Loc: "DIFC DUBÁI",
      proj3Num: "03",
      proj4Title: "PABELLÓN JUNO",
      proj4Year: "2025",
      proj4Loc: "JUMEIRAH",
      proj4Num: "04",
      proj5Title: "ATELIER AL QUOZ",
      proj5Year: "2026",
      proj5Loc: "FABRICACIÓN",
      proj5Num: "05",

      // Unpinned Vertical Finale
      finaleChapter: "(Contacta)",
      finaleTitle: "DESBLOQUEA TU SUEÑO",
      finaleSubtitle: "EXCLUSIVIDAD EN SU MÁXIMA EXPRESIÓN",
      finaleParagraph:
        "En Yashmeen, nuestra prioridad es ofrecerte un servicio personalizado y cercano para ayudarte a materializar tu proyecto soñado.",
      finaleCta: "Solicitar información",
      footerTagline: "INTERIORES A MEDIDA Y CONTRATACIÓN ARQUITECTÓNICA • DUBÁI, EAU"
    }
  };

  const currentText = texts[lang];

  // Helper for masking individual characters
  const renderChars = (str, className = "char") =>
    str.split("").map((c, i) => (
      <span key={i} className="splitline-char-wrap" style={{ position: "relative", display: "inline-block" }}>
        <span
          className={className}
          style={{ position: "relative", display: "inline-block" }}
        >
          {c === " " ? "\u00A0" : c}
        </span>
      </span>
    ));

  // --------------------------------------------------------------------------
  // 1. PRELOADER & INTRO ENTRANCE ANIMATION (Matching normalisboring.es)
  // --------------------------------------------------------------------------
  const runSequence = useCallback(() => {
    setIsPreloading(true);
    if (timelineRef.current) timelineRef.current.kill();
    gsap.killTweensOf("*");

    setProgress(0);

    const isMobile = window.innerWidth <= 991;

    // Resets
    if (backdropRef.current) backdropRef.current.style.display = "flex";
    gsap.set(".nib-preloader-backdrop", { opacity: 1 });
    gsap.set(".nib-preloader-center", { opacity: 1 });
    gsap.set(".header__logo", { opacity: 0 });
    gsap.set(".header__btn", { y: "-180%", opacity: 0 });

    // Intro elements initial states
    gsap.set(".mod-scroll__intro > .wrapper", { width: isMobile ? "100%" : "100vw" });
    gsap.set(".mod-scroll__intro__title .char", { yPercent: 110 });
    gsap.set(".mod-scroll__intro__text", { opacity: 0, y: "100%" });
    gsap.set(".mod-scroll__intro__menu .menu-item", { y: "2.5rem", opacity: 0 });
    gsap.set(".mod-scroll__intro__section", { opacity: 0 });
    gsap.set(".mod-scroll__intro__copyright", { opacity: 0 });
    gsap.set(".mod-scroll__intro__logo", { opacity: 0 });

    const progressObj = { val: 0 };
    gsap.to(progressObj, {
      val: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.round(progressObj.val));
      },
      onComplete: () => {
        const introTl = gsap.timeline();
        timelineRef.current = introTl;

        // 1. Preloader fade out
        introTl.to(".nib-preloader-center", { opacity: 0, duration: 0.35, ease: "linear" }, 0);
        introTl.to(
          ".nib-preloader-backdrop",
          {
            opacity: 0,
            duration: 0.75,
            ease: "power2.inOut",
            onComplete: () => {
              setIsPreloading(false);
              if (backdropRef.current) backdropRef.current.style.display = "none";
            }
          },
          0.1
        );

        // 2. Intro Logo Reveal
        introTl.to(".mod-scroll__intro__logo", { opacity: 1, duration: 0.8 }, 0.2);

        // 3. Intro Title Char Reveals (alternating 110% and -110%)
        introTl.to(
          ".mod-scroll__intro__wrap-titles .char",
          {
            yPercent: 0,
            duration: 0.65,
            stagger: 0.02,
            ease: "power3.out"
          },
          0.3
        );

        // 4. Intro text & menu
        introTl.to(".mod-scroll__intro__text", { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.5);
        introTl.to(
          ".mod-scroll__intro__menu .menu-item",
          {
            y: "0rem",
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out"
          },
          0.55
        );
        introTl.to(".mod-scroll__intro__section, .mod-scroll__intro__copyright", { opacity: 1, duration: 0.5 }, 0.7);

        // 5. Shrink Intro Wrapper from 100vw to 80vw (revealing architectural preview on right!)
        if (!isMobile) {
          introTl.to(
            ".mod-scroll__intro > .wrapper",
            {
              width: "80vw",
              duration: 1.25,
              ease: "power3.out"
            },
            0.6
          );

          introTl.fromTo(
            ".mod-scroll__images__image-single",
            { x: "-5vw" },
            { x: "-15vw", duration: 1.25, ease: "power2.out" },
            0.6
          );
        }
      }
    });
  }, []);

  useEffect(() => {
    runSequence();
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      gsap.killTweensOf("*");
    };
  }, [runSequence]);

  // --------------------------------------------------------------------------
  // 2. HORIZONTAL SCROLL ENGINE (Exact kinematics of normalisboring.es)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const modScroll = modScrollRef.current;
    if (!modScroll) return;

    if (window.innerWidth <= 991) return; // Natural vertical flow on mobile

    let lenis = null;
    let tickerCallback = null;

    try {
      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.95
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);
      tickerCallback = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn("Lenis init skipped:", e);
    }

    const sections = Array.from(modScroll.querySelectorAll(":scope > div"));
    const scrollH_width = modScroll.scrollWidth;
    const scrollDistance = scrollH_width - window.innerWidth;

    // Master horizontal scroll timeline
    const scrollTl = gsap.timeline({ paused: true });

    // Move all sections horizontally
    scrollTl.to(sections, {
      x: -scrollDistance,
      duration: 100,
      ease: "none"
    });

    // Pinned horizontal track trigger
    const scrollHTrigger = ScrollTrigger.create({
      id: "normal-scroll-horizontal",
      animation: scrollTl,
      trigger: modScroll,
      pin: "main",
      scrub: 1,
      start: "top top",
      end: () => `+=${scrollDistance}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const currentScroll = self.scroll();

        // Reveal fixed header logo & floating Menú controls once scrolled past intro
        const headerLogo = headerLogoRef.current;
        const headerControls = document.querySelector(".header__controls");
        if (headerLogo && headerControls) {
          if (self.progress > 0.04) {
            headerLogo.style.opacity = "1";
            headerControls.style.transform = "translate3d(0, 0, 0)";
            headerControls.style.opacity = "1";
            headerControls.style.pointerEvents = "all";
          } else {
            headerLogo.style.opacity = "0";
            headerControls.style.transform = "translate3d(0, -180%, 0)";
            headerControls.style.opacity = "0";
            headerControls.style.pointerEvents = "none";
          }
        }

        // Detect dark sections (Black Atelier or Red Cierre) to toggle white header contrast
        const s3 = document.querySelector(".mod-scroll__images-text");
        const s8 = document.querySelector(".mod-scroll__cierre");
        if (s3 && s8) {
          const s3Left = s3.offsetLeft - currentScroll;
          const s3Right = s3Left + s3.offsetWidth;
          const s8Left = s8.offsetLeft - currentScroll;
          const s8Right = s8Left + s8.offsetWidth;

          const isDark = (s3Left <= 250 && s3Right >= 50) || (s8Left <= 250 && s8Right >= 50);
          setIsHeaderDark(isDark);
        }
      }
    });

    // Section 1 Image scrub (moves -15vw -> 0vw)
    const singleImg = modScroll.querySelector(".mod-scroll__images__image-single");
    if (singleImg) {
      gsap.fromTo(
        singleImg,
        { x: "-15vw" },
        {
          x: "0vw",
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: singleImg.closest(".mod-scroll__images"),
            start: "0% 78%",
            end: "90% 100%",
            scrub: 0.5
          }
        }
      );
    }

    // Section 4 Vertical Carousel Ticker (translates vertically as you scroll horizontally)
    const carouselContent = modScroll.querySelector(".mod-scroll__carousel__content");
    if (carouselContent) {
      gsap.fromTo(
        carouselContent,
        { y: "175vh" },
        {
          y: "-100vh",
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: carouselContent.closest(".mod-scroll__carousel"),
            start: "0% 95%",
            end: "100% 0%",
            scrub: 0.5
          }
        }
      );
    }

    // Section 6 Terms Parallax
    const terms = modScroll.querySelectorAll(".mod-scroll__terms__term");
    if (terms.length >= 3) {
      gsap.to(terms[0], {
        paddingLeft: "12vw",
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: terms[0],
          start: "0% 100%",
          end: "100% 0%",
          scrub: 1
        }
      });
      gsap.to(terms[1], {
        paddingRight: "3vw",
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: terms[1],
          start: "0% 100%",
          end: "100% 0%",
          scrub: 1
        }
      });
      gsap.to(terms[2], {
        paddingLeft: "20vw",
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: terms[2],
          start: "0% 100%",
          end: "100% 0%",
          scrub: 1
        }
      });
    }

    // Section 7: Expanding Project Cards (signature 15vw -> 60vw expansion)
    const projectItems = modScroll.querySelectorAll(".mod-scroll__projects__item:not(.last-item)");
    projectItems.forEach((item, idx) => {
      const media = item.querySelector(".media__source");

      // Expand card width 15vw -> 60vw
      gsap.fromTo(
        item,
        { width: "15vw" },
        {
          width: "60vw",
          ease: "power1.inOut",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: item,
            start: "0% 80%",
            end: "100% 40%",
            scrub: true,
            onEnter: () => setActiveProjectIdx(idx),
            onEnterBack: () => setActiveProjectIdx(idx)
          }
        }
      );

      // Media height adjustments
      if (media) {
        gsap.fromTo(
          media,
          { height: "87vh" },
          {
            height: "66vh",
            ease: "power1.inOut",
            scrollTrigger: {
              containerAnimation: scrollTl,
              trigger: item,
              start: "0% 80%",
              end: "100% 40%",
              scrub: true
            }
          }
        );
      }
    });

    ScrollTrigger.refresh();

    return () => {
      scrollHTrigger.kill();
      scrollTl.kill();
      if (lenis && tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        lenis.destroy();
      }
    };
  }, []);

  // Track mouse coordinates for floating preview in terms section
  const handleTermsMouseMove = (e) => {
    if (!termsRef.current) return;
    const rect = termsRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      className={`nib-page-wrapper ${isPreloading ? "is-preloading" : ""} ${
        isHeaderDark ? "theme-dark-active" : ""
      }`}
      ref={containerRef}
    >
      {/* ------------------------------------------------------------------
          1. FIXED HEADER
         ------------------------------------------------------------------ */}
      <header>
        <div className="header">
          {/* Top-Left Floating Compact Logo (Revealed on Scroll) */}
          <div
            className={`header__logo logo ${isHeaderDark ? "c-white" : ""}`}
            ref={headerLogoRef}
          >
            <Link to="/" className="logo__normal" aria-label="Yashmeen Home">
              <span>YASHMEEN</span>
            </Link>
          </div>

          {/* Top-Right Floating Controls (Language Toggle & Menú Button) */}
          <div className="header__controls">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className={`header__lang-btn ${isHeaderDark ? "c-white" : ""}`}
              title="Toggle Language"
            >
              {lang === "en" ? "ES" : "EN"}
            </button>

            <button
              type="button"
              onClick={runSequence}
              className={`header__lang-btn ${isHeaderDark ? "c-white" : ""}`}
              title="Replay Entrance Ceremony"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <FiRotateCcw size={11} />
              <span>Replay</span>
            </button>

            <Link
              to="/contact"
              className="header__btn btn btn--bg f-edit t-parrafo-l"
            >
              <span>Menú</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          2. MINIMALIST PRELOADER BACKDROP
         ------------------------------------------------------------------ */}
      <div className="nib-preloader-backdrop" ref={backdropRef}>
        <div className="nib-preloader-center">
          <div className="nib-preloader-percent">{progress}%</div>
          <div className="nib-preloader-progress">
            <div
              className="nib-preloader-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          3. MAIN HORIZONTAL SCROLL WRAPPER (.mod-scroll)
         ------------------------------------------------------------------ */}
      <main>
        <section className="mod-scroll" ref={modScrollRef}>
          {/* ===============================================================
              SECTION 0: INTRO (.mod-scroll__intro bg-white)
             =============================================================== */}
          <div className="mod-scroll__intro bg-white">
            <div className="wrapper">
              {/* Rotated Top-Right Navigation Menu (-90deg hallmark) */}
              <ul className="mod-scroll__intro__menu f-izmir t-parrafo t-upper">
                <li className="menu-item">
                  <a href="#studio">{currentText.navStudio}</a>
                </li>
                <li className="menu-item">
                  <a href="#projects">{currentText.navProjects}</a>
                </li>
                <li className="menu-item">
                  <a href="#contact">{currentText.navContact}</a>
                </li>
              </ul>

              {/* Section Tag & Copyright */}
              <div className="mod-scroll__intro__section mod-scroll__section t-parrafo-l f-edit">
                {currentText.sectionHome}
              </div>
              <div className="mod-scroll__intro__copyright t-subtitulo f-izmir">
                {currentText.copyright}
              </div>

              {/* 2-Column Asymmetric Editorial Headline Grid & Narrative Text */}
              <div className="mod-scroll__intro__content">
                <div className="mod-scroll__intro__wrap-titles">
                  {/* Col 1, Row 1 */}
                  <div className="mod-scroll__intro__title f-izmir t-titulo-xxl line lh-less is_home">
                    <div className="splitline clip-y">
                      {renderChars(currentText.line1_a)}
                    </div>
                    <div className="splitline clip-y">
                      {renderChars(currentText.line1_b)}
                    </div>
                  </div>

                  {/* Col 2, Row 1 (Indented/Spaced) */}
                  <div className="mod-scroll__intro__title f-izmir t-titulo-xxl line lh-less is_home">
                    <div className="splitline clip-y">&nbsp;</div>
                    <div className="splitline clip-y">&nbsp;</div>
                    <div className="splitline clip-y">
                      {renderChars(currentText.line2_a)}
                    </div>
                    <div className="splitline clip-y">
                      {renderChars(currentText.line2_b)}
                    </div>
                  </div>

                  {/* Col 1, Row 2 */}
                  <div className="mod-scroll__intro__title f-izmir t-titulo-xxl line lh-less is_home">
                    <div className="splitline clip-y">
                      {renderChars(currentText.line3_lead)}
                    </div>
                    <div className="splitline clip-y">
                      <em>{renderChars(currentText.line3_climax)}</em>
                      <span className="accent-dot">•</span>
                    </div>
                  </div>

                  {/* Col 2, Row 2: Pure Narrative Paragraph */}
                  <div className="mod-scroll__intro__text">
                    <p>{currentText.heroCopy}</p>
                  </div>
                </div>
              </div>

              {/* Intro Logo (NORMAL / BORING signature diagonal split) */}
              <div className="mod-scroll__intro__logo logo c-black">
                <div className="logo__normal" data-url="/">
                  {renderChars("YASHMEEN")}
                </div>
                <div className="logo__group">
                  <div className="logo__is">{renderChars("is")}</div>
                  <div className="logo__boring">
                    {renderChars("ORDINARY")}
                    <div className="reg">®</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              SECTION 1: PRIMARY IMAGES (.mod-scroll__images bg-white principal)
             =============================================================== */}
          <div className="mod-scroll__images bg-white principal">
            {/* Giant Single Image with translate3d(-15vw -> 0vw) */}
            <div className="media mod-scroll__images__image-single noAspect">
              <div className="media__wrap-source image">
                <img
                  className="media__source w-100"
                  src="/static/hero-editorial.png"
                  alt="Yashmeen Interior Architecture"
                />
              </div>
            </div>

            {/* Overlapping Dual Flip Media */}
            <div className="mod-scroll__images__flip flipMedia flipMedia--upDown">
              <div className="media flipMedia__media flipMedia__media--down noAspect">
                <div className="media__wrap-source image">
                  <img
                    className="media__source w-100"
                    src="/static/studio.jpg"
                    alt="Yashmeen Design Studio"
                  />
                </div>
              </div>
              <div className="media flipMedia__media flipMedia__media--up noAspect">
                <div className="media__wrap-source image">
                  <img
                    className="media__source w-100"
                    src="/static/design-desk.jpg"
                    alt="Materiality Selection"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              SECTION 2: EDITORIAL TEXT (.mod-scroll__text bg-white)
             =============================================================== */}
          <div className="mod-scroll__text bg-white" id="studio">
            <div className="wrapper">
              <div className="mod-scroll__text__section mod-scroll__section t-parrafo-l f-edit">
                {currentText.textSectionLabel}
              </div>

              <div className="mod-scroll__text__wrap-text">
                <div className="mod-scroll__text__title t-supertitulo-l f-regular">
                  <div className="line t-upper col-12 align-left t-left">
                    <span className="cont">{currentText.textLine1}</span>
                  </div>
                  <div className="line t-upper col-12 align-left t-left">
                    <span className="cont">{currentText.textLine2}</span>
                  </div>
                  <div className="line t-upper col-12 align-left t-left">
                    <span className="cont">{currentText.textLine3}</span>
                  </div>
                  <div className="line t-upper col-12 align-right t-right">
                    <span className="cont">{currentText.textLine4}</span>
                  </div>
                </div>

                <div className="mod-scroll__text__text f-izmir t-parrafo">
                  <p>{currentText.textParagraph}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              SECTION 3: DARK ATELIER (.mod-scroll__images-text bg-black c-white)
             =============================================================== */}
          <div className="mod-scroll__images-text bg-black c-white">
            <div className="wrapper">
              {/* Dual flip media pair 1 */}
              <div className="mod-scroll__images-text__flip flipMedia flipMedia--rightLeft">
                <div className="media flipMedia__media flipMedia__media--down noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source w-100"
                      src="/static/joinery-bay.jpg"
                      alt="Al Quoz Joinery Bay"
                    />
                  </div>
                </div>
                <div className="media flipMedia__media flipMedia__media--up noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source w-100"
                      src="/static/production-facility.jpg"
                      alt="Manufacturing Precision"
                    />
                  </div>
                </div>
              </div>

              {/* Central Narrative */}
              <div className="mod-scroll__images-text__text">
                <p>{currentText.imagesTextParagraph}</p>
              </div>

              {/* Dual flip media pair 2 */}
              <div className="mod-scroll__images-text__flip flipMedia flipMedia--leftRight">
                <div className="media flipMedia__media flipMedia__media--down noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source w-100"
                      src="/static/Custom-Furniture.jpg"
                      alt="Bespoke Travertine Detail"
                    />
                  </div>
                </div>
                <div className="media flipMedia__media flipMedia__media--up noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source w-100"
                      src="/static/Residential-Fit-Out.jpg"
                      alt="Fluted Acoustic Woodwork"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              SECTION 4: VERTICAL CAROUSEL RIBBON (.mod-scroll__carousel)
             =============================================================== */}
          <div className="mod-scroll__carousel bg-beige c-black t-supertitulo-l">
            <div className="mod-scroll__carousel__content">
              <span>
                <p className="mod-scroll__carousel__text f-regular">
                  {currentText.carouselText}
                </p>
                <span className="mod-scroll__carousel__asterisk">✻</span>
              </span>
              <span>
                <p className="mod-scroll__carousel__text f-regular">
                  {currentText.carouselText}
                </p>
                <span className="mod-scroll__carousel__asterisk">✻</span>
              </span>
              <span>
                <p className="mod-scroll__carousel__text f-regular">
                  {currentText.carouselText}
                </p>
                <span className="mod-scroll__carousel__asterisk">✻</span>
              </span>
              <span>
                <p className="mod-scroll__carousel__text f-regular">
                  {currentText.carouselText}
                </p>
                <span className="mod-scroll__carousel__asterisk">✻</span>
              </span>
            </div>
          </div>

          {/* ===============================================================
              SECTION 5: SECONDARY MEDIA (.mod-scroll__images bg-beige c-black)
             =============================================================== */}
          <div className="mod-scroll__images bg-beige c-black secundario">
            <div className="mod-scroll__images__flip flipMedia flipMedia--rightLeft">
              <div className="media flipMedia__media flipMedia__media--down noAspect">
                <div className="media__wrap-source image">
                  <img
                    className="media__source w-100"
                    src="/static/atelier-render.jpg"
                    alt="Atelier Fabrication"
                  />
                </div>
              </div>
            </div>

            <div className="mod-scroll__images__flip flipMedia flipMedia--leftRight">
              <div className="media flipMedia__media flipMedia__media--down noAspect">
                <div className="media__wrap-source image">
                  <img
                    className="media__source w-100"
                    src="/static/Open-Plan-Office-Fit-Out.jpg"
                    alt="Turnkey Architectural Delivery"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              SECTION 6: TERMS WITH MOUSE-FOLLOW (.mod-scroll__terms bg-blue)
             =============================================================== */}
          <div
            className="mod-scroll__terms follow__wrap bg-blue"
            ref={termsRef}
            onMouseMove={handleTermsMouseMove}
            onMouseEnter={() => setHoveredTermImage("/static/work-clifton.jpg")}
            onMouseLeave={() => setHoveredTermImage(null)}
          >
            {/* Term 1 */}
            <div
              className="mod-scroll__terms__term"
              onMouseEnter={() => setHoveredTermImage("/static/work-clifton.jpg")}
            >
              <div className="mod-scroll__terms__term__text f-izmir t-parrafo">
                <div className="mod-scroll__terms__term__text__single">
                  {currentText.term1Desc}
                </div>
              </div>
              <div className="mod-scroll__terms__term__wrap-title">
                <div className="mod-scroll__terms__term__num f-edit t-parrafo">
                  {currentText.term1Num}
                </div>
                <div className="mod-scroll__terms__term__title t-supertitulo-l f-edit">
                  <span className="mod-scroll__terms__term__title__filter">
                    <span className="mod-scroll__terms__term__title__color">
                      {currentText.term1Title}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Term 2 */}
            <div
              className="mod-scroll__terms__term"
              onMouseEnter={() => setHoveredTermImage("/static/work-myrtle.jpg")}
            >
              <div className="mod-scroll__terms__term__text f-izmir t-parrafo">
                <div className="mod-scroll__terms__term__text__single">
                  {currentText.term2Desc}
                </div>
              </div>
              <div className="mod-scroll__terms__term__wrap-title">
                <div className="mod-scroll__terms__term__num f-edit t-parrafo">
                  {currentText.term2Num}
                </div>
                <div className="mod-scroll__terms__term__title t-supertitulo-l f-edit">
                  <span className="mod-scroll__terms__term__title__filter">
                    <span className="mod-scroll__terms__term__title__color">
                      {currentText.term2Title}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Term 3 */}
            <div
              className="mod-scroll__terms__term"
              onMouseEnter={() => setHoveredTermImage("/static/work-oh-office.jpg")}
            >
              <div className="mod-scroll__terms__term__text f-izmir t-parrafo">
                <div className="mod-scroll__terms__term__text__single">
                  {currentText.term3Desc}
                </div>
              </div>
              <div className="mod-scroll__terms__term__wrap-title">
                <div className="mod-scroll__terms__term__num f-edit t-parrafo">
                  {currentText.term3Num}
                </div>
                <div className="mod-scroll__terms__term__title t-supertitulo-l f-edit">
                  <span className="mod-scroll__terms__term__title__filter">
                    <span className="mod-scroll__terms__term__title__color">
                      {currentText.term3Title}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Mouse Follow Image Container */}
            <div
              className={`follow__mouse ${hoveredTermImage ? "is-visible" : ""}`}
              style={{
                transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0px)`
              }}
            >
              {hoveredTermImage && (
                <img src={hoveredTermImage} alt="Architectural Reference" />
              )}
            </div>
          </div>

          {/* ===============================================================
              SECTION 7: PROJECTS EXPANDING GALLERY (.mod-scroll__projects)
             =============================================================== */}
          <div className="mod-scroll__projects" id="projects">
            <div className="mod-scroll__projects__wrap-text">
              <div className="mod-scroll__projects__section mod-scroll__section t-parrafo-l f-edit">
                {currentText.projectsLabel}
              </div>
              <div className="mod-scroll__projects__text f-izmir t-parrafo">
                <div className="line">{currentText.projectsIntro}</div>
              </div>
            </div>

            {/* Project 1 */}
            <div className="mod-scroll__projects__item bg-beige c-black">
              <div className="mod-scroll__projects__item__content">
                <div className="media mod-scroll__projects__item__image noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source"
                      src="/static/work-clifton.jpg"
                      alt={currentText.proj1Title}
                    />
                  </div>
                </div>
                <div className="mod-scroll__projects__item__text f-regular t-supertitulo-l t-upper">
                  <div className="mod-scroll__projects__item__text__title">
                    <div>{currentText.proj1Title}</div>
                  </div>
                  <div className="mod-scroll__projects__item__text__data f-izmir t-parrafo t-upper">
                    <div className="data-year">
                      <span>{currentText.proj1Year}</span>
                    </div>
                    <div className="data-loc">
                      <span>{currentText.proj1Loc}</span>
                    </div>
                    <div className="data-number">
                      <span>{currentText.proj1Num}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="mod-scroll__projects__item bg-grey">
              <div className="mod-scroll__projects__item__content">
                <div className="media mod-scroll__projects__item__image noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source"
                      src="/static/work-myrtle.jpg"
                      alt={currentText.proj2Title}
                    />
                  </div>
                </div>
                <div className="mod-scroll__projects__item__text f-regular t-supertitulo-l t-upper">
                  <div className="mod-scroll__projects__item__text__title">
                    <div>{currentText.proj2Title}</div>
                  </div>
                  <div className="mod-scroll__projects__item__text__data f-izmir t-parrafo t-upper">
                    <div className="data-year">
                      <span>{currentText.proj2Year}</span>
                    </div>
                    <div className="data-loc">
                      <span>{currentText.proj2Loc}</span>
                    </div>
                    <div className="data-number">
                      <span>{currentText.proj2Num}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="mod-scroll__projects__item bg-blue">
              <div className="mod-scroll__projects__item__content">
                <div className="media mod-scroll__projects__item__image noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source"
                      src="/static/work-oh-office.jpg"
                      alt={currentText.proj3Title}
                    />
                  </div>
                </div>
                <div className="mod-scroll__projects__item__text f-regular t-supertitulo-l t-upper">
                  <div className="mod-scroll__projects__item__text__title">
                    <div>{currentText.proj3Title}</div>
                  </div>
                  <div className="mod-scroll__projects__item__text__data f-izmir t-parrafo t-upper">
                    <div className="data-year">
                      <span>{currentText.proj3Year}</span>
                    </div>
                    <div className="data-loc">
                      <span>{currentText.proj3Loc}</span>
                    </div>
                    <div className="data-number">
                      <span>{currentText.proj3Num}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 4 */}
            <div className="mod-scroll__projects__item bg-beige c-black">
              <div className="mod-scroll__projects__item__content">
                <div className="media mod-scroll__projects__item__image noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source"
                      src="/static/work-runic.jpg"
                      alt={currentText.proj4Title}
                    />
                  </div>
                </div>
                <div className="mod-scroll__projects__item__text f-regular t-supertitulo-l t-upper">
                  <div className="mod-scroll__projects__item__text__title">
                    <div>{currentText.proj4Title}</div>
                  </div>
                  <div className="mod-scroll__projects__item__text__data f-izmir t-parrafo t-upper">
                    <div className="data-year">
                      <span>{currentText.proj4Year}</span>
                    </div>
                    <div className="data-loc">
                      <span>{currentText.proj4Loc}</span>
                    </div>
                    <div className="data-number">
                      <span>{currentText.proj4Num}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 5 (Last Item) */}
            <div className="mod-scroll__projects__item last-item bg-grey">
              <div className="mod-scroll__projects__item__content">
                <div className="media mod-scroll__projects__item__image noAspect">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source"
                      src="/static/work-samford.jpg"
                      alt={currentText.proj5Title}
                    />
                  </div>
                </div>
                <div className="mod-scroll__projects__item__text f-regular t-supertitulo-l t-upper">
                  <div className="mod-scroll__projects__item__text__title">
                    <div>{currentText.proj5Title}</div>
                  </div>
                  <div className="mod-scroll__projects__item__text__data f-izmir t-parrafo t-upper">
                    <div className="data-year">
                      <span>{currentText.proj5Year}</span>
                    </div>
                    <div className="data-loc">
                      <span>{currentText.proj5Loc}</span>
                    </div>
                    <div className="data-number">
                      <span>{currentText.proj5Num}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Closing Cierre (.mod-scroll__cierre bg-red c-black) */}
            <div className="mod-scroll__cierre bg-red c-black">
              <div className="mod-scroll__cierre__content">
                <div className="mod-scroll__cierre__content__image flipMedia flipMedia--upDown">
                  <div className="media flipMedia__media flipMedia__media--down noAspect">
                    <div className="media__wrap-source image">
                      <img
                        className="media__source w-100"
                        src="/static/work-stanley.jpg"
                        alt="Yashmeen Cierre"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===============================================================
            4. UNPINNED VERTICAL FINALE & FOOTER (Matches normalisboring.es)
           =============================================================== */}
        <section
          className="mod-title wrapper mod-title--chapter bg-beige c-black anim-line"
          id="contact"
        >
          <div className="mod-title__chapter-label f-edit t-titulo">
            {currentText.finaleChapter}
          </div>
          <h2 className="mod-title__heading f-regular t-supertitulo-xl t-title-ls t-upper t-center">
            {currentText.finaleTitle}
          </h2>
        </section>

        <section className="mod-media mod-media--double bg-beige c-black wrapper">
          <div className="mod-media__col">
            <img
              src="/static/hero-cinematic.jpg"
              alt="Luxury Dubai Architecture"
            />
          </div>
          <div className="mod-media__col">
            <img src="/static/about-us.webp" alt="Yashmeen Atelier" />
          </div>
        </section>

        <section className="mod-title wrapper mod-title--lines bg-beige c-black">
          <h3 className="line f-regular t-supertitulo t-title-ls t-upper col-12 align-left t-left">
            {currentText.finaleSubtitle}
          </h3>
        </section>

        <section className="mod-content wrapper mod-content--cols bg-beige c-black">
          <div className="mod-content__col big_text">
            <p>{currentText.finaleParagraph}</p>
            <p>
              <strong>info@yashmeen.ae</strong>
            </p>
          </div>
        </section>

        <section className="mod-content wrapper mod-content--center bg-beige c-black">
          <Link
            to="/contact"
            className="mod-content__btn btn btn--bg btn--bg-xl f-edit t-titulo"
          >
            <span>{currentText.finaleCta}</span>
          </Link>
        </section>

        <footer className="mod-footer wrapper bg-beige c-black">
          <div className="mod-footer__top">
            <div className="mod-footer__links">
              <a href="mailto:info@yashmeen.ae">info@yashmeen.ae</a>
              <span className="sep">|</span>
              <a href="tel:+97140000000">+971 4 000 0000</a>
              <span className="sep">|</span>
              <span>Al Quoz Industrial Area 3, Dubai, UAE</span>
            </div>
          </div>
          <div className="mod-footer__bottom">
            <span>{currentText.copyright}</span>
            <span>{currentText.footerTagline}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

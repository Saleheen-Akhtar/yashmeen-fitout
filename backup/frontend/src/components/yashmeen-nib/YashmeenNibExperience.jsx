import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { FiArrowRight, FiRotateCcw, FiLayers, FiMaximize2, FiX } from "react-icons/fi";
import "../../styles/yashmeen-nib.css";

// Register GreenSock ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function YashmeenNibExperience() {
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState("en"); // "en" or "es"
  const [isPreloading, setIsPreloading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [hoveredTermImage, setHoveredTermImage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHeaderDark, setIsHeaderDark] = useState(false);

  // Storytelling interactive states
  const [activeMaterial, setActiveMaterial] = useState("travertine");
  const [isBlueprintMode, setIsBlueprintMode] = useState(false);
  const [openSpecProjectIdx, setOpenSpecProjectIdx] = useState(null);
  const [activeCommissionType, setActiveCommissionType] = useState("residential");

  const containerRef = useRef(null);
  const backdropRef = useRef(null);
  const timelineRef = useRef(null);
  const modScrollRef = useRef(null);
  const termsRef = useRef(null);
  const headerLogoRef = useRef(null);
  const lenisRef = useRef(null);

  // Bilingual text dictionary
  const texts = {
    en: {
      navStudio: "STUDIO",
      navProjects: "PROJECTS",
      navContact: "CONTACT",
      sectionHome: "Home",
      copyright: "YASHMEEN FIT-OUT CONTRACTING ©2026",

      // Chapters
      chapters: [
        "01 ORIGIN",
        "02 MATERIALITY",
        "03 THE STUDIO",
        "04 THE ATELIER",
        "05 VALUES",
        "06 TENETS",
        "07 MONOLITHS",
        "08 COMMISSION"
      ],

      // Hero Intro
      line1_a: "CONSIDERED",
      line1_b: "SPACES",
      line2_a: "THAT",
      line2_b: "CHALLENGE",
      line3_lead: "THE",
      line3_climax: "ORDINARY",
      heroCopy:
        "In a world where everything has become disposable, Yashmeen builds interiors to endure. Bespoke joinery from our 35,000 sq.ft Al Quoz atelier, architectural engineering and single-source certainty.",

      // Chapter 1: Materiality Lab
      matEyebrow: "ACT I // MATERIALITY & ANATOMY",
      matTitle: "THE ALCHEMY OF RAW SUBSTANCE",
      matNarrative:
        "Before architectural form exists, there is raw matter. In Dubai's climate, true luxury is material honesty. We calibrate European quarries and sustainably harvested timber to withstand time with effortless grace.",
      matTravertine: "Roman Travertine",
      matOak: "French White Oak",
      matBronze: "Patinated Bronze",
      matWalnut: "Fluted Walnut",
      labelOrigin: "Quarry / Origin",
      labelFinish: "Tactile Finish",
      labelDensity: "Density / Grade",
      labelApplication: "Joinery Application",

      // Chapter 2: Text / Studio
      textSectionLabel: "The Studio",
      textLine1: "SPACES THAT INVITE",
      textLine2: "TO HOLD AND ENJOY",
      textLine3: "TIME IN STILLNESS",
      textLine4: "AND DISCONNECT",
      textParagraph:
        "Every space must be singular and meaningful, just like the people who inhabit it. We are the benchmark for quiet architectural luxury, where design discipline, sustainable engineering and craftsmanship unite to offer something truly exceptional.",
      telemetry1Label: "AL QUOZ MASTER ATELIER",
      telemetry2Label: "BESPOKE ARTISANS & JOINERS",
      telemetry3Label: "SHADOW GAP PRECISION",

      // Chapter 3: Dark Atelier
      imagesTextParagraph:
        "At Yashmeen, we shape spaces that stand apart through bespoke joinery craftsmanship and disciplined execution. Contemporary volumes, tactile materiality, open to light. Environments that elevate daily life with more comfort, more permanence and genuine emotion.",
      btnBlueprintReality: "Built Reality",
      btnBlueprintCad: "CAD Drafting Wireframe",

      // Chapter 4: Carousel
      carouselText: "VALUES",

      // Chapter 5: Terms
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

      // Chapter 6: Projects
      projectsLabel: "Projects",
      projectsIntro:
        "We shape prime residences, bespoke hospitality and commercial spaces with single-source accountability.",
      btnInspectSpec: "Technical Spec +",
      btnHideSpec: "Close Spec ×",
      specScope: "Scope",
      specArea: "Footprint",
      specTimeline: "Duration",
      specJoinery: "Key Joinery",

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

      // Chapter 7: Unpinned Vertical Finale
      finaleChapter: "(Commission)",
      finaleTitle: "UNLOCK YOUR VISION",
      finaleSubtitle: "EXCLUSIVITY IN ITS HIGHEST EXPRESSION",
      finaleParagraph:
        "At Yashmeen, our priority is offering a personalized, dedicated partnership to bring your architectural vision into reality. Our team is at your disposal to guide you through every milestone.",
      commResidential: "Private Residences",
      commCorporate: "Executive Headquarters",
      commHospitality: "Bespoke Hospitality",
      commMillwork: "Atelier Joinery",
      guidanceResidential:
        "Turnkey interior fit-out and architectural millwork for villas and private estates across Emirates Hills, Palm Jumeirah and Dubai Hills. Typical delivery: 20–32 weeks.",
      guidanceCorporate:
        "Grade-A commercial fit-outs and boardroom architecture in DIFC and Downtown Dubai. Acoustically tuned woodwork and single-source project governance.",
      guidanceHospitality:
        "Atmospheric dining salons, boutique hotel suites and experiential retail spaces requiring custom curved millwork and patinated architectural metalwork.",
      guidanceMillwork:
        "Dedicated bespoke fabrication from our 35,000 sq.ft Al Quoz atelier for architects, interior designers and private commissioners.",
      finaleCta: "Request Private Consultation",
      footerTagline: "BESPOKE INTERIORS & ARCHITECTURAL FIT-OUT • DUBAI, UAE"
    },
    es: {
      navStudio: "ESTUDIO",
      navProjects: "PROYECTOS",
      navContact: "CONTACTO",
      sectionHome: "Inicio",
      copyright: "YASHMEEN CONTRATACIÓN DE INTERIORES ©2026",

      // Chapters
      chapters: [
        "01 ORIGEN",
        "02 MATERIALIDAD",
        "03 EL ESTUDIO",
        "04 EL ATELIER",
        "05 VALORES",
        "06 PRINCIPIOS",
        "07 MONOLITOS",
        "08 COMISIÓN"
      ],

      // Hero Intro
      line1_a: "ESPACIOS",
      line1_b: "DE VIDA",
      line2_a: "QUE",
      line2_b: "DESAFÍAN",
      line3_lead: "LO",
      line3_climax: "ORDINARIO",
      heroCopy:
        "En un mundo fugaz en el que lo efímero lo ha empapado todo, construimos interiores para durar más y más, preservando la artesanía a medida y la certeza arquitectónica.",

      // Chapter 1: Materiality Lab
      matEyebrow: "ACTO I // MATERIALIDAD Y ANATOMÍA",
      matTitle: "LA ALQUIMIA DE LA SUSTANCIA PURA",
      matNarrative:
        "Antes de que la forma arquitectónica exista, está la materia prima. En el clima de Dubái, el verdadero lujo es la honestidad material. Calibramos canteras europeas y maderas nobles sostenibles para trascender el tiempo con serenidad.",
      matTravertine: "Travertino Romano",
      matOak: "Roble Francés",
      matBronze: "Bronce Patinado",
      matWalnut: "Nogal Acanalado",
      labelOrigin: "Cantera / Origen",
      labelFinish: "Acabado Táctil",
      labelDensity: "Densidad / Grado",
      labelApplication: "Aplicación de Ebanistería",

      // Chapter 2: Text / Studio
      textSectionLabel: "Nosotros",
      textLine1: "CASAS QUE INVITAN",
      textLine2: "A  DETENER",
      textLine3: "EL TIEMPO",
      textLine4: "Y DESCONECTAR",
      textParagraph:
        "Cada vivienda debe ser única y especial, al igual que las personas que la habitan. Somos el referente del lujo aspiracional, donde diseño, sostenibilidad y calidad de vida se unen para ofrecer algo verdaderamente excepcional.",
      telemetry1Label: "ATELIER CENTRAL EN AL QUOZ",
      telemetry2Label: "MAESTROS ARTESANOS Y EBANISTAS",
      telemetry3Label: "PRECISIÓN EN JUNTAS OCULTAS",

      // Chapter 3: Dark Atelier
      imagesTextParagraph:
        "En Yashmeen construimos espacios que sobresalen por la calidad y el diseño, de volúmenes contemporáneos, impolutos y abiertos al exterior. Espacios que mejoran la calidad de vida de quienes los habitan, ofreciendo más confort, más belleza y más emoción.",
      btnBlueprintReality: "Realidad Construida",
      btnBlueprintCad: "Plano Técnico CAD",

      // Chapter 4: Carousel
      carouselText: "VALORES",

      // Chapter 5: Terms
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

      // Chapter 6: Projects
      projectsLabel: "Proyectos",
      projectsIntro:
        "Desarrollamos proyectos residenciales y corporativos exclusivos con una visión integral de principio a fin.",
      btnInspectSpec: "Ficha Técnica +",
      btnHideSpec: "Cerrar Ficha ×",
      specScope: "Alcance",
      specArea: "Superficie",
      specTimeline: "Plazo",
      specJoinery: "Ebanistería",

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

      // Chapter 7: Unpinned Vertical Finale
      finaleChapter: "(Comisión)",
      finaleTitle: "DESBLOQUEA TU SUEÑO",
      finaleSubtitle: "EXCLUSIVIDAD EN SU MÁXIMA EXPRESIÓN",
      finaleParagraph:
        "En Yashmeen, nuestra prioridad es ofrecerte un servicio personalizado y cercano para ayudarte a materializar tu proyecto soñado.",
      commResidential: "Residencias Privadas",
      commCorporate: "Sedes Corporativas",
      commHospitality: "Hospitalidad Exclusiva",
      commMillwork: "Ebanistería a Medida",
      guidanceResidential:
        "Construcción y ebanistería llave en mano para villas en Emirates Hills, Palm Jumeirah y Dubai Hills. Plazo estimado: 20–32 semanas.",
      guidanceCorporate:
        "Equipamiento corporativo en DIFC y Downtown Dubái. Acústica de precisión y dirección técnica integral.",
      guidanceHospitality:
        "Salones gastronómicos y suites de lujo con madera curvada al vapor y metales nobles patinados a mano.",
      guidanceMillwork:
        "Fabricación dedicada desde nuestro atelier de 35,000 pies cuadrados en Al Quoz para arquitectos y promotores privados.",
      finaleCta: "Solicitar Consulta Privada",
      footerTagline: "INTERIORES A MEDIDA Y CONTRATACIÓN ARQUITECTÓNICA • DUBÁI, EAU"
    }
  };

  const currentText = texts[lang];

  // Material Specimen Definitions
  const materialSpecs = {
    travertine: {
      name: currentText.matTravertine,
      origin: lang === "en" ? "Tivoli Quarries, Italy" : "Canteras de Tívoli, Italia",
      finish: lang === "en" ? "Honed & Cross-Cut Silk" : "Apomazado y Corte Transversal Seda",
      density: "2,480 kg/m³ • Class A",
      application:
        lang === "en"
          ? "Monolithic Kitchen Islands & Full-Slab Bathroom Vanities"
          : "Islas Monolíticas de Cocina y Revestimientos de Baño",
      image: "/static/Custom-Furniture.jpg",
      color: "#d9cec1"
    },
    oak: {
      name: currentText.matOak,
      origin: lang === "en" ? "Vosges Forest, France" : "Bosque de los Vosgos, Francia",
      finish: lang === "en" ? "Smoked Natural Tannin & Matte Polyurethane" : "Tanino Ahumado y Poliuretano Mate",
      density: "740 kg/m³ • Janka 1,360",
      application:
        lang === "en"
          ? "Floor-to-Ceiling Pivot Portals & Fluted Secret Doors"
          : "Puertas Pivotantes de Suelo a Techo y Puertas Ocultas",
      image: "/static/Residential-Fit-Out.jpg",
      color: "#c2ab87"
    },
    bronze: {
      name: currentText.matBronze,
      origin: lang === "en" ? "Bespoke Foundry Custom Extrusion" : "Extrusión a Medida en Fundición Artesanal",
      finish: lang === "en" ? "Hand-Rubbed Micro-Abrasive Patina" : "Pátina Microabrasiva Frotada a Mano",
      density: "8,730 kg/m³ • Marine Grade",
      application:
        lang === "en"
          ? "Concealed Edge Pulls, Shadow Gap Trims & Pivot Hinges"
          : "Tiradores Embutidos, Perfiles de Junta Oculta y Bisagras",
      image: "/static/studio.jpg",
      color: "#a4824d"
    },
    walnut: {
      name: currentText.matWalnut,
      origin: lang === "en" ? "Appalachian Sustainable Hardwood" : "Madera Sostenible de los Apalaches",
      finish: lang === "en" ? "Open-Pore Deep Walnut Oil Seal" : "Sellado al Aceite Profundo a Poro Abierto",
      density: "660 kg/m³ • Acoustic Baffle",
      application:
        lang === "en"
          ? "Acoustic Slatted Wall Cladding & Executive Desk Suites"
          : "Revestimiento Acústico Alistonado y Despachos Ejecutivos",
      image: "/static/design-desk.jpg",
      color: "#5c4033"
    }
  };

  // Detailed Monolith Project Specs
  const projectSpecs = [
    {
      scope: lang === "en" ? "Turnkey Private Residence" : "Residencia Privada Llave en Mano",
      area: "14,500 sq.ft",
      timeline: "24 Weeks",
      joinery: lang === "en" ? "French Oak & Fluted Wall Paneling" : "Roble Francés y Panelado Acanalado"
    },
    {
      scope: lang === "en" ? "Commercial Creative Atelier" : "Atelier Creativo Comercial",
      area: "8,200 sq.ft",
      timeline: "16 Weeks",
      joinery: lang === "en" ? "Roman Travertine & Patinated Bronze" : "Travertino Romano y Bronce Patinado"
    },
    {
      scope: lang === "en" ? "DIFC Executive Sovereign Suite" : "Sede Ejecutiva en DIFC",
      area: "18,000 sq.ft",
      timeline: "28 Weeks",
      joinery: lang === "en" ? "Acoustic Slatted Walnut & Marble" : "Nogal Acústico Alistonado y Mármol"
    },
    {
      scope: lang === "en" ? "Bespoke Hospitality Pavilion" : "Pabellón Gastronómico de Lujo",
      area: "11,200 sq.ft",
      timeline: "20 Weeks",
      joinery: lang === "en" ? "Curved Steam-Bent Teak & Brass" : "Teca Curvada al Vapor y Latón Macizo"
    },
    {
      scope: lang === "en" ? "Master Joinery Fabrication Facility" : "Centro de Fabricación de Ebanistería",
      area: "35,000 sq.ft",
      timeline: "Continuous Operations",
      joinery: lang === "en" ? "5-Axis CNC & Hand-Chiseled Detailing" : "CNC de 5 Ejes y Acabado Manual"
    }
  ];

  // Helper for masking individual characters
  const renderChars = (str, className = "char") =>
    str.split("").map((c, i) => (
      <span key={i} className="splitline-char-wrap" style={{ position: "relative", display: "inline-block" }}>
        <span className={className} style={{ position: "relative", display: "inline-block" }}>
          {c === " " ? "\u00A0" : c}
        </span>
      </span>
    ));

  // --------------------------------------------------------------------------
  // 1. PRELOADER & INTRO ENTRANCE ANIMATION
  // --------------------------------------------------------------------------
  const runSequence = useCallback(() => {
    setIsPreloading(true);
    if (timelineRef.current) timelineRef.current.kill();
    gsap.killTweensOf("*");

    setProgress(0);
    const isMobile = window.innerWidth <= 991;

    if (backdropRef.current) backdropRef.current.style.display = "flex";
    gsap.set(".nib-preloader-backdrop", { opacity: 1 });
    gsap.set(".nib-preloader-center", { opacity: 1 });
    gsap.set(".header__logo", { opacity: 0 });
    gsap.set(".header__btn", { y: "-180%", opacity: 0 });

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

        introTl.to(".mod-scroll__intro__logo", { opacity: 1, duration: 0.8 }, 0.2);

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
  // 2. HORIZONTAL SCROLL & CHAPTER CHOREOGRAPHY ENGINE
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

    const scrollTl = gsap.timeline({ paused: true });

    scrollTl.to(sections, {
      x: -scrollDistance,
      duration: 100,
      ease: "none"
    });

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

        // Fixed header logo & Menú button reveal
        const headerLogo = headerLogoRef.current;
        const headerControls = document.querySelector(".header__controls");
        if (headerLogo && headerControls) {
          if (self.progress > 0.03) {
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

        // Active Chapter Calculation (0 to 7) based on section boundaries
        const sectionSelectors = [
          ".mod-scroll__intro",
          ".mod-scroll__materiality",
          ".mod-scroll__text",
          ".mod-scroll__images-text",
          ".mod-scroll__carousel",
          ".mod-scroll__terms",
          ".mod-scroll__projects",
          ".mod-title--chapter"
        ];
        if (window.innerWidth > 991) {
          const currentX = self.progress * (modScroll.scrollWidth - window.innerWidth);
          let activeIdx = 0;
          for (let i = 0; i < 7; i++) {
            const sec = document.querySelector(sectionSelectors[i]);
            if (sec && currentX >= sec.offsetLeft - window.innerWidth * 0.35) {
              activeIdx = i;
            }
          }
          if (self.progress >= 0.95) {
            activeIdx = 7;
          }
          setActiveChapter(activeIdx);
        }

        // Dark Theme Contrast Detection
        const sAtelier = document.querySelector(".mod-scroll__images-text");
        const sCierre = document.querySelector(".mod-scroll__cierre");
        if (sAtelier && sCierre) {
          const s3Left = sAtelier.offsetLeft - currentScroll;
          const s3Right = s3Left + sAtelier.offsetWidth;
          const s8Left = sCierre.offsetLeft - currentScroll;
          const s8Right = s8Left + sCierre.offsetWidth;

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

    // Section 4 Vertical Carousel Ticker
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

    // Section 7: Expanding Project Cards (15vw -> 60vw)
    const projectItems = modScroll.querySelectorAll(".mod-scroll__projects__item:not(.last-item)");
    projectItems.forEach((item, idx) => {
      const media = item.querySelector(".media__source");

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

  // Jump to specific chapter along the journey
  const jumpToChapter = (idx) => {
    if (typeof window === "undefined") return;
    const modScroll = modScrollRef.current;
    const sectionSelectors = [
      ".mod-scroll__intro",
      ".mod-scroll__materiality",
      ".mod-scroll__text",
      ".mod-scroll__images-text",
      ".mod-scroll__carousel",
      ".mod-scroll__terms",
      ".mod-scroll__projects",
      ".mod-title--chapter"
    ];

    const targetEl = document.querySelector(sectionSelectors[idx]);
    if (!targetEl) return;

    let targetY = 0;
    if (window.innerWidth > 991 && modScroll) {
      const scrollDistance = modScroll.scrollWidth - window.innerWidth;
      if (idx < 7) {
        targetY = Math.min(targetEl.offsetLeft, scrollDistance);
      } else {
        targetY = scrollDistance + 1200;
      }
    } else {
      targetY = targetEl.getBoundingClientRect().top + window.scrollY - 80;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  // Track mouse coordinates for floating preview
  const handleTermsMouseMove = (e) => {
    if (!termsRef.current) return;
    const rect = termsRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const currentMat = materialSpecs[activeMaterial];

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
          3. FIXED BOTTOM STORYTELLING CHAPTER HUD
         ------------------------------------------------------------------ */}
      <nav className="nib-story-hud" aria-label="Experience Chapters">
        {currentText.chapters.map((chapterName, idx) => (
          <button
            key={idx}
            type="button"
            className={`nib-story-hud__btn ${activeChapter === idx ? "is-active" : ""}`}
            onClick={() => jumpToChapter(idx)}
            title={`Glide to ${chapterName}`}
          >
            {chapterName}
          </button>
        ))}
      </nav>

      {/* ------------------------------------------------------------------
          4. MAIN HORIZONTAL SCROLL WRAPPER (.mod-scroll)
         ------------------------------------------------------------------ */}
      <main>
        <section className="mod-scroll" ref={modScrollRef}>
          {/* ===============================================================
              CHAPTER 0: INTRO MANIFESTO (.mod-scroll__intro bg-white)
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
              CHAPTER 1: PRIMARY IMAGES (.mod-scroll__images bg-white principal)
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
              NEW CHAPTER: MATERIALITY LABORATORY (.mod-scroll__materiality)
             =============================================================== */}
          <div className="mod-scroll__materiality">
            {/* Visual Column */}
            <div className="materiality__col-visual">
              <span className="materiality__visual-badge">
                {currentMat.name} // SPECIMEN 01
              </span>
              <img
                src={currentMat.image}
                alt={currentMat.name}
                key={activeMaterial}
                style={{ animation: "fadeIn 0.6s ease" }}
              />
            </div>

            {/* Narrative & Interactive Swatches Column */}
            <div className="materiality__col-content">
              <div className="materiality__eyebrow">{currentText.matEyebrow}</div>
              <h2 className="materiality__title">{currentText.matTitle}</h2>
              <p className="materiality__narrative">{currentText.matNarrative}</p>

              {/* Swatch Selector Buttons */}
              <div className="materiality__swatches">
                {Object.keys(materialSpecs).map((key) => {
                  const item = materialSpecs[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`material-swatch-btn ${activeMaterial === key ? "is-active" : ""}`}
                      onClick={() => setActiveMaterial(key)}
                    >
                      <span
                        className="swatch-color-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Technical Specimen Card */}
              <div className="materiality__spec-card">
                <div className="spec-item">
                  <span className="spec-label">{currentText.labelOrigin}</span>
                  <span className="spec-val">{currentMat.origin}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{currentText.labelDensity}</span>
                  <span className="spec-val">{currentMat.density}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{currentText.labelFinish}</span>
                  <span className="spec-val">{currentMat.finish}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{currentText.labelApplication}</span>
                  <span className="spec-val">{currentMat.application}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              CHAPTER 2: EDITORIAL TEXT (.mod-scroll__text bg-white)
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

                {/* Live Studio Telemetry Counters */}
                <div className="mod-scroll__text__telemetry">
                  <div className="telemetry-item">
                    <span className="telemetry-num">35,000</span>
                    <span className="telemetry-label">{currentText.telemetry1Label}</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-num">140+</span>
                    <span className="telemetry-label">{currentText.telemetry2Label}</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-num">0.5 MM</span>
                    <span className="telemetry-label">{currentText.telemetry3Label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              CHAPTER 3: DARK ATELIER (.mod-scroll__images-text bg-black c-white)
             =============================================================== */}
          <div className="mod-scroll__images-text bg-black c-white">
            <div className="wrapper" style={{ position: "relative" }}>
              {/* CAD Blueprint / Built Reality X-Ray Mode Toggle */}
              <div className="atelier-controls">
                <button
                  type="button"
                  className={`btn-blueprint-mode ${isBlueprintMode ? "is-active" : ""}`}
                  onClick={() => setIsBlueprintMode(!isBlueprintMode)}
                >
                  <FiLayers size={13} />
                  <span>
                    {isBlueprintMode ? currentText.btnBlueprintReality : currentText.btnBlueprintCad}
                  </span>
                </button>
              </div>

              {/* Dual flip media pair 1 */}
              <div className="mod-scroll__images-text__flip flipMedia flipMedia--rightLeft" style={{ position: "relative" }}>
                {isBlueprintMode && (
                  <div className="blueprint-overlay">
                    <span className="blueprint-tag">CAD DRAFTING // JOINERY BAY 03</span>
                    <span className="blueprint-tag">DETAIL: 45° MITRED CORNER • 0.5MM TOLERANCE</span>
                    <span className="blueprint-tag">CONCEALED HAFELE PIVOT AXIS</span>
                  </div>
                )}
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
              CHAPTER 4: VERTICAL CAROUSEL RIBBON (.mod-scroll__carousel)
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
              CHAPTER 5: SECONDARY MEDIA (.mod-scroll__images.secundario)
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
              CHAPTER 6: SPATIAL TENETS (.mod-scroll__terms bg-blue)
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
              CHAPTER 7: EXPANDING MONOLITHS (.mod-scroll__projects)
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

            {/* Project 1: Clifton Residence */}
            <div className="mod-scroll__projects__item bg-beige c-black">
              <div className="mod-scroll__projects__item__content">
                <button
                  type="button"
                  className="project-spec-toggle-btn"
                  onClick={() =>
                    setOpenSpecProjectIdx(openSpecProjectIdx === 0 ? null : 0)
                  }
                >
                  {openSpecProjectIdx === 0
                    ? currentText.btnHideSpec
                    : currentText.btnInspectSpec}
                </button>

                {openSpecProjectIdx === 0 && (
                  <div className="project-spec-drawer">
                    <div className="drawer-details-grid">
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specScope}</span>
                        <span className="drawer-val">{projectSpecs[0].scope}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specArea}</span>
                        <span className="drawer-val">{projectSpecs[0].area}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specTimeline}</span>
                        <span className="drawer-val">{projectSpecs[0].timeline}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specJoinery}</span>
                        <span className="drawer-val">{projectSpecs[0].joinery}</span>
                      </div>
                    </div>
                  </div>
                )}

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

            {/* Project 2: Myrtle House */}
            <div className="mod-scroll__projects__item bg-grey">
              <div className="mod-scroll__projects__item__content">
                <button
                  type="button"
                  className="project-spec-toggle-btn"
                  onClick={() =>
                    setOpenSpecProjectIdx(openSpecProjectIdx === 1 ? null : 1)
                  }
                >
                  {openSpecProjectIdx === 1
                    ? currentText.btnHideSpec
                    : currentText.btnInspectSpec}
                </button>

                {openSpecProjectIdx === 1 && (
                  <div className="project-spec-drawer">
                    <div className="drawer-details-grid">
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specScope}</span>
                        <span className="drawer-val">{projectSpecs[1].scope}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specArea}</span>
                        <span className="drawer-val">{projectSpecs[1].area}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specTimeline}</span>
                        <span className="drawer-val">{projectSpecs[1].timeline}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specJoinery}</span>
                        <span className="drawer-val">{projectSpecs[1].joinery}</span>
                      </div>
                    </div>
                  </div>
                )}

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

            {/* Project 3: OH Workplace */}
            <div className="mod-scroll__projects__item bg-blue">
              <div className="mod-scroll__projects__item__content">
                <button
                  type="button"
                  className="project-spec-toggle-btn"
                  onClick={() =>
                    setOpenSpecProjectIdx(openSpecProjectIdx === 2 ? null : 2)
                  }
                >
                  {openSpecProjectIdx === 2
                    ? currentText.btnHideSpec
                    : currentText.btnInspectSpec}
                </button>

                {openSpecProjectIdx === 2 && (
                  <div className="project-spec-drawer">
                    <div className="drawer-details-grid">
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specScope}</span>
                        <span className="drawer-val">{projectSpecs[2].scope}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specArea}</span>
                        <span className="drawer-val">{projectSpecs[2].area}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specTimeline}</span>
                        <span className="drawer-val">{projectSpecs[2].timeline}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specJoinery}</span>
                        <span className="drawer-val">{projectSpecs[2].joinery}</span>
                      </div>
                    </div>
                  </div>
                )}

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

            {/* Project 4: Juno Pavilion */}
            <div className="mod-scroll__projects__item bg-beige c-black">
              <div className="mod-scroll__projects__item__content">
                <button
                  type="button"
                  className="project-spec-toggle-btn"
                  onClick={() =>
                    setOpenSpecProjectIdx(openSpecProjectIdx === 3 ? null : 3)
                  }
                >
                  {openSpecProjectIdx === 3
                    ? currentText.btnHideSpec
                    : currentText.btnInspectSpec}
                </button>

                {openSpecProjectIdx === 3 && (
                  <div className="project-spec-drawer">
                    <div className="drawer-details-grid">
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specScope}</span>
                        <span className="drawer-val">{projectSpecs[3].scope}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specArea}</span>
                        <span className="drawer-val">{projectSpecs[3].area}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specTimeline}</span>
                        <span className="drawer-val">{projectSpecs[3].timeline}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specJoinery}</span>
                        <span className="drawer-val">{projectSpecs[3].joinery}</span>
                      </div>
                    </div>
                  </div>
                )}

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

            {/* Project 5: The Master Atelier (Last Item) */}
            <div className="mod-scroll__projects__item last-item bg-grey">
              <div className="mod-scroll__projects__item__content">
                <button
                  type="button"
                  className="project-spec-toggle-btn"
                  onClick={() =>
                    setOpenSpecProjectIdx(openSpecProjectIdx === 4 ? null : 4)
                  }
                >
                  {openSpecProjectIdx === 4
                    ? currentText.btnHideSpec
                    : currentText.btnInspectSpec}
                </button>

                {openSpecProjectIdx === 4 && (
                  <div className="project-spec-drawer">
                    <div className="drawer-details-grid">
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specScope}</span>
                        <span className="drawer-val">{projectSpecs[4].scope}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specArea}</span>
                        <span className="drawer-val">{projectSpecs[4].area}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specTimeline}</span>
                        <span className="drawer-val">{projectSpecs[4].timeline}</span>
                      </div>
                      <div className="drawer-item">
                        <span className="drawer-label">{currentText.specJoinery}</span>
                        <span className="drawer-val">{projectSpecs[4].joinery}</span>
                      </div>
                    </div>
                  </div>
                )}

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
            EPILOGUE: UNPINNED VERTICAL FINALE & BESPOKE COMMISSION
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

        {/* Interactive Commission Scope Selector */}
        <section className="mod-content wrapper mod-content--cols bg-beige c-black">
          <div className="mod-content__col big_text">
            <p>{currentText.finaleParagraph}</p>
            
            <div className="commission-selector">
              <div className="commission-pills">
                <button
                  type="button"
                  className={`commission-pill-btn ${activeCommissionType === "residential" ? "is-active" : ""}`}
                  onClick={() => setActiveCommissionType("residential")}
                >
                  {currentText.commResidential}
                </button>
                <button
                  type="button"
                  className={`commission-pill-btn ${activeCommissionType === "corporate" ? "is-active" : ""}`}
                  onClick={() => setActiveCommissionType("corporate")}
                >
                  {currentText.commCorporate}
                </button>
                <button
                  type="button"
                  className={`commission-pill-btn ${activeCommissionType === "hospitality" ? "is-active" : ""}`}
                  onClick={() => setActiveCommissionType("hospitality")}
                >
                  {currentText.commHospitality}
                </button>
                <button
                  type="button"
                  className={`commission-pill-btn ${activeCommissionType === "millwork" ? "is-active" : ""}`}
                  onClick={() => setActiveCommissionType("millwork")}
                >
                  {currentText.commMillwork}
                </button>
              </div>

              <div className="commission-guidance-card">
                {activeCommissionType === "residential" && currentText.guidanceResidential}
                {activeCommissionType === "corporate" && currentText.guidanceCorporate}
                {activeCommissionType === "hospitality" && currentText.guidanceHospitality}
                {activeCommissionType === "millwork" && currentText.guidanceMillwork}
              </div>
            </div>

            <p style={{ marginTop: "1.5rem" }}>
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

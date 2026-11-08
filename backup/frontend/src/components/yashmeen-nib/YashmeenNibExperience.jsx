import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  FiArrowRight,
  FiRotateCcw,
  FiLayers,
  FiMaximize2,
  FiX,
  FiGrid,
  FiSliders,
  FiCompass,
  FiVolume2,
  FiVolumeX
} from "react-icons/fi";
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

  // Floating Dynamic Nav & Soundscape States
  const [navDockPosition, setNavDockPosition] = useState("top"); // "top" | "bottom"
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  const containerRef = useRef(null);
  const backdropRef = useRef(null);
  const timelineRef = useRef(null);
  const modScrollRef = useRef(null);
  const termsRef = useRef(null);
  const headerLogoRef = useRef(null);
  const lenisRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

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

      // Chapter 4: Values & Pillars
      carouselText: "VALUES",
      valEyebrow: "ACT II // ARCHITECTURAL PILLARS",
      valTitle: "DISCIPLINE BEYOND AESTHETICS",
      pillar1Title: "HONESTY OF MATTER",
      pillar1Desc:
        "European certified quarries, kiln-dried solid hardwoods and architectural bronze alloys. Zero simulated veneers or hollow substrates.",
      pillar2Title: "SUB-MILLIMETER DISCIPLINE",
      pillar2Desc:
        "0.5mm shadow gaps engineered with 5-axis German CNC milling and concealed German pivot hardware.",
      pillar3Title: "SINGLE-SOURCE INTEGRITY",
      pillar3Desc:
        "From raw timber intake in our 35,000 sq.ft Al Quoz atelier to white-glove site delivery with complete accountability.",

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
      footerTagline: "BESPOKE INTERIORS & ARCHITECTURAL FIT-OUT • DUBAI, UAE",

      // Interactive Navigation & Drawer
      navExplore: "INDEX",
      navScrubber: "JOURNEY TIMELINE",
      navDockTop: "DOCK TOP",
      navDockBottom: "DOCK BOTTOM",
      navSoundOn: "AMBIENCE ON",
      navSoundOff: "AMBIENCE OFF",
      navBlueprintOn: "CAD WIREFRAME",
      navBlueprintOff: "BUILT REALITY",
      navClose: "CLOSE ×",
      navJump: "Glide to chapter",
      chapterSub0: "Considered Spaces That Challenge The Ordinary",
      chapterSub1: "The Alchemy of Raw Substance & European Quarries",
      chapterSub2: "Spaces That Invite Stillness & Architectural Discipline",
      chapterSub3: "Bespoke Joinery Bay & 5-Axis Precision Engineering",
      chapterSub4: "Sub-Millimeter Tolerances & Single-Source Integrity",
      chapterSub5: "Spatial Elegance, Authenticity & Pragmatic Function",
      chapterSub6: "Monolithic Residences & Bespoke Architectural Volumes",
      chapterSub7: "Exclusivity in Its Highest Expression & Private Inquiry"
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

      // Chapter 4: Values & Pillars
      carouselText: "VALORES",
      valEyebrow: "ACTO II // PILARES ARQUITECTÓNICOS",
      valTitle: "DISCIPLINA MÁS ALLÁ DE LA ESTÉTICA",
      pillar1Title: "HONESTIDAD DE LA MATERIA",
      pillar1Desc:
        "Canteras europeas certificadas, maderas nobles secadas al horno y aleaciones de bronce. Cero acabados simulados ni laminados huecos.",
      pillar2Title: "DISCIPLINA SUBMILIMÉTRICA",
      pillar2Desc:
        "Frisos de sombra de 0,5 mm mecanizados con CNC alemán de 5 ejes y herrajes pivotantes ocultos alemanes.",
      pillar3Title: "INTEGRIDAD DE FUENTE ÚNICA",
      pillar3Desc:
        "Desde la recepción de madera en nuestro taller de 35.000 sq.ft en Al Quoz hasta la instalación final sin intermediarios.",

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
      footerTagline: "INTERIORES A MEDIDA Y CONTRATACIÓN ARQUITECTÓNICA • DUBÁI, EAU",

      // Interactive Navigation & Drawer
      navExplore: "ÍNDICE",
      navScrubber: "TIMELINE DE VIAJE",
      navDockTop: "ANCLAR ARRIBA",
      navDockBottom: "ANCLAR ABAJO",
      navSoundOn: "AMBIENTE ON",
      navSoundOff: "AMBIENTE OFF",
      navBlueprintOn: "CAD WIREFRAME",
      navBlueprintOff: "REALIDAD CONSTRUIDA",
      navClose: "CERRAR ×",
      navJump: "Desplazarse al capítulo",
      chapterSub0: "Espacios Considerados Que Desafían Lo Ordinario",
      chapterSub1: "La Alquimia de la Materia Prima y Canteras Europeas",
      chapterSub2: "Espacios Que Invitan a la Quietud y Disciplina",
      chapterSub3: "Taller de Ebanistería y Precisión CNC de 5 Ejes",
      chapterSub4: "Tolerancias Submilimétricas e Integridad Integral",
      chapterSub5: "Elegancia Espacial, Autenticidad y Función Pragmática",
      chapterSub6: "Residencias Monolíticas y Volúmenes Arquitectónicos",
      chapterSub7: "Exclusividad en su Máxima Expresión y Consulta Privada"
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
      image: "/static/raw-space.jpg",
      specCode: "SPEC-TRV-091",
      gps: "41.9028° N, 12.4964° E",
      color: "#d9cec1"
    },
    oak: {
      name: currentText.matOak,
      origin: lang === "en" ? "Tronçais Forest, France" : "Bosque de Tronçais, Francia",
      finish: lang === "en" ? "Smoked Natural Tannin & Wire-Brushed" : "Tanino Ahumado y Cepillado Natural",
      density: "740 kg/m³ • FAS Prime",
      application:
        lang === "en"
          ? "Floor-to-Ceiling Pivot Portals & Fluted Wall Paneling"
          : "Puertas Pivotantes de Suelo a Techo y Panelado Alistonado",
      image: "/static/Custom-Furniture.jpg",
      specCode: "SPEC-OAK-044",
      gps: "46.6667° N, 2.7167° E",
      color: "#c2ab87"
    },
    bronze: {
      name: currentText.matBronze,
      origin: lang === "en" ? "Bespoke Foundry Architectural Alloy" : "Aleación de Fundición Arquitectónica",
      finish: lang === "en" ? "Hand-Rubbed Sulfur Liver Patina" : "Pátina de Sulfuro Pulida a Mano",
      density: "8,730 kg/m³ • Solid Alloy",
      application:
        lang === "en"
          ? "Concealed Edge Pulls, Shadow Gap Trims & Pivot Hinges"
          : "Tiradores Embutidos, Perfiles de Junta Oculta y Bisagras",
      image: "/static/why-us.jpg",
      specCode: "SPEC-BRZ-118",
      gps: "25.1319° N, 55.2348° E",
      color: "#a4824d"
    },
    walnut: {
      name: currentText.matWalnut,
      origin: lang === "en" ? "Appalachian Valley, USA" : "Valle de los Apalaches, EE.UU.",
      finish: lang === "en" ? "CNC 6mm Radial Flute & Natural Matte Oil" : "Ranurado CNC 6mm y Aceite Mate Natural",
      density: "660 kg/m³ • First Grade",
      application:
        lang === "en"
          ? "Acoustic Slatted Wall Cladding & Executive Desk Suites"
          : "Revestimiento Acústico Alistonado y Despachos Ejecutivos",
      image: "/static/yashmeen-studio.jpg",
      specCode: "SPEC-WLN-073",
      gps: "37.9268° N, 79.5594° W",
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

    const skewSetter = gsap.quickSetter(modScroll, "skewX", "deg");
    const clampSkew = gsap.utils.clamp(-2.5, 2.5);
    let proxySkew = { skew: 0 };

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
        setScrollPercent(Math.round(self.progress * 100));

        // Spatial Velocity Skew Inertia
        const vel = self.getVelocity();
        const skew = clampSkew(vel / -300);
        if (Math.abs(skew) > Math.abs(proxySkew.skew)) {
          proxySkew.skew = skew;
          gsap.to(proxySkew, {
            skew: 0,
            duration: 0.8,
            ease: "power3",
            overwrite: true,
            onUpdate: () => skewSetter(proxySkew.skew)
          });
        }

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

    // ------------------------------------------------------------------------
    // MULTI-AXIS VERTICAL PARALLAX & COUNTER-SCROLL CHOREOGRAPHY
    // ------------------------------------------------------------------------

    // 1. Vertical Counter-Scrolling Flip Media (Defining hallmark of reference)
    const flipMediaDownList = modScroll.querySelectorAll(".flipMedia__media--down");
    flipMediaDownList.forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -18 },
        {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: el.closest(".flipMedia") || el,
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.5
          }
        }
      );
    });

    const flipMediaUpList = modScroll.querySelectorAll(".flipMedia__media--up");
    flipMediaUpList.forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: 18 },
        {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: el.closest(".flipMedia") || el,
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.5
          }
        }
      );
    });

    // 2. Chapter 0: Intro Vertical-to-Horizontal Aperture Elevation Shift
    const introTitles = modScroll.querySelectorAll(".mod-scroll__intro__wrap-titles .mod-scroll__intro__title");
    if (introTitles.length >= 3) {
      gsap.to(introTitles[0], {
        yPercent: -24,
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: ".mod-scroll__intro",
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0.5
        }
      });
      gsap.to(introTitles[1], {
        yPercent: 28,
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: ".mod-scroll__intro",
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0.5
        }
      });
      gsap.to(introTitles[2], {
        yPercent: -32,
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: ".mod-scroll__intro",
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0.5
        }
      });
    }

    // Intro wrapper elevation retreat
    gsap.to(".mod-scroll__intro > .wrapper", {
      yPercent: -14,
      scale: 0.94,
      ease: "none",
      scrollTrigger: {
        containerAnimation: scrollTl,
        trigger: ".mod-scroll__intro",
        start: "0% 0%",
        end: "100% 0%",
        scrub: 0.5
      }
    });

    // 3. Chapter 1: Primary Images Scrub (Ascending from below into horizontal rail)
    gsap.fromTo(
      ".mod-scroll__images.principal",
      { y: "10vh" },
      {
        y: "-5vh",
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTl,
          trigger: ".mod-scroll__images.principal",
          start: "0% 100%",
          end: "100% 0%",
          scrub: 0.6
        }
      }
    );

    const singleImg = modScroll.querySelector(".mod-scroll__images__image-single");
    if (singleImg) {
      gsap.fromTo(
        singleImg,
        { x: "-15vw", y: "-6vh" },
        {
          x: "0vw",
          y: "6vh",
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

    // 4. Chapter 1: Materiality Specimen Vertical Float & Narrative Glide
    const matVisual = modScroll.querySelector(".materiality__col-visual-shell");
    const matContent = modScroll.querySelector(".materiality__col-content");
    if (matVisual && matContent) {
      gsap.fromTo(
        matVisual,
        { y: "9vh", scale: 0.96 },
        {
          y: "-9vh",
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__materiality",
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.8
          }
        }
      );
      gsap.fromTo(
        matContent,
        { y: "-6vh" },
        {
          y: "6vh",
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__materiality",
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.8
          }
        }
      );
    }

    // 5. Chapter 2: Studio Manifesto Editorial Typography Wave & Floating Telemetry
    const textLines = modScroll.querySelectorAll(".mod-scroll__text__title .line");
    textLines.forEach((line, idx) => {
      const yDist = (idx % 2 === 0 ? -1 : 1) * (7 + idx * 3);
      gsap.fromTo(
        line,
        { y: `${yDist}vh` },
        {
          y: `${-yDist}vh`,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__text",
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.6
          }
        }
      );
    });

    const telemetryItems = modScroll.querySelectorAll(".telemetry-item");
    telemetryItems.forEach((tItem, idx) => {
      gsap.fromTo(
        tItem,
        { y: idx === 1 ? "-5vh" : "5vh" },
        {
          y: idx === 1 ? "5vh" : "-5vh",
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__text",
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.6
          }
        }
      );
    });

    // 6. Chapter 3: Dark Atelier 3D Perspective Rotation & Iris Shutter
    const darkAtelier = modScroll.querySelector(".mod-scroll__images-text");
    if (darkAtelier) {
      gsap.fromTo(
        darkAtelier,
        { rotateY: -8, scale: 0.94, clipPath: "inset(4% 0% 4% 0%)", transformOrigin: "left center" },
        {
          rotateY: 0,
          scale: 1.0,
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "power2.out",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: darkAtelier,
            start: "0% 95%",
            end: "35% 50%",
            scrub: 0.5
          }
        }
      );
    }

    const atelierText = modScroll.querySelector(".mod-scroll__images-text__text");
    if (atelierText) {
      gsap.fromTo(
        atelierText,
        { y: "7vh" },
        {
          y: "-7vh",
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: atelierText,
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.5
          }
        }
      );
    }

    // 7. Chapter 4: Values Vertical Ribbon Ticker & 3D Tectonic Pillar Stacking
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

    const valueCards = modScroll.querySelectorAll(".value-card");
    if (valueCards.length >= 3) {
      gsap.fromTo(
        valueCards[0],
        { y: "24vh", rotateZ: -2, scale: 0.92 },
        {
          y: "-4vh",
          rotateZ: 0,
          scale: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__carousel",
            start: "0% 95%",
            end: "65% 35%",
            scrub: 0.6
          }
        }
      );
      gsap.fromTo(
        valueCards[1],
        { y: "-22vh", scale: 0.94 },
        {
          y: "6vh",
          scale: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__carousel",
            start: "0% 95%",
            end: "75% 35%",
            scrub: 0.6
          }
        }
      );
      gsap.fromTo(
        valueCards[2],
        { y: "26vh", rotateZ: 2, scale: 0.92 },
        {
          y: "-6vh",
          rotateZ: 0,
          scale: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: ".mod-scroll__carousel",
            start: "0% 95%",
            end: "85% 35%",
            scrub: 0.6
          }
        }
      );
    }

    // 8. Chapter 5: Spatial Tenets Dual-Axis Counter-Flow in Deep Slate
    const terms = modScroll.querySelectorAll(".mod-scroll__terms__term");
    if (terms.length >= 3) {
      gsap.fromTo(
        terms[0],
        { paddingLeft: "4vw", y: "-18vh", opacity: 0.7 },
        {
          paddingLeft: "14vw",
          y: "18vh",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: terms[0],
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.8
          }
        }
      );
      gsap.fromTo(
        terms[1],
        { paddingRight: "10vw", y: "20vh", opacity: 0.7 },
        {
          paddingRight: "2vw",
          y: "-20vh",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: terms[1],
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.8
          }
        }
      );
      gsap.fromTo(
        terms[2],
        { paddingLeft: "6vw", y: "-22vh", opacity: 0.7 },
        {
          paddingLeft: "22vw",
          y: "22vh",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            containerAnimation: scrollTl,
            trigger: terms[2],
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0.8
          }
        }
      );
    }

    // 9. Chapter 6: Expanding Monolith Cards & Vertical Image Parallax
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
          { height: "87vh", yPercent: idx % 2 === 0 ? -12 : 12, scale: 1.08 },
          {
            height: "66vh",
            yPercent: idx % 2 === 0 ? 12 : -12,
            scale: 1.0,
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

      const titleBlock = item.querySelector(".mod-scroll__projects__item__text");
      if (titleBlock) {
        gsap.fromTo(
          titleBlock,
          { y: "5vh", opacity: 0.7 },
          {
            y: "0vh",
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              containerAnimation: scrollTl,
              trigger: item,
              start: "0% 70%",
              end: "100% 30%",
              scrub: 0.4
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

  // Procedural Web Audio Soundscape Synthesizer
  const toggleSound = useCallback(() => {
    if (isSoundOn) {
      if (gainNodeRef.current && audioCtxRef.current) {
        try {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.4);
          setTimeout(() => {
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
              audioCtxRef.current.suspend();
            }
          }, 450);
        } catch (e) {
          console.warn("Sound ramp error", e);
        }
      }
      setIsSoundOn(false);
    } else {
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;

          // Warm 55Hz architectural drone + 110Hz harmonic
          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(55, ctx.currentTime);

          const osc2 = ctx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(110, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(240, ctx.currentTime);

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gainNodeRef.current = masterGain;

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(masterGain);
          masterGain.connect(ctx.destination);

          osc1.start();
          osc2.start();
        }

        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.06, audioCtxRef.current.currentTime + 0.6);
        }
        setIsSoundOn(true);
      } catch (err) {
        console.warn("AudioContext error", err);
      }
    }
  }, [isSoundOn]);

  // Cleanup Web Audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Escape key closes chapter index drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsNavExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Interactive scrubber click handler
  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const modScroll = modScrollRef.current;
    if (!modScroll) return;
    const totalScroll = modScroll.scrollWidth - window.innerWidth + 1200;
    const targetY = ratio * totalScroll;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const chapterData = [
    { num: "01", name: currentText.chapters[0], image: "/static/hero-editorial.png", subtitle: currentText.chapterSub0 },
    { num: "02", name: currentText.chapters[1], image: "/static/raw-space.jpg", subtitle: currentText.chapterSub1 },
    { num: "03", name: currentText.chapters[2], image: "/static/yashmeen-studio.jpg", subtitle: currentText.chapterSub2 },
    { num: "04", name: currentText.chapters[3], image: "/static/joinery-bay.jpg", subtitle: currentText.chapterSub3 },
    { num: "05", name: currentText.chapters[4], image: "/static/Residential-Fit-Out.jpg", subtitle: currentText.chapterSub4 },
    { num: "06", name: currentText.chapters[5], image: "/static/work-clifton.jpg", subtitle: currentText.chapterSub5 },
    { num: "07", name: currentText.chapters[6], image: "/static/work-myrtle.jpg", subtitle: currentText.chapterSub6 },
    { num: "08", name: currentText.chapters[7], image: "/static/hero-cinematic.jpg", subtitle: currentText.chapterSub7 }
  ];

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
          3. FLOATING ARCHITECTURAL DYNAMIC NAV & SCRUBBER (REPLACES STATIC HUD)
         ------------------------------------------------------------------ */}
      <div
        className={`nib-dynamic-nav ${
          navDockPosition === "top" ? "is-dock-top" : "is-dock-bottom"
        } ${isNavExpanded ? "is-expanded" : ""} ${
          isHeaderDark ? "theme-dark-active" : ""
        }`}
      >
        {/* Floating Capsule Bar */}
        <div className="dynamic-nav__capsule">
          {/* Chapter Compass & Circular Progress Ring */}
          <button
            type="button"
            className="nav-capsule__chapter-indicator"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            title="Open Chapter Index"
          >
            <div className="nav-capsule__ring-wrap">
              <svg className="nav-ring-svg" viewBox="0 0 36 36">
                <circle className="nav-ring-bg" cx="18" cy="18" r="15.915" />
                <circle
                  className="nav-ring-val"
                  cx="18"
                  cy="18"
                  r="15.915"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - scrollPercent}
                />
              </svg>
              <span className="nav-ring-label">{activeChapter + 1}</span>
            </div>

            <div className="nav-capsule__meta">
              <span className="nav-capsule__chapter-num">0{activeChapter + 1} / 08</span>
              <span className="nav-capsule__chapter-title">
                {currentText.chapters[activeChapter]?.replace(/^\d+\s*/, "")}
              </span>
            </div>
          </button>

          {/* Live Scroll Percentage Tag */}
          <div className="nav-capsule__pct-chip">
            <span>{scrollPercent}%</span>
          </div>

          {/* Procedural Web Audio Soundscape Toggle */}
          <button
            type="button"
            className={`nav-capsule__btn ${isSoundOn ? "is-active" : ""}`}
            onClick={toggleSound}
            title={isSoundOn ? currentText.navSoundOff : currentText.navSoundOn}
          >
            <div className={`nav-sound-wave ${isSoundOn ? "is-playing" : ""}`}>
              <span className="wave-bar bar-1" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-3" />
              <span className="wave-bar bar-4" />
            </div>
            <span className="btn-label">{isSoundOn ? "AMBIENCE" : "MUTED"}</span>
          </button>

          {/* CAD Blueprint / Built Reality X-Ray Switch */}
          <button
            type="button"
            className={`nav-capsule__btn ${isBlueprintMode ? "is-active" : ""}`}
            onClick={() => setIsBlueprintMode(!isBlueprintMode)}
            title={isBlueprintMode ? currentText.navBlueprintOff : currentText.navBlueprintOn}
          >
            <FiLayers size={12} />
            <span className="btn-label">{isBlueprintMode ? "REALITY" : "X-RAY"}</span>
          </button>

          {/* Dock Position Switcher: Top vs Bottom */}
          <button
            type="button"
            className="nav-capsule__btn nav-capsule__dock-btn"
            onClick={() => setNavDockPosition(navDockPosition === "top" ? "bottom" : "top")}
            title={`Flip Docking to ${navDockPosition === "top" ? "Bottom" : "Top"}`}
          >
            <FiSliders size={12} />
            <span className="btn-label">{navDockPosition === "top" ? "DOCK ↓" : "DOCK ↑"}</span>
          </button>

          {/* Chapter Index Trigger */}
          <button
            type="button"
            className="nav-capsule__btn nav-capsule__index-trigger"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            title={isNavExpanded ? currentText.navClose : currentText.navExplore}
          >
            <FiGrid size={12} />
            <span className="btn-label">{isNavExpanded ? currentText.navClose : currentText.navExplore}</span>
          </button>
        </div>

        {/* Expanded Architectural Chapter Drawer & Scrubber Overlay */}
        {isNavExpanded && (
          <div className="nib-nav-drawer">
            <div className="drawer-inner">
              {/* Scrubber Header Bar */}
              <div className="drawer-scrubber-header">
                <div className="scrubber-title-wrap">
                  <span className="scrubber-eyebrow">ARCHITECTURAL JOURNEY</span>
                  <span className="scrubber-title">{currentText.navScrubber}</span>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setIsNavExpanded(false)}
                >
                  <FiX size={15} />
                  <span>{currentText.navClose}</span>
                </button>
              </div>

              {/* High-Precision Interactive Scrubber Track */}
              <div
                className="interactive-scrubber-track"
                onClick={handleScrubberClick}
                title="Click anywhere to glide"
              >
                <div
                  className="scrubber-fill"
                  style={{ width: `${scrollPercent}%` }}
                />
                <div
                  className="scrubber-handle"
                  style={{ left: `${scrollPercent}%` }}
                >
                  <span className="scrubber-handle-tag">{scrollPercent}%</span>
                </div>

                <div className="scrubber-ticks">
                  {currentText.chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className={`scrubber-tick ${activeChapter === idx ? "is-active" : ""}`}
                      style={{ left: `${(idx / 7) * 100}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToChapter(idx);
                        setIsNavExpanded(false);
                      }}
                    >
                      <span className="tick-mark" />
                      <span className="tick-label">0{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8 Architectural Chapter Bento Cards */}
              <div className="drawer-chapters-grid">
                {chapterData.map((ch, idx) => (
                  <div
                    key={idx}
                    className={`drawer-chapter-card ${activeChapter === idx ? "is-current" : ""}`}
                    onClick={() => {
                      jumpToChapter(idx);
                      setIsNavExpanded(false);
                    }}
                  >
                    <div className="card-thumb-wrap">
                      <img src={ch.image} alt={ch.name} className="card-thumb-img" />
                      <span className="card-num-badge">{ch.num}</span>
                      {activeChapter === idx && (
                        <span className="card-live-badge">VIEWING</span>
                      )}
                    </div>
                    <div className="card-body">
                      <h4 className="card-title">{ch.name}</h4>
                      <p className="card-subtitle">{ch.subtitle}</p>
                      <span className="card-jump-link">
                        <span>{currentText.navJump}</span>
                        <FiArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
            {/* Visual Column: Double-Bezel Specimen Frame */}
            <div className="materiality__col-visual-shell">
              <div className="materiality__col-visual">
                <div className="materiality__visual-top-bar">
                  <span className="materiality__visual-badge">
                    {currentMat.name} // {currentMat.specCode}
                  </span>
                  <span className="materiality__visual-gps">
                    {currentMat.gps}
                  </span>
                </div>

                <img
                  src={currentMat.image}
                  alt={currentMat.name}
                  key={activeMaterial}
                  className="materiality__specimen-img"
                />

                <div className="materiality__visual-bottom-bar">
                  <span className="materiality__visual-finish-tag">
                    {currentMat.finish}
                  </span>
                  <span className="materiality__visual-inspect-btn">
                    <FiMaximize2 size={11} />
                    <span>TACTILE SPECIMEN</span>
                  </span>
                </div>
              </div>
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
                    <div className="telemetry-top">
                      <span className="telemetry-num">35,000</span>
                      <span className="telemetry-unit">SQ.FT</span>
                    </div>
                    <span className="telemetry-label">{currentText.telemetry1Label}</span>
                  </div>
                  <div className="telemetry-item">
                    <div className="telemetry-top">
                      <span className="telemetry-num">140+</span>
                      <span className="telemetry-unit">ARTISANS</span>
                    </div>
                    <span className="telemetry-label">{currentText.telemetry2Label}</span>
                  </div>
                  <div className="telemetry-item">
                    <div className="telemetry-top">
                      <span className="telemetry-num">0.5</span>
                      <span className="telemetry-unit">MM</span>
                    </div>
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
                    <div className="blueprint-grid-fx" />
                    <div className="blueprint-header-bar">
                      <span className="blueprint-tag">CAD DRAFTING // JOINERY BAY 03</span>
                      <span className="blueprint-tag">TOLERANCE ±0.5MM</span>
                    </div>

                    <div className="blueprint-callout-pin" style={{ top: "26%", left: "22%" }}>
                      <span className="pin-reticle" />
                      <span className="pin-text">01 // 45° MITERED SHADOW GAP</span>
                    </div>

                    <div className="blueprint-callout-pin" style={{ top: "52%", left: "62%" }}>
                      <span className="pin-reticle" />
                      <span className="pin-text">02 // HAFELE CONCEALED PIVOT</span>
                    </div>

                    <div className="blueprint-callout-pin" style={{ top: "78%", left: "30%" }}>
                      <span className="pin-reticle" />
                      <span className="pin-text">03 // KILN-DRIED SOLID SUBSTRATE</span>
                    </div>

                    <div className="blueprint-footer-bar">
                      <span>SHOP DRAWING #YASH-2026-B3</span>
                      <span>5-AXIS CNC ROUTER CALIBRATED</span>
                    </div>
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
              CHAPTER 4: ARCHITECTURAL VALUES GALLERY (.mod-scroll__carousel)
             =============================================================== */}
          <div className="mod-scroll__carousel bg-beige c-black">
            {/* Left: Iconic Kinetic Ribbon */}
            <div className="values__ribbon">
              <div className="mod-scroll__carousel__content t-supertitulo-l">
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

            {/* Right: 3 Architectural Pillars Bento */}
            <div className="values__pillars-container">
              <div className="values__header">
                <span className="values__eyebrow">{currentText.valEyebrow}</span>
                <h3 className="values__title">{currentText.valTitle}</h3>
              </div>

              <div className="values__grid">
                <div className="value-card">
                  <div className="value-card__header">
                    <span className="value-card__idx">01</span>
                    <span className="value-card__badge">100% SOLID SUBSTANCE</span>
                  </div>
                  <h4 className="value-card__title">{currentText.pillar1Title}</h4>
                  <p className="value-card__desc">{currentText.pillar1Desc}</p>
                </div>

                <div className="value-card">
                  <div className="value-card__header">
                    <span className="value-card__idx">02</span>
                    <span className="value-card__badge">±0.5MM PRECISION</span>
                  </div>
                  <h4 className="value-card__title">{currentText.pillar2Title}</h4>
                  <p className="value-card__desc">{currentText.pillar2Desc}</p>
                </div>

                <div className="value-card">
                  <div className="value-card__header">
                    <span className="value-card__idx">03</span>
                    <span className="value-card__badge">SINGLE-SOURCE</span>
                  </div>
                  <h4 className="value-card__title">{currentText.pillar3Title}</h4>
                  <p className="value-card__desc">{currentText.pillar3Desc}</p>
                </div>
              </div>
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
              CHAPTER 6: SPATIAL TENETS (.mod-scroll__terms bg-blue c-white)
             =============================================================== */}
          <div
            className="mod-scroll__terms follow__wrap bg-blue c-white"
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
            <div className="mod-scroll__projects__item bg-blue c-white">
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

            {/* Section 8: Closing Cierre (.mod-scroll__cierre bg-red c-white) */}
            <div className="mod-scroll__cierre bg-red c-white">
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

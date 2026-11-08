import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { FiArrowRight, FiRotateCcw, FiX } from "react-icons/fi";
import "../../styles/yashmeen-nib.css";

// Register GreenSock ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function YashmeenNibExperience() {
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState("en"); // "en" | "es"
  const [isPreloading, setIsPreloading] = useState(true);
  const [isHeaderDark, setIsHeaderDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenuProject, setHoveredMenuProject] = useState(0);
  const [hoveredTerm, setHoveredTerm] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  const containerRef = useRef(null);
  const backdropRef = useRef(null);
  const modScrollRef = useRef(null);
  const headerLogoRef = useRef(null);
  const menuRef = useRef(null);
  const menuBgRef = useRef(null);
  const lenisRef = useRef(null);
  const timelineRef = useRef(null);

  // Bilingual text dictionary
  const texts = {
    en: {
      navStudio: "STUDIO",
      navProjects: "PROJECTS",
      navContact: "CONTACT",
      sectionHome: "Home",
      copyright: "YASHMEEN FIT-OUT CONTRACTING ©2026",

      // Menu Navigation
      menuTitle: "DISCOVER YASHMEEN",
      menuClose: "CLOSE",
      menuOpen: "MENÚ",
      menuItems: [
        { label: "01 ORIGIN", anchor: "#intro" },
        { label: "02 THE STUDIO", anchor: "#studio" },
        { label: "03 THE ATELIER", anchor: "#atelier" },
        { label: "04 VALUES", anchor: "#values" },
        { label: "05 TENETS", anchor: "#tenets" },
        { label: "06 MONOLITHS", anchor: "#projects" },
        { label: "07 COMMISSION", anchor: "#commission" }
      ],
      menuViewAll: "Explore Portfolio",
      menuExploreTag: "Inspect",

      // Hero Intro
      line1_a: "CONSIDERED",
      line1_b: "SPACES",
      line2_a: "THAT",
      line2_b: "CHALLENGE",
      line3_lead: "THE",
      line3_climax: "ORDINARY",
      heroCopy:
        "In a world where everything has become disposable, Yashmeen builds interiors to endure. Bespoke joinery from our 35,000 sq.ft Al Quoz atelier, architectural engineering and single-source certainty.",

      // Chapter 2: Studio Manifesto
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
        "At Yashmeen, we shape spaces that stand apart through bespoke joinery craftsmanship and disciplined execution. Contemporary volumes, tactile materiality, open to light. Environments that elevate daily life with permanence and genuine emotion.",

      // Chapter 4: Values Ribbon
      carouselText: "VALUES",

      // Chapter 5: Tenets
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
        "Luxury is neither shouted nor driven by fleeting trends: it is single-source architectural certainty.",
      btnInspectSpec: "Inspect Monolith →",

      proj1Title: "PALM JUMEIRAH VILLA",
      proj1Year: "2025",
      proj1Loc: "PALM JUMEIRAH",
      proj1Num: "01",
      proj2Title: "EMIRATES HILLS ESTATE",
      proj2Year: "2025",
      proj2Loc: "EMIRATES HILLS",
      proj2Num: "02",
      proj3Title: "AL QUOZ MASTER ATELIER",
      proj3Year: "2024",
      proj3Loc: "INDUSTRIAL AREA 4",
      proj3Num: "03",
      proj4Title: "DIFC EXECUTIVE SUITE",
      proj4Year: "2025",
      proj4Loc: "FINANCIAL CENTER",
      proj4Num: "04",
      proj5Title: "JUMEIRAH BAY PENTHOUSE",
      proj5Year: "2026",
      proj5Loc: "PRIVATE ISLAND",
      proj5Num: "05",

      // Chapter 7: Unpinned Vertical Finale
      finaleChapter: "(08 Commission)",
      finaleTitle: "CRAFTING THE EXCEPTIONAL",
      finaleSubtitle: "SINGLE-SOURCE FIT-OUT & JOINERY CERTAINTY",
      finaleCol1:
        "From raw timber intake in our 35,000 sq.ft Al Quoz atelier to turnkey handover on site, Yashmeen integrates every discipline under one roof. We eliminate subcontractors, preserve tolerances, and ensure absolute fidelity to your architectural vision.",
      finaleCol2:
        "Our master artisans operate German 5-axis CNC machinery alongside hand-planed joinery traditions, achieving 0.5mm shadow gaps, book-matched marble veins, and lifetime structural durability for the region's most ambitious spaces.",
      finaleCta: "START YOUR COMMISSION",
      footerTagline: "BESPOKE INTERIORS & ARCHITECTURAL FIT-OUT • DUBAI, UAE",
      footerAddress: "Atelier: Street 18, Al Quoz Industrial 4, Dubai, UAE",
      footerPhone: "+971 4 338 0000",
      footerEmail: "inquiries@yashmeen.ae"
    },
    es: {
      navStudio: "ESTUDIO",
      navProjects: "PROYECTOS",
      navContact: "CONTACTO",
      sectionHome: "Inicio",
      copyright: "YASHMEEN CONTRATACIÓN DE INTERIORES ©2026",

      // Menu Navigation
      menuTitle: "DESCUBRE YASHMEEN",
      menuClose: "CERRAR",
      menuOpen: "MENÚ",
      menuItems: [
        { label: "01 ORIGEN", anchor: "#intro" },
        { label: "02 EL ESTUDIO", anchor: "#studio" },
        { label: "03 EL ATELIER", anchor: "#atelier" },
        { label: "04 VALORES", anchor: "#values" },
        { label: "05 PRINCIPIOS", anchor: "#tenets" },
        { label: "06 MONOLITOS", anchor: "#projects" },
        { label: "07 COMISIÓN", anchor: "#commission" }
      ],
      menuViewAll: "Ver Portafolio",
      menuExploreTag: "Explorar",

      // Hero Intro
      line1_a: "ESPACIOS",
      line1_b: "DE VIDA",
      line2_a: "QUE",
      line2_b: "DESAFÍAN",
      line3_lead: "LO",
      line3_climax: "ORDINARIO",
      heroCopy:
        "En un mundo fugaz en el que lo efímero lo ha empapado todo, construimos interiores para durar, preservando la artesanía a medida y la certeza arquitectónica.",

      // Chapter 2: Studio Manifesto
      textSectionLabel: "El Estudio",
      textLine1: "ESPACIOS QUE INVITAN",
      textLine2: "A SOSTENER Y VIVIR",
      textLine3: "EL TIEMPO EN CALMA",
      textLine4: "Y DESCONECTAR",
      textParagraph:
        "Cada vivienda debe ser única y especial, al igual que las personas que la habitan. Somos el referente del lujo silencioso, donde diseño, ingeniería y artesanía se unen para ofrecer algo excepcional.",
      telemetry1Label: "ATELIER PRINCIPAL EN AL QUOZ",
      telemetry2Label: "ARTESANOS Y EBANISTAS EXPERTOS",
      telemetry3Label: "PRECISIÓN DE FRANJA DE 0.5MM",

      // Chapter 3: Dark Atelier
      imagesTextParagraph:
        "En Yashmeen creamos espacios que sobresalen por la calidad y el diseño a medida. Volúmenes contemporáneos, texturas naturales, abiertos a la luz. Entornos concebidos para elevar la vida diaria con permanencia y autenticidad.",

      // Chapter 4: Values Ribbon
      carouselText: "VALORES",

      // Chapter 5: Tenets
      term1Num: "01",
      term1Title: "ELEGANCIA",
      term1Desc:
        "Una arquitectura sobria y silenciosa y una sensibilidad estética que se manifiestan en roble francés, piedra caliza y tonos tierra.",
      term2Num: "02",
      term2Title: "AUTENTICIDAD",
      term2Desc:
        "La unión de arquitectura atemporal y fabricación artesanal propia, dando lugar a espacios con identidad imborrable.",
      term3Num: "03",
      term3Title: "FUNCIONALIDAD",
      term3Desc:
        "Espacios abiertos, armónicos y funcionales donde cada detalle técnico responde a las necesidades cotidianas con naturalidad.",

      // Chapter 6: Projects
      projectsLabel: "Proyectos",
      projectsIntro:
        "El lujo no se grita ni se mueve por tendencias banales: es certeza arquitectónica de origen único.",
      btnInspectSpec: "Ver Monolito →",

      proj1Title: "VILLA PALM JUMEIRAH",
      proj1Year: "2025",
      proj1Loc: "PALM JUMEIRAH",
      proj1Num: "01",
      proj2Title: "RESIDENCIA EMIRATES HILLS",
      proj2Year: "2025",
      proj2Loc: "EMIRATES HILLS",
      proj2Num: "02",
      proj3Title: "ATELIER CENTRAL AL QUOZ",
      proj3Year: "2024",
      proj3Loc: "ÁREA INDUSTRIAL 4",
      proj3Num: "03",
      proj4Title: "SUITE EJECUTIVA DIFC",
      proj4Year: "2025",
      proj4Loc: "CENTRO FINANCIERO",
      proj4Num: "04",
      proj5Title: "ÁTICO JUMEIRAH BAY",
      proj5Year: "2026",
      proj5Loc: "ISLA PRIVADA",
      proj5Num: "05",

      // Chapter 7: Unpinned Vertical Finale
      finaleChapter: "(08 Comisión)",
      finaleTitle: "FORJANDO LO EXCEPCIONAL",
      finaleSubtitle: "CERTEZA ARQUITECTÓNICA DE FUENTE ÚNICA",
      finaleCol1:
        "Desde la recepción de maderas nobles en nuestro atelier de 35,000 pies cuadrados en Al Quoz hasta la entrega llave en mano, Yashmeen integra todas las disciplinas bajo un mismo techo.",
      finaleCol2:
        "Nuestros maestros artesanos operan maquinaria alemana CNC de 5 ejes junto a técnicas tradicionales de ebanistería, logrando franjas de sombra de 0.5 mm y durabilidad estructural de por vida.",
      finaleCta: "INICIAR CONVERSACIÓN",
      footerTagline: "INTERIORES A MEDIDA Y CONTRATACIÓN ARQUITECTÓNICA • DUBÁI, EAU",
      footerAddress: "Atelier: Calle 18, Al Quoz Industrial 4, Dubái, EAU",
      footerPhone: "+971 4 338 0000",
      footerEmail: "inquiries@yashmeen.ae"
    }
  };

  const currentText = texts[lang];

  // Projects dataset
  const projectsList = [
    {
      num: currentText.proj1Num,
      year: currentText.proj1Year,
      location: currentText.proj1Loc,
      title: currentText.proj1Title,
      image: "/static/work-stanley.jpg"
    },
    {
      num: currentText.proj2Num,
      year: currentText.proj2Year,
      location: currentText.proj2Loc,
      title: currentText.proj2Title,
      image: "/static/work-samford.jpg"
    },
    {
      num: currentText.proj3Num,
      year: currentText.proj3Year,
      location: currentText.proj3Loc,
      title: currentText.proj3Title,
      image: "/static/work-runic.jpg"
    },
    {
      num: currentText.proj4Num,
      year: currentText.proj4Year,
      location: currentText.proj4Loc,
      title: currentText.proj4Title,
      image: "/static/Office-fit-out.jpg"
    },
    {
      num: currentText.proj5Num,
      year: currentText.proj5Year,
      location: currentText.proj5Loc,
      title: currentText.proj5Title,
      image: "/static/Residential-Fit-Out.jpg"
    }
  ];

  // Tenets specimen images
  const tenetImages = [
    "/static/Residential-Fit-Out.jpg",
    "/static/work-myrtle.jpg",
    "/static/Office-fit-out.jpg"
  ];

  // Character splitter helper matching normalisboring.es DOM
  const renderChars = (str, className = "char") =>
    str.split("").map((c, i) => (
      <span
        key={i}
        className="splitline-char-wrap"
        style={{ position: "relative", display: "inline-block" }}
      >
        <span
          className={className}
          style={{ position: "relative", display: "inline-block" }}
        >
          {c === " " ? "\u00A0" : c}
        </span>
      </span>
    ));

  // --------------------------------------------------------------------------
  // 1. PRELOADER & INTRO ENTRANCE ANIMATION
  // --------------------------------------------------------------------------
  const runSequence = useCallback(() => {
    setIsPreloading(true);
    setProgress(0);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPreloading(false);
      }
    });

    timelineRef.current = tl;

    // Fast, crisp preloader count (1.2s total)
    const progressObj = { val: 0 };
    tl.to(progressObj, {
      val: 100,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => setProgress(Math.round(progressObj.val))
    });

    // Fade out backdrop
    tl.to(backdropRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        if (backdropRef.current) backdropRef.current.style.display = "none";
      }
    });

    // Intro char animations
    tl.fromTo(
      ".mod-scroll__intro .splitline .char",
      { y: "110%" },
      {
        y: "0%",
        duration: 0.7,
        stagger: 0.02,
        ease: "power3.out"
      },
      "-=0.2"
    );

    tl.fromTo(
      ".mod-scroll__intro__text p",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    tl.fromTo(
      ".mod-scroll__intro__menu .menu-item",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    );
  }, []);

  useEffect(() => {
    runSequence();
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, [runSequence]);

  // --------------------------------------------------------------------------
  // 2. SMOOTH SCROLL (LENIS) + HORIZONTAL PINNED TRACK & VERTICAL PARALLAX
  // --------------------------------------------------------------------------
  useEffect(() => {
    const isDesktop = window.innerWidth > 991;
    let lenis = null;
    let tickerCallback = null;

    if (isDesktop) {
      lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 0.85,
        smoothWheel: true
      });
      lenisRef.current = lenis;

      lenis.on("scroll", () => {
        ScrollTrigger.update();
      });

      tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    const modScroll = modScrollRef.current;
    if (!modScroll) return;

    // Master horizontal pin
    let scrollTl = null;
    let scrollHTrigger = null;

    if (isDesktop) {
      const sections = modScroll.querySelectorAll(".mod-scroll > *");
      const totalWidth = modScroll.scrollWidth;
      const scrollDistance = totalWidth - window.innerWidth;

      scrollTl = gsap.timeline({ paused: true });

      // Move entire horizontal rail
      scrollTl.to(sections, {
        x: -scrollDistance,
        ease: "none",
        duration: 100
      });

      // Pin mod-scroll container
      scrollHTrigger = ScrollTrigger.create({
        animation: scrollTl,
        trigger: modScroll,
        pin: true,
        scrub: 1,
        start: "top top",
        end: "+=" + scrollDistance,
        onUpdate: () => {
          // Check if dark section is currently under the header
          const darkSec = document.querySelector(".mod-scroll__images-text");
          if (darkSec) {
            const rect = darkSec.getBoundingClientRect();
            if (rect.left <= 120 && rect.right >= 120) {
              setIsHeaderDark(true);
            } else {
              setIsHeaderDark(false);
            }
          }
        }
      });

      // Section 1: Principal Images scrubbing & Vertical FlipMedia Parallax
      const principalSec = document.querySelector(".mod-scroll__images.principal");
      if (principalSec) {
        const singleImage = principalSec.querySelector(
          ".mod-scroll__images__image-single"
        );
        if (singleImage) {
          gsap.fromTo(
            singleImage,
            { x: "-15vw" },
            {
              x: "0vw",
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: principalSec,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }

        const flipDown = principalSec.querySelector(".flipMedia__media--down");
        const flipUp = principalSec.querySelector(".flipMedia__media--up");
        if (flipDown) {
          gsap.fromTo(
            flipDown.querySelector(".media__source"),
            { yPercent: -18 },
            {
              yPercent: 18,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: principalSec,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }
        if (flipUp) {
          gsap.fromTo(
            flipUp.querySelector(".media__source"),
            { yPercent: 18 },
            {
              yPercent: -18,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: principalSec,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }
      }

      // Section 2: Studio Manifesto Line 4 horizontal scrub
      const studioSec = document.querySelector(".mod-scroll__text");
      if (studioSec) {
        const line4Span = studioSec.querySelector(
          ".mod-scroll__text__title .line:nth-child(4) span.cont"
        );
        if (line4Span) {
          gsap.fromTo(
            line4Span,
            { x: 220 },
            {
              x: 0,
              ease: "power1.inOut",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: studioSec,
                start: "left 75%",
                end: "right 25%",
                scrub: 0.5
              }
            }
          );
        }
      }

      // Section 3: Dark Atelier Paragraph Text Stagger & Vertical FlipMedia
      const atelierSec = document.querySelector(".mod-scroll__images-text");
      if (atelierSec) {
        const textLines = atelierSec.querySelectorAll(
          ".mod-scroll__images-text__text p span"
        );
        if (textLines.length) {
          gsap.fromTo(
            textLines,
            { opacity: 0.2 },
            {
              opacity: 1,
              stagger: 0.1,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: atelierSec,
                start: "left 70%",
                end: "center center",
                scrub: 0.5
              }
            }
          );
        }

        const flipDown2 = atelierSec.querySelector(".flipMedia__media--down");
        const flipUp2 = atelierSec.querySelector(".flipMedia__media--up");
        if (flipDown2) {
          gsap.fromTo(
            flipDown2.querySelector(".media__source"),
            { yPercent: -20 },
            {
              yPercent: 20,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: atelierSec,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }
        if (flipUp2) {
          gsap.fromTo(
            flipUp2.querySelector(".media__source"),
            { yPercent: 20 },
            {
              yPercent: -20,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: atelierSec,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }
      }

      // Section 4: Vertical Kinetic Values Ribbon
      const carouselSec = document.querySelector(".mod-scroll__carousel");
      if (carouselSec) {
        const ribbonContent = carouselSec.querySelector(
          ".mod-scroll__carousel__content"
        );
        if (ribbonContent) {
          gsap.fromTo(
            ribbonContent,
            { y: "175vh" },
            {
              y: "-100%",
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: carouselSec,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }
      }

      // Section 5: Secundario FlipMedia
      const secImages = document.querySelector(
        ".mod-scroll__images.secundario"
      );
      if (secImages) {
        const flips = secImages.querySelectorAll(".flipMedia__media");
        if (flips.length >= 2) {
          gsap.fromTo(
            flips[0].querySelector(".media__source"),
            { yPercent: -15 },
            {
              yPercent: 15,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: secImages,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
          gsap.fromTo(
            flips[1].querySelector(".media__source"),
            { yPercent: 15 },
            {
              yPercent: -15,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTl,
                trigger: secImages,
                start: "left right",
                end: "right left",
                scrub: 0.5
              }
            }
          );
        }
      }

      // Section 7: Expanding Project Cards Accordion
      const projectsSec = document.querySelector(".mod-scroll__projects");
      if (projectsSec) {
        const projectItems = projectsSec.querySelectorAll(
          ".mod-scroll__projects__item"
        );

        projectItems.forEach((elem, idx) => {
          const media = elem.querySelector(".media__source");
          const textData = elem.querySelector(
            ".mod-scroll__projects__item__text"
          );

          // Card expands when scrolling into view
          ScrollTrigger.create({
            containerAnimation: scrollTl,
            trigger: elem,
            start: "left 80%",
            end: "left 20%",
            scrub: true,
            onEnter: () => setActiveProjectIdx(idx),
            onEnterBack: () => setActiveProjectIdx(idx)
          });

          if (media) {
            gsap.fromTo(
              elem,
              { width: "18vw" },
              {
                width: "58vw",
                ease: "power1.inOut",
                scrollTrigger: {
                  containerAnimation: scrollTl,
                  trigger: elem,
                  start: "left 85%",
                  end: "left 40%",
                  scrub: true
                }
              }
            );

            gsap.fromTo(
              media,
              { height: "87vh" },
              {
                height: "66vh",
                ease: "power1.inOut",
                scrollTrigger: {
                  containerAnimation: scrollTl,
                  trigger: elem,
                  start: "left 85%",
                  end: "left 40%",
                  scrub: true
                }
              }
            );
          }

          if (textData) {
            gsap.fromTo(
              textData,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out",
                scrollTrigger: {
                  containerAnimation: scrollTl,
                  trigger: elem,
                  start: "left 65%",
                  end: "left 35%",
                  scrub: true
                }
              }
            );
          }
        });
      }
    }

    // Unpinned vertical animations after mod-scroll
    const doubleMedia = document.querySelectorAll(".mod-media--double .mod-media__col img");
    if (doubleMedia.length) {
      doubleMedia.forEach((img, i) => {
        gsap.fromTo(
          img,
          { y: i % 2 === 0 ? -40 : 40, scale: 1.05 },
          {
            y: i % 2 === 0 ? 40 : -40,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".mod-media--double",
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          }
        );
      });
    }

    return () => {
      if (scrollHTrigger) scrollHTrigger.kill();
      if (scrollTl) scrollTl.kill();
      if (lenis && tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        lenis.destroy();
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // --------------------------------------------------------------------------
  // 3. FULL-SCREEN INTERACTIVE EDITORIAL MENU DRAWER
  // --------------------------------------------------------------------------
  const toggleMenu = () => {
    const menuEl = menuRef.current;
    const menuBg = menuBgRef.current;
    if (!menuEl || !menuBg) return;

    if (!isMenuOpen) {
      setIsMenuOpen(true);
      menuEl.classList.remove("d-none");

      const tl = gsap.timeline();
      tl.to(menuBg, { width: "100vw", duration: 0.65, ease: "power2.out" }, 0);
      tl.fromTo(
        ".header__menu__nav-site li",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "power3.out" },
        0.2
      );
      tl.fromTo(
        ".header__menu__media",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
        0.3
      );
      tl.fromTo(
        ".header__menu__nav-single__proyectos__item",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" },
        0.4
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          menuEl.classList.add("d-none");
          setIsMenuOpen(false);
        }
      });
      tl.to(".header__menu__nav-site li", { y: -20, opacity: 0, duration: 0.25 }, 0);
      tl.to(".header__menu__media", { opacity: 0, duration: 0.25 }, 0);
      tl.to(menuBg, { width: "0vw", duration: 0.45, ease: "power2.in" }, 0.1);
    }
  };

  // Smooth scroll to chapter from menu
  const glideToSection = (anchor) => {
    toggleMenu();

    setTimeout(() => {
      const modScroll = modScrollRef.current;
      if (!modScroll) return;

      const targetEl = document.querySelector(anchor);
      if (!targetEl) return;

      if (window.innerWidth > 991) {
        const scrollDistance = modScroll.scrollWidth - window.innerWidth;
        const targetX = targetEl.offsetLeft;
        const ratio = targetX / modScroll.scrollWidth;
        const scrollY = ratio * scrollDistance;

        if (lenisRef.current) {
          lenisRef.current.scrollTo(scrollY, { duration: 1.2 });
        } else {
          window.scrollTo({ top: scrollY, behavior: "smooth" });
        }
      } else {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 450);
  };

  // Tenets Mouse Move Listener
  const handleTermsMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
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
          {/* Top-Left Editorial Logo */}
          <div
            className={`header__logo logo ${isHeaderDark ? "c-white" : ""}`}
            ref={headerLogoRef}
          >
            <Link to="/" className="logo__normal" aria-label="Yashmeen Home">
              <span>YASHMEEN</span>
            </Link>
            <div className="logo__group">
              <span className="logo__is">ATELIER</span>
              <span className="logo__boring">DUBAI®</span>
            </div>
          </div>

          {/* Top-Right Floating Minimalist Controls */}
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

            <button
              type="button"
              onClick={toggleMenu}
              className={`header__btn btn btn--bg f-edit t-parrafo-l ${
                isMenuOpen ? "btn--menu-active" : ""
              }`}
              aria-label="Toggle Navigation Menu"
            >
              <span>{isMenuOpen ? currentText.menuClose : currentText.menuOpen}</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            FULL-SCREEN EDITORIAL MENU DRAWER (.header__menu)
           ------------------------------------------------------------------ */}
        <div className="header__menu c-black d-none" ref={menuRef}>
          <div className="header__menu__bg" ref={menuBgRef} />

          <div className="header__menu__inner">
            {/* Left Column: Numbered Navigation Chapters */}
            <ul className="header__menu__nav-site f-izmir t-titulo-l t-upper">
              {currentText.menuItems.map((item, idx) => (
                <li key={idx} className="link menu-item">
                  <a
                    href={item.anchor}
                    onClick={(e) => {
                      e.preventDefault();
                      glideToSection(item.anchor);
                    }}
                  >
                    <span className="line">
                      <span>{item.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Right Column: Featured Project Preview & Direct Links */}
            <div className="header__menu__content">
              <div className="header__menu__media">
                <div className="header__menu__media__title f-medium t-titulo-xl t-upper">
                  {projectsList[hoveredMenuProject]?.title}
                </div>
                <div className="media">
                  <div className="media__wrap-source image">
                    <img
                      className="media__source w-100"
                      src={projectsList[hoveredMenuProject]?.image}
                      alt={projectsList[hoveredMenuProject]?.title}
                    />
                  </div>
                </div>
              </div>

              <nav className="header__menu__nav-single">
                <h5 className="header__menu__nav-single__title f-izmir t-titulo t-upper">
                  {currentText.projectsLabel}
                </h5>

                <div className="header__menu__nav-single__proyectos">
                  {projectsList.map((proj, idx) => (
                    <div
                      key={idx}
                      className={`header__menu__nav-single__proyectos__item ${
                        hoveredMenuProject === idx ? "is-active" : ""
                      }`}
                      onMouseEnter={() => setHoveredMenuProject(idx)}
                      onClick={() => glideToSection("#projects")}
                    >
                      <span className="line">
                        <span className="num f-edit t-parrafo-xl t-normal">
                          ({proj.num})
                        </span>
                        <span className="title f-izmir t-titulo-l t-upper">
                          {proj.title}
                        </span>
                        <span className="place f-edit t-parrafo-xl t-italic">
                          {proj.location}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="header__menu__nav-single__link f-edit t-parrafo-l"
                  onClick={toggleMenu}
                >
                  <span className="link under">{currentText.menuViewAll} →</span>
                </Link>
              </nav>
            </div>
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
          3. MAIN HORIZONTAL PINNED TRACK (.mod-scroll)
         ------------------------------------------------------------------ */}
      <main>
        <section className="mod-scroll" ref={modScrollRef}>
          {/* ===============================================================
              CHAPTER 0: INTRO MANIFESTO (.mod-scroll__intro bg-white)
             =============================================================== */}
          <div className="mod-scroll__intro bg-white" id="intro">
            <div className="wrapper">
              {/* Rotated Top-Right Navigation Menu (-90deg hallmark) */}
              <ul className="mod-scroll__intro__menu f-izmir t-parrafo t-upper">
                <li className="menu-item">
                  <a
                    href="#studio"
                    onClick={(e) => {
                      e.preventDefault();
                      glideToSection("#studio");
                    }}
                  >
                    {currentText.navStudio}
                  </a>
                </li>
                <li className="menu-item">
                  <a
                    href="#projects"
                    onClick={(e) => {
                      e.preventDefault();
                      glideToSection("#projects");
                    }}
                  >
                    {currentText.navProjects}
                  </a>
                </li>
                <li className="menu-item">
                  <Link to="/contact">{currentText.navContact}</Link>
                </li>
              </ul>

              {/* Section Tag & Copyright */}
              <div className="mod-scroll__intro__section mod-scroll__section t-parrafo-l f-edit">
                {currentText.sectionHome}
              </div>
              <div className="mod-scroll__intro__copyright t-subtitulo f-izmir">
                {currentText.copyright}
              </div>

              {/* Asymmetric Editorial Headline Grid & Narrative Text */}
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
                      <span className="accent-dot">.</span>
                    </div>
                  </div>

                  {/* Col 2, Row 2: Pure Narrative Paragraph */}
                  <div className="mod-scroll__intro__text">
                    <p>{currentText.heroCopy}</p>
                  </div>
                </div>
              </div>

              {/* Landmark Big Brand Identity */}
              <div className="mod-scroll__intro__logo logo c-white">
                <div className="logo__normal">
                  {renderChars("YASHMEEN")}
                </div>
                <div className="logo__group">
                  <div className="logo__is">{renderChars("ATELIER")}</div>
                  <div className="logo__boring">
                    {renderChars("DUBAI")}
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
            {/* Single Large Scrubbing Image */}
            <div className="media mod-scroll__images__image-single noAspect">
              <div className="media__wrap-source image">
                <img
                  className="media__source w-100"
                  src="/static/hero-cinematic.jpg"
                  alt="Yashmeen Architectural Craftsmanship"
                />
              </div>
            </div>

            {/* Overlapping Dual Flip Media with Opposing Vertical Parallax */}
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
                    alt="Materiality Selection Desk"
                  />
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

                {/* Studio Telemetry Counters */}
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
          <div className="mod-scroll__images-text bg-black c-white" id="atelier">
            <div className="wrapper">
              {/* Left Column: Split-Text Lines Narrative */}
              <div className="mod-scroll__images-text__text f-regular t-titulo-xl">
                <p>
                  <span>{currentText.imagesTextParagraph}</span>
                </p>
              </div>

              {/* Right Column: Dual Vertical FlipMedia */}
              <div className="mod-scroll__images-text__images">
                <div className="mod-scroll__images-text__flip flipMedia flipMedia--upDown">
                  <div className="media flipMedia__media flipMedia__media--down noAspect">
                    <div className="media__wrap-source image">
                      <img
                        className="media__source w-100"
                        src="/static/production-facility.jpg"
                        alt="Joinery Machine Production Bay"
                      />
                    </div>
                  </div>
                  <div className="media flipMedia__media flipMedia__media--up noAspect">
                    <div className="media__wrap-source image">
                      <img
                        className="media__source w-100"
                        src="/static/joinery-bay.jpg"
                        alt="Artisanal Hand-Assembly Workstation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              CHAPTER 4: VALUES VERTICAL RIBBON (.mod-scroll__carousel)
             =============================================================== */}
          <div
            className="mod-scroll__carousel bg-beige c-black t-supertitulo-l"
            id="values"
          >
            <div className="mod-scroll__carousel__content">
              <span>{currentText.carouselText}</span>
              <span className="star"> ★ </span>
              <span>{currentText.carouselText}</span>
              <span className="star"> ★ </span>
              <span>{currentText.carouselText}</span>
              <span className="star"> ★ </span>
              <span>{currentText.carouselText}</span>
            </div>
          </div>

          {/* ===============================================================
              CHAPTER 5: SECONDARY IMAGES (.mod-scroll__images bg-beige secundario)
             =============================================================== */}
          <div className="mod-scroll__images bg-beige c-black secundario">
            <div className="mod-scroll__images__flip flipMedia flipMedia--rightLeft">
              <div className="media flipMedia__media flipMedia__media--down noAspect">
                <div className="media__wrap-source image">
                  <img
                    className="media__source w-100"
                    src="/static/work-oh-office.jpg"
                    alt="Bespoke Executive Boardroom"
                  />
                </div>
              </div>
            </div>
            <div className="mod-scroll__images__flip flipMedia flipMedia--leftRight">
              <div className="media flipMedia__media flipMedia__media--up noAspect">
                <div className="media__wrap-source image">
                  <img
                    className="media__source w-100"
                    src="/static/work-clifton.jpg"
                    alt="Private Residence Dining Pavilion"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              CHAPTER 6: ARCHITECTURAL TENETS (.mod-scroll__terms follow__wrap)
             =============================================================== */}
          <div
            className="mod-scroll__terms follow__wrap bg-beige c-black"
            id="tenets"
            onMouseMove={handleTermsMouseMove}
          >
            {/* Term 1: ELEGANCE */}
            <div
              className={`mod-scroll__terms__term ${hoveredTerm === 0 ? "is-hovered" : ""}`}
              onMouseEnter={() => setHoveredTerm(0)}
            >
              <div className="mod-scroll__terms__term__title f-izmir t-titulo-xl t-upper">
                <span>{currentText.term1Num}</span>
                <span className="title-text">{currentText.term1Title}</span>
              </div>
              <div className="mod-scroll__terms__term__text f-edit t-parrafo-l">
                <p>{currentText.term1Desc}</p>
              </div>
            </div>

            {/* Term 2: AUTHENTICITY */}
            <div
              className={`mod-scroll__terms__term ${hoveredTerm === 1 ? "is-hovered" : ""}`}
              onMouseEnter={() => setHoveredTerm(1)}
            >
              <div className="mod-scroll__terms__term__title f-izmir t-titulo-xl t-upper">
                <span>{currentText.term2Num}</span>
                <span className="title-text">{currentText.term2Title}</span>
              </div>
              <div className="mod-scroll__terms__term__text f-edit t-parrafo-l">
                <p>{currentText.term2Desc}</p>
              </div>
            </div>

            {/* Term 3: FUNCTIONALITY */}
            <div
              className={`mod-scroll__terms__term ${hoveredTerm === 2 ? "is-hovered" : ""}`}
              onMouseEnter={() => setHoveredTerm(2)}
            >
              <div className="mod-scroll__terms__term__title f-izmir t-titulo-xl t-upper">
                <span>{currentText.term3Num}</span>
                <span className="title-text">{currentText.term3Title}</span>
              </div>
              <div className="mod-scroll__terms__term__text f-edit t-parrafo-l">
                <p>{currentText.term3Desc}</p>
              </div>
            </div>

            {/* Floating Mouse Cursor Follower Specimen Image */}
            <div
              className="follow__mouse"
              style={{
                transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
              }}
            >
              {tenetImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Architectural Tenet Specimen"
                  className={hoveredTerm === idx ? "on" : ""}
                />
              ))}
            </div>
          </div>

          {/* ===============================================================
              CHAPTER 7: EXPANDING PROJECT MONOLITHS (.mod-scroll__projects)
             =============================================================== */}
          <div className="mod-scroll__projects" id="projects">
            {/* Left Manifesto */}
            <div className="mod-scroll__projects__wrap-text">
              <div className="mod-scroll__projects__section mod-scroll__section t-parrafo-l f-edit">
                {currentText.projectsLabel}
              </div>
              <div className="mod-scroll__projects__text f-izmir t-titulo">
                <p>{currentText.projectsIntro}</p>
              </div>
            </div>

            {/* Expanding Project Cards Accordion */}
            {projectsList.map((proj, idx) => (
              <div
                key={idx}
                className={`mod-scroll__projects__item bg-beige c-black ${
                  activeProjectIdx === idx ? "is-active" : ""
                }`}
                onClick={() => setActiveProjectIdx(idx)}
              >
                <div className="mod-scroll__projects__item__content">
                  <div className="mod-scroll__projects__item__text">
                    <div className="mod-scroll__projects__item__text__data f-edit t-parrafo-l">
                      <div className="data-year">
                        <span>{proj.year}</span>
                      </div>
                      <div className="data-location">
                        <span>{proj.location}</span>
                      </div>
                      <div className="data-number">
                        <span>({proj.num})</span>
                      </div>
                    </div>

                    <div className="mod-scroll__projects__item__text__title f-izmir t-titulo-xl t-upper">
                      <h3>{proj.title}</h3>
                    </div>

                    <div className="mod-scroll__projects__item__action">
                      <Link
                        to="/contact"
                        className="btn btn--underline f-edit t-parrafo-l"
                      >
                        <span>{currentText.btnInspectSpec}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mod-scroll__projects__item__image">
                    <div className="media">
                      <div className="media__wrap-source image">
                        <img
                          className="media__source w-100"
                          src={proj.image}
                          alt={proj.title}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pinned spacer */}
            <div className="mod-scroll__pin" />

            {/* Closing color accent block */}
            <div className="mod-scroll__cierre bg-beige c-black">
              <div className="mod-scroll__cierre__content">
                <div className="mod-scroll__cierre__label f-edit t-parrafo-xl">
                  {currentText.finaleChapter}
                </div>
                <div className="mod-scroll__cierre__heading f-izmir t-titulo-xxl t-upper">
                  {currentText.finaleTitle}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            CHAPTER 8: UNPINNED VERTICAL FINALE & COMMISSION FORM
           ================================================================= */}
        <section
          className="mod-title wrapper mod-title--chapter bg-beige c-black anim-line"
          id="commission"
        >
          <div className="mod-title__chapter-label f-edit t-titulo">
            {currentText.finaleChapter}
          </div>
          <h2 className="mod-title__heading f-regular t-supertitulo-xl t-title-ls t-upper t-center">
            {currentText.finaleTitle}
          </h2>
        </section>

        {/* Double Full-Bleed Architectural Media with Vertical Parallax */}
        <section className="mod-media mod-media--double bg-beige c-black wrapper">
          <div className="mod-media__col">
            <img
              src="/static/hero-cinematic.jpg"
              alt="Luxury Dubai Architecture"
              className="mod-media__img"
            />
          </div>
          <div className="mod-media__col">
            <img
              src="/static/hero-bg.jpg"
              alt="Atelier Joinery Monolith"
              className="mod-media__img"
            />
          </div>
        </section>

        {/* Statement Headline */}
        <section className="mod-title wrapper mod-title--lines bg-beige c-black">
          <h3 className="mod-title__lines-text f-izmir t-titulo-xl t-upper t-center">
            {currentText.finaleSubtitle}
          </h3>
        </section>

        {/* Two-Column Editorial Narrative */}
        <section className="mod-content wrapper mod-content--cols bg-beige c-black">
          <div className="mod-content__col f-edit t-parrafo-xl">
            <p>{currentText.finaleCol1}</p>
          </div>
          <div className="mod-content__col f-edit t-parrafo-xl">
            <p>{currentText.finaleCol2}</p>
          </div>
        </section>

        {/* Centered Luxury Action Button */}
        <section className="mod-content wrapper mod-content--center bg-beige c-black">
          <Link
            to="/contact"
            className="btn btn--monolith-cta f-izmir t-titulo-l t-upper"
          >
            <span>{currentText.finaleCta}</span>
            <FiArrowRight className="cta-arrow" />
          </Link>
        </section>

        {/* Editorial Architectural Footer */}
        <footer className="mod-footer wrapper bg-beige c-black">
          <div className="mod-footer__top">
            <div className="mod-footer__logo f-regular t-titulo-xl">
              <span>YASHMEEN</span>
            </div>
            <div className="mod-footer__tagline f-izmir t-subtitulo">
              {currentText.footerTagline}
            </div>
          </div>

          <div className="mod-footer__info-grid">
            <div className="footer-info-col">
              <span className="footer-label">ATELIER LOCATION</span>
              <p className="footer-val">{currentText.footerAddress}</p>
            </div>
            <div className="footer-info-col">
              <span className="footer-label">DIRECT INQUIRIES</span>
              <p className="footer-val">{currentText.footerEmail}</p>
              <p className="footer-val">{currentText.footerPhone}</p>
            </div>
            <div className="footer-info-col">
              <span className="footer-label">CERTIFICATION</span>
              <p className="footer-val">Dubai Municipality & Civil Defence Approved</p>
              <p className="footer-val">ISO 9001:2015 Quality Certified</p>
            </div>
          </div>

          <div className="mod-footer__bottom">
            <div className="mod-footer__copy f-izmir t-subtitulo">
              {currentText.copyright}
            </div>
            <div className="mod-footer__links f-izmir t-subtitulo">
              <Link to="/">Home</Link>
              <Link to="/about-us">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

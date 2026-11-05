import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "../styles/motion.css";

// Register GreenSock Plugins
gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

// Register OH Architecture Signature Eases
try {
  CustomEase.create("ease-primary", "0.87, 0, 0.13, 1");
  CustomEase.create("ease-secondary", "0.16, 1, 0.35, 1");
  CustomEase.create("ease-menu", "0.7, 0, 0.22, 1");
} catch {
  // Fallbacks if already created
}

export let lenisInstance = null;

export default function MotionProvider() {
  const { pathname } = useLocation();

  /* --------------------------------------------------------------------------
     1. LENIS SMOOTH INERTIAL SCROLL
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
      autoResize: true,
      respectReducedMotion: false,
    });
    lenisInstance = lenis;
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Stop smooth scroll when a modal or menu curtain locks body
    const handleBodyOverflow = () => {
      if (document.body.style.overflow === "hidden") {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    const observer = new MutationObserver(handleBodyOverflow);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    // Smooth anchor navigation
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest?.('a[href^="#"]');
      if (!anchor || anchor.getAttribute("href") === "#") return;
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      observer.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  /* --------------------------------------------------------------------------
     2. TOP SCROLL PROGRESS BAR
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return undefined;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);

  /* --------------------------------------------------------------------------
     3. ARCHITECTURAL PER-ROUTE ANIMATIONS
     -------------------------------------------------------------------------- */
  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true, force: true });

    let activeSplits = [];
    let isCleanedUp = false;

    const ctx = gsap.context(() => {
      // Small delay to allow DOM to settle after route change
      setTimeout(() => {
        if (isCleanedUp) return;

        /* A. HERO ENTRANCE & PARALLAX SCRUB */
        const heroStageImgs = document.querySelectorAll(".hero-provocative-img, .hero-minimal-img, .hero-scrubber-img, .hero-fullbleed-img, .hero-stage-img, .hero-media-wrap img");
        const heroSection = document.querySelector(".hero-provocative-stage, .hero-minimal-stage, .hero-scrubber-stage, .hero-fullbleed-wrap, .hero-master-section, .hero-editorial");
        const telemetryBar = document.querySelector(".hero-provocative-baseline, .hero-minimal-baseline, .hero-hud-bottom, .hero-telemetry-pill-strip, .hero-master-telemetry-bar, .hero-telemetry-bar");
        const heroBadges = document.querySelectorAll(".hero-baseline-numbers, .hero-minimal-numbers, .hero-hud-pill, .hero-hud-coords, .hero-corner-tag, .hero-stage-badge, .hero-commission-tabs, .hero-layer-toggle-btn");
        const scrollCue = document.querySelector(".hero-minimal-scroll, .hero-scroll-cue-link, .hero-scroll-prompt, .hero-scroll-down-cue, .hero-scroll-cue");

        if (heroStageImgs.length && heroSection) {
          // Entrance Animation
          const heroTl = gsap.timeline({ defaults: { ease: "ease-secondary" } });
          heroTl
            .fromTo(
              heroStageImgs,
              { scale: 1.15, filter: "blur(8px)" },
              { scale: 1.0, filter: "blur(0px)", duration: 1.8 }
            )
            .fromTo(
              telemetryBar,
              { yPercent: 120, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1.2 },
              "-=1.2"
            )
            .fromTo(
              heroBadges,
              { y: -20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
              "-=1.0"
            )
            .fromTo(
              scrollCue,
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1.0 },
              "-=0.9"
            );
        }

        /* B. SPLIT-TEXT LINE REVEALS (OH Architecture Masked Baseline) */
        const splitTargets = document.querySelectorAll(
          ".u-text-display, .u-text-h2, .hero-manifesto-quote, .hero-philosophy, .hero-manifesto-statement, .process-display-statement, .testimonial-quote-text, h1:not(.no-split), [data-lines-split]"
        );

        splitTargets.forEach((el) => {
          if (el.dataset.splitInitialized) return;
          try {
            const parentSplit = new SplitText(el, {
              type: "lines",
              linesClass: "split-parent",
            });
            const childSplit = new SplitText(parentSplit.lines, {
              type: "lines",
              linesClass: "split-child",
            });
            activeSplits.push(parentSplit, childSplit);
            el.dataset.splitInitialized = "true";

            const isHero = el.closest(".hero-provocative-stage, .hero-minimal-stage, .hero-scrubber-stage, .hero-fullbleed-wrap, .hero-master-section, .hero-editorial");

            gsap.from(childSplit.lines, {
              yPercent: 120,
              rotate: 0.001,
              duration: 1.2,
              ease: "ease-secondary",
              stagger: 0.065,
              scrollTrigger: isHero
                ? undefined
                : {
                    trigger: el,
                    start: "top 86%",
                    once: true,
                  },
              delay: isHero ? 0.35 : 0,
            });
          } catch {
            // Graceful fallback if DOM is detached
          }
        });

        /* C. ARCHITECTURAL IMAGE CURTAIN UNMASKING */
        const imageCards = document.querySelectorAll(
          ".works-card-image-wrap, .studio-inset-image-wrap, .process-photo-wrap, [data-image-reveal]"
        );

        imageCards.forEach((wrap) => {
          if (wrap.dataset.revealInitialized) return;
          wrap.dataset.revealInitialized = "true";

          const img = wrap.querySelector("img");
          if (!img) return;

          // Initial mask setup
          gsap.set(wrap, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            overflow: "hidden",
          });
          gsap.set(img, { scale: 1.12 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top 88%",
              once: true,
            },
          });

          tl.to(wrap, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.35,
            ease: "ease-secondary",
          }).to(
            img,
            {
              scale: 1.0,
              duration: 1.5,
              ease: "ease-secondary",
            },
            "<"
          );
        });

        /* D. 6-STAGE PROCESS STAGGER */
        const processItems = document.querySelectorAll(".process-accordion-item");
        const processList = document.querySelector(".process-accordion-list");
        if (processItems.length && processList) {
          gsap.from(processItems, {
            y: 35,
            opacity: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "ease-secondary",
            scrollTrigger: {
              trigger: processList,
              start: "top 82%",
              once: true,
            },
          });
        }

        /* E. GENERAL CONTENT CARDS FADE-UP */
        const contentCards = document.querySelectorAll(
          ".studio-narrative-grid > div, .footer-top-grid > div, .card, .spatial-card, .info-card"
        );
        if (contentCards.length) {
          ScrollTrigger.batch(contentCards, {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.fromTo(
                batch,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.9,
                  stagger: 0.08,
                  ease: "ease-secondary",
                  clearProps: "transform,opacity",
                }
              ),
          });
        }

        /* F. MAGNETIC PILL BUTTON PHYSICS (Fine Pointers) */
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const pills = document.querySelectorAll(".btn-pill, .header-btn-enquire, .header-btn-menu");
          pills.forEach((pill) => {
            const xTo = gsap.quickTo(pill, "x", { duration: 0.4, ease: "power2.out" });
            const yTo = gsap.quickTo(pill, "y", { duration: 0.4, ease: "power2.out" });

            pill.addEventListener("mousemove", (e) => {
              const r = pill.getBoundingClientRect();
              const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
              const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
              xTo(dx);
              yTo(dy);
            });

            pill.addEventListener("mouseleave", () => {
              xTo(0);
              yTo(0);
            });
          });
        }

        ScrollTrigger.refresh();
      }, 50);
    });

    return () => {
      isCleanedUp = true;
      activeSplits.forEach((split) => {
        try {
          if (split && typeof split.revert === "function") split.revert();
        } catch {
          // ignore
        }
      });
      activeSplits = [];
      ctx.revert();
    };
  }, [pathname]);

  return <div id="scroll-progress" aria-hidden="true" />;
}

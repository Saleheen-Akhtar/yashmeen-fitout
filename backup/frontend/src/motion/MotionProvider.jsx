import { useEffect, useState } from "react";
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
  const { pathname, hash, key } = useLocation();
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  /* Track OS/browser reduced-motion changes and mirror html.motion class */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (matches) => {
      setReducedMotion(matches);
      document.documentElement.classList.toggle("motion", !matches);
    };
    sync(mq.matches);

    const onChange = (e) => sync(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
      document.documentElement.classList.remove("motion");
    };
  }, []);

  /* --------------------------------------------------------------------------
     1. LENIS SMOOTH INERTIAL SCROLL
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (reducedMotion) {
      lenisInstance = null;
      if (window.__lenis) window.__lenis = null;
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.055,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.2,
      infinite: false,
      autoResize: true,
      respectReducedMotion: true,
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

    // Smooth plain in-page #anchor navigation
    const handleAnchorClick = (e) => {
      if (e.defaultPrevented) return;
      const anchor = e.target.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
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
      if (window.__lenis === lenis) {
        window.__lenis = null;
      }
    };
  }, [reducedMotion]);

  /* --------------------------------------------------------------------------
     2. ROUTE & HASH NAVIGATION SCROLLING
     -------------------------------------------------------------------------- */
  useEffect(() => {
    let rafId = 0;
    let attempts = 0;

    if (hash) {
      const targetId = hash.slice(1);
      const scrollToHash = () => {
        const target =
          document.getElementById(targetId) ||
          (() => {
            try {
              return document.querySelector(hash);
            } catch {
              return null;
            }
          })();

        if (target) {
          if (!reducedMotion && lenisInstance) {
            lenisInstance.scrollTo(target, { offset: -80, duration: 1.1 });
          } else {
            const top = Math.max(
              0,
              target.getBoundingClientRect().top + window.scrollY - 80
            );
            window.scrollTo({ top, left: 0, behavior: "auto" });
          }
          return;
        }

        attempts += 1;
        if (attempts < 10) {
          rafId = requestAnimationFrame(scrollToHash);
        }
      };

      rafId = requestAnimationFrame(scrollToHash);
    } else if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname, hash, key, reducedMotion]);

  /* --------------------------------------------------------------------------
     3. TOP SCROLL PROGRESS BAR
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return undefined;
    if (reducedMotion) {
      gsap.set(bar, { scaleX: 0 });
      return undefined;
    }

    const st = ScrollTrigger.create({
      id: "global-scroll-progress",
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, [reducedMotion]);

  /* --------------------------------------------------------------------------
     4. HEADER MAGNETIC BUTTONS (PERSISTENT ACROSS ROUTES)
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (
      reducedMotion ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      const headerButtons = document.querySelectorAll(
        ".site-header .btn-pill, .site-header .header-btn-enquire, .site-header .header-btn-menu, .site-header [data-magnetic]"
      );
      if (headerButtons.length) {
        gsap.set(headerButtons, { clearProps: "x,y,transform" });
      }
      return undefined;
    }

    const cleanups = [];
    const headerButtons = document.querySelectorAll(
      ".site-header .btn-pill, .site-header .header-btn-enquire, .site-header .header-btn-menu, .site-header [data-magnetic]"
    );

    headerButtons.forEach((pill) => {
      const xTo = gsap.quickTo(pill, "x", { duration: 0.4, ease: "power2.out" });
      const yTo = gsap.quickTo(pill, "y", { duration: 0.4, ease: "power2.out" });

      const onMove = (e) => {
        const r = pill.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
        xTo(dx);
        yTo(dy);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      pill.addEventListener("mousemove", onMove);
      pill.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        pill.removeEventListener("mousemove", onMove);
        pill.removeEventListener("mouseleave", onLeave);
        gsap.set(pill, { clearProps: "x,y,transform" });
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [reducedMotion]);

  /* --------------------------------------------------------------------------
     5. ARCHITECTURAL PER-ROUTE ANIMATIONS (#main & #footer; NEVER transform #main)
     -------------------------------------------------------------------------- */
  useEffect(() => {
    let activeSplits = [];
    let magneticCleanups = [];
    let isCleanedUp = false;
    let rafId = 0;
    let mutationRaf = 0;

    const clearDatasetFlags = () => {
      document
        .querySelectorAll(
          "[data-aperture-initialized], [data-hero-initialized], [data-split-initialized], [data-reveal-initialized], [data-stagger-initialized], [data-card-initialized], [data-magnetic-initialized], [data-parallax-initialized]"
        )
        .forEach((el) => {
          delete el.dataset.apertureInitialized;
          delete el.dataset.heroInitialized;
          delete el.dataset.splitInitialized;
          delete el.dataset.revealInitialized;
          delete el.dataset.staggerInitialized;
          delete el.dataset.cardInitialized;
          delete el.dataset.magneticInitialized;
          delete el.dataset.parallaxInitialized;
        });
    };

    const resetAnimatedProps = () => {
      const animatedTargets = document.querySelectorAll(
        ".aperture-hero-photo img, .aperture-parallax-layer, .aperture-copy-parallax, .aperture-copy-inner, .aperture-word, .aperture-kicker, .aperture-intro, .aperture-actions, .aperture-proof, .aperture-project-link, .studio-inset-image-wrap, .studio-inset-image-wrap img, .works-card, .works-card-image-wrap, .works-card-image-wrap img, .process-photo-wrap, .process-photo-wrap img, [data-image-reveal], [data-image-reveal] img, .process-accordion-item, .studio-narrative-grid > div, .footer-top-grid > div, .card, .spatial-card, .info-card, .testimonial-quote-text, .btn-pill, [data-magnetic]"
      );
      if (animatedTargets.length) {
        gsap.set(animatedTargets, {
          clearProps: "opacity,transform,clipPath,scale,x,y,yPercent",
        });
      }
    };

    if (reducedMotion) {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars?.id !== "global-scroll-progress") st.kill();
      });
      clearDatasetFlags();
      resetAnimatedProps();
      return () => {
        clearDatasetFlags();
      };
    }

    const ctx = gsap.context(() => {}, document.body);
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const runScan = () => {
      if (isCleanedUp) return;

      let pruned = false;
      ScrollTrigger.getAll().forEach((st) => {
        if (
          st.vars?.id !== "global-scroll-progress" &&
          st.trigger &&
          !st.trigger.isConnected
        ) {
          st.kill();
          pruned = true;
        }
      });

      let didChange = false;

      ctx.add(() => {
        /* A1. HOMEPAGE LAYERED APERTURE PARALLAX */
        const apertureStage = document.querySelector(".aperture-hero-stage");
        if (apertureStage && !apertureStage.dataset.apertureInitialized) {
          apertureStage.dataset.apertureInitialized = "true";
          didChange = true;

          const mm = gsap.matchMedia();
          const wireLayers = (depths) => {
            depths.forEach((depth, index) => {
              const layer = apertureStage.querySelector(
                `[data-parallax-layer='${index + 1}']`
              );
              if (!layer) return;
              gsap.fromTo(
                layer,
                { yPercent: 0 },
                {
                  yPercent: depth,
                  ease: "none",
                  scrollTrigger: {
                    trigger: apertureStage,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.35,
                    invalidateOnRefresh: true,
                  },
                }
              );
            });
            return () => {
              const layers = apertureStage.querySelectorAll("[data-parallax-layer]");
              if (layers.length) gsap.set(layers, { clearProps: "yPercent,transform" });
            };
          };

          mm.add("(min-width: 761px)", () => wireLayers([70, 55, 40, 10]));
          mm.add("(max-width: 760px)", () => wireLayers([32, 24, 16, 6]));

          const copyInner = apertureStage.querySelector(".aperture-copy-inner");
          if (copyInner) {
            gsap.fromTo(
              copyInner,
              { opacity: 1 },
              {
                opacity: 0.14,
                ease: "none",
                scrollTrigger: {
                  trigger: apertureStage,
                  start: "25% top",
                  end: "bottom top",
                  scrub: 0.4,
                  invalidateOnRefresh: true,
                },
              }
            );
          }
        }

        /* A2. EDITORIAL HERO STAGES (NON-HOMEPAGE HERO VARIANTS) */
        const heroStageImgs = document.querySelectorAll(
          ".hero-provocative-img, .hero-minimal-img, .hero-scrubber-img, .hero-fullbleed-img, .hero-stage-img, .hero-media-wrap img"
        );
        const heroSection = document.querySelector(
          ".hero-provocative-stage, .hero-minimal-stage, .hero-scrubber-stage, .hero-fullbleed-wrap, .hero-master-section, .hero-editorial"
        );
        const heroCanvas = document.querySelector(
          ".hero-provocative-canvas, .hero-media-wrap"
        );
        const heroContent = document.querySelector(
          ".hero-provocative-content, .hero-editorial-content"
        );
        const telemetryBar = document.querySelector(
          ".hero-provocative-baseline, .hero-minimal-baseline, .hero-hud-bottom, .hero-telemetry-pill-strip, .hero-master-telemetry-bar, .hero-telemetry-bar"
        );
        const heroBadges = document.querySelectorAll(
          ".hero-baseline-numbers, .hero-minimal-numbers, .hero-hud-pill, .hero-hud-coords, .hero-corner-tag, .hero-stage-badge, .hero-commission-tabs, .hero-layer-toggle-btn"
        );
        const scrollCue = document.querySelector(
          ".hero-minimal-scroll, .hero-scroll-cue-link, .hero-scroll-prompt, .hero-scroll-down-cue, .hero-scroll-cue"
        );

        if (
          heroStageImgs.length &&
          heroSection &&
          !heroSection.dataset.heroInitialized
        ) {
          heroSection.dataset.heroInitialized = "true";
          didChange = true;

          const heroTl = gsap.timeline({ defaults: { ease: "ease-secondary" } });
          heroTl.fromTo(
            heroStageImgs,
            { scale: 1.05, opacity: 0 },
            { scale: 1.0, opacity: 1, duration: 1.4 }
          );
          if (telemetryBar) {
            heroTl.fromTo(
              telemetryBar,
              { yPercent: 120, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1.2 },
              "-=1.2"
            );
          }
          if (heroBadges.length) {
            heroTl.fromTo(
              heroBadges,
              { y: -20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
              "-=1.0"
            );
          }
          if (scrollCue) {
            heroTl.fromTo(
              scrollCue,
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1.0 },
              "-=0.9"
            );
          }

          if (heroCanvas) {
            gsap.to(heroCanvas, {
              yPercent: 18,
              ease: "none",
              scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            });
          }

          if (heroContent) {
            gsap.to(heroContent, {
              y: -70,
              opacity: 0.25,
              ease: "none",
              scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "85% top",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });
          }

          if (telemetryBar) {
            gsap.to(telemetryBar, {
              y: 35,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "65% top",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });
          }
        }

        /* B. SPLIT-TEXT LINE REVEALS (Masked Baseline) */
        const splitTargets = document.querySelectorAll(
          ".u-text-display, .u-text-h2, .hero-manifesto-quote, .hero-philosophy, .hero-manifesto-statement, .process-display-statement, .testimonial-quote-text, h1:not(.no-split), [data-lines-split]"
        );

        splitTargets.forEach((el) => {
          if (el.dataset.splitInitialized || !el.textContent?.trim()) return;
          el.dataset.splitInitialized = "true";
          didChange = true;

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

            const isHero = el.closest(
              ".hero-provocative-stage, .hero-minimal-stage, .hero-scrubber-stage, .hero-fullbleed-wrap, .hero-master-section, .hero-editorial"
            );
            const rect = el.getBoundingClientRect();
            if (!isHero && rect.bottom < 0) {
              return;
            }

            gsap.from(childSplit.lines, {
              yPercent: 120,
              rotate: 0.001,
              duration: 1.2,
              ease: "ease-secondary",
              stagger: 0.065,
              clearProps: "transform",
              scrollTrigger: isHero
                ? undefined
                : {
                    trigger: el,
                    start: "top 88%",
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
          const img = wrap.querySelector("img");
          if (!img) return;

          wrap.dataset.revealInitialized = "true";
          didChange = true;

          const isStudioInset = wrap.classList.contains("studio-inset-image-wrap");
          const isProcessPhoto = wrap.classList.contains("process-photo-wrap");
          const startScale = isProcessPhoto ? 1.32 : isStudioInset ? 1.28 : 1.12;
          const endScale = isProcessPhoto ? 1.24 : isStudioInset ? 1.2 : 1.0;

          if (wrap.getBoundingClientRect().bottom < 0) {
            gsap.set(wrap, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              overflow: "hidden",
            });
            gsap.set(img, { scale: endScale, transformOrigin: "50% 50%" });
            return;
          }

          gsap.set(wrap, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            overflow: "hidden",
          });
          gsap.set(img, { scale: startScale, transformOrigin: "50% 50%" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top 90%",
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
              scale: endScale,
              duration: 1.5,
              ease: "ease-secondary",
            },
            "<"
          );
        });

        /* D. 6-STAGE PROCESS STAGGER */
        const processItems = document.querySelectorAll(".process-accordion-item");
        const processList = document.querySelector(".process-accordion-list");
        if (
          processItems.length &&
          processList &&
          !processList.dataset.staggerInitialized
        ) {
          processList.dataset.staggerInitialized = "true";
          didChange = true;

          if (processList.getBoundingClientRect().bottom >= 0) {
            gsap.fromTo(
              processItems,
              { y: 35, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.08,
                ease: "ease-secondary",
                clearProps: "transform,opacity",
                scrollTrigger: {
                  trigger: processList,
                  start: "top 86%",
                  once: true,
                },
              }
            );
          }
        }

        /* E. GENERAL CONTENT CARDS FADE-UP */
        const uninitializedCards = Array.from(
          document.querySelectorAll(
            ".studio-narrative-grid > div, .footer-top-grid > div, .card, .spatial-card, .info-card"
          )
        ).filter((card) => !card.dataset.cardInitialized);

        if (uninitializedCards.length) {
          uninitializedCards.forEach((card) => {
            card.dataset.cardInitialized = "true";
          });
          didChange = true;

          const animateCards = (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.85,
                stagger: 0.08,
                ease: "ease-secondary",
                overwrite: "auto",
                clearProps: "transform,opacity",
              }
            );

          ScrollTrigger.batch(uninitializedCards, {
            start: "top 95%",
            once: true,
            onEnter: animateCards,
            onEnterBack: animateCards,
          });
        }

        /* F. MAGNETIC PILL BUTTONS IN ROUTE / FOOTER (Fine Pointers) */
        if (finePointer) {
          const pills = document.querySelectorAll(".btn-pill, [data-magnetic]");
          pills.forEach((pill) => {
            if (pill.closest(".site-header") || pill.dataset.magneticInitialized) {
              return;
            }
            pill.dataset.magneticInitialized = "true";
            didChange = true;

            const xTo = gsap.quickTo(pill, "x", { duration: 0.4, ease: "power2.out" });
            const yTo = gsap.quickTo(pill, "y", { duration: 0.4, ease: "power2.out" });

            const onMove = (e) => {
              const r = pill.getBoundingClientRect();
              const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
              const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
              xTo(dx);
              yTo(dy);
            };

            const onLeave = () => {
              xTo(0);
              yTo(0);
            };

            pill.addEventListener("mousemove", onMove);
            pill.addEventListener("mouseleave", onLeave);
            magneticCleanups.push(() => {
              pill.removeEventListener("mousemove", onMove);
              pill.removeEventListener("mouseleave", onLeave);
              gsap.set(pill, { clearProps: "x,y,transform" });
            });
          });
        }

        /* G. DIMENSIONAL ARCHITECTURAL PARALLAX SCROLLING */
        // 1. Works Bento Grid Differential Column Float (Desktop 2-Column Only)
        const offsetCards = Array.from(
          document.querySelectorAll(".works-card.offset-top")
        ).filter((card) => !card.dataset.parallaxInitialized);
        const standardCards = Array.from(
          document.querySelectorAll(".works-card:not(.offset-top)")
        ).filter((card) => !card.dataset.parallaxInitialized);

        if (offsetCards.length || standardCards.length) {
          [...offsetCards, ...standardCards].forEach((card) => {
            card.dataset.parallaxInitialized = "true";
          });
          didChange = true;

          const mm = gsap.matchMedia();
          mm.add("(min-width: 769px)", () => {
            offsetCards.forEach((card) => {
              gsap.fromTo(
                card,
                { y: 35 },
                {
                  y: -35,
                  ease: "none",
                  scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.85,
                    invalidateOnRefresh: true,
                  },
                }
              );
            });

            standardCards.forEach((card) => {
              gsap.fromTo(
                card,
                { y: -18 },
                {
                  y: 18,
                  ease: "none",
                  scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.85,
                    invalidateOnRefresh: true,
                  },
                }
              );
            });

            return () => {
              gsap.set([...offsetCards, ...standardCards], {
                clearProps: "y,transform",
              });
            };
          });
        }

        // 2. Studio Inset Photograph Window Parallax (yPercent paired with 1.20 scale)
        const studioWrap = document.querySelector(".studio-inset-image-wrap");
        const studioImg = studioWrap?.querySelector("img");
        if (studioWrap && studioImg && !studioWrap.dataset.parallaxInitialized) {
          studioWrap.dataset.parallaxInitialized = "true";
          didChange = true;

          gsap.fromTo(
            studioImg,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: studioWrap,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // 3. Testimonial Blockquote Elevation Float
        const testimonialQuote = document.querySelector(".testimonial-quote-text");
        const testimonialSec = document.querySelector(".testimonial-card-section");
        if (
          testimonialQuote &&
          testimonialSec &&
          !testimonialQuote.dataset.parallaxInitialized
        ) {
          testimonialQuote.dataset.parallaxInitialized = "true";
          didChange = true;

          gsap.fromTo(
            testimonialQuote,
            { y: 25 },
            {
              y: -25,
              ease: "none",
              scrollTrigger: {
                trigger: testimonialSec,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.85,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // 4. Process Detailing Photo Window Parallax (yPercent paired with 1.24 scale)
        const processPhotoWrap = document.querySelector(".process-photo-wrap");
        const processPhotoImg = processPhotoWrap?.querySelector("img");
        if (
          processPhotoWrap &&
          processPhotoImg &&
          !processPhotoWrap.dataset.parallaxInitialized
        ) {
          processPhotoWrap.dataset.parallaxInitialized = "true";
          didChange = true;

          gsap.fromTo(
            processPhotoImg,
            { yPercent: -10 },
            {
              yPercent: 10,
              ease: "none",
              scrollTrigger: {
                trigger: processPhotoWrap,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });

      if (didChange || pruned) {
        ScrollTrigger.refresh();
      }
    };

    rafId = requestAnimationFrame(() => {
      if (!isCleanedUp) runScan();
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!isCleanedUp) ScrollTrigger.refresh();
      });
    }

    const observeTarget = document.getElementById("main") || document.body;
    const domObserver = new MutationObserver(() => {
      if (isCleanedUp || mutationRaf) return;
      mutationRaf = requestAnimationFrame(() => {
        mutationRaf = 0;
        if (!isCleanedUp) runScan();
      });
    });
    domObserver.observe(observeTarget, { childList: true, subtree: true });

    return () => {
      isCleanedUp = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (mutationRaf) cancelAnimationFrame(mutationRaf);
      domObserver.disconnect();
      magneticCleanups.forEach((fn) => fn());
      magneticCleanups = [];

      activeSplits.forEach((split) => {
        try {
          if (split && typeof split.revert === "function") split.revert();
        } catch {
          // ignore
        }
      });
      activeSplits = [];

      ctx.revert();
      clearDatasetFlags();
      resetAnimatedProps();
    };
  }, [pathname, reducedMotion]);

  return <div id="scroll-progress" aria-hidden="true" />;
}

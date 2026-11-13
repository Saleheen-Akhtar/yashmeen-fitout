import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { initLenis, lenisInstance } from "./lenis";
import { initHeaderMagnetic, initContentMagnetic } from "./magnetic";
import {
  initApertureParallax,
  initEditorialHeroParallax,
  initDimensionalParallax,
} from "./parallax";
import {
  initSplitTextReveals,
  initImageCurtainReveals,
  initProcessAccordionStagger,
  initCardBatchReveals,
} from "./reveal";
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

export { lenisInstance };

export default function MotionProvider() {
  const { pathname, hash, key } = useLocation();
  const [reducedMotion] = useState(false);

  /* Ensure html.motion class stays active on all visitor routes */
  useEffect(() => {
    document.documentElement.classList.add("motion");
    return () => {
      document.documentElement.classList.remove("motion");
    };
  }, []);

  /* 1. LENIS SMOOTH INERTIAL SCROLL */
  useEffect(() => {
    const { cleanup } = initLenis(reducedMotion);
    return cleanup;
  }, [reducedMotion]);

  /* 2. ROUTE & HASH NAVIGATION SCROLLING */
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

  /* 3. TOP SCROLL PROGRESS BAR */
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

  /* 4. HEADER MAGNETIC BUTTONS */
  useEffect(() => {
    return initHeaderMagnetic(reducedMotion);
  }, [reducedMotion]);

  /* 5. ARCHITECTURAL PER-ROUTE ANIMATIONS */
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
        const apertureStage = document.querySelector(".aperture-hero-stage");
        if (initApertureParallax(ctx, apertureStage)) didChange = true;
        if (initEditorialHeroParallax(ctx)) didChange = true;
        if (initSplitTextReveals(ctx, activeSplits)) didChange = true;
        if (initImageCurtainReveals(ctx)) didChange = true;
        if (initProcessAccordionStagger(ctx)) didChange = true;
        if (initCardBatchReveals(ctx)) didChange = true;

        const { cleanups, didChange: magChanged } = initContentMagnetic(finePointer);
        if (magChanged) didChange = true;
        magneticCleanups.push(...cleanups);

        if (initDimensionalParallax(ctx)) didChange = true;
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

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initApertureParallax(ctx, apertureStage) {
  if (!apertureStage || apertureStage.dataset.apertureInitialized) return false;
  apertureStage.dataset.apertureInitialized = "true";

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

  return true;
}

export function initEditorialHeroParallax(ctx) {
  const heroStageImgs = document.querySelectorAll(
    ".hero-provocative-img, .hero-minimal-img, .hero-scrubber-img, .hero-fullbleed-img, .hero-stage-img, .hero-media-wrap img"
  );
  const heroSection = document.querySelector(
    ".hero-provocative-stage, .hero-minimal-stage, .hero-scrubber-stage, .hero-fullbleed-wrap, .hero-master-section, .hero-editorial"
  );
  const heroCanvas = document.querySelector(".hero-provocative-canvas, .hero-media-wrap");
  const heroContent = document.querySelector(".hero-provocative-content, .hero-editorial-content");
  const telemetryBar = document.querySelector(
    ".hero-provocative-baseline, .hero-minimal-baseline, .hero-hud-bottom, .hero-telemetry-pill-strip, .hero-master-telemetry-bar, .hero-telemetry-bar"
  );
  const heroBadges = document.querySelectorAll(
    ".hero-baseline-numbers, .hero-minimal-numbers, .hero-hud-pill, .hero-hud-coords, .hero-corner-tag, .hero-stage-badge, .hero-commission-tabs, .hero-layer-toggle-btn"
  );
  const scrollCue = document.querySelector(
    ".hero-minimal-scroll, .hero-scroll-cue-link, .hero-scroll-prompt, .hero-scroll-down-cue, .hero-scroll-cue"
  );

  if (!heroStageImgs.length || !heroSection || heroSection.dataset.heroInitialized) {
    return false;
  }

  heroSection.dataset.heroInitialized = "true";

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

  return true;
}

export function initDimensionalParallax(ctx) {
  let didChange = false;

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

  // 2. Studio Inset Photograph Window Parallax
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
  if (testimonialQuote && testimonialSec && !testimonialQuote.dataset.parallaxInitialized) {
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

  // 4. Process Detailing Photo Window Parallax
  const processPhotoWrap = document.querySelector(".process-photo-wrap");
  const processPhotoImg = processPhotoWrap?.querySelector("img");
  if (processPhotoWrap && processPhotoImg && !processPhotoWrap.dataset.parallaxInitialized) {
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

  return didChange;
}

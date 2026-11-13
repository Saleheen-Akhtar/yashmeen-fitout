import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export function initSplitTextReveals(ctx, activeSplits) {
  const splitTargets = document.querySelectorAll(
    ".u-text-display, .u-text-h2, .hero-manifesto-quote, .hero-philosophy, .hero-manifesto-statement, .process-display-statement, .testimonial-quote-text, h1:not(.no-split), [data-lines-split]"
  );
  let didChange = false;

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

  return didChange;
}

export function initImageCurtainReveals(ctx) {
  const imageCards = document.querySelectorAll(
    ".works-card-image-wrap, .studio-inset-image-wrap, .process-photo-wrap, [data-image-reveal]"
  );
  let didChange = false;

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

  return didChange;
}

export function initProcessAccordionStagger(ctx) {
  const processItems = document.querySelectorAll(".process-accordion-item");
  const processList = document.querySelector(".process-accordion-list");
  if (!processItems.length || !processList || processList.dataset.staggerInitialized) {
    return false;
  }

  processList.dataset.staggerInitialized = "true";

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

  return true;
}

export function initCardBatchReveals(ctx) {
  const uninitializedCards = Array.from(
    document.querySelectorAll(
      ".studio-narrative-grid > div, .footer-top-grid > div, .card, .spatial-card, .info-card"
    )
  ).filter((card) => !card.dataset.cardInitialized);

  if (!uninitializedCards.length) return false;

  uninitializedCards.forEach((card) => {
    card.dataset.cardInitialized = "true";
  });

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

  return true;
}

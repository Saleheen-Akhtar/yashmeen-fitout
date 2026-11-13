import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export let lenisInstance = null;

export function initLenis(reducedMotion) {
  if (reducedMotion) {
    lenisInstance = null;
    if (window.__lenis) window.__lenis = null;
    return { lenis: null, cleanup: () => {} };
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

  const cleanup = () => {
    document.removeEventListener("click", handleAnchorClick);
    observer.disconnect();
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenisInstance = null;
    if (window.__lenis === lenis) {
      window.__lenis = null;
    }
  };

  return { lenis, cleanup };
}

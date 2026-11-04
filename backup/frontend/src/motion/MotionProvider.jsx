import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "../styles/motion.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

// Elements the generic scanner reveals on pages that do not tag their own markup.
const AUTO_SPLIT = "#main h1, #main h2";
const AUTO_BATCH = "#main :is(h3, h4, p, li, figure, form, blockquote, table)";
const AUTO_SKIP = "[data-split], [data-reveal], [data-stagger] > *, [data-manual] *, [role='dialog'], [aria-modal='true'], nav, button, summary, .lightbox, [data-nomotion], [data-nomotion] *";

export let lenisInstance = null;

export default function MotionProvider() {
  const { pathname } = useLocation();

  /* Smooth scroll: one Lenis instance for the whole visitor site, driven by the GSAP ticker */
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return undefined;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Stop smooth scroll while a modal/menu locks the body
    const sync = () => (document.body.style.overflow === "hidden" ? lenis.stop() : lenis.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    // Anchor links scroll smoothly
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a || a.getAttribute("href") === "#") return;
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80, duration: 1.4 }); }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      mo.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  /* Scroll progress bar */
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar || window.matchMedia(REDUCED).matches) return undefined;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);

  /* Per-route animations */
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return undefined;
    lenisInstance?.scrollTo(0, { immediate: true, force: true });

    const root = document.getElementById("main");
    const ctx = gsap.context(() => {});
    let timer = null;
    let alive = true;

    // Opacity only: a transform on #main would break sticky and pinned sections
    if (root) gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity" });

    const once = (el, key) => {
      if (el.dataset[key]) return false;
      el.dataset[key] = "1";
      return true;
    };
    const visible = (el) => el.getClientRects().length > 0;

    const scan = () => {
      if (!alive || !root) return;
      ctx.add(() => {
        // 1. Split-text headings: lines slide up from a mask
        const splits = [
          ...root.querySelectorAll("[data-split]"),
          ...[...root.querySelectorAll(AUTO_SPLIT)].filter((el) => !el.matches(AUTO_SKIP) && !el.closest("[data-manual]")),
        ];
        splits.forEach((el) => {
          if (!visible(el) || !once(el, "mSplit")) return;
          const delay = parseFloat(el.dataset.delay || 0);
          const hero = el.hasAttribute("data-hero");
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 115,
                duration: 1.15,
                ease: "expo.out",
                stagger: 0.09,
                delay,
                scrollTrigger: hero ? undefined : { trigger: el, start: "top 90%", once: true },
              });
            },
          });
        });

        // 2. Words that light up as you scroll
        root.querySelectorAll("[data-words]").forEach((el) => {
          if (!once(el, "mWords")) return;
          SplitText.create(el, {
            type: "words",
            autoSplit: true,
            onSplit(self) {
              return gsap.fromTo(self.words, { opacity: 0.16 }, {
                opacity: 1, ease: "none", stagger: 0.12,
                scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 55%", scrub: 0.6 },
              });
            },
          });
        });

        // 3. Explicit reveals
        root.querySelectorAll("[data-reveal]").forEach((el) => {
          if (!visible(el) || !once(el, "mReveal")) return;
          gsap.from(el, {
            y: parseFloat(el.dataset.y || 36), opacity: 0, duration: 1, ease: "power3.out",
            delay: parseFloat(el.dataset.delay || 0), clearProps: "transform,opacity",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        // 4. Staggered children
        root.querySelectorAll("[data-stagger]").forEach((el) => {
          if (!visible(el) || !once(el, "mStagger")) return;
          gsap.from(el.children, {
            y: 40, opacity: 0, duration: 0.95, ease: "power3.out", stagger: 0.1, clearProps: "transform,opacity",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          });
        });

        // 5. Class flip (CSS handles the transition, e.g. lines drawing in)
        root.querySelectorAll("[data-in]").forEach((el) => {
          if (!once(el, "mIn")) return;
          ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("is-in") });
        });

        // 6. Parallax for images (child img moves inside an overflow-hidden frame)
        root.querySelectorAll("[data-parallax]").forEach((el) => {
          if (!once(el, "mPar")) return;
          const amt = parseFloat(el.dataset.parallax || 0.12) * 100;
          const img = el.querySelector("img") || el;
          gsap.fromTo(img, { yPercent: -amt }, {
            yPercent: amt, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // 7. Image mask reveal
        root.querySelectorAll("[data-clip]").forEach((el) => {
          if (!once(el, "mClip")) return;
          gsap.fromTo(el, { clipPath: "inset(14% 14% 14% 14% round 16px)" }, {
            clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // 8. Count up
        root.querySelectorAll("[data-count]").forEach((el) => {
          if (!once(el, "mCount")) return;
          const end = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const o = { v: 0 };
          el.textContent = "0" + suffix;
          gsap.to(o, {
            v: end, duration: 2.2, ease: "power3.out",
            onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("en-US") + suffix; },
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // 9. Generic fade-up for pages that are not hand-tagged
        const batchTargets = [...root.querySelectorAll(AUTO_BATCH)].filter(
          (el) => !el.matches(AUTO_SKIP) && !el.closest("[data-manual], [data-split], [data-reveal], [data-stagger], [data-nomotion], [role='dialog'], [aria-modal='true'], nav, button, summary, .lightbox") && visible(el) && once(el, "mBatch")
        );
        if (batchTargets.length) {
          gsap.set(batchTargets, { opacity: 0, y: 28 });
          ScrollTrigger.batch(batchTargets, {
            start: "top 92%", once: true, interval: 0.08, batchMax: 6,
            onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, clearProps: "transform,opacity" }),
          });
        }

        // 10. Magnetic buttons (fine pointers only)
        if (window.matchMedia(FINE_POINTER).matches) {
          root.querySelectorAll("[data-magnetic]").forEach((el) => {
            if (!once(el, "mMag")) return;
            const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
            const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
            el.addEventListener("pointermove", (e) => {
              const r = el.getBoundingClientRect();
              xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
              yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
            });
            el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
          });
        }
      });
      ScrollTrigger.refresh();
    };

    // Pages are lazy and data loads late, so rescan when the DOM changes
    const schedule = () => { clearTimeout(timer); timer = setTimeout(scan, 30); };
    const mo = new MutationObserver(schedule);
    if (root) mo.observe(root, { childList: true, subtree: true });
    schedule();
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());

    return () => {
      alive = false;
      clearTimeout(timer);
      mo.disconnect();
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [pathname]);

  return <div id="scroll-progress" aria-hidden="true" />;
}

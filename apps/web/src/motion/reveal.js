import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

const EXCLUDED = '[data-nomotion], [data-manual], .aperture-hero, [role="dialog"], .spatial-gallery, .photogal-photo-tile';
const CARD_SELECTOR = '[data-stagger] > *, .process-accordion-item, .studio-narrative-grid > div, .srv-service-card, .srv-process-step, .srv-project-card, .mv-card, .service-item, .info-card, .reason-card, .career-job-card, .blog-card';
const IMAGE_SELECTOR = '[data-image-reveal], .works-card-image-wrap, .studio-inset-image-wrap, .process-photo-wrap, .about-image-frame, .srv-intro-image-frame';

export function createRouteReveals(root, context, reducedMotion = false) {
  const seen = new WeakSet();
  const eligible = element => !seen.has(element) && !element.closest(EXCLUDED) && element.getBoundingClientRect().width > 0;
  const trigger = element => ({ trigger: element, start: 'top 92%', once: true });

  function reveal(element) {
    seen.add(element);
    if (element.getBoundingClientRect().bottom < 0) return;
    gsap.from(element, {
      opacity: 0, y: reducedMotion ? 0 : 24, duration: reducedMotion ? 0.56 : 0.85,
      ease: reducedMotion ? 'power2.out' : 'power3.out', clearProps: 'opacity,transform',
      scrollTrigger: trigger(element),
    });
  }

  return function scan() {
    context.add(() => {
      root.querySelectorAll('h1:not(.no-split), h2:not(.no-split), [data-split], [data-lines-split]').forEach(element => {
        if (!eligible(element) || !element.textContent.trim()) return;
        if (reducedMotion) {
          reveal(element);
          return;
        }
        seen.add(element);
        if (element.querySelector('a,button') || element.closest(CARD_SELECTOR)) return;
        SplitText.create(element, {
          type: 'lines', mask: 'lines', linesClass: 'reveal-line', autoSplit: true,
          onSplit(split) {
            return gsap.from(split.lines, {
              yPercent: 105, opacity: 0, duration: 0.95, stagger: 0.075,
              ease: 'power3.out', clearProps: 'transform,opacity',
              scrollTrigger: trigger(element),
            });
          },
        });
      });

      root.querySelectorAll(IMAGE_SELECTOR).forEach(element => {
        if (!eligible(element)) return;
        seen.add(element);
        if (element.getBoundingClientRect().bottom < 0) return;
        gsap.from(element, {
          clipPath: reducedMotion ? 'inset(0 0 0 0)' : 'inset(8% 0 92% 0)', opacity: 0,
          duration: reducedMotion ? 0.62 : 1.1,
          ease: reducedMotion ? 'power2.out' : 'power3.out', clearProps: 'clipPath,opacity',
          scrollTrigger: trigger(element),
        });
      });

      root.querySelectorAll(CARD_SELECTOR + ', [data-reveal], [data-in], section p').forEach(element => {
        if (!eligible(element) || element.closest('.reveal-line, .reveal-line-mask')) return;
        if (element.parentElement.closest(CARD_SELECTOR)) return;
        reveal(element);
      });
    });
  };
}

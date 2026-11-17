import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { initLenis } from './lenis';
import { initHeaderMagnetic } from './magnetic';
import { createRouteReveals } from './reveal';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import '../styles/motion.css';

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
CustomEase.create('ease-primary', '0.87, 0, 0.13, 1');
CustomEase.create('ease-secondary', '0.16, 1, 0.35, 1');
CustomEase.create('ease-menu', '0.7, 0, 0.22, 1');

export default function MotionProvider() {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotionPreference();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('motion', !reducedMotion);
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    return () => document.documentElement.classList.remove('motion', 'reduced-motion');
  }, [reducedMotion]);

  useEffect(() => initLenis(reducedMotion).cleanup, [reducedMotion]);
  useEffect(() => initHeaderMagnetic(reducedMotion), [reducedMotion]);

  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    const progress = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => gsap.set(bar, { scaleX: self.progress }),
    });
    return () => { progress.kill(); gsap.set(bar, { clearProps: 'transform' }); };
  }, [reducedMotion]);

  useEffect(() => {
    const root = document.getElementById('main');
    if (!root) return;
    const context = gsap.context(() => {}, root);
    const scan = createRouteReveals(root, context, reducedMotion);
    let disposed = false;
    let frame = 0;
    const observer = new MutationObserver(schedule);

    function schedule() {
      if (disposed || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (disposed) return;
        observer.disconnect();
        if (root.querySelector('[data-motion-ready="true"]')) scan();
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-motion-ready'] });
        ScrollTrigger.refresh();
      });
    }

    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-motion-ready'] });
    root.addEventListener('load', schedule, true);
    schedule();
    document.fonts?.ready.then(schedule);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('load', schedule, true);
      // Revert only this route. Hero, menu and carousel own their animations.
      context.revert();
    };
  }, [pathname, reducedMotion]);

  return <div id="scroll-progress" aria-hidden="true" />;
}

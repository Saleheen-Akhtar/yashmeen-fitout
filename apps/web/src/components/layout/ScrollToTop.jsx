import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { lenisInstance } from '../../motion/lenis';

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    let observer;
    let frame;
    function scroll() {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (hash && !target) return false;
      const offset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 84;
      const top = target ? Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset) : 0;
      if (lenisInstance) lenisInstance.scrollTo(top, { immediate: true, force: true });
      window.scrollTo({ top, left: 0, behavior: 'instant' });
      return true;
    }
    frame = requestAnimationFrame(() => {
      if (!scroll()) {
        observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
        observer.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.history.scrollRestoration = previous;
    };
  }, [pathname, hash, key]);
  return null;
}

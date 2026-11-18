import { useEffect } from 'react';

export default function useDialogFocus(open, ref) {
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const controls = () => [...dialog.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]')].filter(node => node.getClientRects().length);
    const frame = requestAnimationFrame(() => controls()[0]?.focus({ preventScroll: true }));
    const trap = (event) => {
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    dialog.addEventListener('keydown', trap);
    return () => {
      cancelAnimationFrame(frame);
      dialog.removeEventListener('keydown', trap);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, ref]);
}

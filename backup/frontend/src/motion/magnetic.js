import gsap from "gsap";

export function initHeaderMagnetic(reducedMotion) {
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
    return () => {};
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
}

export function initContentMagnetic(finePointer) {
  if (!finePointer) return { cleanups: [], didChange: false };

  const pills = document.querySelectorAll(".btn-pill, [data-magnetic]");
  const cleanups = [];
  let didChange = false;

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
    cleanups.push(() => {
      pill.removeEventListener("mousemove", onMove);
      pill.removeEventListener("mouseleave", onLeave);
      gsap.set(pill, { clearProps: "x,y,transform" });
    });
  });

  return { cleanups, didChange };
}

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DEFAULT_EDITORIAL_ITEMS } from "../data/editorialItems";
import "../styles/editorial-carousel-3d.css";

// Helper: positive modulo
function positiveModulo(n, m) {
  return ((n % m) + m) % m;
}

// Helper: compute responsive dimensions, perspective, and screen-space anchors
function computeLayout(W, H, isMobile) {
  const C = isMobile
    ? Math.min(W * 0.34, H * 0.56, 440)
    : Math.min(W * 0.25, H * 0.56, 440);
  const cardHeight = (4 * C) / 3;
  const B = H / 2 + cardHeight / 2;
  const P = 900;
  const gap = isMobile ? C * 0.07 : C * 0.09;

  // Precompute inner-edge screen anchors A for slots 0 through 4
  const A = [-C / 2];
  for (let n = 0; n < 4; n++) {
    const F = A[n];
    const slotA = n;
    const s = isMobile
      ? 1 - Math.min(slotA, 3) * 0.26
      : 1 - Math.min(slotA, 3) * 0.12;
    const slotZ = -slotA * slotA * C * 0.12;
    const thetaDeg = (12 * slotA + 5 * slotA * slotA) * 0.65;
    const theta = (thetaDeg * Math.PI) / 180;
    const w = C * s;
    const Xh = (F * (P - slotZ)) / P;
    const projectedWidth =
      ((Xh + w * Math.cos(theta)) * P) /
        (P - slotZ + w * Math.sin(theta)) -
      F;
    A[n + 1] = F + projectedWidth + gap;
  }

  const spacing = A[1] + C / 2;
  return { C, cardHeight, B, P, gap, A, spacing, isMobile };
}

// Helper: calculate 3D transform and visual styling for a given circular offset
function getCardState(o, layout) {
  const { C, P, A, isMobile } = layout;
  const a = Math.abs(o);
  const sign = o >= 0 ? 1 : -1;

  // Scale: desktop shrinks by 0.12 per unit (max 3 units); mobile shrinks by 0.26
  const scale = isMobile
    ? 1 - Math.min(a, 3) * 0.26
    : 1 - Math.min(a, 3) * 0.12;

  // Outward Y rotation in degrees
  const rotationDeg = (12 * a + 5 * a * a) * 0.65;

  // Depth z
  const z = -a * a * C * 0.12;

  // Screen anchor A(a) interpolated
  let Aa;
  if (a <= 0) {
    Aa = A[0];
  } else {
    const idx = Math.floor(a);
    const frac = a - idx;
    if (idx >= 4) {
      Aa = A[4] + (a - 4) * (A[4] - A[3]);
    } else {
      Aa = A[idx] + frac * (A[idx + 1] - A[idx]);
    }
  }

  // Convert screen anchor back into world space at depth z
  const Xh = (Aa * (P - z)) / P;
  const x = sign * (Xh + C / 2);

  // Filter: blur and brightness
  let blur = 0;
  let brightness = 1;
  if (a >= 0.5) {
    blur = a <= 1 ? Math.min(a, 3) * 1.8 : Math.min(a, 3) * 3.4;
    brightness = 1 - Math.min(a, 3) * 0.2;
  }

  // Opacity: 1 until a = 2.2, then fades linearly to 0 by a = 2.8
  let opacity = 1;
  if (a > 2.2) {
    opacity = Math.max(0, 1 - (a - 2.2) / 0.6);
  }

  // Stacking z-index: cards closer to center have higher priority
  const zIndex = Math.round(100 - a * 10);

  // Text opacity: visible only near center, max(0, 1 - 1.8a)
  const textOpacity = Math.max(0, 1 - 1.8 * a);
  const textTranslateY = (1 - textOpacity) * 10;

  // Hinge: bottom-inner corner
  // Right cards (o > 0): bottom-left (0% 100%)
  // Left cards (o < 0): bottom-right (100% 100%)
  // Center card: bottom-center (50% 100%)
  let transformOrigin = "50% 100%";
  if (o > 0.01) transformOrigin = "0% 100%";
  else if (o < -0.01) transformOrigin = "100% 100%";

  return {
    x,
    z,
    rotationDeg: sign * rotationDeg,
    scale,
    blur,
    brightness,
    opacity,
    zIndex,
    textOpacity,
    textTranslateY,
    transformOrigin,
    visible: opacity > 0.002,
  };
}

export default function EditorialCarousel3D({
  items = DEFAULT_EDITORIAL_ITEMS,
  tuning = {},
  onCardClick,
  className = "",
  ariaLabel = "Editorial 3D Image Carousel",
}) {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const textRefs = useRef([]);

  // Physics and interaction state kept in refs for high frame rate rAF loop
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const velocityRef = useRef(0);
  const dragPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const velocityTrackerRef = useRef(0);
  const rAFIdRef = useRef(null);
  const layoutRef = useRef(null);
  const isSettledRef = useRef(true);
  const isVisibleRef = useRef(true);
  const lastWheelTimeRef = useRef(0);
  const lastAnnouncedIdxRef = useRef(-1);

  // Reduced motion preference
  const reducedMotionRef = useRef(false);

  // Screen reader live region text
  const [settledAnnouncement, setSettledAnnouncement] = useState("");

  const N = items.length;

  // Card follower positions array for the ripple effect
  const followersRef = useRef(new Array(N).fill(0));

  // Tuning values with defaults
  const cfg = useMemo(
    () => ({
      perspective: tuning.perspective ?? 900,
      springStiffness: tuning.springStiffness ?? 0.026,
      springDamping: tuning.springDamping ?? 0.89,
      dragFollowRate: tuning.dragFollowRate ?? 0.2,
      followerRates: tuning.followerRates ?? {
        center: 0.32,
        near: 0.2,
        mid: 0.13,
        outer: 0.1,
      },
      trackScaleMax: tuning.trackScaleMax ?? 0.035,
    }),
    [tuning]
  );

  // Function to render cards directly into DOM
  const renderCards = useCallback(() => {
    const layout = layoutRef.current;
    if (!layout) return;

    const itemCount = items.length;
    for (let i = 0; i < itemCount; i++) {
      const el = cardRefs.current[i];
      const txtEl = textRefs.current[i];
      if (!el) continue;

      const o =
        positiveModulo(i - followersRef.current[i] + itemCount / 2, itemCount) -
        itemCount / 2;
      const state = getCardState(o, layout);

      if (!state.visible) {
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
        el.setAttribute("aria-hidden", "true");
        el.tabIndex = -1;
        continue;
      }

      el.style.visibility = "visible";
      el.style.opacity = state.opacity.toFixed(4);
      el.style.zIndex = state.zIndex;
      el.style.pointerEvents = isDraggingRef.current ? "none" : "auto";
      el.style.filter = `blur(${state.blur.toFixed(2)}px) brightness(${state.brightness.toFixed(2)})`;
      el.style.transformOrigin = state.transformOrigin;
      el.style.transform = `translate3d(${state.x.toFixed(2)}px, 0px, ${state.z.toFixed(2)}px) rotateY(${state.rotationDeg.toFixed(2)}deg) scale(${state.scale.toFixed(4)})`;

      const isCenter = Math.abs(o) < 0.5;
      el.setAttribute("aria-hidden", isCenter ? "false" : "true");
      el.tabIndex = isCenter ? 0 : -1;

      if (txtEl) {
        txtEl.style.opacity = state.textOpacity.toFixed(3);
        txtEl.style.transform = `translateY(${state.textTranslateY.toFixed(2)}px)`;
      }
    }
  }, [items]);

  // Animation frame loop
  const tick = useCallback(() => {
    rAFIdRef.current = null;
    const layout = layoutRef.current;
    if (!layout) {
      return;
    }

    const itemCount = items.length;
    let moving = false;

    if (reducedMotionRef.current) {
      posRef.current = targetRef.current;
      velocityRef.current = 0;
      for (let i = 0; i < itemCount; i++) {
        followersRef.current[i] = targetRef.current;
      }
      moving = false;
    } else if (isDraggingRef.current) {
      // Gentle follow during drag
      const diff = dragPosRef.current - posRef.current;
      posRef.current += diff * cfg.dragFollowRate;
      velocityRef.current = diff * cfg.dragFollowRate;
      moving = true;
    } else {
      // Soft spring update on release
      const dist = targetRef.current - posRef.current;
      velocityRef.current += dist * cfg.springStiffness;
      velocityRef.current *= cfg.springDamping;
      posRef.current += velocityRef.current;

      if (Math.abs(dist) < 0.0003 && Math.abs(velocityRef.current) < 0.0003) {
        posRef.current = targetRef.current;
        velocityRef.current = 0;
      } else {
        moving = true;
      }
    }

    // Ripple follower update per card
    const pos = posRef.current;
    const fRates = cfg.followerRates;

    for (let i = 0; i < itemCount; i++) {
      if (reducedMotionRef.current) {
        followersRef.current[i] = pos;
        continue;
      }

      const curO =
        positiveModulo(i - followersRef.current[i] + itemCount / 2, itemCount) -
        itemCount / 2;
      const curA = Math.abs(curO);

      let rate = fRates.outer;
      if (curA < 0.5) rate = fRates.center;
      else if (curA < 1.5) rate = fRates.near;
      else if (curA < 2.5) rate = fRates.mid;

      const fDiff = pos - followersRef.current[i];
      followersRef.current[i] += fDiff * rate;

      if (Math.abs(fDiff) > 0.0003) {
        moving = true;
      }
    }

    // Subtly press track back while velocity is high
    if (trackRef.current) {
      let trackScale = 1;
      if (!reducedMotionRef.current) {
        trackScale =
          1 - Math.min(1, Math.abs(velocityRef.current) * 10) * cfg.trackScaleMax;
      }
      trackRef.current.style.transformOrigin = `50% ${layout.B}px`;
      trackRef.current.style.transform = `scale(${trackScale.toFixed(4)})`;
    }

    // Render cards
    renderCards();

    if (typeof window !== "undefined") {
      window.__carouselState = {
        pos: posRef.current,
        target: targetRef.current,
        velocity: velocityRef.current,
        isVisible: isVisibleRef.current,
        moving,
        isDragging: isDraggingRef.current,
        rAFId: rAFIdRef.current
      };
    }

    if (moving || isDraggingRef.current) {
      isSettledRef.current = false;
      if (isVisibleRef.current) {
        rAFIdRef.current = requestAnimationFrame(tick);
      }
    } else {
      isSettledRef.current = true;
      rAFIdRef.current = null;

      // Announce active card politely on settle
      const settledIdx = positiveModulo(Math.round(posRef.current), itemCount);
      if (lastAnnouncedIdxRef.current !== settledIdx) {
        lastAnnouncedIdxRef.current = settledIdx;
        const active = items[settledIdx];
        if (active) {
          setSettledAnnouncement(
            `Item ${settledIdx + 1} of ${itemCount}: ${active.title}, ${active.category}`
          );
        }
      }
    }
  }, [items, cfg, renderCards]);

  // Request tick helper
  const requestTick = useCallback(() => {
    isVisibleRef.current = true;
    isSettledRef.current = false;
    if (!rAFIdRef.current) {
      rAFIdRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  // Apply layout measurements and CSS custom properties
  const updateLayout = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const W = rect.width || window.innerWidth;
    const H = rect.height || 720;
    const isMobile = W < 640;

    const layout = computeLayout(W, H, isMobile);
    layoutRef.current = layout;

    stage.style.setProperty("--card-w", `${layout.C}px`);
    stage.style.setProperty("--card-h", `${layout.cardHeight}px`);
    stage.style.setProperty("--card-h-half", `${layout.cardHeight / 2}px`);
    stage.style.setProperty("--baseline-px", `${layout.B}px`);
    stage.style.perspectiveOrigin = `50% ${layout.B}px`;
    stage.style.perspective = `${layout.P}px`;

    // Render cards immediately with current layout
    renderCards();
    requestTick();
  }, [renderCards, requestTick]);

  // Pointer event handlers
  const handlePointerDown = useCallback(
    (e) => {
      // Primary button only
      if (e.button !== 0) return;

      const stage = stageRef.current;
      if (!stage) return;

      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      stage.classList.add("is-dragging");
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartPosRef.current = posRef.current;
      dragPosRef.current = posRef.current;
      dragDistanceRef.current = 0;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = performance.now();
      velocityTrackerRef.current = 0;

      requestTick();
    },
    [requestTick]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;
      const layout = layoutRef.current;
      if (!layout) return;

      const dx = e.clientX - dragStartXRef.current;
      dragDistanceRef.current = Math.max(
        dragDistanceRef.current,
        Math.abs(dx)
      );

      // Dragging left advances; dragging right reverses
      const spacing = layout.spacing;
      dragPosRef.current = dragStartPosRef.current - dx / (spacing * 1.1);

      // Smooth pointer velocity in px/ms
      const now = performance.now();
      const dt = now - lastPointerTimeRef.current;
      if (dt > 0) {
        const vLatest = (e.clientX - lastPointerXRef.current) / dt;
        velocityTrackerRef.current =
          0.6 * velocityTrackerRef.current + 0.4 * vLatest;
      }
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;

      requestTick();
    },
    [requestTick]
  );

  const handlePointerUpOrCancel = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;
      const stage = stageRef.current;
      if (stage) {
        try {
          if (stage.hasPointerCapture(e.pointerId)) {
            stage.releasePointerCapture(e.pointerId);
          }
        } catch {
          /* ignore */
        }
        stage.classList.remove("is-dragging");
      }

      isDraggingRef.current = false;
      const layout = layoutRef.current;

      if (reducedMotionRef.current || !layout) {
        targetRef.current = Math.round(dragPosRef.current);
        posRef.current = targetRef.current;
        requestTick();
        return;
      }

      const spacing = layout.spacing;
      // Project ahead with smoothed pointer velocity
      const projected =
        dragPosRef.current - (velocityTrackerRef.current * 280) / spacing;
      // Clamp projection to within 3 items of current logical position
      const clamped = Math.max(
        posRef.current - 3,
        Math.min(posRef.current + 3, projected)
      );
      targetRef.current = Math.round(clamped);

      requestTick();
    },
    [requestTick]
  );

  // Card click handler: center clicked card if drag was <= 4px
  const handleCardClick = useCallback(
    (index) => {
      if (dragDistanceRef.current > 4) {
        // Drag swipe just completed: suppress accidental click
        return;
      }

      const itemCount = items.length;
      const o =
        positiveModulo(
          index - followersRef.current[index] + itemCount / 2,
          itemCount
        ) -
        itemCount / 2;

      if (Math.abs(o) < 0.25) {
        // Already center: trigger optional external callback
        if (onCardClick) onCardClick(items[index], index);
        return;
      }

      // Center the clicked neighbor using nearest logical index
      const nearestLogical = posRef.current + o;
      targetRef.current = Math.round(nearestLogical);

      if (reducedMotionRef.current) {
        posRef.current = targetRef.current;
      }
      requestTick();
    },
    [items, onCardClick, requestTick]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        targetRef.current = Math.round(posRef.current) + 1;
        if (reducedMotionRef.current) posRef.current = targetRef.current;
        requestTick();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        targetRef.current = Math.round(posRef.current) - 1;
        if (reducedMotionRef.current) posRef.current = targetRef.current;
        requestTick();
      }
    },
    [requestTick]
  );

  // Horizontal wheel / trackpad gestures
  const handleWheel = useCallback(
    (e) => {
      if (
        Math.abs(e.deltaX) > Math.abs(e.deltaY) &&
        Math.abs(e.deltaX) >= 8
      ) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTimeRef.current > 350) {
          lastWheelTimeRef.current = now;
          const step = e.deltaX > 0 ? 1 : -1;
          targetRef.current = Math.round(posRef.current) + step;
          if (reducedMotionRef.current) posRef.current = targetRef.current;
          requestTick();
        }
      }
    },
    [requestTick]
  );

  // ResizeObserver and media query setup
  useEffect(() => {
    updateLayout();

    const stage = stageRef.current;
    if (!stage) return;

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateLayout();
      });
      ro.observe(stage);
    }

    const handleWindowResize = () => updateLayout();
    window.addEventListener("resize", handleWindowResize);

    // Motion runs unconditionally on all systems
    reducedMotionRef.current = false;

    // Page visibility listener
    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState !== "hidden";
      if (isVisibleRef.current && !isSettledRef.current) {
        requestTick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // IntersectionObserver to pause when offscreen
    let io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            isVisibleRef.current = true;
            if (!isSettledRef.current) {
              requestTick();
            }
          } else {
            // Only pause if settled and not actively dragging
            if (isSettledRef.current && !isDraggingRef.current) {
              isVisibleRef.current = false;
            }
          }
        },
        { threshold: 0.01 }
      );
      io.observe(stage);
    }

    // Initial render
    requestTick();

    return () => {
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
        rAFIdRef.current = null;
      }
    };
  }, [updateLayout, requestTick]);

  return (
    <div
      className={`editorial-carousel-wrapper ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      {/* Screen reader instructions */}
      <div className="editorial-sr-only">
        Interactive 3D editorial gallery. Use left and right arrow keys or drag
        horizontally to rotate through cards.
      </div>

      {/* Polite live region announcing settled selection */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="editorial-sr-only"
      >
        {settledAnnouncement}
      </div>

      <div
        ref={stageRef}
        className="editorial-carousel-stage"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onLostPointerCapture={handlePointerUpOrCancel}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
      >
        <div ref={trackRef} className="editorial-carousel-track">
          {items.map((item, idx) => {
            const num = String(idx + 1).padStart(2, "0");
            return (
              <div
                key={item.id || idx}
                ref={(el) => (cardRefs.current[idx] = el)}
                className="editorial-card"
                onClick={() => handleCardClick(idx)}
                style={{
                  top: "calc(50% - var(--card-h-half, 240px))",
                  width: "var(--card-w, 360px)",
                  height: "var(--card-h, 480px)",
                  marginLeft: "calc(-0.5 * var(--card-w, 360px))",
                }}
              >
                <div className="editorial-card-inner">
                  {/* Portrait image with local asset and remote fallback */}
                  <img
                    className="editorial-card-img"
                    src={item.src}
                    alt={item.alt || item.title}
                    loading={idx < 3 ? "eager" : "lazy"}
                    draggable={false}
                    onError={(e) => {
                      if (item.fallbackSrc && e.currentTarget.src !== item.fallbackSrc) {
                        e.currentTarget.src = item.fallbackSrc;
                      }
                    }}
                  />

                  {/* Vertical shade overlay: clear top, rgba(10,0,0,0.75) bottom */}
                  <div
                    className="editorial-overlay-shade"
                    aria-hidden="true"
                  />

                  {/* Soft radial vignette overlay: darkens outside edges */}
                  <div
                    className="editorial-overlay-vignette"
                    aria-hidden="true"
                  />

                  {/* Lower metadata overlay: above overlays, fades outward */}
                  <div
                    ref={(el) => (textRefs.current[idx] = el)}
                    className="editorial-card-content"
                  >
                    <div className="editorial-card-info">
                      <span className="editorial-card-category">
                        {item.category}
                      </span>
                      <h3 className="editorial-card-title">{item.title}</h3>
                    </div>
                    <span
                      className="editorial-card-number"
                      aria-hidden="true"
                    >
                      {num}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

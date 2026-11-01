import { useEffect, useRef } from "react";

export default function BeforeAfterSection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // --- drag-to-compare logic (now isolated so it can't block reveal-on-scroll) ---
    const shell = root.querySelector("#baShell");
    const before = root.querySelector("#baBefore");
    const handle = root.querySelector("#baHandle");

    let dragging = false;
    let cleanupDrag = () => {};

    function setPos(clientX) {
      const rect = shell.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + "%";
    }

    if (shell && before && handle) {
      const onPointerDown = (e) => {
        dragging = true;
        setPos(e.clientX);
        shell.setPointerCapture(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (dragging) setPos(e.clientX);
      };
      const onPointerUp = () => {
        dragging = false;
      };
      const onPointerLeave = () => {
        dragging = false;
      };

      shell.addEventListener("pointerdown", onPointerDown);
      shell.addEventListener("pointermove", onPointerMove);
      shell.addEventListener("pointerup", onPointerUp);
      shell.addEventListener("pointerleave", onPointerLeave);

      cleanupDrag = () => {
        shell.removeEventListener("pointerdown", onPointerDown);
        shell.removeEventListener("pointermove", onPointerMove);
        shell.removeEventListener("pointerup", onPointerUp);
        shell.removeEventListener("pointerleave", onPointerLeave);
      };
    } else {
      // Don't let a missing drag element silently kill the reveal-on-scroll
      // logic below (which used to live in the same try-less block).
      console.warn(
        "BeforeAfterSection: one or more drag elements (#baShell, #baBefore, #baHandle) were not found. Drag-to-compare is disabled, but content will still reveal.",
      );
    }

    // --- reveal-on-scroll: runs independently of the drag setup above ---
    const revealEls = root.querySelectorAll(".reveal");
    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      // No IntersectionObserver support: just show everything.
      revealEls.forEach((el) => el.classList.add("in-view"));
    }

    // Safety net: if for any reason an element never intersects
    // (e.g. it's already in view but the observer fires oddly, or it's
    // positioned off-screen and never scrolled to), force reveal after
    // a short delay so content is never permanently invisible.
    const fallbackTimer = setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("in-view"));
    }, 2000);

    return () => {
      cleanupDrag();
      if (io) io.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ BEFORE / AFTER ============ */
        .ba {
            padding: 110px 0;
            background: #141311; color: #faf7f0;
        }

        .ba .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .ba .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .ba-shell {
            position: relative;
            max-width: 960px;
            margin: 44px auto 0;
            aspect-ratio: 16/9;
            overflow: hidden;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.65);
            cursor: ew-resize;
            user-select: none;
        }

        .ba-after,
        .ba-before {
            position: absolute;
            inset: 0;
        }

        .ba-after .room-block,
        .ba-before .room-block {
            height: 100%;
            width: 100%;
            position: relative;
            overflow: hidden;
        }

        .ba-after .room-block img,
        .ba-before .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .ba-after .room-block::after,
        .ba-before .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 60%, rgba(23,20,15,.75) 100%);
        }

        .ba-after .room-block .rb-label,
        .ba-before .room-block .rb-label {
            position: absolute;
            left: 16px;
            bottom: 14px;
            right: 16px;
            z-index: 2;
            color: var(--paper, #faf7f0);
            font-size: 13.5px;
            font-weight: 600;
            letter-spacing: .01em;
        }

        .ba-before {
            clip-path: inset(0 50% 0 0);
        }

        .ba-tag {
            position: absolute;
            top: 16px;
            z-index: 5;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            padding: 7px 13px;
            background: rgba(23, 20, 15, .55);
            color: var(--paper, #faf7f0);
            backdrop-filter: blur(2px);
        }

        .ba-tag.before {
            left: 16px;
        }

        .ba-tag.after {
            right: 16px;
        }

        .ba-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            background: var(--paper, #faf7f0);
            z-index: 6;
            transform: translateX(-1px);
            pointer-events: none;
        }

        .ba-grip {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--brass-light, #dfba73), var(--brass, #c5a059));
            border-radius: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, .5), 0 0 15px rgba(197, 160, 89, 0.4);
            border: 2px solid #ffffff;
            z-index: 7;
            pointer-events: none;
        }

        .ba-grip svg {
            width: 22px;
            height: 22px;
            color: #ffffff;
        }

        .ba-hint {
            text-align: center;
            margin-top: 16px;
            font-size: 12.5px;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: rgba(250, 247, 240, 0.6);
        }
      `}</style>

      <section className="ba" id="ba">
        <div className="wrap">
          <div
            className="section-head reveal"
            style={{ textAlign: "center", margin: "0 auto" }}
          >
            
            <h2 className="section-title" style={{ maxWidth: "none", color: "#faf7f0" }}>
              Drag to compare - before &amp; after
            </h2>
          </div>
          <div className="ba-shell reveal" id="baShell">
            <div className="ba-after">
              <div className="room-block" style={{ height: "100%" }}>
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
                  alt="Renovated living room, full renovation"
                  loading="lazy"
                  draggable="false"
                />
                
              </div>
            </div>
            <div className="ba-before" id="baBefore">
              <div className="room-block" style={{ height: "100%" }}>
                <img
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
                  alt="Original layout before renovation"
                  loading="lazy"
                  draggable="false"
                />
                
              </div>
            </div>
            <div className="ba-tag before">Before</div>
            <div className="ba-tag after">After</div>
            <div className="ba-handle" id="baHandle">
              <div className="ba-grip">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <p className="ba-hint">
            Drag slider to compare raw space with completed luxury handover
          </p>
        </div>
      </section>
    </div>
  );
}

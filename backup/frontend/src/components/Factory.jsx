import { useEffect, useRef } from "react";

export default function FactorySection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealEls = root.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
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

    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      <style>{`
        /* material swatch strip - signature motif */
        .material-strip {
            display: flex;
            height: 8px;
            width: 100%;
        }

        .material-strip span {
            flex: 1;
        }

        .m-travertine {
            background: linear-gradient(100deg, #e7dcc0, #cbb98f 45%, #e7dcc0);
        }

        .m-brass {
            background: linear-gradient(100deg, #8a6b26, #d8b45c 45%, #8a6b26);
        }

        .m-walnut {
            background: linear-gradient(100deg, #4a3524, #7a5232 45%, #4a3524);
        }

        .m-concrete {
            background: linear-gradient(100deg, #8f8b81, #c4c0b4 45%, #8f8b81);
        }

        /* ============ FACTORY ============ */
        .factory {
            padding: 110px 0;
            background: #11100e;
            color: var(--paper, #faf7f0);
            position: relative;
            overflow: hidden;
        }

        /*
          Same fix as every other section: .reveal needs the .in-view
          class (added by the observer above) to fade in.
        */
        .factory .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .factory .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .factory .material-strip {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        }

        .factory-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }

        .factory-copy p {
            margin-top: 18px;
            color: rgba(250, 247, 240, .72);
            line-height: 1.8;
            font-size: 15px;
        }

        .factory-divs {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        .fdiv {
            display: flex;
            gap: 16px;
            align-items: flex-start;
            padding-bottom: 18px;
            border-bottom: 1px solid rgba(250, 247, 240, .14);
        }

        .fdiv:last-child {
            border: none;
            padding-bottom: 0;
        }

        .fdiv svg {
            width: 20px;
            height: 20px;
            color: var(--brass-light, #d8b568);
            flex: none;
            margin-top: 2px;
        }

        .fdiv h5 {
            font-size: 15px;
            color: var(--paper, #faf7f0);
        }

        .fdiv p {
            margin-top: 4px;
            font-size: 13.5px;
            color: rgba(250, 247, 240, .62);
        }

        .factory-visual {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
        }

        .factory-visual .room-block {
            aspect-ratio: 1/1;
            position: relative;
            overflow: hidden;
            border-radius: 2px;
        }

        .factory-visual .room-block:nth-child(1) {
            grid-column: span 2;
            aspect-ratio: 16/9;
        }

        .factory-visual .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .factory-visual .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 50%, rgba(23,20,15,.82) 100%);
        }

        .factory-visual .rb-tag {
            position: absolute;
            top: 14px;
            left: 14px;
            z-index: 2;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--brass-light, #d8b568);
            background: rgba(23, 20, 15, .55);
            padding: 6px 11px;
            backdrop-filter: blur(4px);
        }

        .factory-visual .rb-label {
            position: absolute;
            left: 14px;
            right: 14px;
            bottom: 12px;
            z-index: 2;
            color: var(--paper, #faf7f0);
            font-size: 13.5px;
            font-weight: 600;
            letter-spacing: .01em;
            line-height: 1.3;
        }

        @media(max-width:900px) {
            .factory-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
        }
      `}</style>

      <section className="factory">
        <div className="material-strip">
          <span className="m-travertine"></span>
          <span className="m-brass"></span>
          <span className="m-walnut"></span>
          <span className="m-concrete"></span>
        </div>
        <div className="wrap factory-grid">
          <div className="factory-visual reveal">
            <div className="room-block">
              <img
                src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80"
                alt="Al Quoz 3 production facility floor"
                loading="lazy"
              />
              <span className="rb-tag">Al Quoz 3</span>
              <span className="rb-label">35,000 sq.ft Production Facility</span>
            </div>
            <div className="room-block">
              <img
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=700&q=80"
                alt="Metal and glass fabrication workshop"
                loading="lazy"
              />
              <span className="rb-label">Metal &amp; Glass</span>
            </div>
            <div className="room-block">
              <img
                src="https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=700&q=80"
                alt="Joinery bay with woodworking equipment"
                loading="lazy"
              />
              <span className="rb-label">Joinery Bay</span>
            </div>
          </div>
          <div className="factory-copy reveal">
            
            <h2
              className="section-title"
              style={{ color: "#faf7f0", maxWidth: "14ch" }}
            >
              A 35,000 sq.ft facility in Al Quoz 3
            </h2>
            <p>
              Three specialist divisions share one roof, keeping design,
              fabrication and finishing on a single site.
            </p>
            <div className="factory-divs">
              <div className="fdiv">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 20V8l8-5 8 5v12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <h5>Joinery &amp; Upholstery</h5>
                  <p>
                    Expertly constructed woodwork, built to design
                    specification.
                  </p>
                </div>
              </div>
              <div className="fdiv">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <h5>Metal &amp; Glass</h5>
                  <p>Custom architectural metalwork and glass solutions.</p>
                </div>
              </div>
              <div className="fdiv">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12h16M4 6h16M4 18h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <h5>Signage</h5>
                  <p>
                    Branding elements finished and fitted to match the interior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

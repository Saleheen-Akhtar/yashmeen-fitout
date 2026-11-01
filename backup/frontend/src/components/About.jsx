import { useEffect, useRef } from "react";

export default function AboutSection() {
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
        /* ============ ABOUT ============ */
        .about {
            padding: 110px 0;
            background: var(--paper, #faf7f0);
        }

        .about .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .about .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .about-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 70px;
            align-items: center;
        }

        .about-copy p {
            color: var(--ink-soft, #5e584f);
            line-height: 1.8;
            font-size: 16px;
            margin-top: 18px;
        }

        .about-visual {
            position: relative;
        }

        .about-visual .stack {
            display: grid;
            grid-template-columns: 1.2fr .8fr;
            gap: 16px;
        }

        .about-visual .room-block {
            aspect-ratio: 1/1;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
        }

        .about-visual .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.6s ease;
        }

        .about-visual .room-block:hover img {
            transform: scale(1.04);
        }

        .about-visual .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 60%, rgba(23,20,15,.75) 100%);
            pointer-events: none;
        }

        .about-visual .rb-label {
            position: absolute;
            left: 16px;
            bottom: 16px;
            z-index: 2;
            font-family: var(--font-serif);
            font-size: 16px;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .about-badge {
            position: absolute;
            left: -24px;
            bottom: -24px;
            background: var(--ink, #17140f);
            color: #ffffff;
            padding: 24px 28px;
            border-radius: 4px;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
            border-left: 3px solid var(--brass);
            z-index: 3;
        }

        .about-badge .n {
            font-family: var(--font-serif);
            font-size: 38px;
            font-weight: 600;
            color: var(--brass-light);
            line-height: 1;
        }

        .about-badge .t {
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.75);
            margin-top: 6px;
            max-width: 16ch;
        }

        @media(max-width:900px) {
            .about-grid {
                grid-template-columns: 1fr;
                gap: 44px;
            }

            .about-visual {
                order: -1;
            }

            .about-badge {
                left: 16px;
                bottom: -20px;
            }
        }

        .pillars {
            margin-top: 76px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border-top: 1px solid var(--line, rgba(23, 20, 15, 0.12));
            border-left: 1px solid var(--line, rgba(23, 20, 15, 0.12));
        }

        .pillar {
            padding: 32px 28px;
            border-right: 1px solid var(--line, rgba(23, 20, 15, 0.12));
            border-bottom: 1px solid var(--line, rgba(23, 20, 15, 0.12));
            background: transparent;
            transition: all .35s ease;
        }

        .pillar:hover {
            background: #ffffff;
            box-shadow: 0 16px 36px -12px rgba(23, 20, 15, 0.12);
            transform: translateY(-3px);
            z-index: 2;
        }

        .pillar .idx {
            font-family: var(--font-serif);
            font-size: 16px;
            color: var(--brass);
            font-weight: 600;
        }

        .pillar h4 {
            margin-top: 12px;
            font-size: 17px;
            font-weight: 600;
            color: var(--ink);
            line-height: 1.3;
        }

        .pillar p {
            margin-top: 10px;
            font-size: 13.5px;
            color: var(--ink-soft);
            line-height: 1.65;
        }

        @media(max-width:800px) {
            .pillars {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media(max-width:520px) {
            .pillars {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <section className="about" id="about">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-copy reveal">
              <span className="eyebrow">Who We Are</span>
              <h2 className="section-title" style={{ maxWidth: "16ch" }}>
                A single studio, every trade under one roof.
              </h2>
              <p>
                Yashmeen Future Building is a Dubai-based fit-out and interior architecture
                studio specialising in bespoke, functional spaces for
                commercial, hospitality and residential clients. From concept
                sketch to handover, our architects, 3D visualisers, MEP
                engineers and joinery craftsmen work from the same facility in
                Al Quoz — so nothing gets lost between drawing and delivery.
              </p>
              <p>
                Because our MEP team sits alongside design and manufacturing,
                air-conditioning, electrical, plumbing and automation works are planned in
                from day one rather than bolted on later. It's a cohesive structure that
                keeps large-scale turnkey fit-outs moving on one predictable timeline.
              </p>
              <div className="hero-ctas" style={{ marginTop: "32px" }}>
                <a href="#contact" className="btn btn-brass">
                  Explore Our Studio
                </a>
              </div>
            </div>
            <div className="about-visual reveal">
              <div className="stack">
                <div className="room-block">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                    alt="Al Quoz fit-out studio executive space"
                    loading="lazy"
                  />
                  <span className="rb-label">Al Quoz Studio</span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="room-block">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                      alt="Joinery bay woodworker cutting custom architectural timber"
                      loading="lazy"
                    />
                    <span className="rb-label">Joinery Bay</span>
                  </div>
                  <div className="room-block">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
                      alt="Interior design desk with material samples"
                      loading="lazy"
                    />
                    <span className="rb-label">Design Atelier</span>
                  </div>
                </div>
              </div>
              <div className="about-badge">
                <div className="n">9+</div>
                <div className="t">Years shaping Dubai interiors</div>
              </div>
            </div>
          </div>

          <div className="pillars reveal">
            <div className="pillar">
              <div className="idx">01</div>
              <h4>Single-Source Accountability</h4>
              <p>
                Design, engineering, joinery fabrication, and MEP run under one team with zero subcontractor blame-shifting.
              </p>
            </div>
            <div className="pillar">
              <div className="idx">02</div>
              <h4>In-House Al Quoz Facility</h4>
              <p>
                35,000 sq.ft manufacturing facility producing custom joinery, architectural metalwork, and glass directly.
              </p>
            </div>
            <div className="pillar">
              <div className="idx">03</div>
              <h4>ISO-Audited Standards</h4>
              <p>
                Every project runs under ISO 9001, 14001, and 45001 standards governing structural tolerances and site safety.
              </p>
            </div>
            <div className="pillar">
              <div className="idx">04</div>
              <h4>Guaranteed 60–90 Day Handover</h4>
              <p>
                Precision scheduling and dedicated site superintendents ensure handovers happen on schedule without quality drift.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

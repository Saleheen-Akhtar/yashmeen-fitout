import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function ServicesSection() {
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
        /* ============ SERVICES ============ */
        .services {
            padding: 110px 0;
            background: var(--ink, #17140f);
            color: var(--paper, #faf7f0);
        }

        /*
          Same fix as About / Clients: .reveal needs an .in-view class
          (added by the observer above) to fade in. Scoped locally so
          this section works standalone regardless of the rest of the
          page.
        */
        .services .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .services .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .services .eyebrow {
            color: var(--brass-light, #d8b568);
        }

        .services .eyebrow::before {
            background: var(--brass-light, #d8b568);
        }

        .services h2.section-title {
            color: var(--paper, #faf7f0);
        }

        .services .section-head p.lede {
            color: rgba(250, 247, 240, .68);
        }

        .service-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            background: transparent;
            border: none;
        }

        .service-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 4px;
            padding: 40px 32px;
            backdrop-filter: blur(12px);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
            transition: transform 0.35s var(--ease, ease), background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }

        .service-card:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(197, 160, 89, 0.4);
            transform: translateY(-4px);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(197, 160, 89, 0.1);
        }

        .service-card .snum {
            font-size: 11px;
            letter-spacing: .12em;
            color: var(--brass-light, #d8b568);
            font-weight: 700;
        }

        .service-card h3 {
            margin-top: 18px;
            font-size: 20px;
            color: var(--paper, #faf7f0);
        }

        .service-card p {
            margin-top: 12px;
            font-size: 14px;
            line-height: 1.7;
            color: rgba(250, 247, 240, .62);
        }

        .service-card .more {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 20px;
            font-size: 12.5px;
            letter-spacing: .06em;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--brass-light, #d8b568);
            text-decoration: none;
        }

        .service-card .more svg {
            width: 13px;
            height: 13px;
            transition: transform .3s;
        }

        .service-card:hover .more svg {
            transform: translateX(4px);
        }

        @media(max-width:900px) {
            .service-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media(max-width:600px) {
            .service-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <section className="services" id="services">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Disciplines</span>
            <h2 className="section-title">
              Six disciplines, one accountable studio
            </h2>
            <p className="lede">
              Every service below is delivered by our own people, from our own
              facility - no layers of subcontracting between your brief and the
              finished room.
            </p>
          </div>
          <div className="service-grid reveal">
            <div className="service-card">
              <div className="snum">01</div>
              <h3>Interior Fit-Out</h3>
              <p>
                Design, construction and commissioning of luxury interiors -
                walls, ceilings, MEP and IT - as one turnkey package.
              </p>
              <Link to="/services/interior-design" className="more">
                Read More{" "}
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
            <div className="service-card">
              <div className="snum">02</div>
              <h3>Interior Design</h3>
              <p>
                Concept development, 3D visualisation and material sourcing that
                turns a brief into a buildable design.
              </p>
              <Link to="/services/interior-design" className="more">
                Read More{" "}
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
            <div className="service-card">
              <div className="snum">03</div>
              <h3>MEP Engineering</h3>
              <p>
                In-house air-conditioning, electrical and plumbing teams,
                sequenced with construction from day one.
              </p>
              <Link to="/services/construction" className="more">
                Read More{" "}
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
            <div className="service-card">
              <div className="snum">04</div>
              <h3>Carpentry &amp; Joinery</h3>
              <p>
                Custom wardrobes, kitchens, doors and furniture, hand-built in
                our Al Quoz joinery facility.
              </p>
              <Link to="/services/interior-design" className="more">
                Read More{" "}
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
            <div className="service-card">
              <div className="snum">05</div>
              <h3>Pools &amp; Landscaping</h3>
              <p>
                Bespoke residential pools, gardens and terraces designed to
                extend your interior outdoors.
              </p>
              <Link to="/services/architecture" className="more">
                Read More{" "}
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
            <div className="service-card">
              <div className="snum">06</div>
              <h3>Smart Home / IT</h3>
              <p>
                Home automation, CCTV, background audio and fire systems,
                integrated during fit-out, not after.
              </p>
              <Link to="/services/office-renovation" className="more">
                Read More{" "}
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

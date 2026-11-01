import { useEffect, useRef } from "react";

export default function WhySection() {
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
        /* ============ WHY US ============ */
        .why {
            padding: 110px 0;
            background: var(--paper, #ffffff);
        }

        /*
          Same fix as every other section: .reveal needs the .in-view
          class (added by the observer above) to fade in. Scoped locally
          so this section works standalone.
        */
        .why .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .why .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .why-grid {
            display: grid;
            grid-template-columns: .85fr 1.15fr;
            gap: 60px;
        }

        .why-list {
            border-top: 1px solid var(--line, #e7e2d8);
        }

        .why-item {
            padding: 28px 0;
            border-bottom: 1px solid var(--line, #e7e2d8);
            display: grid;
            grid-template-columns: 60px 1fr;
            gap: 20px;
        }

        .why-item .wn {
            font-family: var(--serif, Georgia, serif);
            font-size: 26px;
            color: var(--stone-deep, #c9c0aa);
            font-weight: 600;
        }

        .why-item h4 {
            font-size: 17.5px;
            color: var(--ink, #17140f);
        }

        .why-item p {
            margin-top: 8px;
            font-size: 14.5px;
            color: var(--ink-soft, #6b6255);
            line-height: 1.7;
        }

        .why-visual {
            position: relative;
        }

        .why-visual .room-block {
            height: 100%;
            min-height: 420px;
            position: relative;
            overflow: hidden;
            border-radius: 2px;
        }

        .why-visual .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            position: absolute;
            inset: 0;
        }

        .why-visual .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 50%, rgba(23,20,15,.82) 100%);
        }

        .why-visual .rb-tag {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 2;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--brass-light, #d8b568);
            background: rgba(23, 20, 15, .55);
            padding: 7px 12px;
            backdrop-filter: blur(4px);
        }

        .why-visual .rb-label {
            position: absolute;
            left: 20px;
            bottom: 20px;
            right: 20px;
            z-index: 2;
            font-family: var(--serif, Georgia, serif);
            font-size: 19px;
            line-height: 1.3;
            color: var(--paper, #faf7f0);
        }

        @media(max-width:900px) {
            .why-grid {
                grid-template-columns: 1fr;
            }

            .why-visual {
                order: -1;
            }

            .why-visual .room-block {
                min-height: 260px;
            }
        }
      `}</style>

      <section className="why" id="why">
        <div className="wrap why-grid">
          <div>
            <div className="section-head reveal" style={{ marginBottom: "0" }}>
              <span className="eyebrow">Why Us</span>
              <h2 className="section-title" style={{ maxWidth: "13ch" }}>
                Why clients choose to build with us.
              </h2>
            </div>
            <div className="why-list reveal">
              <div className="why-item">
                <div className="wn">01</div>
                <div>
                  <h4>Everything in-house</h4>
                  <p>
                    Design, engineering, manufacturing and installation under
                    one team — no subcontracting, no quality drift.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">02</div>
                <div>
                  <h4>Fast, reliable delivery</h4>
                  <p>
                    Most projects complete in 60–90 days thanks to architects,
                    MEP engineers and site teams working from one schedule.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">03</div>
                <div>
                  <h4>ISO-certified quality</h4>
                  <p>
                    ISO 9001, 14001 and 45001 govern how every project is run,
                    independently audited each year.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">04</div>
                <div>
                  <h4>Transparent process</h4>
                  <p>
                    Regular progress updates and no surprises — if a challenge
                    appears on site, we resolve it and tell you.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">05</div>
                <div>
                  <h4>Regional coverage</h4>
                  <p>
                    Based in Dubai, delivering across Abu Dhabi, Sharjah and the
                    Northern Emirates.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="why-visual reveal">
            <div className="room-block" style={{ height: "100%" }}>
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="Office fit-out site walkthrough, DIFC Dubai"
                loading="lazy"
              />
              <span className="rb-tag">Site Walkthrough</span>
              <span className="rb-label">Office Fit-Out — DIFC, Dubai</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
            background: #11100e; color: #faf7f0;
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
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: 32px;
        }

        .why-item {
            padding: 24px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            display: grid;
            grid-template-columns: 50px 1fr;
            gap: 18px;
        }

        .why-item .wn {
            font-family: var(--font-serif);
            font-size: 24px;
            color: var(--brass-light, #dfba73);
            font-weight: 500;
        }

        .why-item h4 {
            font-size: 17px;
            color: #faf7f0;
            font-weight: 600;
        }

        .why-item p {
            margin-top: 6px;
            font-size: 14px;
            color: rgba(250, 247, 240, 0.7);
            line-height: 1.65;
        }

        .why-visual {
            position: relative;
        }

        .why-visual .room-block {
            height: 100%;
            min-height: 440px;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.55);
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
              
              <h2 className="section-title" style={{ maxWidth: "16ch", color: "#faf7f0" }}>
                Disciplined 4-stage execution methodology
              </h2>
            </div>
            <div className="why-list reveal">
              <div className="why-item">
                <div className="wn">01</div>
                <div>
                  <h4>Technical Survey &amp; Statutory Approvals</h4>
                  <p>
                    Full laser-scanning site survey, MEP load calculations, and expedited Dubai Municipality, Civil Defense, and master-developer permits.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">02</div>
                <div>
                  <h4>In-House Al Quoz Joinery Benchwork</h4>
                  <p>
                    Custom millwork, architectural metalwork, and glass partitioning handcrafted in our 35,000 sq.ft facility before site delivery.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">03</div>
                <div>
                  <h4>Sequenced Turnkey Fit-Out Construction</h4>
                  <p>
                    Dedicated site superintendents coordinate acoustics, HVAC, smart lighting, and wall finishes under one uncompromised milestone schedule.
                  </p>
                </div>
              </div>
              <div className="why-item">
                <div className="wn">04</div>
                <div>
                  <h4>Handover &amp; 12-Month Snag Warranty</h4>
                  <p>
                    Comprehensive air-balancing, authority completion certificates, zero-snag delivery, and 12-month post-handover warranty support.
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
              <span className="rb-label">Office Fit-Out - DIFC, Dubai</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

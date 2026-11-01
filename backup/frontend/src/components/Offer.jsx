import { useEffect, useRef } from "react";

export default function OfferSection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // --- existing tab-switching logic (unchanged) ---
    const offerTabs = root.querySelectorAll(".offer-tab");
    const offerPanels = root.querySelectorAll(".offer-panel");
    const offerHandlers = [];
    offerTabs.forEach((tab) => {
      const handler = () => {
        offerTabs.forEach((t) => t.classList.remove("active"));
        offerPanels.forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        root.querySelector("#" + tab.dataset.tab).classList.add("active");
      };
      tab.addEventListener("click", handler);
      offerHandlers.push([tab, handler]);
    });

    // --- reveal-on-scroll: this was missing, same as every other section ---
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
      revealEls.forEach((el) => el.classList.add("in-view"));
    }

    return () => {
      offerHandlers.forEach(([tab, handler]) =>
        tab.removeEventListener("click", handler),
      );
      if (io) io.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ OFFERINGS TABS ============ */
        .offer {
            padding: 110px 0;
            background: #141311; color: #faf7f0;
        }

        /*
          Same fix as every other section: .reveal needs the .in-view
          class (added by the observer above) to fade in.
        */
        .offer .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .offer .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .offer-shell {
            display: grid;
            grid-template-columns: .7fr 1.3fr;
            gap: 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(16px);
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.55);
        }

        .offer-tabs {
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.01);
        }

        .offer-tab {
            display: block;
            width: 100%;
            text-align: left;
            padding: 22px 26px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            background: transparent;
            font-size: 14.5px;
            font-weight: 600;
            color: rgba(250, 247, 240, 0.65);
            transition: all .25s;
            cursor: pointer;
            border-left: 3px solid transparent;
        }

        .offer-tab.active {
            background: rgba(197, 160, 89, 0.12);
            color: var(--brass-light, #dfba73);
            border-left: 3px solid var(--brass, #c5a059);
        }

        .offer-panels {
            position: relative;
            min-height: 380px;
        }

        .offer-panel {
            display: none;
            padding: 44px;
            grid-template-columns: 1fr 1fr;
            gap: 36px;
            align-items: center;
        }

        .offer-panel.active {
            display: grid;
            animation: fadein .5s var(--ease, ease);
        }

        @keyframes fadein {
            from {
                opacity: 0;
                transform: translateY(8px);
            }

            to {
                opacity: 1;
                transform: none;
            }
        }

        .offer-panel h3 {
            font-family: var(--font-serif);
            font-size: 26px;
            color: #faf7f0;
            font-weight: 500;
            letter-spacing: -0.01em;
        }

        .offer-panel p {
            margin-top: 14px;
            color: rgba(250, 247, 240, 0.75);
            font-size: 15px;
            line-height: 1.75;
        }

        .offer-panel ul li::before {
            content: "";
            width: 5px;
            height: 5px;
            background: var(--brass, #a9832e);
            border-radius: 50%;
            flex: none;
        }

        .offer-panel .room-block {
            aspect-ratio: 1/1;
            position: relative;
            overflow: hidden;
            border-radius: 2px;
        }

        .offer-panel .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .offer-panel .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 55%, rgba(23,20,15,.8) 100%);
        }

        .offer-panel .room-block .rb-label {
            position: absolute;
            left: 16px;
            right: 16px;
            bottom: 14px;
            z-index: 2;
            color: var(--paper, #faf7f0);
            font-size: 13.5px;
            font-weight: 600;
            letter-spacing: .02em;
        }

        @media(max-width:860px) {
            .offer-shell {
                grid-template-columns: 1fr;
            }

            .offer-tabs {
                display: flex;
                overflow-x: auto;
                border-right: none;
                border-bottom: 1px solid var(--line-strong, #d8d2c4);
            }

            .offer-tab {
                white-space: nowrap;
                border-bottom: none;
                border-right: 1px solid var(--line, #e7e2d8);
            }

            .offer-panel {
                grid-template-columns: 1fr;
                padding: 30px 24px;
            }

            .offer-panel .room-block {
                order: -1;
                aspect-ratio: 16/9;
            }
        }
      `}</style>

      <section className="offer" id="offer">
        <div className="wrap">
          <div className="section-head reveal">
            
            <h2 className="section-title" style={{ color: "#faf7f0" }}>Scope of Turnkey Contracting</h2>
          </div>
          <div className="offer-shell reveal">
            <div className="offer-tabs">
              <button className="offer-tab active" data-tab="t1">
                Commercial Fit-Out
              </button>
              <button className="offer-tab" data-tab="t2">
                Residential Fit-Out
              </button>
              <button className="offer-tab" data-tab="t3">
                Joinery
              </button>
              <button className="offer-tab" data-tab="t4">
                Custom Furniture
              </button>
              <button className="offer-tab" data-tab="t5">
                Home Automation
              </button>
            </div>
            <div className="offer-panels">
              <div className="offer-panel active" id="t1">
                <div>
                  <h3>Commercial spaces that work as hard as you do.</h3>
                  <p>
                    From offices to lounges, we plan layouts around how teams
                    actually move, meet and focus - then build to a fixed
                    schedule.
                  </p>
                  <ul>
                    <li>Time-served engineers on every project</li>
                    <li>Single point of contact throughout</li>
                    <li>Fixed, transparent scheduling</li>
                    <li>Flexible with any building structure</li>
                  </ul>
                </div>
                <div className="room-block">
                  <img
                    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80"
                    alt="Open-plan office fit-out"
                    loading="lazy"
                  />
                  <span className="rb-label">Open-Plan Office Fit-Out</span>
                </div>
              </div>
              <div className="offer-panel" id="t2">
                <div>
                  <h3>Homes designed around daily life.</h3>
                  <p>
                    Residential fit-outs balance comfort and durability -
                    material choices that photograph well and hold up to real
                    living.
                  </p>
                  <ul>
                    <li>Personal design consultations</li>
                    <li>Material and finish sourcing</li>
                    <li>Minimal-disruption phasing</li>
                    <li>Post-handover support</li>
                  </ul>
                </div>
                <div className="room-block">
                  <img
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
                    alt="Family living room interior"
                    loading="lazy"
                  />
                  <span className="rb-label">Family Living Room</span>
                </div>
              </div>
              <div className="offer-panel" id="t3">
                <div>
                  <h3>Joinery built under one roof.</h3>
                  <p>
                    Our in-house joinery bay gives designers and craftsmen a
                    direct line - changes happen at the bench, not through
                    emails.
                  </p>
                  <ul>
                    <li>Custom wardrobes &amp; kitchens</li>
                    <li>Solid wood and veneer finishes</li>
                    <li>Precision-fit installation</li>
                    <li>Full attention to detail</li>
                  </ul>
                </div>
                <div className="room-block">
                  <img
                    src="https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=800&q=80"
                    alt="Handcrafted joinery workshop"
                    loading="lazy"
                  />
                  <span className="rb-label">Handcrafted Joinery</span>
                </div>
              </div>
              <div className="offer-panel" id="t4">
                <div>
                  <h3>Furniture made to your specification.</h3>
                  <p>
                    From dining sets to bespoke seating, each piece is built to
                    your exact dimensions, finish and use.
                  </p>
                  <ul>
                    <li>Premium quality materials</li>
                    <li>Functional, considered forms</li>
                    <li>Personalised design briefs</li>
                    <li>Fits any interior structure</li>
                  </ul>
                </div>
                <div className="room-block">
                  <img
                    src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80"
                    alt="Bespoke furniture piece"
                    loading="lazy"
                  />
                  <span className="rb-label">Bespoke Furniture</span>
                </div>
              </div>
              <div className="offer-panel" id="t5">
                <div>
                  <h3>Homes that respond to you.</h3>
                  <p>
                    Lighting, climate and security controlled from your phone or
                    by voice - integrated during fit-out, not retrofitted.
                  </p>
                  <ul>
                    <li>Energy-efficient systems</li>
                    <li>Intelligent lighting scenes</li>
                    <li>Smart security &amp; access</li>
                    <li>Voice and remote control</li>
                  </ul>
                </div>
                <div className="room-block">
                  <img
                    src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"
                    alt="Smart home living space"
                    loading="lazy"
                  />
                  <span className="rb-label">Smart Living</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

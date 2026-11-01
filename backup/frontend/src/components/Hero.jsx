import { useEffect, useRef } from "react";

export default function HeroSection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stats = root.querySelectorAll(".stat-band .num");
    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const dur = 1400;
            const start = performance.now();
            function tick(now) {
              const p = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(eased * target).toLocaleString();
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            statObs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 },
    );
    stats.forEach((s) => statObs.observe(s));

    return () => statObs.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ HERO ============ */
        .hero {
            padding: 58px 0 0;
            background: var(--ink);
            color: var(--paper);
            position: relative;
            overflow: hidden;
        }

        .hero-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
            overflow: hidden;
        }

        .hero-bg img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            object-position: center 30%;
        }

        .hero-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            background:
                linear-gradient(100deg, rgba(23, 20, 15, .94) 0%, rgba(23, 20, 15, .82) 32%, rgba(23, 20, 15, .5) 62%, rgba(23, 20, 15, .7) 100%),
                linear-gradient(0deg, rgba(23, 20, 15, .9) 0%, rgba(23, 20, 15, 0) 26%);
        }

        .hero .blueprint {
            position: absolute;
            inset: 0;
            z-index: 1;
            opacity: .35;
            background-image:
                linear-gradient(rgba(250, 247, 240, .05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(250, 247, 240, .05) 1px, transparent 1px);
            background-size: 42px 42px;
        }

        .hero::after {
            content: "";
            position: absolute;
            z-index: 1;
            right: -10%;
            top: 10%;
            width: 60%;
            height: 120%;
            background: radial-gradient(ellipse at center, rgba(169, 131, 46, .18), transparent 65%);
            pointer-events: none;
        }

        .hero-inner {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1.15fr .85fr;
            gap: 60px;
            align-items: center;
            padding-bottom: 70px;
        }

        .hero-visual {
            box-shadow: 0 30px 70px -30px rgba(0, 0, 0, .6);
        }

        .hero-copy .eyebrow {
            color: var(--brass-light);
        }

        .hero-copy .eyebrow::before {
            background: var(--brass-light);
        }

        .hero-copy h1 {
            font-family: var(--font-serif);
            font-size: clamp(38px, 5.2vw, 68px);
            font-weight: 500;
            line-height: 1.05;
            letter-spacing: -0.015em;
            margin-top: 18px;
            color: var(--paper);
        }

        .hero-copy h1 .em {
            font-style: italic;
            color: var(--brass-light);
            font-weight: 400;
        }

        .hero-copy p.lede {
            margin-top: 22px;
            font-size: 17px;
            line-height: 1.75;
            color: rgba(250, 247, 240, .72);
            max-width: 50ch;
        }

        .hero-points {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .hero-points li {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            font-size: 14.5px;
            color: rgba(250, 247, 240, .88);
        }

        .hero-points svg {
            flex: none;
            margin-top: 3px;
            width: 16px;
            height: 16px;
            color: var(--brass-light);
        }

        .hero-ctas {
            display: flex;
            gap: 16px;
            margin-top: 36px;
            flex-wrap: wrap;
        }

        .hero-visual {
            position: relative;
            aspect-ratio: 4/5;
            border-radius: 2px;
            overflow: hidden;
            border: 1px solid rgba(250, 247, 240, .14);
        }

        .hero-visual .room-block {
            height: 100%;
            width: 100%;
            position: relative;
        }

        .hero-visual .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .hero-visual .room-block::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(23,20,15,0) 55%, rgba(23,20,15,.85) 100%);
        }

        .hero-visual .rb-tag {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 3;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--brass-light);
            background: rgba(23, 20, 15, .55);
            padding: 7px 12px;
            backdrop-filter: blur(4px);
        }

        .hero-visual .rb-label {
            position: absolute;
            bottom: 60px;
            left: 20px;
            right: 20px;
            z-index: 3;
            font-family: var(--serif);
            font-size: 19px;
            line-height: 1.3;
            color: var(--paper);
        }

        .hero-visual .frame-tag {
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 3;
            background: var(--brass);
            color: var(--ink);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            padding: 8px 14px;
        }

        .stat-band {
            position: relative;
            z-index: 2;
            border-top: 1px solid rgba(250, 247, 240, .14);
            background: rgba(23, 20, 15, .55);
            backdrop-filter: blur(6px);
        }

        .stat-band .wrap {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
        }

        .stat-band .stat {
            padding: 30px 10px;
            text-align: center;
            border-right: 1px solid rgba(250, 247, 240, .14);
        }

        .stat-band .stat:last-child {
            border-right: none;
        }

        .stat-band .num {
            font-family: var(--font-serif);
            font-size: clamp(28px, 3.4vw, 42px);
            color: var(--brass-light);
            font-weight: 500;
            line-height: 1;
        }

        .stat-band .lbl {
            margin-top: 6px;
            font-size: 11.5px;
            letter-spacing: .09em;
            text-transform: uppercase;
            color: rgba(250, 247, 240, .65);
        }

        @media(max-width:900px) {
            .hero-inner {
                grid-template-columns: 1fr;
            }

            .hero-visual {
                aspect-ratio: 16/10;
                order: -1;
            }
        }

        @media(max-width:700px) {
            .stat-band .wrap {
                grid-template-columns: repeat(2, 1fr);
            }

            .stat-band .stat:nth-child(2n) {
                border-right: none;
            }

            .stat-band .stat {
                border-bottom: 1px solid rgba(250, 247, 240, .14);
            }
        }
      `}</style>

      <section className="hero" id="home">
        <div className="hero-bg" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80"
            alt=""
            loading="eager"
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="blueprint"></div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Dubai · Est. 2016</span>
            <h1>
              Dubai's fit-out
              <br />
              partner for <span className="em">considered</span>
              <br />
              interiors.
            </h1>
            <p className="lede">
              Yashmeen Future Building designs, builds and installs turnkey
              commercial, hospitality and residential spaces — one in-house team
              from first sketch to final snag.
            </p>
            <ul className="hero-points">
              <li>
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10.5L8 14.5L16 5.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                35,000 sq.ft in-house production facility — joinery, upholstery,
                metal &amp; glass.
              </li>
              <li>
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10.5L8 14.5L16 5.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                200+ in-house designers, engineers and project managers.
              </li>
              <li>
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10.5L8 14.5L16 5.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Most projects delivered in 60–90 days, ISO 9001 · 14001 · 45001
                certified.
              </li>
            </ul>
            <div className="hero-ctas">
              <a href="#contact" className="btn btn-brass">
                Book a Consultation
              </a>
              <a href="#projects" className="btn btn-light">
                View Our Projects
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="room-block">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="Private residence living room, Emirates Hills"
                loading="lazy"
              />
              <span className="rb-tag">Featured Project</span>
              <span className="rb-label">
                Private Residence — Emirates Hills
              </span>
            </div>
            <span className="frame-tag">Design &amp; Build</span>
          </div>
        </div>
        <div className="stat-band">
          <div className="wrap">
            <div className="stat">
              <div className="num" data-count="9">
                0
              </div>
              <div className="lbl">Years Active</div>
            </div>
            <div className="stat">
              <div className="num" data-count="640">
                0
              </div>
              <div className="lbl">Projects Delivered</div>
            </div>
            <div className="stat">
              <div className="num" data-count="200">
                0
              </div>
              <div className="lbl">In-House Staff</div>
            </div>
            <div className="stat">
              <div className="num" data-count="150">
                0
              </div>
              <div className="lbl">High-End Villas</div>
            </div>
            <div className="stat">
              <div className="num" data-count="90">
                0
              </div>
              <div className="lbl">Commercial Offices</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

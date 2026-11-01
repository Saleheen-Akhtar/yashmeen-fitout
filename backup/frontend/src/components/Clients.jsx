import { useEffect, useRef } from "react";

const CLIENTS = [
  { name: "Emaar Hospitality", sector: "Luxury Hotels & Resorts" },
  { name: "Sobha Realty", sector: "Residential Communities" },
  { name: "Damac Properties", sector: "Tower Developments" },
  { name: "Al Habtoor Group", sector: "Commercial & Hospitality" },
  { name: "Meraas Dubai", sector: "Urban Destinations" },
  { name: "Nakheel Properties", sector: "Waterfront Developments" },
  { name: "Dnata Retail", sector: "Airport & Commercial Lounges" },
  { name: "Omniyat Living", sector: "Ultra-Prime Residences" },
];

export default function Clients() {
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
        /* ============ CLIENT LOGOS ============ */
        .clients {
            padding: 50px 0;
            background: #ffffff;
            border-bottom: 1px solid rgba(23, 20, 15, 0.08);
            border-top: 1px solid rgba(23, 20, 15, 0.04);
            overflow: hidden;
        }

        .clients .reveal {
            opacity: 0;
            transform: translateY(16px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .clients .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .clients-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 28px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .clients-head .eyebrow {
            margin: 0;
        }

        .clients-head span.sub {
            font-size: 13px;
            color: var(--ink-soft, #5e584f);
            font-weight: 500;
            letter-spacing: 0.02em;
        }

        .logo-marquee {
            position: relative;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
            padding: 10px 0;
        }

        .logo-track {
            display: flex;
            align-items: center;
            gap: 52px;
            width: max-content;
            animation: marquee 36s linear infinite;
        }

        .logo-marquee:hover .logo-track {
            animation-play-state: paused;
        }

        @keyframes marquee {
            from {
                transform: translateX(0);
            }
            to {
                transform: translateX(-50%);
            }
        }

        .client-logo-item {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: none;
            padding: 10px 18px;
            border-radius: 4px;
            border: 1px solid rgba(23, 20, 15, 0.06);
            background: #faf8f4;
            transition: all .25s ease;
            cursor: default;
        }

        .client-logo-item:hover {
            border-color: rgba(197, 160, 89, 0.4);
            background: #ffffff;
            box-shadow: 0 8px 20px -6px rgba(197, 160, 89, 0.18);
            transform: translateY(-2px);
        }

        .client-logo-item .bullet {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--brass, #c5a059);
            opacity: 0.6;
        }

        .client-logo-item .lname {
            font-family: var(--font-serif);
            font-size: 19px;
            font-weight: 600;
            color: var(--ink, #17140f);
            letter-spacing: -0.01em;
            white-space: nowrap;
        }

        .client-logo-item .lsector {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--brass-dim, #9e7d38);
            padding-left: 6px;
            border-left: 1px solid rgba(23, 20, 15, 0.12);
        }
      `}</style>

      <section className="clients" id="clients">
        <div className="wrap">
          <div className="clients-head reveal">
            <span className="eyebrow">Trusted Across The UAE</span>
            <span className="sub">
              Delivering turnkey fit-out contracts for premier developers, hospitality groups &amp; private estates.
            </span>
          </div>

          <div className="logo-marquee reveal">
            <div className="logo-track">
              {[...CLIENTS, ...CLIENTS].map((client, idx) => (
                <div className="client-logo-item" key={idx}>
                  <span className="bullet" />
                  <span className="lname">{client.name}</span>
                  <span className="lsector">{client.sector}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
            padding: 54px 0;
            background: #11100e;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            overflow: hidden;
            position: relative;
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

        .clients-head .trust-label {
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--brass-light, #dfba73);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .clients-head .trust-label::before {
            content: "";
            width: 18px;
            height: 1px;
            background: var(--brass, #c5a059);
        }

        .clients-head span.sub {
            font-size: 13px;
            color: rgba(250, 247, 240, 0.65);
            font-weight: 400;
            letter-spacing: 0.01em;
        }

        .logo-marquee {
            position: relative;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
            padding: 8px 0;
        }

        .logo-track {
            display: flex;
            align-items: center;
            gap: 40px;
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
            padding: 10px 20px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(8px);
            transition: all .25s ease;
            cursor: default;
        }

        .client-logo-item:hover {
            border-color: rgba(197, 160, 89, 0.45);
            background: rgba(255, 255, 255, 0.07);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 18px rgba(197, 160, 89, 0.15);
            transform: translateY(-2px);
        }

        .client-logo-item .bullet {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--brass, #c5a059);
            box-shadow: 0 0 8px rgba(197, 160, 89, 0.6);
        }

        .client-logo-item .lname {
            font-family: var(--font-serif);
            font-size: 19px;
            font-weight: 500;
            color: #faf7f0;
            letter-spacing: -0.01em;
            white-space: nowrap;
        }

        .client-logo-item .lsector {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--brass-light, #dfba73);
            padding-left: 8px;
            border-left: 1px solid rgba(255, 255, 255, 0.12);
        }
      `}</style>

      <section className="clients" id="clients">
        <div className="wrap">
          <div className="clients-head reveal">
            <span className="trust-label">Trusted Across The UAE</span>
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

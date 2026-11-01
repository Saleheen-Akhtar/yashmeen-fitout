import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote: "Genuinely one of the finest turnkey fit-out partners we have commissioned in Dubai. Responsive, impeccably organised, and the custom joinery finish in our villa speaks for itself.",
    author: "Farah Al Suwaidi",
    location: "Emirates Hills Villa, Dubai",
    project: "Turnkey Residential Fit-Out",
    rating: 5,
  },
  {
    quote: "From initial concept renderings to final authority handovers, coordination was seamless. Their in-house MEP sequencing saved us weeks of ceiling rework.",
    author: "Daniyar Omarov",
    location: "Business Bay Corporate Office, Dubai",
    project: "Commercial Headquarters",
    rating: 5,
  },
  {
    quote: "The craftsmanship from their Al Quoz joinery bay is exceptional. Every veneer was grain-matched and delivered precisely on the agreed milestone date.",
    author: "Evelyn Marsh",
    location: "Palm Jumeirah Penthouse, Dubai",
    project: "Luxury Penthouse Renovation",
    rating: 5,
  },
  {
    quote: "Working with a single accountable studio for both civil architecture and MEP approvals made all the difference. Delivered completely on time within 75 days.",
    author: "Tariq Mansoori",
    location: "DIFC Executive Lounge, Dubai",
    project: "Hospitality & Dining Space",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const rootRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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

  const current = TESTIMONIALS[activeIdx];

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ TESTIMONIALS ============ */
        .testi {
            padding: 110px 0;
            background: #141311; color: #faf7f0;
            overflow: hidden;
            position: relative;
        }

        .testi .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .testi .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .testi-shell {
            max-width: 860px;
            margin: 0 auto;
            position: relative;
        }

        .testi-card {
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 4px;
            padding: 56px 50px;
            text-align: center;
            box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            position: relative;
            transition: all 0.4s ease;
        }

        .testi-card .quote-icon {
            width: 38px;
            height: 30px;
            color: var(--brass, #c5a059);
            margin: 0 auto 24px;
            opacity: 0.85;
        }

        .testi-card p.msg {
            font-family: var(--font-serif);
            font-size: clamp(20px, 2.4vw, 25px);
            line-height: 1.6;
            color: #faf7f0;
            font-weight: 400;
            font-style: italic;
            margin: 0;
        }

        .testi-card .who {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .testi-card .who strong {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .testi-card .who span {
            font-size: 12.5px;
            color: var(--brass-light, #dfba73);
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        .testi-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 36px;
        }

        .testi-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.05);
            color: #faf7f0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .testi-btn:hover {
            border-color: var(--brass);
            background: var(--brass);
            color: #ffffff;
            transform: scale(1.05);
        }

        .testi-dots {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .testi-dot {
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.25);
            border: none;
            cursor: pointer;
            padding: 0;
            transition: all 0.3s ease;
        }

        .testi-dot.active {
            width: 24px;
            background: var(--brass, #c5a059);
        }

        @media(max-width:640px) {
            .testi-card {
                padding: 36px 24px;
            }
        }
      `}</style>

      <section className="testi" id="testimonials">
        <div className="wrap">
          <div
            className="section-head reveal"
            style={{ textAlign: "center", margin: "0 auto 40px" }}
          >
            
            <h2 className="section-title" style={{ maxWidth: "none", color: "#faf7f0" }}>Voices from delivered spaces</h2>
          </div>

          <div className="testi-shell reveal">
            <div className="testi-card">
              <svg
                className="quote-icon"
                viewBox="0 0 34 26"
                fill="currentColor"
              >
                <path d="M0 26V14.6C0 6.2 4.9 1 12.9 0l1.5 4.4C9 5.6 6.4 8.6 6.1 13.2h7.5V26H0zm18.6 0V14.6c0-8.4 4.9-13.6 12.9-14.6l1.5 4.4c-5.4 1.2-8 4.2-8.3 8.8h7.5V26H18.6z" />
              </svg>
              <p className="msg">&ldquo;{current.quote}&rdquo;</p>
              <div className="who">
                <strong>{current.author}</strong>
                <span>{current.location} &bull; {current.project}</span>
              </div>
            </div>

            <div className="testi-nav">
              <button
                type="button"
                className="testi-btn"
                onClick={() =>
                  setActiveIdx((prev) =>
                    (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                  )
                }
                aria-label="Previous testimonial"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="testi-dots">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`testi-dot ${i === activeIdx ? "active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="testi-btn"
                onClick={() =>
                  setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length)
                }
                aria-label="Next testimonial"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const TESTIMONIALS = [
  {
    quote:
      "Genuinely one of the finest turnkey fit-out partners we have commissioned in Dubai. Responsive, impeccably organised, and the custom joinery finish in our Emirates Hills villa speaks for itself.",
    author: "Farah Al Suwaidi",
    location: "Emirates Hills, Dubai",
    project: "Turnkey Luxury Villa Fit-Out",
    timeline: "Delivered in 72 Days",
  },
  {
    quote:
      "From initial concept renderings to final authority handovers, coordination was seamless. Their in-house MEP sequencing saved us weeks of ceiling rework and Dubai Municipality approvals.",
    author: "Daniyar Omarov",
    location: "Business Bay, Dubai",
    project: "Commercial Headquarters",
    timeline: "Delivered in 60 Days",
  },
  {
    quote:
      "The craftsmanship from their Al Quoz joinery bay is exceptional. Every veneer was grain-matched and delivered precisely on the agreed milestone date.",
    author: "Evelyn Marsh",
    location: "Palm Jumeirah Penthouse",
    project: "Luxury Penthouse Renovation",
    timeline: "Delivered in 80 Days",
  },
];

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => {
    setActiveIdx((i) => (i === 0 ? TESTIMONIALS.length - 1 : i - 1));
  };

  const next = () => {
    setActiveIdx((i) => (i === TESTIMONIALS.length - 1 ? 0 : i + 1));
  };

  const t = TESTIMONIALS[activeIdx];

  return (
    <section className="testimonials-section">
      <style>{`
        /* ============ AWWWARDS-TIER TESTIMONIALS ============ */
        .testimonials-section {
          padding: 120px 24px;
          background: #0d0c0a;
          color: var(--paper, #faf7f0);
          position: relative;
        }

        @media (min-width: 768px) {
          .testimonials-section {
            padding: 140px 32px;
          }
        }

        .testimonials-wrap {
          max-width: 1080px;
          margin: 0 auto;
        }

        .testi-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .testi-eyebrow {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 12px;
        }

        .testi-title {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(32px, 4.2vw, 52px);
          font-weight: 500;
          line-height: 1.15;
          color: #ffffff;
        }

        .testi-bezel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 8px;
          box-shadow: 0 40px 80px -25px rgba(0, 0, 0, 0.7);
        }

        .testi-core-card {
          background: #11100e;
          border-radius: 14px;
          padding: 48px 36px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
        }

        @media (min-width: 768px) {
          .testi-core-card {
            padding: 64px 56px;
          }
        }

        .testi-quote-mark {
          font-family: var(--font-serif);
          font-size: 72px;
          line-height: 1;
          color: var(--brass, #c5a059);
          opacity: 0.45;
          margin-bottom: -16px;
        }

        .testi-quote-text {
          font-family: var(--font-serif);
          font-size: clamp(22px, 2.6vw, 32px);
          font-weight: 400;
          line-height: 1.45;
          color: #ffffff;
          font-style: italic;
        }

        .testi-author-row {
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .testi-name {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 700;
          color: var(--brass-light, #dfba73);
          letter-spacing: 0.02em;
        }

        .testi-meta {
          font-size: 13px;
          color: rgba(250, 247, 240, 0.65);
          margin-top: 4px;
        }

        .testi-nav-btns {
          display: flex;
          gap: 10px;
        }

        .testi-nav-arrow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .testi-nav-arrow:hover {
          background: var(--brass, #c5a059);
          color: #0d0c0a;
          border-color: var(--brass);
        }
      `}</style>

      <div className="testimonials-wrap">
        <div className="testi-header">
          <span className="testi-eyebrow">Client Endorsements</span>
          <h2 className="testi-title">Measured by delivered reality.</h2>
        </div>

        <div className="testi-bezel">
          <div className="testi-core-card">
            <div className="testi-quote-mark">&ldquo;</div>
            <p className="testi-quote-text">{t.quote}</p>

            <div className="testi-author-row">
              <div>
                <div className="testi-name">{t.author}</div>
                <div className="testi-meta">
                  {t.project} &bull; {t.location} &bull;{" "}
                  <span style={{ color: "var(--brass-light)" }}>{t.timeline}</span>
                </div>
              </div>

              <div className="testi-nav-btns">
                <button
                  type="button"
                  className="testi-nav-arrow"
                  onClick={prev}
                  aria-label="Previous client endorsement"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="testi-nav-arrow"
                  onClick={next}
                  aria-label="Next client endorsement"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

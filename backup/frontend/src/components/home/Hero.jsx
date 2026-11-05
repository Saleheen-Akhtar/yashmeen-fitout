import { Link } from "react-router-dom";

export default function Hero() {
  const openEnquiry = (e) => {
    if (e) e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("open-questionnaire", {
        detail: { initialScope: "Turnkey Architecture & Interior Fit-Out" },
      })
    );
  };

  return (
    <section className="hero-editorial-section wrap" id="hero" aria-label="Hero Section">
      {/* 1. Eyebrow Row & Monumental Display Title */}
      <div className="hero-headline-block">
        <div className="hero-eyebrow-row">
          <span className="eyebrow">(OUR ATELIER · DUBAI)</span>
          <span className="hero-facility-badge">EST. 35,000 SQ. FT. AL QUOZ BENCH</span>
        </div>
        <h1 className="u-text-display">
          TURNKEY FIT-OUT
          <br />
          &amp; BESPOKE JOINERY
        </h1>
      </div>

      {/* 2. Centered Inset Architectural Photograph (Matching Studio Section) */}
      <div className="hero-inset-image-wrap">
        <img
          src="/static/hero.jpg"
          alt="Bespoke architectural joinery and turnkey fit-out in Dubai"
          loading="eager"
        />
        <div className="hero-caption-bar">
          <span className="hero-caption-left">
            01 / AL QUOZ MANUFACTURING ATELIER · 35,000 SQ. FT. IN-HOUSE JOINERY
          </span>
          <span className="hero-caption-coords">25.2048 N, 55.2708 E</span>
        </div>
      </div>

      {/* 3. 2-Column Editorial Narrative Grid (Identical to Studio Section) */}
      <div className="hero-narrative-grid">
        <div>
          <p className="u-text-lead">
            <strong>Yashmeen Future Building</strong> delivers complete turnkey architectural fit-out
            and precision joinery for luxury residential villas, commercial headquarters, and hospitality
            commissions across Dubai.
          </p>
        </div>

        <div>
          <p>
            Operating an in-house 35,000 sq.ft Al Quoz manufacturing atelier, we unite design,
            structural millwork, MEP engineering, and Dubai authority approvals under one accountable
            contract. Zero sub-contractor risk, guaranteed delivery schedules, and snag-free execution.
          </p>

          {/* Action Button Row */}
          <div className="hero-actions-row">
            <a href="#works" className="btn-pill btn-pill-dark">
              <span>EXPLORE COMMISSIONS</span>
              <span className="g-circle" aria-hidden="true" />
            </a>
            <button
              type="button"
              className="btn-pill btn-pill-light"
              onClick={openEnquiry}
            >
              <span>INQUIRE [RFQ]</span>
            </button>
          </div>

          {/* Trust Authority Baseline */}
          <div className="hero-trust-row">
            <span className="hero-trust-item">150+ COMPLETED COMMISSIONS</span>
            <span className="hero-trust-sep">·</span>
            <span className="hero-trust-item">DM &amp; CIVIL DEFENCE APPROVED</span>
            <span className="hero-trust-sep">·</span>
            <span className="hero-trust-item">ZERO SUB-CONTRACTOR RISK</span>
          </div>
        </div>
      </div>
    </section>
  );
}

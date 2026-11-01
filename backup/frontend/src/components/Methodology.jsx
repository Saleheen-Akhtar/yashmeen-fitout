import { FiCheckCircle, FiCpu, FiAward, FiClock } from "react-icons/fi";

const STAGES = [
  {
    step: "01",
    title: "Briefing & 3D Visualisation",
    desc: "Rigorous site scan, space layout engineering, and photorealistic 3D rendering so every proportion and material sample is approved prior to procurement.",
  },
  {
    step: "02",
    title: "Statutory Authority Approvals",
    desc: "Direct submission and swift clearance through Dubai Municipality, Civil Defence, DDA, Tecom, and master developers by our in-house statutory engineers.",
  },
  {
    step: "03",
    title: "Al Quoz In-House Fabrication",
    desc: "Custom cabinetry, architectural metalwork, and bespoke furniture crafted concurrently in our 35,000 SF Al Quoz workshop while MEP rough-ins proceed on site.",
  },
  {
    step: "04",
    title: "Sequenced Build & Snag-Free Handover",
    desc: "Strictly sequenced installation, comprehensive acoustic and MEP commissioning, clean authority completion certificate, and 12-month defect warranty.",
  },
];

const SWATCHES = [
  { name: "Roman Travertine", gradient: "linear-gradient(135deg, #e7dcc0, #cbb98f 60%, #e7dcc0)" },
  { name: "Satin Brass", gradient: "linear-gradient(135deg, #dfba73, #c5a059 60%, #8a6a28)" },
  { name: "Smoked Walnut", gradient: "linear-gradient(135deg, #4a3524, #7a5232 60%, #302115)" },
  { name: "Architectural Concrete", gradient: "linear-gradient(135deg, #a8a49c, #78756e 60%, #4a4742)" },
];

export default function MethodologySection() {
  return (
    <section className="methodology-section" id="methodology">
      <style>{`
        /* ============ AWWWARDS-TIER METHODOLOGY & PRODUCTION ============ */
        .methodology-section {
          padding: 130px 24px;
          background: #0a0908;
          color: var(--paper, #faf7f0);
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .methodology-section {
            padding: 150px 32px;
          }
        }

        .methodology-wrap {
          max-width: 1240px;
          margin: 0 auto;
        }

        .method-head {
          max-width: 760px;
          margin-bottom: 60px;
        }

        .method-eyebrow {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 14px;
        }

        .method-title {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(34px, 4.4vw, 56px);
          font-weight: 500;
          line-height: 1.12;
          color: #ffffff;
          letter-spacing: -0.015em;
        }

        .method-title span {
          font-style: italic;
          color: var(--brass-light, #dfba73);
        }

        /* 2-Column Split: Process & Factory Moat */
        .method-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
        }

        @media (min-width: 1024px) {
          .method-split-grid {
            grid-template-columns: 1.1fr 0.9fr;
            gap: 48px;
            align-items: start;
          }
        }

        /* Process Steps Column */
        .method-stages-list {
          display: grid;
          gap: 18px;
        }

        .stage-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 28px 30px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .stage-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(197, 160, 89, 0.35);
        }

        .stage-num {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 600;
          color: var(--brass-light, #dfba73);
          line-height: 1;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .stage-title {
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .stage-desc {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(250, 247, 240, 0.7);
        }

        /* Factory Moat Column */
        .factory-moat-card {
          background: #11100e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 36px;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.7);
          position: sticky;
          top: 100px;
        }

        .moat-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 14px;
        }

        .moat-headline {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 16px;
        }

        .moat-desc {
          font-size: 14.5px;
          line-height: 1.75;
          color: rgba(250, 247, 240, 0.75);
          margin-bottom: 28px;
        }

        .moat-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .moat-metric-box {
          padding: 16px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .moat-metric-val {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 700;
          color: var(--brass-light, #dfba73);
        }

        .moat-metric-lbl {
          font-size: 12px;
          color: rgba(250, 247, 240, 0.65);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Material Swatches */
        .swatches-header {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(250, 247, 240, 0.6);
          margin-bottom: 12px;
        }

        .swatches-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .swatch-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: center;
        }

        .swatch-color {
          height: 38px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .swatch-name {
          font-size: 10.5px;
          color: rgba(250, 247, 240, 0.6);
        }
      `}</style>

      <div className="methodology-wrap">
        <div className="method-head">
          <span className="method-eyebrow">Disciplined Execution</span>
          <h2 className="method-title">
            The Yashmeen Singularity. <span>No sub-contractors.</span>
          </h2>
        </div>

        <div className="method-split-grid">
          {/* Left Column: 4-Stage Protocol */}
          <div className="method-stages-list">
            {STAGES.map((s) => (
              <div key={s.step} className="stage-card">
                <div className="stage-num">{s.step}</div>
                <div>
                  <h3 className="stage-title">{s.title}</h3>
                  <p className="stage-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: 35k SF Manufacturing Moat */}
          <div className="factory-moat-card">
            <span className="moat-badge">Industrial Asset &bull; Al Quoz 4</span>
            <h3 className="moat-headline">
              35,000 Sq.Ft in-house manufacturing atelier.
            </h3>
            <p className="moat-desc">
              Unlike brokerage fit-out contractors who outsource critical woodwork and joinery to
              unknown workshops, Yashmeen controls quality, tolerances, and delivery times from our
              own production facility in Al Quoz Industrial Area 4.
            </p>

            <div className="moat-metrics-grid">
              <div className="moat-metric-box">
                <div className="moat-metric-val">35,000</div>
                <div className="moat-metric-lbl">Sq.Ft Factory</div>
              </div>
              <div className="moat-metric-box">
                <div className="moat-metric-val">200+</div>
                <div className="moat-metric-lbl">In-House Staff</div>
              </div>
              <div className="moat-metric-box">
                <div className="moat-metric-val">60 - 90</div>
                <div className="moat-metric-lbl">Days Handover</div>
              </div>
              <div className="moat-metric-box">
                <div className="moat-metric-val">12 Mo.</div>
                <div className="moat-metric-lbl">Snag Warranty</div>
              </div>
            </div>

            <div className="swatches-header">Tactile Material Craftsmanship</div>
            <div className="swatches-row">
              {SWATCHES.map((sw) => (
                <div key={sw.name} className="swatch-item">
                  <div className="swatch-color" style={{ background: sw.gradient }} />
                  <span className="swatch-name">{sw.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

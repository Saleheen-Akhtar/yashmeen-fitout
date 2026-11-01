import { Link } from "react-router-dom";
import { FiArrowUpRight, FiLayers, FiShield, FiBriefcase, FiHome } from "react-icons/fi";

const DISCIPLINES = [
  {
    span: "col-span-12 lg:col-span-8",
    title: "Turnkey Architectural Interior Fit-Out",
    sub: "Private Luxury Villas & Penthouses",
    desc: "Single-source execution from concept design and photorealistic 3D renders to MEP execution, statutory authority permits and turnkey white-glove handover in Emirates Hills and Palm Jumeirah.",
    tag: "Flagship Discipline",
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    href: "/services/interior-design",
  },
  {
    span: "col-span-12 lg:col-span-4",
    title: "Bespoke Al Quoz Joinery & Millwork",
    sub: "35,000 SF In-House Production",
    desc: "Handcrafted architectural woodwork, custom veneer wall panelling, walk-in dressing rooms, and luxury kitchens built directly in our Al Quoz atelier without third-party delay.",
    tag: "In-House Atelier",
    img: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=900&q=80",
    href: "/services/architecture",
  },
  {
    span: "col-span-12 lg:col-span-4",
    title: "Statutory Approvals & Compliance",
    sub: "100% Authority Permitting",
    desc: "Our registered in-house engineers manage full compliance and swift clearances across Dubai Municipality (DM), Civil Defence (DCD), DDA, Trakhees, and master developers.",
    tag: "Zero-Friction Permitting",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    href: "/services/construction",
  },
  {
    span: "col-span-12 lg:col-span-8",
    title: "Grade-A Corporate Workplace Fit-Out",
    sub: "DIFC, Business Bay & Sheikh Zayed Road",
    desc: "High-performance executive environments featuring acoustic glass partitions, integrated DEWA-compliant MEP systems, smart lighting automation, and collaborative boardrooms.",
    tag: "Commercial Excellence",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    href: "/services/office-renovation",
  },
];

export default function DisciplinesSection() {
  return (
    <section className="disciplines-section" id="disciplines">
      <style>{`
        /* ============ AWWWARDS-TIER DISCIPLINES BENTO ============ */
        .disciplines-section {
          padding: 120px 24px;
          background: #080706;
          color: var(--paper, #faf7f0);
          position: relative;
        }

        @media (min-width: 768px) {
          .disciplines-section {
            padding: 140px 32px;
          }
        }

        .disciplines-wrap {
          max-width: 1240px;
          margin: 0 auto;
        }

        .disciplines-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 60px;
        }

        .disciplines-eyebrow {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 14px;
        }

        .disciplines-title {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(34px, 4.4vw, 56px);
          font-weight: 500;
          line-height: 1.12;
          color: #ffffff;
          letter-spacing: -0.015em;
        }

        .disciplines-title span {
          font-style: italic;
          color: var(--brass-light, #dfba73);
        }

        .disciplines-lede {
          margin-top: 18px;
          font-size: 16px;
          line-height: 1.7;
          color: rgba(250, 247, 240, 0.7);
        }

        /* Bento Grid */
        .disciplines-bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }

        /* Double-Bezel Hardware Architecture */
        .bento-bezel-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 8px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }

        .bento-bezel-card:hover {
          transform: translateY(-5px);
          border-color: rgba(197, 160, 89, 0.35);
          box-shadow: 0 24px 50px -15px rgba(0, 0, 0, 0.7);
        }

        .bento-inner-core {
          background: #11100e;
          border-radius: 14px;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bento-media-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
        }

        .bento-card-compact .bento-media-frame {
          aspect-ratio: 16 / 11;
        }

        .bento-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.88) contrast(1.08);
          transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .bento-bezel-card:hover .bento-media-img {
          transform: scale(1.07);
        }

        .bento-media-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, #11100e 100%);
        }

        .bento-tag-pill {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(13, 12, 10, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(197, 160, 89, 0.3);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
        }

        .bento-body-area {
          padding: 24px 28px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }

        .bento-head-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .bento-card-title {
          font-family: var(--font-serif);
          font-size: clamp(20px, 2.2vw, 26px);
          font-weight: 600;
          color: #ffffff;
          line-height: 1.25;
        }

        .bento-card-sub {
          font-size: 12.5px;
          color: var(--brass-light, #dfba73);
          font-weight: 600;
          letter-spacing: 0.04em;
          margin-top: 4px;
        }

        .bento-card-desc {
          margin-top: 14px;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(250, 247, 240, 0.7);
        }

        .bento-trailing-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brass-light);
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .bento-bezel-card:hover .bento-trailing-arrow {
          transform: rotate(45deg);
          background: var(--brass, #c5a059);
          color: #0d0c0a;
        }
      `}</style>

      <div className="disciplines-wrap">
        <div className="disciplines-header">
          <span className="disciplines-eyebrow">Turnkey Capabilities</span>
          <h2 className="disciplines-title">
            Engineered disciplines. <span>One accountable atelier.</span>
          </h2>
          <p className="disciplines-lede">
            By unifying architecture, statutory municipal approvals, bespoke Al Quoz joinery,
            and MEP systems under a single contract, Yashmeen eliminates the disputes and delays of
            fragmented sub-contracting.
          </p>
        </div>

        <div className="disciplines-bento-grid">
          {DISCIPLINES.map((d, i) => {
            const isWide = d.span.includes("col-span-8");
            return (
              <Link
                key={d.title}
                to={d.href}
                className={`bento-bezel-card ${d.span} ${isWide ? "bento-card-wide" : "bento-card-compact"}`}
              >
                <div className="bento-inner-core">
                  <div className="bento-media-frame">
                    <img className="bento-media-img" src={d.img} alt={d.title} loading="lazy" />
                    <div className="bento-media-shade" />
                    <span className="bento-tag-pill">{d.tag}</span>
                  </div>
                  <div className="bento-body-area">
                    <div>
                      <div className="bento-head-row">
                        <div>
                          <h3 className="bento-card-title">{d.title}</h3>
                          <div className="bento-card-sub">{d.sub}</div>
                        </div>
                        <div className="bento-trailing-arrow">
                          <FiArrowUpRight size={17} />
                        </div>
                      </div>
                      <p className="bento-card-desc">{d.desc}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

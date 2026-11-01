import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { projectAPI, itemPath } from "../services/api";
import { FiArrowUpRight, FiSliders, FiGrid } from "react-icons/fi";

const FALLBACK_PROJECTS = [
  {
    id: "p1",
    label: "Private Residence",
    location: "Emirates Hills, Dubai",
    scope: "Full Turnkey Villa Fit-Out",
    tag: "Residential",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    label: "Boutique Executive Suite",
    location: "DIFC Gate Precinct, Dubai",
    scope: "Grade-A Corporate HQ",
    tag: "Commercial",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    label: "Waterfront Villa Atelier",
    location: "Palm Jumeirah, Dubai",
    scope: "Joinery & Interior Architecture",
    tag: "Residential",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    label: "Haute Cuisine Dining Lounge",
    location: "Downtown Dubai",
    scope: "F&B Turnkey Contracting",
    tag: "Hospitality",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },
];

const toList = (res) => {
  if (Array.isArray(res)) return res;
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  const list = body?.data ?? body?.projects ?? body?.items ?? body?.results ?? body;
  if (Array.isArray(list)) return list;
  return [];
};

const fileUrl = (path = "") =>
  /^https?:\/\//i.test(path) ? path : `${itemPath}/${String(path).replace(/^\/+/, "")}`;

export default function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState("portfolio"); // portfolio | beforeAfter
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Before/After interactive slider states
  const baShellRef = useRef(null);
  const baBeforeRef = useRef(null);
  const baHandleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await projectAPI.getAll();
        const list = toList(res)
          .slice(0, 6)
          .map((p, idx) => {
            const cat = p.categoryId ?? p.category;
            const catName =
              typeof cat === "object" ? cat?.categoryName ?? cat?.name ?? "" : cat ?? "";
            const imagePath =
              p.file ?? p.image ?? p.thumbnail ?? p.coverImage ?? p.images?.[0] ?? "";
            return {
              id: p._id,
              label: p.title ?? p.name ?? "Luxury Fit-Out",
              tag: catName || "Turnkey",
              location: p.location || "Dubai, UAE",
              img: imagePath
                ? fileUrl(imagePath)
                : FALLBACK_PROJECTS[idx % FALLBACK_PROJECTS.length].img,
            };
          });
        if (!cancelled && list.length > 0) setProjects(list);
        else if (!cancelled) setProjects(FALLBACK_PROJECTS);
      } catch {
        if (!cancelled) setProjects(FALLBACK_PROJECTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Before/After drag logic
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setSliderPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const setSliderPosition = (clientX) => {
    const shell = baShellRef.current;
    const before = baBeforeRef.current;
    const handle = baHandleRef.current;
    if (!shell || !before || !handle) return;

    const rect = shell.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  };

  return (
    <section className="showcase-section" id="projects">
      <style>{`
        /* ============ AWWWARDS-TIER SHOWCASE ============ */
        .showcase-section {
          padding: 130px 24px;
          background: #0d0c0a;
          color: var(--paper, #faf7f0);
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .showcase-section {
            padding: 150px 32px;
          }
        }

        .showcase-wrap {
          max-width: 1240px;
          margin: 0 auto;
        }

        /* Top Header & Mode Switcher */
        .showcase-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 50px;
        }

        .showcase-head-copy {
          max-width: 640px;
        }

        .showcase-eyebrow {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 14px;
        }

        .showcase-title {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(34px, 4.4vw, 56px);
          font-weight: 500;
          line-height: 1.12;
          letter-spacing: -0.015em;
          color: #ffffff;
        }

        .showcase-title span {
          font-style: italic;
          color: var(--brass-light, #dfba73);
        }

        .showcase-mode-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
        }

        .mode-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 100px;
          background: transparent;
          color: rgba(250, 247, 240, 0.7);
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .mode-tab-btn:hover {
          color: #ffffff;
        }

        .mode-tab-btn.active {
          background: var(--brass, #c5a059);
          color: #0d0c0a;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(197, 160, 89, 0.35);
        }

        /* Portfolio Bento Grid */
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }

        .bento-card-large {
          grid-column: span 12;
        }

        @media (min-width: 900px) {
          .bento-card-large {
            grid-column: span 7;
          }
          .bento-card-tall {
            grid-column: span 5;
          }
          .bento-card-reg {
            grid-column: span 6;
          }
        }

        .showcase-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: #141311;
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-decoration: none;
          color: inherit;
          display: block;
          group: hover;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease;
        }

        .showcase-card:hover {
          transform: translateY(-5px);
          border-color: rgba(197, 160, 89, 0.4);
        }

        .showcase-card-img-wrap {
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          position: relative;
        }

        .bento-card-tall .showcase-card-img-wrap {
          aspect-ratio: 4 / 3.4;
        }

        .showcase-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.5s ease;
          filter: brightness(0.92) contrast(1.05);
        }

        .showcase-card:hover .showcase-card-img {
          transform: scale(1.06);
          filter: brightness(1) contrast(1.08);
        }

        .showcase-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(13, 12, 10, 0.85) 100%);
        }

        .showcase-card-content {
          padding: 24px 28px 28px;
        }

        .showcase-card-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 8px;
        }

        .showcase-card-title {
          font-family: var(--font-serif);
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.25;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .showcase-card-loc {
          margin-top: 6px;
          font-size: 13.5px;
          color: rgba(250, 247, 240, 0.65);
        }

        .showcase-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brass-light);
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .showcase-card:hover .showcase-icon-btn {
          transform: rotate(45deg);
          background: var(--brass, #c5a059);
          color: #0d0c0a;
        }

        /* Interactive Before/After Studio Mode */
        .beforeafter-studio {
          border-radius: 16px;
          overflow: hidden;
          background: #11100e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.7);
        }

        .ba-stage-wrap {
          position: relative;
          aspect-ratio: 16 / 9;
          user-select: none;
          touch-action: none;
          cursor: ew-resize;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .ba-stage-wrap {
            aspect-ratio: 4 / 3;
          }
        }

        .ba-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .ba-layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ba-before-layer {
          clip-path: inset(0 50% 0 0);
          z-index: 2;
        }

        .ba-slider-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: var(--brass-light, #dfba73);
          box-shadow: 0 0 16px rgba(223, 186, 115, 0.8);
          z-index: 3;
          transform: translateX(-50%);
          cursor: ew-resize;
        }

        .ba-grip-disc {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #0d0c0a;
          border: 2px solid var(--brass-light, #dfba73);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brass-light);
          font-size: 14px;
        }

        .ba-studio-caption {
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #141311;
        }

        .ba-caption-title {
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
        }

        .ba-caption-meta {
          font-size: 13px;
          color: rgba(250, 247, 240, 0.65);
        }

        .showcase-footer-cta {
          margin-top: 50px;
          text-align: center;
        }
      `}</style>

      <div className="showcase-wrap">
        {/* Header & Mode Switcher */}
        <div className="showcase-header">
          <div className="showcase-head-copy">
            <span className="showcase-eyebrow">Proven Dubai commissions</span>
            <h2 className="showcase-title">
              Turnkey delivery. <span>Quiet architectural authority.</span>
            </h2>
          </div>

          <div className="showcase-mode-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
              onClick={() => setActiveTab("portfolio")}
            >
              <FiGrid size={14} /> Curated Works
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${activeTab === "beforeAfter" ? "active" : ""}`}
              onClick={() => setActiveTab("beforeAfter")}
            >
              <FiSliders size={14} /> Transformation Studio
            </button>
          </div>
        </div>

        {/* Tab 1: Portfolio Bento */}
        {activeTab === "portfolio" && (
          <div className="showcase-grid">
            {projects.slice(0, 4).map((p, idx) => {
              const cardClass =
                idx === 0
                  ? "bento-card-large"
                  : idx === 1
                  ? "bento-card-tall"
                  : "bento-card-reg";
              return (
                <Link
                  key={p.id}
                  to={`/project/details/${p.id}`}
                  className={`showcase-card ${cardClass}`}
                >
                  <div className="showcase-card-img-wrap">
                    <img
                      className="showcase-card-img"
                      src={p.img}
                      alt={p.label}
                      loading="lazy"
                    />
                    <div className="showcase-card-overlay" />
                  </div>
                  <div className="showcase-card-content">
                    <div className="showcase-card-tag">{p.tag}</div>
                    <div className="showcase-card-title">
                      <span>{p.label}</span>
                      <div className="showcase-icon-btn">
                        <FiArrowUpRight size={17} />
                      </div>
                    </div>
                    <div className="showcase-card-loc">{p.location}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Tab 2: Interactive Before/After Studio */}
        {activeTab === "beforeAfter" && (
          <div className="beforeafter-studio">
            <div
              className="ba-stage-wrap"
              ref={baShellRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* After Layer (Base) */}
              <div className="ba-layer">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80"
                  alt="Delivered luxury villa interior fit-out in Emirates Hills"
                />
              </div>

              {/* Before Layer (Clipped) */}
              <div className="ba-layer ba-before-layer" ref={baBeforeRef}>
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=80"
                  alt="Original shell and core layout prior to Yashmeen fit-out"
                  style={{ filter: "grayscale(70%) contrast(1.1)" }}
                />
              </div>

              {/* Grip Line Handle */}
              <div className="ba-slider-handle" ref={baHandleRef}>
                <div className="ba-grip-disc">
                  &harr;
                </div>
              </div>
            </div>

            <div className="ba-studio-caption">
              <div>
                <div className="ba-caption-title">
                  Emirates Hills Villa Transformation
                </div>
                <div className="ba-caption-meta">
                  Drag slider horizontally &bull; Raw shell-and-core converted into bespoke luxury in 75 days
                </div>
              </div>
              <a href="#scope-calculator" className="btn btn-brass" style={{ padding: "10px 20px", fontSize: 13 }}>
                Calculate Similar Scope &rarr;
              </a>
            </div>
          </div>
        )}

        <div className="showcase-footer-cta">
          <Link to="/projects" className="btn btn-light" style={{ padding: "14px 28px", fontSize: 13.5 }}>
            View Complete Architectural Portfolio (24+ Commissions) &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

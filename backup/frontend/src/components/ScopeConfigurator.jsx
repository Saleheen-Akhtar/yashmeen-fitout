import { useState } from "react";
import { quoteAPI } from "../services/api";
import {
  FiArrowRight,
  FiCheck,
  FiHome,
  FiBriefcase,
  FiCoffee,
  FiShoppingBag,
  FiClock,
  FiShield,
  FiMessageSquare,
} from "react-icons/fi";

const DOMAINS = [
  { id: "Residential", label: "Luxury Villa", icon: FiHome, sub: "Palm Jumeirah, Emirates Hills, Dubai Hills" },
  { id: "Commercial", label: "Corporate Office", icon: FiBriefcase, sub: "DIFC, Business Bay, SZR" },
  { id: "Hospitality", label: "F&B / Hospitality", icon: FiCoffee, sub: "Fine Dining, Boutique Lounges" },
  { id: "Retail", label: "Retail Showroom", icon: FiShoppingBag, sub: "Galleries, Luxury Flagships" },
];

const SCALES = [
  { id: "under3k", label: "< 3,000 SF", timeline: "45 - 60 Days", team: "Dedicated Team of 12" },
  { id: "3kto8k", label: "3,000 - 8,000 SF", timeline: "60 - 90 Days", team: "Dedicated Team of 24" },
  { id: "8kto15k", label: "8,000 - 15,000 SF", timeline: "90 - 120 Days", team: "Dedicated Team of 36" },
  { id: "15kplus", label: "15,000+ SF", timeline: "Phased Turnkey", team: "Full Atelier Directorate" },
];

const REQUIREMENTS = [
  "Complete Architectural Turnkey Build",
  "Statutory Authority Approvals (DM/DCD/DDA)",
  "Bespoke Al Quoz Joinery & Millwork",
  "MEP, HVAC & Smart Lighting Integration",
];

export default function ScopeConfigurator() {
  const [domain, setDomain] = useState("Residential");
  const [scale, setScale] = useState(SCALES[1]);
  const [selectedReqs, setSelectedReqs] = useState([
    "Complete Architectural Turnkey Build",
    "Bespoke Al Quoz Joinery & Millwork",
  ]);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    location: "Dubai",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  const toggleReq = (req) => {
    setSelectedReqs((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email) {
      setErrorMessage("Please provide your name, mobile number and email.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        projectType: domain,
        services: selectedReqs.length > 0 ? selectedReqs : ["Turnkey fit-out"],
        location: form.location,
        budget: "AED 500,000+",
        timeline: scale.timeline,
        message: `Scope Configurator: ${domain} (${scale.label}), Location: ${form.location}. Requirements: ${selectedReqs.join(", ")}.`,
      };

      await quoteAPI.create(payload);
      setStatus("sent");
    } catch (err) {
      console.error("Scope configurator submission error:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          "Unable to dispatch enquiry. Please call our Bay Square studio directly."
      );
      setStatus("error");
    }
  };

  return (
    <section className="configurator-section" id="scope-calculator">
      <style>{`
        /* ============ AWWWARDS-TIER SCOPE CONFIGURATOR ============ */
        .configurator-section {
          padding: 120px 24px;
          background: #080706;
          color: var(--paper, #faf7f0);
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        @media (min-width: 768px) {
          .configurator-section {
            padding: 140px 32px;
          }
        }

        .configurator-glow {
          position: absolute;
          top: 30%;
          right: -10%;
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(197, 160, 89, 0.12) 0%, transparent 65%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .configurator-wrap {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* Section Head */
        .config-head {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 56px;
        }

        .config-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(197, 160, 89, 0.28);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 20px;
        }

        .config-title {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(32px, 4.4vw, 54px);
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -0.015em;
          color: #ffffff;
        }

        .config-title span {
          font-style: italic;
          color: var(--brass-light, #dfba73);
        }

        .config-subtitle {
          margin-top: 18px;
          font-size: 16px;
          line-height: 1.7;
          color: rgba(250, 247, 240, 0.72);
        }

        /* Double-Bezel Hardware Layout */
        .config-bezel-shell {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 8px;
          box-shadow: 0 40px 90px -25px rgba(0, 0, 0, 0.8);
        }

        @media (min-width: 768px) {
          .config-bezel-shell {
            padding: 12px;
          }
        }

        .config-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          background: #11100e;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        @media (min-width: 980px) {
          .config-grid {
            grid-template-columns: 1.15fr 0.85fr;
          }
        }

        /* Configurator Left Core (Interactive controls) */
        .config-core {
          padding: 36px 28px;
        }

        @media (min-width: 768px) {
          .config-core {
            padding: 48px 44px;
          }
        }

        .config-step-label {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .config-step-title {
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 20px;
        }

        /* Domain Cards */
        .domain-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 36px;
        }

        @media (max-width: 540px) {
          .domain-row {
            grid-template-columns: 1fr;
          }
        }

        .domain-pill {
          padding: 16px 18px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
          color: rgba(250, 247, 240, 0.85);
        }

        .domain-pill:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(197, 160, 89, 0.35);
        }

        .domain-pill.active {
          background: rgba(197, 160, 89, 0.12);
          border-color: var(--brass, #c5a059);
          box-shadow: 0 4px 20px rgba(197, 160, 89, 0.2);
        }

        .domain-pill-top {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14.5px;
          color: #ffffff;
        }

        .domain-pill.active .domain-pill-top {
          color: var(--brass-light, #dfba73);
        }

        .domain-pill-sub {
          margin-top: 6px;
          font-size: 11.5px;
          color: rgba(250, 247, 240, 0.5);
        }

        /* Scale Selector */
        .scale-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 36px;
        }

        @media (min-width: 600px) {
          .scale-row {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .scale-btn {
          padding: 14px 10px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(250, 247, 240, 0.85);
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .scale-btn:hover {
          border-color: rgba(197, 160, 89, 0.3);
        }

        .scale-btn.active {
          background: var(--brass, #c5a059);
          color: #0d0c0a;
          border-color: var(--brass, #c5a059);
          font-weight: 700;
        }

        /* Requirements Pills */
        .req-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .req-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13.5px;
          color: rgba(250, 247, 240, 0.85);
        }

        .req-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .req-item.active {
          border-color: rgba(197, 160, 89, 0.4);
          background: rgba(197, 160, 89, 0.08);
          color: #ffffff;
        }

        .req-check {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .req-item.active .req-check {
          background: var(--brass, #c5a059);
          border-color: var(--brass, #c5a059);
          color: #0d0c0a;
        }

        /* Right Summary & Conversion Form */
        .config-summary {
          background: #0d0c0a;
          padding: 36px 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media (min-width: 980px) {
          .config-summary {
            border-top: none;
            border-left: 1px solid rgba(255, 255, 255, 0.08);
            padding: 48px 40px;
          }
        }

        .summary-card {
          padding: 24px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(197, 160, 89, 0.22);
          margin-bottom: 28px;
        }

        .summary-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass-light, #dfba73);
          margin-bottom: 12px;
        }

        .summary-headline {
          font-family: var(--font-serif);
          font-size: 22px;
          color: #ffffff;
          font-weight: 600;
          line-height: 1.3;
        }

        .summary-stats {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .summary-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .summary-stat-label {
          color: rgba(250, 247, 240, 0.6);
        }

        .summary-stat-val {
          color: var(--brass-light, #dfba73);
          font-weight: 600;
        }

        /* Form Inputs */
        .config-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .config-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 6px;
          background: #141311;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .config-input:focus {
          border-color: var(--brass, #c5a059);
          box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.15);
        }

        .config-submit-btn {
          margin-top: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 16px 24px;
          border-radius: 100px;
          background: linear-gradient(135deg, #dfba73 0%, #c5a059 100%);
          color: #0d0c0a;
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          box-shadow: 0 10px 24px rgba(197, 160, 89, 0.3);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .config-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(197, 160, 89, 0.45);
        }

        .config-submit-btn:active {
          transform: scale(0.98);
        }

        .btn-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(13, 12, 10, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Success & Error State */
        .config-success {
          padding: 32px;
          text-align: center;
          border-radius: 10px;
          background: rgba(197, 160, 89, 0.08);
          border: 1px solid rgba(197, 160, 89, 0.35);
        }

        .config-success h3 {
          font-family: var(--font-serif);
          font-size: 24px;
          color: var(--brass-light);
          margin-bottom: 10px;
        }

        .config-whatsapp-btn {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: 100px;
          background: #25d366;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
        }
      `}</style>

      <div className="configurator-glow" />

      <div className="configurator-wrap">
        <div className="config-head">
          <span className="config-eyebrow">Project Feasibility &amp; Intake</span>
          <h2 className="config-title">
            Configure your architectural brief in <span>three steps.</span>
          </h2>
          <p className="config-subtitle">
            Receive an immediate execution timeline estimate and request a formal site audit
            conducted directly by our Principal Architect in Bay Square, Business Bay.
          </p>
        </div>

        <div className="config-bezel-shell">
          <div className="config-grid">
            {/* Left Core Configuration */}
            <div className="config-core">
              {/* Step 1: Sector / Domain */}
              <div className="config-step-label">Step 01 - Space Domain</div>
              <h3 className="config-step-title">Select your project typology</h3>
              <div className="domain-row">
                {DOMAINS.map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={`domain-pill ${domain === d.id ? "active" : ""}`}
                      onClick={() => setDomain(d.id)}
                    >
                      <div className="domain-pill-top">
                        <Icon size={18} color="var(--brass)" />
                        <span>{d.label}</span>
                      </div>
                      <div className="domain-pill-sub">{d.sub}</div>
                    </button>
                  );
                })}
              </div>

              {/* Step 2: Scale */}
              <div className="config-step-label">Step 02 - Scale of Execution</div>
              <h3 className="config-step-title">Approximate square footage</h3>
              <div className="scale-row">
                {SCALES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`scale-btn ${scale.id === s.id ? "active" : ""}`}
                    onClick={() => setScale(s)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Step 3: Requirements */}
              <div className="config-step-label">Step 03 - Scope Disciplines</div>
              <h3 className="config-step-title">Tailor deliverables</h3>
              <div className="req-list">
                {REQUIREMENTS.map((r) => {
                  const active = selectedReqs.includes(r);
                  return (
                    <div
                      key={r}
                      className={`req-item ${active ? "active" : ""}`}
                      onClick={() => toggleReq(r)}
                    >
                      <div className="req-check">{active && <FiCheck size={12} />}</div>
                      <span>{r}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Summary & Conversion Dispatch */}
            <div className="config-summary">
              {status === "sent" ? (
                <div className="config-success">
                  <h3>Brief Received</h3>
                  <p style={{ color: "rgba(250, 247, 240, 0.78)", fontSize: 14 }}>
                    Our Bay Square Studio Directorate has logged your {domain} brief. A senior
                    architect will review your scope and contact you within one business day.
                  </p>
                  <a
                    href="https://wa.me/971543862870?text=Hello%20Yashmeen%20Fitout,%20I%20just%20submitted%20a%20project%20scope%20brief."
                    target="_blank"
                    rel="noreferrer"
                    className="config-whatsapp-btn"
                  >
                    <FiMessageSquare size={16} /> Connect on WhatsApp Now
                  </a>
                </div>
              ) : (
                <div>
                  <div className="summary-card">
                    <div className="summary-badge">Execution Blueprint</div>
                    <div className="summary-headline">
                      {domain} &bull; {scale.label}
                    </div>
                    <div className="summary-stats">
                      <div className="summary-stat-row">
                        <span className="summary-stat-label">Estimated Delivery</span>
                        <span className="summary-stat-val">
                          <FiClock size={13} style={{ display: "inline", marginRight: 4 }} />
                          {scale.timeline}
                        </span>
                      </div>
                      <div className="summary-stat-row">
                        <span className="summary-stat-label">Production Allocation</span>
                        <span className="summary-stat-val">{scale.team}</span>
                      </div>
                      <div className="summary-stat-row">
                        <span className="summary-stat-label">Authority Approvals</span>
                        <span className="summary-stat-val">In-House DM &bull; DCD Track</span>
                      </div>
                      <div className="summary-stat-row">
                        <span className="summary-stat-label">Handover Warranty</span>
                        <span className="summary-stat-val">
                          <FiShield size={13} style={{ display: "inline", marginRight: 4 }} />
                          12-Month Snag-Free
                        </span>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        background: "rgba(220, 38, 38, 0.15)",
                        border: "1px solid rgba(220, 38, 38, 0.4)",
                        color: "#fca5a5",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}

                  <form className="config-form" onSubmit={handleSubmit}>
                    <input
                      id="scope-name"
                      name="name"
                      autoComplete="name"
                      className="config-input"
                      type="text"
                      placeholder="Your full name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <input
                      id="scope-mobile"
                      name="mobile"
                      autoComplete="tel"
                      className="config-input"
                      type="tel"
                      placeholder="Mobile number (+971...) *"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      required
                    />
                    <input
                      id="scope-email"
                      name="email"
                      autoComplete="email"
                      className="config-input"
                      type="email"
                      placeholder="Corporate or personal email *"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                    <input
                      id="scope-location"
                      name="location"
                      autoComplete="address-level2"
                      className="config-input"
                      type="text"
                      placeholder="Project location (e.g. Emirates Hills, DIFC, Palm)"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />

                    <button
                      type="submit"
                      className="config-submit-btn"
                      disabled={status === "sending"}
                    >
                      <span>
                        {status === "sending"
                          ? "Securing Brief…"
                          : "Request Architectural Proposal"}
                      </span>
                      <div className="btn-icon-wrapper">
                        <FiArrowRight size={15} />
                      </div>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROCESS_STEPS = [
  {
    num: "(01)",
    title: "Consultation & Spatial Feasibility",
    desc: "Site survey, spatial zoning, landlord criteria, and statutory authority pre-assessment across Dubai.",
  },
  {
    num: "(02)",
    title: "Concept Design & Material Selection",
    desc: "Curated materiality boards, architectural layouts, bespoke joinery details, and photorealistic 3D renders.",
  },
  {
    num: "(03)",
    title: "Dubai Authority Approvals",
    desc: "Direct submission and expedited clearances through Dubai Municipality, Civil Defence, Tecom, and Master Developers.",
  },
  {
    num: "(04)",
    title: "Bespoke Joinery & Factory Fabrication",
    desc: "Precision millwork, timber panelling, and metalwork fabricated in our 35,000 sq.ft Al Quoz manufacturing facility.",
  },
  {
    num: "(05)",
    title: "Turnkey Site Construction & MEP Integration",
    desc: "Comprehensive site execution with dedicated mechanical, electrical, and plumbing engineering on a single critical path.",
  },
  {
    num: "(06)",
    title: "Snag-Free Handover & 12-Month Guarantee",
    desc: "Full testing, commissioning approvals, operation manuals, and an unconditional 12-month defect liability guarantee.",
  },
];

export default function Process() {
  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section className="process-editorial-section wrap" id="process" aria-label="Our Delivery Process">
      <div className="process-layout-grid">
        {/* Left Column: Tag, Photo & 6-Stage List */}
        <div className="process-left-col">
          <div>
            <span className="eyebrow">(FROM FIRST MEETING TO HANDOVER)</span>
            <div className="process-photo-wrap" style={{ marginTop: "1rem" }}>
              <img
                src="/static/why-us.jpg"
                alt="Architectural detailing and joinery assembly"
                loading="lazy"
              />
            </div>
          </div>

          <div className="process-accordion-list">
            {PROCESS_STEPS.map((step) => (
              <div key={step.num} className="process-accordion-item">
                <span className="process-item-index">{step.num}</span>
                <div>
                  <h3 className="process-item-title">{step.title}</h3>
                  <p className="process-item-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Statement, Lead & Action */}
        <div className="process-right-col">
          <h2 className="process-display-statement">
            One team carries your project from the first brief to the final handover.
          </h2>

          <div className="process-narrative-copy">
            <p style={{ marginBottom: "1.5rem" }}>
              Interior design, engineering, approvals, fabrication and site delivery run as one connected
              programme. You have a clear point of contact and a team responsible for the complete result.
            </p>
            <p>
              Our Al Quoz atelier fabricates the details our site team installs, helping each material,
              junction and finish stay true to the approved design.
            </p>
          </div>

          <button
            type="button"
            onClick={openEnquiry}
            className="btn-pill btn-pill-dark"
          >
            <span>GET TO KNOW OUR PROCESS</span>
            <span className="g-circle" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

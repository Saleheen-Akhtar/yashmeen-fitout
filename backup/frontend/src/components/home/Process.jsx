import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function Process() {
  const { content } = useWebsiteContent();
  const steps = content?.processSteps || [];

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
            {steps.map((step, i) => (
              <div key={step.num || i} className="process-accordion-item">
                <span className="process-item-index">{step.num || `(${String(i + 1).padStart(2, "0")})`}</span>
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
            <span>DISCUSS YOUR PROJECT</span>
            <span className="g-circle" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

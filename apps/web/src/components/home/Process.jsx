import { resolveMediaUrl, mediaFallback } from "../../lib/media";
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
            <span className="eyebrow">{content.process.eyebrow}</span>
            <div className="process-photo-wrap" style={{ marginTop: "1rem" }}>
              <img
                src={resolveMediaUrl(content.process.image)}
                onError={mediaFallback}
                alt={content.process.imageAlt}
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
            {content.process.headline}
          </h2>

          <div className="process-narrative-copy">
            <p style={{ marginBottom: "1.5rem" }}>
              {content.process.paragraph1}
            </p>
            <p>
              {content.process.paragraph2}
            </p>
          </div>

          <button
            type="button"
            onClick={openEnquiry}
            className="btn-pill btn-pill-dark"
          >
            <span>{content.process.ctaText}</span>
            <span className="g-circle" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

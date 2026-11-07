export default function CTA() {
  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section className="climax-cta-section wrap" aria-label="Start Your Commission">
      <div className="wrap-narrow">
        <span className="eyebrow">(START YOUR COMMISSION)</span>

        <h2 className="u-text-display climax-cta-headline">
          FROM BRIEF
          <br />
          TO BUILT.
        </h2>

        <p className="climax-cta-lede">
          Tell us what you are planning. We will bring design, engineering, joinery and delivery into
          one conversation.
        </p>

        <button
          type="button"
          onClick={openEnquiry}
          className="btn-pill btn-pill-dark"
          style={{ height: 50, padding: "0 28px" }}
        >
          <span>START A PROJECT CONVERSATION</span>
          <span className="g-circle" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

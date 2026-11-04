export default function CTA() {
  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section className="climax-cta-section wrap" aria-label="Start Your Commission">
      <div className="wrap-narrow">
        <span className="eyebrow">(START YOUR COMMISSION)</span>

        <h2 className="u-text-display climax-cta-headline">
          FOCUSED ON QUALITY
          <br />
          DRIVEN BY CRAFT
        </h2>

        <p className="climax-cta-lede">
          Tell us about your project. Our senior atelier team will review the details and be in
          touch within one working day.
        </p>

        <button
          type="button"
          onClick={openEnquiry}
          className="btn-pill btn-pill-dark"
          style={{ height: 50, padding: "0 28px" }}
        >
          <span>TELL US ABOUT YOUR PROJECT</span>
          <span className="g-circle" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

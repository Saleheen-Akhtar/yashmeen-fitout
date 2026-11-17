import useWebsiteContent from "../../hooks/useWebsiteContent";
export default function CTA() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.CTA;


  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <section className="climax-cta-section wrap" aria-label="Start Your Commission">
      <div className="wrap-narrow">
        <span className="eyebrow">{pageCopy.start_your_commission}</span>

        <h2 className="u-text-display climax-cta-headline">{pageCopy.from_brief}<br />{pageCopy.to_built}</h2>

        <p className="climax-cta-lede">{pageCopy.tell_us_what_you_are}</p>

        <button
          type="button"
          onClick={openEnquiry}
          className="btn-pill btn-pill-dark"
          style={{ height: 50, padding: "0 28px" }}
        >
          <span>{pageCopy.start_a_project_conversation}</span>
          <span className="g-circle" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

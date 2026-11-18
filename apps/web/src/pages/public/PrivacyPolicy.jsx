import { Link } from "react-router-dom";
import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function PrivacyPolicy() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.PrivacyPolicy;


  const email = content?.email || "info@yfbfitoutcontracting.com";
  const mobile = content?.mobile || "+971 54 386 2870";

  return (
    <section
      className="wrap-narrow"
      style={{
        paddingTop: "clamp(7rem, 12vw, 10rem)",
        paddingBottom: "clamp(5rem, 8vw, 8rem)",
      }}
      aria-labelledby="privacy-heading"
    >
      <span className="eyebrow">{pageCopy.legal_data_protection}</span>
      <h1
        id="privacy-heading"
        className="u-text-h2"
        style={{ marginBottom: "1.5rem" }}
      >{pageCopy.privacy_policy}</h1>
      <p className="u-text-lead" style={{ marginBottom: "2.5rem", color: "var(--muted)" }}>{pageCopy.yashmeen_future_building_fitout_contracting}</p>

      <div style={{ display: "grid", gap: "2rem", borderTop: "1px solid var(--line)", paddingTop: "2rem" }}>
        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>{pageCopy['1_information_we_collect']}</h2>
          <p className="u-text-body">{pageCopy.when_you_request_a_quotation}</p>
        </article>

        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>{pageCopy['2_how_we_use_your']}</h2>
          <p className="u-text-body">{pageCopy.submitted_information_is_used_strictly}</p>
        </article>

        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>{pageCopy['3_browser_storage_analytics']}</h2>
          <p className="u-text-body">{pageCopy.this_website_stores_lightweight_public}</p>
        </article>

        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>{pageCopy['4_data_retention_requests']}</h2>
          <p className="u-text-body">{pageCopy.you_may_request_an_update}{" "}
            <a href={`mailto:${email}`} style={{ textDecoration: "underline", color: "var(--ink)" }}>
              {email}
            </a>{" "}{pageCopy.or_calling}{" "}
            <a
              href={`tel:${mobile.replace(/\s+/g, "")}`}
              style={{ textDecoration: "underline", color: "var(--ink)" }}
            >
              {mobile}
            </a>
            .
          </p>
        </article>
      </div>

      <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/contact" className="btn-pill btn-pill-dark">
          <span>{pageCopy.contact_studio}</span>
          <span className="g-circle" aria-hidden="true" />
        </Link>
        <Link to="/" className="btn-pill btn-pill-outline-dark">
          <span>{pageCopy.back_to_home}</span>
        </Link>
      </div>
    </section>
  );
}

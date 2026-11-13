import { Link } from "react-router-dom";
import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function PrivacyPolicy() {
  const { content } = useWebsiteContent();
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
      <span className="eyebrow">(LEGAL &amp; DATA PROTECTION)</span>
      <h1
        id="privacy-heading"
        className="u-text-h2"
        style={{ marginBottom: "1.5rem" }}
      >
        Privacy Policy
      </h1>
      <p className="u-text-lead" style={{ marginBottom: "2.5rem", color: "var(--muted)" }}>
        Yashmeen Future Building &amp; Fit-Out Contracting LLC respects the confidentiality of every
        architectural brief, contact enquiry, and career application submitted through our digital
        platforms.
      </p>

      <div style={{ display: "grid", gap: "2rem", borderTop: "1px solid var(--line)", paddingTop: "2rem" }}>
        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            1. Information We Collect
          </h2>
          <p className="u-text-body">
            When you request a quotation, submit an enquiry form, or contact our team regarding a
            role, we collect only the details you provide directly: your name, email address, phone
            number, project sector, location, budget range, timeline, and project notes.
          </p>
        </article>

        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            2. How We Use Your Project Details
          </h2>
          <p className="u-text-body">
            Submitted information is used strictly by our Business Bay studio estimation directors,
            engineering leads, and Al Quoz fabrication managers to prepare spatial assessments,
            authority submission timelines, and project proposals. We never sell or rent your
            contact data to third-party brokers.
          </p>
        </article>

        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            3. Browser Storage &amp; Analytics
          </h2>
          <p className="u-text-body">
            This website stores lightweight public portfolio cache entries locally in your browser to
            speed up repeat visits and uses analytics telemetry to understand general page traffic.
            Authorized studio administrators use session tokens solely when signing into the
            internal workspace.
          </p>
        </article>

        <article>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            4. Data Retention &amp; Requests
          </h2>
          <p className="u-text-body">
            You may request an update or permanent removal of your enquiry record at any time by
            emailing{" "}
            <a href={`mailto:${email}`} style={{ textDecoration: "underline", color: "var(--ink)" }}>
              {email}
            </a>{" "}
            or calling{" "}
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
          <span>CONTACT STUDIO</span>
          <span className="g-circle" aria-hidden="true" />
        </Link>
        <Link to="/" className="btn-pill btn-pill-outline-dark">
          <span>BACK TO HOME</span>
        </Link>
      </div>
    </section>
  );
}

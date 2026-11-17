import { mediaFallback } from "../../lib/media";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function Studio() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.Studio;

  const studio = content?.studio || {};
  const activeServices = (content?.services || []).filter((s) => s.active !== false);
  const rawHeadline = studio.headline;
  const headlineLines = String(rawHeadline).split(/\r?\n/);

  return (
    <section className="studio-manifesto-section wrap" id="manifesto" aria-label="Studio Manifesto">
      {/* Eyebrow & Monumental Display Title */}
      <div className="studio-headline-block">
        <span className="eyebrow">{studio.eyebrow}</span>
        <h2 className="u-text-display" key={rawHeadline}>
          {headlineLines.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < headlineLines.length - 1 && <br />}
            </Fragment>
          ))}
        </h2>
      </div>

      {/* Centered Inset Photograph with Generous Whitespace */}
      <div className="studio-inset-image-wrap">
        <div className="studio-inset-image-inner">
          <img onError={mediaFallback}
            src={pageCopy.image}
            alt={pageCopy.image_description}
            loading="lazy"
          />
        </div>
      </div>

      {/* 2-Column Editorial Narrative */}
      <div className="studio-narrative-grid">
        <div>
          <p>
            {studio.paragraph1}
          </p>
        </div>

        <div>
          <p>
            {studio.paragraph2}
          </p>

          <div style={{ marginTop: "2rem" }}>
            <Link to="/about" className="btn-pill btn-pill-dark">
              <span>{pageCopy.learn_more_about_our_studio}</span>
              <span className="g-circle" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Connected Services Index */}
      {activeServices.length > 0 && (
        <div
          id="services-live"
          style={{
            marginTop: "4.5rem",
            paddingTop: "2.5rem",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span className="eyebrow">{pageCopy.core_disciplines_services}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              ({String(activeServices.length).padStart(2, "0")}{pageCopy.disciplines}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {activeServices.map((srv, idx) => (
              <Link
                key={srv.id || srv.slug || idx}
                to={srv.route || "/services/interior-design"}
                className="studio-service-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1.35rem",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      color: "var(--muted)",
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ({String(idx + 1).padStart(2, "0")}) {srv.eyebrow || "SERVICE"}
                  </span>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>
                    {srv.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.55, color: "var(--muted)", margin: 0 }}>
                    {srv.shortDesc || srv.description}
                  </p>
                </div>
                <span
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >{pageCopy.explore_service_}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

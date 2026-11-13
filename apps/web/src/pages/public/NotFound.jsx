import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section
      className="wrap"
      style={{
        paddingTop: "clamp(8rem, 14vw, 12rem)",
        paddingBottom: "clamp(6rem, 10vw, 9rem)",
        textAlign: "center",
      }}
      aria-labelledby="not-found-heading"
    >
      <span className="eyebrow">(ERROR 404)</span>
      <h1
        id="not-found-heading"
        className="u-text-display"
        style={{ marginBottom: "1.5rem" }}
      >
        Page Not Found
      </h1>
      <p
        className="u-text-lead"
        style={{ maxWidth: "46ch", margin: "0 auto 2.5rem", color: "var(--muted)" }}
      >
        The page or URL you requested does not exist on this site. Explore our completed fit-out
        works or return to the homepage.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/" className="btn-pill btn-pill-dark">
          <span>RETURN TO HOME</span>
          <span className="g-circle" aria-hidden="true" />
        </Link>
        <Link to="/projects" className="btn-pill btn-pill-outline-dark">
          <span>VIEW PROJECTS</span>
        </Link>
      </div>
    </section>
  );
}

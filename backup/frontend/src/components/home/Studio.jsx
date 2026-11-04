import { Link } from "react-router-dom";

export default function Studio() {
  return (
    <section className="studio-manifesto-section wrap" id="manifesto" aria-label="Studio Manifesto">
      {/* Eyebrow & Monumental Display Title */}
      <div className="studio-headline-block">
        <span className="eyebrow">(OUR STUDIO)</span>
        <h2 className="u-text-display">
          EXPERIENCE FOCUSED
          <br />
          FIT-OUT
        </h2>
      </div>

      {/* Centered Inset Photograph with Generous Whitespace */}
      <div className="studio-inset-image-wrap">
        <img
          src="/static/studio.jpg"
          alt="Bespoke architectural joinery bench in Al Quoz, Dubai"
          loading="lazy"
        />
      </div>

      {/* 2-Column Editorial Narrative */}
      <div className="studio-narrative-grid">
        <div>
          <p>
            <strong>Yashmeen Future Building</strong> was founded on a simple premise: fit-out delivery in
            Dubai should never depend on a fragile chain of disconnected subcontractors. Design,
            spatial engineering, bespoke joinery, architectural glazing, and authority approvals
            run together under one accountable roof.
          </p>
        </div>

        <div>
          <p>
            Our dedicated 35,000 sq.ft Al Quoz manufacturing facility fabricates custom millwork,
            curved timber, metalwork, and acoustic panelling direct from the bench. With turnkey MEP
            and master site supervision, we eliminate finger-pointing, guarantee milestones, and
            protect architectural intent.
          </p>

          <div style={{ marginTop: "2rem" }}>
            <Link to="/about" className="btn-pill btn-pill-dark">
              <span>LEARN MORE ABOUT OUR STUDIO</span>
              <span className="g-circle" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

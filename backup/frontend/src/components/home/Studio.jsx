import { Link } from "react-router-dom";

export default function Studio() {
  return (
    <section className="studio-manifesto-section wrap" id="manifesto" aria-label="Studio Manifesto">
      {/* Eyebrow & Monumental Display Title */}
      <div className="studio-headline-block">
        <span className="eyebrow">(ONE TEAM. EVERY STAGE.)</span>
        <h2 className="u-text-display">
          DESIGN TO
          <br />
          DELIVERY
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
            <strong>Yashmeen Future Building</strong> brings Dubai fit-out delivery together under one team. Design,
            spatial engineering, bespoke joinery, architectural glazing, and authority approvals
            move together under one accountable team, from the first brief to site handover.
          </p>
        </div>

        <div>
          <p>
            In our 35,000 sq. ft. Al Quoz atelier, craftspeople fabricate custom millwork, curved timber,
            metalwork and acoustic panels. Our MEP and site teams carry those details into the finished
            space, keeping the approved design and the built result connected.
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

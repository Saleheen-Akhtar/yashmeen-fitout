import { Link } from "react-router-dom";

export default function IntroSection() {
  return (
    <section className="section intro">
      <div className="wrap">
        <p className="eyebrow" data-reveal>Studio</p>
        <p className="intro-text" data-words>
          We design, approve and build interiors for villas, offices and hotels across Dubai, with our own workshop and engineers under one roof.
        </p>
        <Link className="link-arrow intro-link" to="/about" data-reveal>About the studio</Link>
      </div>
    </section>
  );
}

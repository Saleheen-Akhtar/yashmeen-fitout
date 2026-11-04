import { Link } from "react-router-dom";

export default function Testimonial() {
  return (
    <section
      className="testimonial-editorial-section wrap"
      aria-label="Client Testimonial"
    >
      <div className="wrap-narrow">
        <span className="eyebrow">(HEAR FROM OUR CLIENT)</span>
        <blockquote className="testimonial-quote-text">
          "From the initial meeting I was impressed by the genuine enthusiasm and willingness to
          engage with the ideas in our brief. The team engendered total confidence. They cared
          about the project; throughout the design and construction process they listened and
          executed with extraordinary precision."
        </blockquote>
        <cite className="testimonial-cite">
          Homeowner, Emirates Hills Villa Commission
        </cite>

        <div style={{ marginTop: "2.5rem" }}>
          <Link to="/projects" className="btn-pill btn-pill-outline-dark">
            <span>VIEW COMMISSION</span>
            <span className="g-circle is-dark" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

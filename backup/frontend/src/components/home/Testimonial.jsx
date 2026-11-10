import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const testimonials = [
  {
    location: "EMIRATES HILLS · PRIVATE RESIDENCE",
    quote:
      "From the initial meeting I was impressed by the genuine enthusiasm and willingness to engage with the ideas in our brief. The team engendered total confidence. They cared about the project; throughout the design and construction process they listened and executed with extraordinary precision.",
    attribution: "Homeowner, Emirates Hills Villa Commission",
    href: "/projects",
    linkLabel: "VIEW COMMISSION",
  },
];

export default function Testimonial() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const countLabel = (value) => String(value + 1).padStart(2, "0");

  const goTo = (index) => {
    const nextIndex = (index + testimonials.length) % testimonials.length;
    setActiveIndex(nextIndex);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackRef.current?.children[nextIndex]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const syncActiveSlide = () => {
    const track = trackRef.current;
    if (!track) return;
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.min(nextIndex, testimonials.length - 1));
  };

  return (
    <section
      className="testimonial-card-section wrap"
      aria-label="Client Testimonial"
    >
      <div className="testimonial-card-heading">
        <span className="eyebrow">(HEAR FROM OUR CLIENT)</span>
        <span className="testimonial-card-kicker">STORY {countLabel(activeIndex)} <i>/</i> {countLabel(testimonials.length - 1)}</span>
      </div>
      <div className="testimonial-carousel-shell" aria-roledescription="carousel">
        <div
          className="testimonial-carousel-track"
          ref={trackRef}
          onScroll={syncActiveSlide}
          aria-live="polite"
        >
          {testimonials.map((item, index) => (
            <article className="testimonial-feature-card" key={`${item.attribution}-${index}`} aria-label={`Client story ${countLabel(index + 0)} of ${countLabel(testimonials.length - 1)}`}>
              <div className="testimonial-feature-topline">
                <span>CLIENT NOTE</span>
                <span>{countLabel(index)} <i>/</i> {countLabel(testimonials.length - 1)}</span>
              </div>
              <div className="testimonial-feature-main">
                <span className="testimonial-card-quote-mark" aria-hidden="true">“</span>
                <blockquote className="testimonial-quote-text">{item.quote}</blockquote>
              </div>
              <footer className="testimonial-feature-footer">
                <div className="testimonial-client-meta">
                  <cite className="testimonial-cite">{item.attribution}</cite>
                  <span className="testimonial-card-kicker">{item.location}</span>
                </div>
                <Link to={item.href} className="testimonial-project-link">
                  <span>{item.linkLabel}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </footer>
            </article>
          ))}
        </div>
        {testimonials.length > 1 && (
          <div className="testimonial-carousel-controls" aria-label="Client story controls">
            <div className="testimonial-carousel-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${(activeIndex + 1) / testimonials.length})` }} />
            </div>
            <div className="testimonial-carousel-arrows">
              <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label="Previous client story">←</button>
              <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label="Next client story">→</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

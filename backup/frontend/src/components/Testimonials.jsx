const TESTIMONIALS = [
  {
    quote:
      "Genuinely one of the finest turnkey fit-out partners we have commissioned in Dubai. Responsive, impeccably organised, and the custom joinery finish in our Emirates Hills villa speaks for itself.",
    author: "Farah Al Suwaidi",
    location: "Emirates Hills, Dubai",
    project: "Turnkey Luxury Villa Fit-Out",
    timeline: "Delivered in 72 Days",
  },
  {
    quote:
      "From initial concept renderings to final authority handovers, coordination was seamless. Their in-house MEP sequencing saved us weeks of ceiling rework and Dubai Municipality approvals.",
    author: "Daniyar Omarov",
    location: "Business Bay, Dubai",
    project: "Commercial Headquarters",
    timeline: "Delivered in 60 Days",
  },
  {
    quote:
      "The craftsmanship from their Al Quoz joinery bay is exceptional. Every veneer was grain-matched and delivered precisely on the agreed milestone date.",
    author: "Evelyn Marsh",
    location: "Palm Jumeirah Penthouse",
    project: "Luxury Penthouse Renovation",
    timeline: "Delivered in 80 Days",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow" data-reveal>Client words</p>
          <h2 className="section-title" data-split>What clients say.</h2>
        </div>
        <ul className="quote-grid" data-stagger>
          {TESTIMONIALS.map((t) => (
            <li key={t.author} className="quote card">
              <blockquote>{t.quote}</blockquote>
              <footer>
                <strong>{t.author}</strong>
                <span>{t.project}, {t.location}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

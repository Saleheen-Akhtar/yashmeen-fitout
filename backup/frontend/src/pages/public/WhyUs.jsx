import "../../styles/why-us.css";
const HERO_BG = "/static/why-us-bg.jpg";
const WHY_IMAGE = "/static/why-us.jpg";

// TODO: replace with the company's actual YouTube video ID (the part after v= or youtu.be/)
const INTRO_VIDEO_ID = "VIDEO_ID_HERE";

const WHY_POINTS = [
  {
    label: "Proven Excellence:",
    copy: "From luxury lounges to high-traffic commercial hubs, our portfolio of global brands proves our ability to deliver premium finishes that stand up to the most demanding environments.",
  },
  {
    label: "In-House Manufacturing:",
    copy: "We operate our own state-of-the-art joinery factory in Al Quoz. By producing bespoke fixtures and furniture in-house, we guarantee 100% quality control, competitive pricing, and on-time delivery.",
  },
  {
    label: "Precision Scheduling:",
    copy: "We understand that time is a critical asset. Our integrated project management ensures every milestone is met, delivering your project on time without compromising on quality.",
  },
];

const REASONS = [
  {
    icon: "shield",
    title: "ISO-Certified Quality",
    copy: "Every contract runs under ISO 9001, ISO 14001, and ISO 45001 standards - not just our headline projects.",
  },
  {
    icon: "clock",
    title: "On-Time Handover",
    copy: "Realistic schedules, tracked weekly, so the date we promise you on day one is the date you actually get your keys.",
  },
  {
    icon: "tag",
    title: "Transparent Pricing",
    copy: "Itemised quotes with no hidden variations. What you approve is what you're billed, with flexible payment plans available.",
  },
  {
    icon: "team",
    title: "One In-House Team",
    copy: "Designers, engineers, and craftsmen under one roof - no subcontractor hand-offs diluting the brief along the way.",
  },
  {
    icon: "house",
    title: "True Turnkey Delivery",
    copy: "Partitions, ceilings, flooring, furnishings, and MEP - we manage every trade so you deal with a single point of contact.",
  },
  {
    icon: "support",
    title: "Support After Handover",
    copy: "Snagging, warranty callbacks, and maintenance support don't stop the day we finish - we stay reachable after handover.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Consultation",
    copy: "We visit your site, listen to the brief, and scope budget and timeline together.",
  },
  {
    step: "02",
    title: "Design",
    copy: "Concept, drawings, and material selections refined with you until every detail is signed off.",
  },
  {
    step: "03",
    title: "Execution",
    copy: "Our in-house team builds to the approved drawings, with weekly progress updates.",
  },
  {
    step: "04",
    title: "Handover",
    copy: "A final walkthrough, snag-free handover, and ongoing support once you've moved in.",
  },
];

function Icon({ name }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--brass-deep)",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M12.5 3.5H5.5L3 6v7L11 21l10-10-8.5-7.5Z" />
          <circle
            cx="8"
            cy="8"
            r="1.4"
            fill="var(--brass-deep)"
            stroke="none"
          />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="8.5" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
          <path d="M14.5 14.3c2.6.3 4.5 2.4 4.5 5.2" />
        </svg>
      );
    case "house":
      return (
        <svg {...common}>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 10v9.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" />
          <path d="M10 20.5v-6h4v6" />
        </svg>
      );
    case "support":
      return (
        <svg {...common}>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <rect x="3" y="13" width="4" height="6" rx="1.3" />
          <rect x="17" y="13" width="4" height="6" rx="1.3" />
          <path d="M20 19v1a3 3 0 0 1-3 3h-3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function WhyUs() {
  return (
    <div className="page whyus-page">

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow eyebrow-light eyebrow-center">
            <span className="eyebrow-bar" />
            About Us
          </span>
          <h1 className="hero-title">Why Choose Us</h1>
          <p className="hero-copy">
            Years of turnkey fit-outs across the UAE have taught Yashmeen Future
            Building & Fit-Out Company exactly where projects go wrong - so
            here&rsquo;s how we make sure yours doesn&rsquo;t.
          </p>
        </div>
      </section>

      {/* IMAGE + WHY INTRO */}
      <section className="intro-section">
        <div className="wrap">
          <div className="intro-grid">
            <div className="intro-image-frame">
              <img
                src={WHY_IMAGE}
                alt="Yashmeen Future Building & Fit-Out Company team on a project site"
              />
            </div>

            <div>
              <h2 className="why-heading">
                Why Yashmeen Future Building & Fit-Out Company?
              </h2>
              <p className="why-intro-copy">
                Yashmeen Future Building & Fit-Out Company is a leading turnkey
                fit-out specialist in Dubai, engineered to handle projects that
                demand extreme precision and complex logistics. We provide a
                distinct advantage through:
              </p>
              <div className="why-list">
                {WHY_POINTS.map((point) => (
                  <div key={point.label} className="why-list-item">
                    <span className="why-bullet" />
                    <span>
                      <span className="why-label">{point.label}</span>{" "}
                      {point.copy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="video-section">
        <div className="wrap">
          <div className="section-header">
            <span className="eyebrow">
              <span className="eyebrow-bar" />
              See Us In Action
            </span>
            <h2 className="section-heading">A closer look at how we work.</h2>
            <p className="section-copy">
              We Work Together, We Learn Together - a short introduction to the
              team and process behind every Yashmeen Future Building & Fit-Out
              Company project.
            </p>
          </div>

          {INTRO_VIDEO_ID && INTRO_VIDEO_ID !== "VIDEO_ID_HERE" && (
            <div className="video-frame">
              <iframe
                src={`https://www.youtube.com/embed/${INTRO_VIDEO_ID}`}
                title="Yashmeen Future Building & Fit-Out Company - We Work Together, We Learn Together"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
      </section>

      {/* REASONS */}
      <section className="reasons-section">
        <div className="wrap">
          <div className="section-header">
            <span className="eyebrow">
              <span className="eyebrow-bar" />
              What Sets Us Apart
            </span>
            <h2 className="section-heading">
              Six reasons clients come back to us.
            </h2>
            <p className="section-copy">
              We&rsquo;re not the only fit-out contractor in Dubai - but
              we&rsquo;re the one that treats your project like it&rsquo;s the
              only one we have.
            </p>
          </div>

          <div className="reasons-grid">
            {REASONS.map((r) => (
              <div key={r.title} className="reason-card">
                <div className="reason-icon-wrap">
                  <Icon name={r.icon} />
                </div>
                <div className="reason-title">{r.title}</div>
                <p className="reason-copy">{r.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process-section">
        <div className="wrap">
          <div className="section-header">
            <span className="eyebrow">
              <span className="eyebrow-bar" />
              How We Work
            </span>
            <h2 className="section-heading">
              A process built to remove surprises.
            </h2>
          </div>

          <div className="process-grid">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="process-card">
                {i < PROCESS.length - 1 && <div className="process-divider" />}
                <div className="process-step">{p.step}</div>
                <div className="process-title">{p.title}</div>
                <p className="process-copy">{p.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

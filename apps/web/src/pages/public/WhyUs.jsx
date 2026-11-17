import { mediaFallback } from "../../lib/media";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import "../../styles/why-us.css";

// TODO: replace with the company's actual YouTube video ID (the part after v= or youtu.be/)

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
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.WhyUs;
  const WHY_IMAGE = pageCopy.why_image;
  const INTRO_VIDEO_ID = pageCopy.intro_video_id;
  const WHY_POINTS = pageCopy.why_points;
  const REASONS = pageCopy.reasons;
  const PROCESS = pageCopy.process;

  return (
    <div className="page whyus-page">


      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow eyebrow-light eyebrow-center">
            <span className="eyebrow-bar" />{pageCopy.about_us}</span>
          <h1 className="hero-title">{pageCopy.why_choose_us}</h1>
          <p className="hero-copy">{pageCopy.years_of_turnkey_fitouts_across}</p>
        </div>
      </section>

      {/* IMAGE + WHY INTRO */}
      <section className="intro-section">
        <div className="wrap">
          <div className="intro-grid">
            <div className="intro-image-frame">
              <img onError={mediaFallback}
                src={WHY_IMAGE}
                alt={pageCopy.image_description}
              />
            </div>

            <div>
              <h2 className="why-heading">{pageCopy.why_yashmeen_future_building_fitout}</h2>
              <p className="why-intro-copy">{pageCopy.yashmeen_future_building_fitout_company}</p>
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
              <span className="eyebrow-bar" />{pageCopy.see_us_in_action}</span>
            <h2 className="section-heading">{pageCopy.a_closer_look_at_how}</h2>
            <p className="section-copy">{pageCopy.we_work_together_we_learn}</p>
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
              <span className="eyebrow-bar" />{pageCopy.what_sets_us_apart}</span>
            <h2 className="section-heading">{pageCopy.six_reasons_clients_come_back}</h2>
            <p className="section-copy">{pageCopy.were_not_the_only_fitout}</p>
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
              <span className="eyebrow-bar" />{pageCopy.how_we_work}</span>
            <h2 className="section-heading">{pageCopy.a_process_built_to_remove}</h2>
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

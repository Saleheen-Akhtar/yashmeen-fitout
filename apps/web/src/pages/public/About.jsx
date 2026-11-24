import { Link } from "react-router-dom";
import { mediaFallback } from "../../lib/media";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import { FiCheck, FiTarget, FiEye } from "react-icons/fi";
import "../../styles/about.css";

export default function AboutPage() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.About;
  const STATS = pageCopy.stats;
  const SERVICES = pageCopy.services;

  return (
    <div className="page aboutpg-page">

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">{pageCopy.about_us}</span>
          <h1 className="hero-title">{pageCopy.interiors_built_around_how_you}</h1>
          <p className="hero-copy">{pageCopy.yashmeen_future_building_fitout_company}</p>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="about-section">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-image-frame">
              <img onError={mediaFallback} src={pageCopy.image} alt={pageCopy.image_alt_1} />
            </div>

            <div>
              <span className="eyebrow">{pageCopy.about_us}</span>
              <h2 className="about-heading">{pageCopy.a_dubai_fitout_company_built}</h2>
              <p className="about-copy">{pageCopy.based_in_business_bay_dubai}</p>
              <p className="about-copy">{pageCopy.we_believe_good_interiors_are}</p>

              <div className="about-highlights">
                <div className="about-highlight">
                  <FiCheck size={16} />{pageCopy.iso_certified_delivery}
                </div>
                <div className="about-highlight">
                  <FiCheck size={16} />{pageCopy.inhouse_craftsmen}
                </div>
                <div className="about-highlight">
                  <FiCheck size={16} />{pageCopy.ontime_handover}
                </div>
                <div className="about-highlight">
                  <FiCheck size={16} />{pageCopy.transparent_pricing}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="wrap">
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mv-section">
        <div className="wrap">
          <div className="mv-header">
            <span className="eyebrow">{pageCopy.what_drives_us}</span>
            <h2 className="mv-heading">{pageCopy.mission_vision}</h2>
          </div>

          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon-circle">
                <FiTarget size={22} strokeWidth={1.75} />
              </div>
              <h3 className="mv-card-title">{pageCopy.our_mission}</h3>
              <p className="mv-card-copy">{pageCopy.to_deliver_turnkey_interior_fitouts}</p>
            </div>

            <div className="mv-card">
              <div className="mv-icon-circle">
                <FiEye size={22} strokeWidth={1.75} />
              </div>
              <h3 className="mv-card-title">{pageCopy.our_vision}</h3>
              <p className="mv-card-copy">{pageCopy.to_be_the_uaes_most}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING / SERVICES */}
      <section className="services-section">
        <div className="wrap">
          <div className="services-grid">
            <div>
              <span className="eyebrow">{pageCopy.what_we_offer}</span>
              <h2 className="services-heading">{pageCopy.turning_your_imagination_into_reality}</h2>
              <p className="services-copy">{pageCopy.looking_for_a_professional_interior}</p>
              <p className="services-copy">{pageCopy.we_are_happy_to_offer}</p>
            </div>

            <div className="services-list">
              {SERVICES.map((service) => (
                <div key={service} className="service-item">
                  <span className="service-check">
                    <FiCheck size={13} strokeWidth={3} />
                  </span>
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTATION CTA BANNER */}
      <section className="about-cta-section">
        <div className="wrap">
          <div className="about-cta-inner">
            <span className="eyebrow">Start Your Project</span>
            <h2 className="about-cta-title">Ready to bring your architectural vision to life?</h2>
            <p className="about-cta-copy">
              Visit our Business Bay design studio or Al Quoz atelier to discuss your residential or commercial fit-out requirements with our senior engineering team.
            </p>
            <div className="about-cta-actions">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-questionnaire"))}
                className="btn-pill btn-pill-dark"
              >
                Request a Consultation
              </button>
              <Link to="/projects" className="btn-pill btn-pill-outline-dark">
                Browse Selected Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

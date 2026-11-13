import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheck, FiArrowRight, FiPlus, FiMinus, FiArrowUpRight, FiLayers } from "react-icons/fi";
import useWebsiteContent from "../../../hooks/useWebsiteContent";
import { SERVICES_DATA } from "./servicesData";
import "../../../styles/services.css";

export default function ServiceDetail({ serviceKey }) {
  const { slug } = useParams();
  const activeKey = (serviceKey || slug || "architecture").toLowerCase();
  const [openFaq, setOpenFaq] = useState(0);

  const { content } = useWebsiteContent();
  const fallbackService = SERVICES_DATA[activeKey] || SERVICES_DATA["architecture"];

  // Check if CMS/backend content overrides or provides custom service info
  const cmsServices = Array.isArray(content?.services) ? content.services : [];
  const cmsService = cmsServices.find(
    (s) => s.slug === activeKey || s.slug === fallbackService.slug
  );

  const title = cmsService?.title || fallbackService.title;
  const kicker = fallbackService.kicker || "YASHMEEN FIT-OUT & INTERIORS";
  const heroHeading = fallbackService.heroTitle || `${title} - Yashmeen Future Building Dubai`;
  const heroBg = cmsService?.image || fallbackService.heroBgImage;
  const introImg = fallbackService.introImage || cmsService?.image || "/static/studio.jpg";
  const introTitle = cmsService?.shortDesc || fallbackService.introTitle;
  const introCopy = cmsService?.description || fallbackService.introCopy;
  const introPoints = Array.isArray(cmsService?.highlights) && cmsService.highlights.length > 0
    ? cmsService.highlights
    : fallbackService.introPoints;

  const stats = fallbackService.stats || [
    { value: "150+", label: "Projects Completed" },
    { value: "10+", label: "Years of Experience" },
    { value: "50+", label: "Skilled Professionals" },
    { value: "100%", label: "In-House Delivery" },
  ];

  const disciplines = fallbackService.disciplines || [];
  const process = fallbackService.process || [];
  const projects = fallbackService.projects || [];
  const faqs = fallbackService.faqs || [];

  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <div className="srv-page">
      {/* 1. HERO BAND */}
      <section
        className="srv-hero-section"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="srv-hero-dark-overlay" />
        <div className="srv-hero-inner-container">
          <span className="srv-hero-kicker">{kicker}</span>
          <h1 className="srv-hero-heading">{heroHeading}</h1>
        </div>
      </section>

      {/* 2. DISCIPLINE OVERVIEW / INTRO */}
      <section className="srv-section">
        <div className="srv-wrap">
          <div className="srv-intro-grid">
            <div>
              <div className="srv-eyebrow">
                <span className="srv-eyebrow-bar" />
                {title}
              </div>
              <h2 className="srv-section-heading">{introTitle}</h2>
              <p className="srv-intro-copy">{introCopy}</p>
              <ul className="srv-check-list">
                {introPoints.map((point, idx) => (
                  <li key={idx} className="srv-check-item">
                    <span className="srv-check-icon">
                      <FiCheck size={14} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "32px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button type="button" onClick={openEnquiry} className="btn-pill btn-pill-dark">
                  <span>REQUEST CONSULTATION</span>
                  <span className="g-circle" aria-hidden="true" />
                </button>
                <Link
                  to="/projects"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 22px",
                    height: "46px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(27,26,23,0.18)",
                    color: "#1b1a17",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span>VIEW COMPLETED WORKS</span>
                  <FiArrowUpRight size={14} />
                </Link>
              </div>
            </div>
            <div className="srv-intro-image-frame">
              <img
                src={introImg}
                alt={title}
                className="srv-intro-image"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY STATISTICS */}
      <section className="srv-stats-section">
        <div className="srv-wrap">
          <div className="srv-stats-grid">
            {stats.map((s, idx) => (
              <div key={idx} className="srv-stat-item">
                <div className="srv-stat-value">{s.value}</div>
                <div className="srv-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE DISCIPLINES & SCOPE */}
      {disciplines.length > 0 && (
        <section className="srv-section srv-services-section">
          <div className="srv-wrap">
            <div className="srv-eyebrow">
              <span className="srv-eyebrow-bar" />
              CAPABILITIES & SCOPE
            </div>
            <h2 className="srv-section-heading">Integrated Disciplines Under One Roof</h2>
            <p className="srv-section-intro">
              Operating our own 35,000 sq.ft manufacturing facility in Al Quoz eliminates
              subcontractor markups, prevents schedule delays, and maintains absolute control over
              fit-out quality.
            </p>
            <div className="srv-service-grid">
              {disciplines.map((d, idx) => {
                const IconComp = d.icon || FiLayers;
                return (
                  <div key={idx} className="srv-service-card">
                    <div className="srv-service-icon">
                      <IconComp size={24} />
                    </div>
                    <h3 className="srv-service-title">{d.title}</h3>
                    <p className="srv-service-copy">{d.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. STRUCTURED PROCESS */}
      {process.length > 0 && (
        <section className="srv-section srv-process-section">
          <div className="srv-wrap">
            <div className="srv-eyebrow">
              <span className="srv-eyebrow-bar" />
              METHODOLOGY
            </div>
            <h2 className="srv-section-heading">How We Deliver From Brief to Handover</h2>
            <p className="srv-section-intro">
              A transparent, milestone-driven execution framework engineered to prevent budget creep
              and ensure smooth authority approvals.
            </p>
            <div className="srv-process-grid">
              {process.map((step, idx) => (
                <div key={idx} className="srv-process-step">
                  <div className="srv-process-number">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="srv-process-title">{step.title}</h3>
                  <p className="srv-process-copy">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. VIDEO SHOWCASE */}
      {fallbackService.videoUrl && (
        <section className="srv-section" style={{ background: "#ffffff" }}>
          <div className="srv-wrap">
            <div className="srv-video-header">
              <div className="srv-eyebrow">
                <span className="srv-eyebrow-bar" />
                STUDIO & SITE TOURS
              </div>
              <h2 className="srv-section-heading">Watch Our Workshop & Site Craft in Motion</h2>
              <p className="srv-section-intro">
                Take a direct look inside our Dubai operations, bespoke fabrication bays, and
                turnkey fit-out sites across the UAE.
              </p>
            </div>
            <div className="srv-video-frame">
              <iframe
                src={fallbackService.videoUrl}
                title={`${title} Video Showcase`}
                className="srv-video-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* 7. FEATURED PROJECTS */}
      {projects.length > 0 && (
        <section className="srv-section">
          <div className="srv-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div className="srv-eyebrow">
                  <span className="srv-eyebrow-bar" />
                  REPRESENTATIVE WORKS
                </div>
                <h2 className="srv-section-heading">Selected Delivered Projects</h2>
              </div>
              <Link
                to="/projects"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--srv-brass-deep)",
                }}
              >
                <span>EXPLORE ALL PROJECTS</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="srv-project-grid">
              {projects.map((p, idx) => (
                <div key={idx} className="srv-project-card">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="srv-project-image"
                    loading="lazy"
                  />
                  <div className="srv-project-shade" />
                  <div className="srv-project-meta">
                    <span className="srv-project-tag">{p.tag}</span>
                    <h3 className="srv-project-title">{p.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ ACCORDION */}
      {faqs.length > 0 && (
        <section className="srv-section srv-faq-section">
          <div className="srv-wrap">
            <div className="srv-eyebrow">
              <span className="srv-eyebrow-bar" />
              COMMON QUESTIONS
            </div>
            <h2 className="srv-section-heading">Frequently Asked Questions</h2>
            <div className="srv-faq-list">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="srv-faq-item">
                    <button
                      type="button"
                      className="srv-faq-question"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <span className="srv-faq-toggle-icon">
                        {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                      </span>
                    </button>
                    {isOpen && <p className="srv-faq-answer">{faq.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 9. FINAL CTA BOX */}
      <section className="srv-cta-section">
        <div className="srv-wrap">
          <div className="srv-cta-box">
            <div>
              <h3 className="srv-cta-heading">Ready to discuss your upcoming project?</h3>
              <p className="srv-cta-copy">
                Speak directly with our architectural directors and engineers. We provide
                transparent scoping, realistic timelines, and comprehensive quotations.
              </p>
            </div>
            <div className="srv-cta-buttons">
              <button
                type="button"
                onClick={openEnquiry}
                className="btn-pill btn-pill-dark"
              >
                <span>REQUEST QUOTATION</span>
                <span className="g-circle" aria-hidden="true" />
              </button>
              <Link to="/contact" className="srv-cta-link">
                <span className="srv-cta-link-label">CONTACT STUDIO</span>
                <span className="srv-cta-link-icon">
                  <FiArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

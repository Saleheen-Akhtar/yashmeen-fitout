import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheck, FiArrowRight, FiPlus, FiMinus, FiArrowUpRight, FiLayers } from "react-icons/fi";
import useWebsiteContent from "../../../hooks/useWebsiteContent";
import { SERVICES_DATA, SERVICE_ICONS } from "./servicesData";
import NotFound from "../NotFound";
import "../../../styles/services.css";
import { resolveMediaUrl, mediaFallback } from "../../../lib/media";

export default function ServiceDetail({ serviceKey }) {
  const { slug } = useParams();
  const activeKey = (serviceKey || slug || "architecture").toLowerCase();
  const [openFaq, setOpenFaq] = useState(0);

  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.ServiceDetail;


  const fallbackService = SERVICES_DATA[activeKey];

  // Check if CMS/backend content overrides or provides custom service info
  const cmsServices = Array.isArray(content?.services) ? content.services : [];
  const cmsService = cmsServices.find(
    (s) => s.slug === activeKey || s.slug === fallbackService?.slug
  );

  if (!cmsService || cmsService.active === false) return <NotFound />;
  const service = { ...fallbackService, ...cmsService };

  const title = cmsService?.title || service.title;
  const kicker = service.kicker || "YASHMEEN FIT-OUT & INTERIORS";
  const heroHeading = title;
  const heroBg = resolveMediaUrl(cmsService?.image || service.image);
  const introImg = resolveMediaUrl(service.introImage || cmsService?.image || "/static/studio.jpg");
  const introTitle = cmsService?.shortDesc || service.shortDesc;
  const introCopy = cmsService?.description || service.description;
  const introPoints = Array.isArray(cmsService?.highlights)
    ? cmsService.highlights
    : service.highlights || [];

  const stats = service.stats || [];

  const disciplines = service.disciplines || [];
  const process = service.process || [];
  const projects = service.projects || [];
  const faqs = service.faqs || [];

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
                  <span>{pageCopy.request_consultation}</span>
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
                  <span>{pageCopy.view_completed_works}</span>
                  <FiArrowUpRight size={14} />
                </Link>
              </div>
            </div>
            <div className="srv-intro-image-frame">
              <img
                src={introImg}
                onError={mediaFallback}
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
              <span className="srv-eyebrow-bar" />{pageCopy.capabilities_scope}</div>
            <h2 className="srv-section-heading">{pageCopy.integrated_disciplines_under_one_roof}</h2>
            <p className="srv-section-intro">{pageCopy.operating_our_own_35000_sqft}</p>
            <div className="srv-service-grid">
              {disciplines.map((d, idx) => {
                const IconComp = SERVICE_ICONS[d.icon] || FiLayers;
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
              <span className="srv-eyebrow-bar" />{pageCopy.methodology}</div>
            <h2 className="srv-section-heading">{pageCopy.how_we_deliver_from_brief}</h2>
            <p className="srv-section-intro">{pageCopy.a_transparent_milestonedriven_execution_framework}</p>
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
      {service.videoUrl && (
        <section className="srv-section" style={{ background: "#ffffff" }}>
          <div className="srv-wrap">
            <div className="srv-video-header">
              <div className="srv-eyebrow">
                <span className="srv-eyebrow-bar" />{pageCopy.studio_site_tours}</div>
              <h2 className="srv-section-heading">{pageCopy.watch_our_workshop_site_craft}</h2>
              <p className="srv-section-intro">{pageCopy.take_a_direct_look_inside}</p>
            </div>
            <div className="srv-video-frame">
              <iframe
                src={service.videoUrl}
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
                  <span className="srv-eyebrow-bar" />{pageCopy.representative_works}</div>
                <h2 className="srv-section-heading">{pageCopy.selected_delivered_projects}</h2>
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
                <span>{pageCopy.explore_all_projects}</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="srv-project-grid">
              {projects.map((p, idx) => (
                <Link to={p.href || "/projects"} key={idx} className="srv-project-card">
                  <img
                    src={resolveMediaUrl(p.img)}
                    onError={mediaFallback}
                    alt={p.title}
                    className="srv-project-image"
                    loading="lazy"
                  />
                  <div className="srv-project-shade" />
                  <div className="srv-project-meta">
                    <span className="srv-project-tag">{p.tag}</span>
                    <h3 className="srv-project-title">{p.title}</h3>
                  </div>
                </Link>
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
              <span className="srv-eyebrow-bar" />{pageCopy.common_questions}</div>
            <h2 className="srv-section-heading">{pageCopy.frequently_asked_questions}</h2>
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
              <h3 className="srv-cta-heading">{pageCopy.ready_to_discuss_your_upcoming}</h3>
              <p className="srv-cta-copy">{pageCopy.speak_directly_with_our_architectural}</p>
            </div>
            <div className="srv-cta-buttons">
              <button
                type="button"
                onClick={openEnquiry}
                className="btn-pill btn-pill-dark"
              >
                <span>{pageCopy.request_quotation}</span>
                <span className="g-circle" aria-hidden="true" />
              </button>
              <Link to="/contact" className="srv-cta-link">
                <span className="srv-cta-link-label">{pageCopy.contact_studio}</span>
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

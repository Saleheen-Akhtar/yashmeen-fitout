import { useState } from "react";
import { Link } from "react-router-dom";
import useWebsiteContent from "../../../hooks/useWebsiteContent";
import {
  FiCheck,
  FiArrowRight,
  FiPlus,
  FiMinus,
  FiLayout,
  FiPenTool,
  FiFileText,
  FiTool,
  FiHome,
  FiLayers,
} from "react-icons/fi";

// Hero & Intro: local studio assets
const ARCH_HERO_BG_IMAGE = "/static/hero-bg.jpg";
const ARCH_INTRO_IMAGE = "/static/design-desk.jpg";

const ARCH_VIDEO_URL = "https://www.youtube-nocookie.com/embed/CF97mtu3qlE";

// Placeholder numbers - replace with your real figures
const ARCH_STATS = [
  { value: "150+", label: "Projects Completed" },
  { value: "10+", label: "Years of Experience" },
  { value: "50+", label: "Skilled Professionals" },
  { value: "100%", label: "In-House Delivery" },
];

const ARCH_INTRO_POINTS = [
  "Concept design through to construction drawings",
  "Authority approvals handled end to end",
  "Structural and MEP coordination in-house",
  "One accountable team from design to handover",
];

const ARCH_SERVICES = [
  {
    icon: FiLayout,
    title: "Concept & Master Planning",
    copy: "Site analysis, space planning and massing studies that turn your brief into a clear architectural direction.",
  },
  {
    icon: FiPenTool,
    title: "Architectural Design",
    copy: "Detailed plans, elevations, sections and 3D visuals so every decision is visible before construction begins.",
  },
  {
    icon: FiFileText,
    title: "Authority Approvals",
    copy: "Preparation and submission of drawings to the relevant authorities, with follow-up until approval is issued.",
  },
  {
    icon: FiLayers,
    title: "Structural & MEP Coordination",
    copy: "Engineers, consultants and trades aligned on a single set of drawings to avoid clashes on site.",
  },
  {
    icon: FiTool,
    title: "Design & Build Delivery",
    copy: "Construction, finishing and bespoke joinery delivered by one team against an agreed budget and programme.",
  },
  {
    icon: FiHome,
    title: "Renovation & Extensions",
    copy: "Reworking existing villas and buildings with new layouts, added floors and upgraded finishes.",
  },
];

const ARCH_PROCESS = [
  {
    title: "Consultation & Brief",
    copy: "We visit the site, understand your goals, budget and timeline, and confirm the scope of work.",
  },
  {
    title: "Concept Design",
    copy: "Layout options, mood boards and 3D concepts are presented and refined with your feedback.",
  },
  {
    title: "Detailed Design & Approvals",
    copy: "Technical drawings, material specifications and authority submissions are completed.",
  },
  {
    title: "Construction & Fit-Out",
    copy: "Our site team builds, finishes and installs, with regular progress updates and quality checks.",
  },
  {
    title: "Handover",
    copy: "Final inspection, snagging and a complete handover pack so you can move in with confidence.",
  },
];

const ARCH_PROJECTS = [
  {
    title: "Contemporary Villa - Full Build",
    tag: "Residential",
    img: "/static/work-myrtle.jpg",
  },
  {
    title: "Corporate Office - Design & Fit-Out",
    tag: "Commercial",
    img: "/static/Office-fit-out.jpg",
  },
  {
    title: "Boutique Retail Space",
    tag: "Retail",
    img: "/static/work-samford.jpg",
  },
];

const ARCH_FAQS = [
  {
    q: "Do you handle both design and construction?",
    a: "Yes. We offer a single-team design-and-build service, so the people who design your space are accountable for how it is built.",
  },
  {
    q: "Can you manage authority approvals for me?",
    a: "We prepare and submit the required drawings and documents and follow up with the authorities until the approvals are in place.",
  },
  {
    q: "How long does an architectural project take?",
    a: "Timelines depend on size and complexity. After the initial consultation we provide a programme covering design, approvals and construction.",
  },
  {
    q: "Can you renovate or extend an existing property?",
    a: "Yes. We handle renovations, layout changes and extensions, from small upgrades to full structural remodelling.",
  },
  {
    q: "How do I get a quotation?",
    a: "Send us your requirements through the contact page or call us. We will arrange a consultation and share a detailed quotation afterwards.",
  },
];

export default function Architecture() {
  const [openFaq, setOpenFaq] = useState(0);
  const { content } = useWebsiteContent();
  const liveSrv = (content?.services || []).find((s) => s.slug === "architecture");
  const livePoints = liveSrv?.highlights?.length ? liveSrv.highlights : ARCH_INTRO_POINTS;

  return (
    <div className="archpg-page">
      <style>{`

        .archpg-page{
          --archpg-ink:#1b1a17;
          --archpg-black:#fbfaf7;
          --archpg-gray-50:#f4f1ea;
          --archpg-gray-100:rgba(27,26,23,0.04);
          --archpg-gray-200:#e6e1d6;
          --archpg-gray-500:#6b665c;
          --archpg-brass:#8a6a28;
          --archpg-brass-deep:#6f541d;
          --archpg-font:var(--font-sans);
          --archpg-max-w:1180px;

          min-height:100vh;
          width:100%;
          background:var(--archpg-black);
          color:var(--archpg-ink);
          font-family:var(--archpg-font);
        }
        .archpg-page *{ box-sizing:border-box; }
        .archpg-page a{ text-decoration:none; color:inherit; }
        .archpg-page button{ font-family:inherit; cursor:pointer; border:none; }

        .archpg-wrap{
          max-width:var(--archpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .archpg-wrap{ padding:0 40px; } }

        /* HERO */
        .archpg-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:var(--archpg-black);
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){ .archpg-hero-section{ padding:120px 0; } }
        .archpg-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(to bottom, rgba(10,10,10,0.72), rgba(10,10,10,0.60));
        }
        .archpg-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:var(--archpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .archpg-hero-inner-container{ padding:0 40px; } }
        .archpg-hero-heading{
          margin:0;
          text-align:center;
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .archpg-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .archpg-hero-heading{ font-size:56px; } }

        /* SHARED SECTION BITS */
        .archpg-section{ padding:72px 0; }
        @media (min-width:768px){ .archpg-section{ padding:96px 0; } }
        .archpg-eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--archpg-brass-deep);
        }
        .archpg-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--archpg-brass);
          border-radius:1px;
        }
        .archpg-section-heading{
          margin:16px 0 0;
          font-weight:600;
          font-size:30px;
          line-height:1.3;
          color:var(--archpg-ink);
        }
        @media (min-width:640px){ .archpg-section-heading{ font-size:38px; } }
        .archpg-section-intro{
          margin:14px 0 0;
          max-width:620px;
          font-size:15.5px;
          line-height:1.75;
          color:var(--archpg-gray-500);
        }

        /* INTRO */
        .archpg-intro-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:40px;
          align-items:center;
        }
        @media (min-width:960px){
          .archpg-intro-grid{ grid-template-columns:1.05fr 0.95fr; gap:64px; }
        }
        .archpg-intro-copy{
          margin:18px 0 0;
          font-size:15.5px;
          line-height:1.8;
          color:var(--archpg-gray-500);
        }
        .archpg-check-list{
          list-style:none;
          margin:26px 0 0;
          padding:0;
          display:grid;
          gap:14px;
        }
        .archpg-check-item{
          display:flex;
          align-items:flex-start;
          gap:12px;
          font-size:15px;
          font-weight:500;
          color:var(--archpg-ink);
        }
        .archpg-check-icon{
          flex-shrink:0;
          width:24px;
          height:24px;
          border-radius:50%;
          background:rgba(169,121,63,0.14);
          color:var(--archpg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:1px;
        }
        .archpg-intro-image-frame{
          border-radius:10px;
          overflow:hidden;
          aspect-ratio:4/4.4;
          background:var(--archpg-gray-100);
        }
        .archpg-intro-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        /* STATS */
        .archpg-stats-section{ padding:0 0 72px; }
        @media (min-width:768px){ .archpg-stats-section{ padding:0 0 96px; } }
        .archpg-stats-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          border:1px solid var(--archpg-gray-200);
          border-radius:10px;
          overflow:hidden;
          background:#FFFFFF;
        }
        @media (min-width:900px){
          .archpg-stats-grid{ grid-template-columns:repeat(4,1fr); }
        }
        .archpg-stat-item{
          padding:34px 20px;
          text-align:center;
          border-right:1px solid var(--archpg-gray-200);
          border-bottom:1px solid var(--archpg-gray-200);
        }
        .archpg-stat-item:nth-child(2n){ border-right:none; }
        .archpg-stat-item:nth-child(n+3){ border-bottom:none; }
        @media (min-width:900px){
          .archpg-stat-item,
          .archpg-stat-item:nth-child(2n){
            border-right:1px solid var(--archpg-gray-200);
            border-bottom:none;
          }
          .archpg-stat-item:last-child{ border-right:none; }
        }
        .archpg-stat-value{
          font-size:38px;
          font-weight:800;
          line-height:1;
          color:var(--archpg-brass-deep);
        }
        @media (min-width:640px){ .archpg-stat-value{ font-size:46px; } }
        .archpg-stat-label{
          margin-top:12px;
          font-size:13px;
          font-weight:600;
          letter-spacing:0.08em;
          text-transform:uppercase;
          color:var(--archpg-gray-500);
        }

        /* SERVICES */
        .archpg-services-section{ background:var(--archpg-gray-50); }
        .archpg-service-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:40px;
        }
        @media (min-width:700px){ .archpg-service-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1000px){ .archpg-service-grid{ grid-template-columns:repeat(3,1fr); } }
        .archpg-service-card{
          background:#ffffff;
          border:1px solid var(--archpg-gray-200);
          backdrop-filter:blur(16px);
          border-radius:8px;
          padding:30px 26px;
          transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .archpg-service-card:hover{
          border-color:rgba(169,121,63,0.55);
          box-shadow:0 14px 30px -18px rgba(0,0,0,0.25);
          transform:translateY(-3px);
        }
        .archpg-service-icon{
          width:52px;
          height:52px;
          border-radius:50%;
          background:rgba(197,160,89,0.12);
          color:var(--archpg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .archpg-service-title{
          margin:20px 0 0;
          font-size:18px;
          font-weight:700;
        }
        .archpg-service-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--archpg-gray-500);
        }

        /* PROCESS (dark band) */
        .archpg-process-section{ background:var(--archpg-black); color:var(--archpg-ink); }
        .archpg-process-section .archpg-section-heading{ color:var(--archpg-ink); }
        .archpg-process-section .archpg-eyebrow{ color:#8a6a28; }
        .archpg-process-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:18px;
          margin-top:40px;
        }
        @media (min-width:700px){ .archpg-process-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1100px){ .archpg-process-grid{ grid-template-columns:repeat(5,1fr); } }
        .archpg-process-step{
          border:1px solid var(--archpg-gray-200);
          border-radius:8px;
          padding:26px 22px;
          background:#ffffff;
        }
        .archpg-process-number{
          font-size:34px;
          font-weight:800;
          color:var(--archpg-brass);
          line-height:1;
        }
        .archpg-process-title{
          margin:16px 0 0;
          font-size:16.5px;
          font-weight:700;
          line-height:1.35;
        }
        .archpg-process-copy{
          margin:10px 0 0;
          font-size:14px;
          line-height:1.7;
          color:var(--archpg-gray-500);
        }

        /* VIDEO */
        .archpg-video-header{ text-align:center; }
        .archpg-video-header .archpg-eyebrow{ justify-content:center; }
        .archpg-video-header .archpg-section-intro{ margin-left:auto; margin-right:auto; }
        .archpg-video-frame{
          position:relative;
          width:100%;
          max-width:980px;
          margin:40px auto 0;
          aspect-ratio:16/9;
          background:#000000;
          border-radius:10px;
          overflow:hidden;
          box-shadow:0 30px 60px -30px rgba(0,0,0,0.45);
        }
        .archpg-video-iframe{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          border:0;
          display:block;
        }

        /* PROJECTS */
        .archpg-project-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:22px;
          margin-top:40px;
        }
        @media (min-width:700px){ .archpg-project-grid{ grid-template-columns:repeat(3,1fr); } }
        .archpg-project-card{
          position:relative;
          border-radius:8px;
          overflow:hidden;
          aspect-ratio:4/4.6;
          background:var(--archpg-gray-100);
        }
        .archpg-project-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition:transform .6s ease;
        }
        .archpg-project-card:hover .archpg-project-image{ transform:scale(1.07); }
        .archpg-project-shade{
          position:absolute;
          inset:0;
          background:linear-gradient(180deg, rgba(10,10,10,0) 45%, rgba(10,10,10,0.85) 100%);
        }
        .archpg-project-meta{
          position:absolute;
          left:22px;
          right:22px;
          bottom:20px;
          color:#ffffff;
        }
        .archpg-project-tag{
          font-size:11px;
          font-weight:700;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:#E1B27A;
        }
        .archpg-project-title{
          margin:8px 0 0;
          font-size:18px;
          font-weight:700;
          line-height:1.3;
        }

        /* FAQ */
        .archpg-faq-section{ background:var(--archpg-gray-50); }
        .archpg-faq-list{
          margin-top:36px;
          max-width:820px;
          display:grid;
          gap:12px;
        }
        .archpg-faq-item{
          background:#FFFFFF;
          border:1px solid var(--archpg-gray-200);
          border-radius:8px;
          overflow:hidden;
        }
        .archpg-faq-question{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          text-align:left;
          background:transparent;
          padding:20px 22px;
          font-size:15.5px;
          font-weight:600;
          color:var(--archpg-ink);
        }
        .archpg-faq-toggle-icon{ flex-shrink:0; color:var(--archpg-brass-deep); }
        .archpg-faq-answer{
          margin:0;
          padding:0 22px 22px;
          font-size:14.5px;
          line-height:1.75;
          color:var(--archpg-gray-500);
        }

        /* CTA */
        .archpg-cta-section{ padding:0 0 88px; background:var(--archpg-gray-50); }
        .archpg-cta-box{
          background:var(--archpg-black);
          border:1px solid var(--archpg-gray-200);
          border-radius:10px;
          padding:44px 28px;
          display:flex;
          flex-direction:column;
          gap:24px;
          align-items:flex-start;
        }
        @media (min-width:768px){
          .archpg-cta-box{
            flex-direction:row;
            align-items:center;
            justify-content:space-between;
            padding:52px 56px;
          }
        }
        .archpg-cta-heading{
          margin:0;
          color:var(--archpg-ink);
          font-size:26px;
          font-weight:700;
          line-height:1.3;
          max-width:560px;
        }
        @media (min-width:640px){ .archpg-cta-heading{ font-size:30px; } }
        .archpg-cta-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--archpg-gray-500);
        }
        .archpg-cta-link{
          display:flex;
          align-items:stretch;
          width:fit-content;
          flex-shrink:0;
        }
        .archpg-cta-link-label{
          display:flex;
          align-items:center;
          background:#1b1a17;
          color:#ffffff;
          padding:15px 26px;
          font-size:14.5px;
          font-weight:700;
          border-radius:6px 0 0 6px;
        }
        .archpg-cta-link-icon{
          display:flex;
          align-items:center;
          justify-content:center;
          width:52px;
          background:var(--archpg-brass);
          color:#FFFFFF;
          border-radius:0 6px 6px 0;
          transition:background-color .15s ease;
        }
        .archpg-cta-link:hover .archpg-cta-link-icon{ background:var(--archpg-brass-deep); }
        .archpg-faq-question:focus-visible,
        .archpg-cta-link:focus-visible{
          outline:2px solid var(--archpg-brass-deep);
          outline-offset:2px;
        }
      `}</style>

      {/* HERO BAND */}
      <section
        className="archpg-hero-section"
        style={{ backgroundImage: `url(${ARCH_HERO_BG_IMAGE})` }}
      >
        <div className="archpg-hero-dark-overlay" />
        <div className="archpg-hero-inner-container">
          <h1 className="archpg-hero-heading">
            Architecture Design & Build - Yashmeen Future Building & Fit-Out
            Company
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="archpg-section">
        <div className="archpg-wrap">
          <div className="archpg-intro-grid">
            <div>
              <div className="archpg-eyebrow">
                <span className="archpg-eyebrow-bar" />
                {liveSrv?.title || "Architecture"}
              </div>
              <h2 className="archpg-section-heading">
                {liveSrv?.shortDesc || "Spaces designed with purpose, built with precision."}
              </h2>
              <p className="archpg-intro-copy">
                From a first sketch to the final handover, our architectural
                team shapes villas, offices and commercial spaces that balance
                design, function and budget. Because design and construction
                sit under one roof, what is drawn is exactly what gets built.
              </p>
              <ul className="archpg-check-list">
                {livePoints.map((point) => (
                  <li key={point} className="archpg-check-item">
                    <span className="archpg-check-icon">
                      <FiCheck size={14} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="archpg-intro-image-frame">
              <img
                className="archpg-intro-image"
                src={ARCH_INTRO_IMAGE}
                alt="Architect reviewing project drawings"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="archpg-stats-section">
        <div className="archpg-wrap">
          <div className="archpg-stats-grid">
            {ARCH_STATS.map((stat) => (
              <div key={stat.label} className="archpg-stat-item">
                <div className="archpg-stat-value">{stat.value}</div>
                <div className="archpg-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="archpg-section archpg-services-section">
        <div className="archpg-wrap">
          <div className="archpg-eyebrow">
            <span className="archpg-eyebrow-bar" />
            What We Deliver
          </div>
          <h2 className="archpg-section-heading">
            Complete architectural services
          </h2>
          <p className="archpg-section-intro">
            Every stage of your project is covered by one coordinated team, so
            nothing gets lost between design, approvals and construction.
          </p>
          <div className="archpg-service-grid">
            {ARCH_SERVICES.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="archpg-service-card">
                <div className="archpg-service-icon">
                  <Icon size={22} />
                </div>
                <h3 className="archpg-service-title">{title}</h3>
                <p className="archpg-service-copy">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="archpg-section archpg-process-section">
        <div className="archpg-wrap">
          <div className="archpg-eyebrow">
            <span className="archpg-eyebrow-bar" />
            Our Process
          </div>
          <h2 className="archpg-section-heading">
            A clear path from idea to handover
          </h2>
          <div className="archpg-process-grid">
            {ARCH_PROCESS.map((step, i) => (
              <div key={step.title} className="archpg-process-step">
                <div className="archpg-process-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="archpg-process-title">{step.title}</h3>
                <p className="archpg-process-copy">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="archpg-section">
        <div className="archpg-wrap">
          <div className="archpg-video-header">
            <div className="archpg-eyebrow">
              <span className="archpg-eyebrow-bar" />
              Watch
            </div>
            <h2 className="archpg-section-heading">
              See our work come to life
            </h2>
            <p className="archpg-section-intro">
              A closer look at how we design and deliver spaces from concept to
              completion.
            </p>
          </div>
          <div className="archpg-video-frame">
            <iframe
              className="archpg-video-iframe"
              src={ARCH_VIDEO_URL}
              title="Architecture project film"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="archpg-section">
        <div className="archpg-wrap">
          <div className="archpg-eyebrow">
            <span className="archpg-eyebrow-bar" />
            Selected Work
          </div>
          <h2 className="archpg-section-heading">Featured projects</h2>
          <div className="archpg-project-grid">
            {ARCH_PROJECTS.map((project) => (
              <div key={project.title} className="archpg-project-card">
                <img
                  className="archpg-project-image"
                  src={project.img}
                  alt={project.title}
                  loading="lazy"
                />
                <div className="archpg-project-shade" />
                <div className="archpg-project-meta">
                  <div className="archpg-project-tag">{project.tag}</div>
                  <h3 className="archpg-project-title">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="archpg-section archpg-faq-section">
        <div className="archpg-wrap">
          <div className="archpg-eyebrow">
            <span className="archpg-eyebrow-bar" />
            FAQ
          </div>
          <h2 className="archpg-section-heading">Frequently asked questions</h2>
          <div className="archpg-faq-list">
            {ARCH_FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q} className="archpg-faq-item">
                  <button
                    type="button"
                    className="archpg-faq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    {item.q}
                    <span className="archpg-faq-toggle-icon">
                      {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                    </span>
                  </button>
                  {isOpen && <p className="archpg-faq-answer">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="archpg-cta-section">
        <div className="archpg-wrap">
          <div className="archpg-cta-box">
            <div>
              <h2 className="archpg-cta-heading">
                Planning a villa or commercial project?
              </h2>
              <p className="archpg-cta-copy">
                Tell us about your space and we will arrange a consultation.
              </p>
            </div>
            <Link to="/contact" className="archpg-cta-link">
              <span className="archpg-cta-link-label">Get in Touch</span>
              <span className="archpg-cta-link-icon">
                <FiArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
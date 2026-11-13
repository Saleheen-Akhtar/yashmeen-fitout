import { useState } from "react";
import { Link } from "react-router-dom";
import useWebsiteContent from "../../../hooks/useWebsiteContent";
import {
  FiCheck,
  FiArrowRight,
  FiPlus,
  FiMinus,
  FiHome,
  FiBriefcase,
  FiLayers,
  FiZap,
  FiTool,
  FiMaximize,
  FiShield,
  FiClipboard,
  FiClock,
} from "react-icons/fi";

// Hero & Intro: local studio assets
const CONS_HERO_BG_IMAGE = "/static/production-facility.jpg";
const CONS_INTRO_IMAGE = "/static/joinery-bay.jpg";

const CONS_VIDEO_URL = "https://www.youtube-nocookie.com/embed/C0JYhtQcsGk";

// Placeholder numbers - replace with your real figures
const CONS_STATS = [
  { value: "150+", label: "Projects Built" },
  { value: "10+", label: "Years of Experience" },
  { value: "50+", label: "Engineers & Site Staff" },
  { value: "100%", label: "On-Site Supervision" },
];

const CONS_INTRO_POINTS = [
  "Experienced engineers and site supervisors on every project",
  "Transparent budgets, schedules and progress reporting",
  "Compliance with local authority regulations and standards",
  "Construction, fit-out and joinery handled by one team",
];

const CONS_SERVICES = [
  {
    icon: FiHome,
    title: "Villa Construction",
    copy: "Ground-up villa builds from foundation to finishing, delivered to your design and specification.",
  },
  {
    icon: FiBriefcase,
    title: "Commercial Buildings",
    copy: "Offices, showrooms and mixed-use spaces built to suit your business and operations.",
  },
  {
    icon: FiLayers,
    title: "Structural Works",
    copy: "Foundations, concrete frames, blockwork and structural modifications carried out to engineering standards.",
  },
  {
    icon: FiZap,
    title: "MEP Installation",
    copy: "Mechanical, electrical and plumbing works coordinated with the main construction programme.",
  },
  {
    icon: FiMaximize,
    title: "Extensions & Additions",
    copy: "Added floors, annexes and layout changes to existing properties with minimal disruption.",
  },
  {
    icon: FiTool,
    title: "Renovation & Refurbishment",
    copy: "Upgrading ageing buildings with new structure, services and finishes.",
  },
];

const CONS_PROJECT_TYPES = [
  "Private Villas",
  "Office Buildings",
  "Retail & Showrooms",
  "Restaurants & Cafés",
  "Warehouses & Workshops",
  "Residential Buildings",
];

const CONS_COMMITMENTS = [
  {
    icon: FiShield,
    title: "Safety First",
    copy: "Strict site safety procedures protect our workers, your property and everyone nearby.",
  },
  {
    icon: FiClipboard,
    title: "Quality Control",
    copy: "Inspections at every stage ensure materials and workmanship meet the approved specification.",
  },
  {
    icon: FiClock,
    title: "On-Time Delivery",
    copy: "Realistic programmes with regular progress reviews keep your project on schedule.",
  },
];

const CONS_PROCESS = [
  {
    title: "Consultation & Survey",
    copy: "We review your plans, visit the site and agree the scope, budget and timeline.",
  },
  {
    title: "Planning & Approvals",
    copy: "Drawings, permits and authority approvals are prepared before work begins.",
  },
  {
    title: "Mobilisation",
    copy: "Site setup, procurement and team allocation are completed against the programme.",
  },
  {
    title: "Construction",
    copy: "Structure, services and finishes are built with regular inspections and reports.",
  },
  {
    title: "Completion & Handover",
    copy: "Final checks, snagging and handover documentation close out the project.",
  },
];

const CONS_PROJECTS = [
  {
    title: "Private Villa - New Build",
    tag: "Residential",
    img: "/static/work-stanley.jpg",
  },
  {
    title: "Office Building Construction",
    tag: "Commercial",
    img: "/static/work-oh-office.jpg",
  },
  {
    title: "Villa Extension & Renovation",
    tag: "Renovation",
    img: "/static/raw-space.jpg",
  },
];

const CONS_FAQS = [
  {
    q: "What types of construction projects do you handle?",
    a: "We build villas, residential buildings, offices, retail units, restaurants and workshops, and also handle extensions and renovations.",
  },
  {
    q: "Do you manage permits and authority approvals?",
    a: "Yes. We prepare the required documents and follow up with the relevant authorities so work can start on a compliant basis.",
  },
  {
    q: "Can you take care of both construction and interior fit-out?",
    a: "Yes. Construction, MEP, finishing and joinery are coordinated by one team, which keeps the programme and quality under control.",
  },
  {
    q: "How is the project cost determined?",
    a: "After reviewing your drawings and requirements we prepare a detailed quotation covering the scope, materials and timeline.",
  },
  {
    q: "How can I follow progress during construction?",
    a: "We share regular progress updates and site reports so you always know where the project stands.",
  },
];

export default function Construction() {
  const [openFaq, setOpenFaq] = useState(0);
  const { content } = useWebsiteContent();
  const liveSrv = (content?.services || []).find((s) => s.slug === "construction");
  const livePoints = liveSrv?.highlights?.length ? liveSrv.highlights : CONS_INTRO_POINTS;

  return (
    <div className="conspg-page">
      <style>{`

        .conspg-page{
          --conspg-ink:#1b1a17;
          --conspg-black:#fbfaf7;
          --conspg-gray-50:#f4f1ea;
          --conspg-gray-100:rgba(27,26,23,0.04);
          --conspg-gray-200:#e6e1d6;
          --conspg-gray-500:#6b665c;
          --conspg-brass:#8a6a28;
          --conspg-brass-deep:#6f541d;
          --conspg-font:var(--font-sans);
          --conspg-max-w:1180px;

          min-height:100vh;
          width:100%;
          background:var(--conspg-black);
          color:var(--conspg-ink);
          font-family:var(--conspg-font);
        }
        .conspg-page *{ box-sizing:border-box; }
        .conspg-page a{ text-decoration:none; color:inherit; }
        .conspg-page button{ font-family:inherit; cursor:pointer; border:none; }

        .conspg-wrap{
          max-width:var(--conspg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .conspg-wrap{ padding:0 40px; } }

        /* HERO */
        .conspg-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:var(--conspg-black);
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){ .conspg-hero-section{ padding:120px 0; } }
        .conspg-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(to bottom, rgba(10,10,10,0.72), rgba(10,10,10,0.60));
        }
        .conspg-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:var(--conspg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .conspg-hero-inner-container{ padding:0 40px; } }
        .conspg-hero-heading{
          margin:0;
          text-align:center;
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .conspg-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .conspg-hero-heading{ font-size:56px; } }

        /* SHARED SECTION BITS */
        .conspg-section{ padding:72px 0; }
        @media (min-width:768px){ .conspg-section{ padding:96px 0; } }
        .conspg-eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--conspg-brass-deep);
        }
        .conspg-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--conspg-brass);
          border-radius:1px;
        }
        .conspg-section-heading{
          margin:16px 0 0;
          font-weight:600;
          font-size:30px;
          line-height:1.3;
          color:var(--conspg-ink);
        }
        @media (min-width:640px){ .conspg-section-heading{ font-size:38px; } }
        .conspg-section-intro{
          margin:14px 0 0;
          max-width:620px;
          font-size:15.5px;
          line-height:1.75;
          color:var(--conspg-gray-500);
        }

        /* INTRO */
        .conspg-intro-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:40px;
          align-items:center;
        }
        @media (min-width:960px){
          .conspg-intro-grid{ grid-template-columns:1.05fr 0.95fr; gap:64px; }
        }
        .conspg-intro-copy{
          margin:18px 0 0;
          font-size:15.5px;
          line-height:1.8;
          color:var(--conspg-gray-500);
        }
        .conspg-check-list{
          list-style:none;
          margin:26px 0 0;
          padding:0;
          display:grid;
          gap:14px;
        }
        .conspg-check-item{
          display:flex;
          align-items:flex-start;
          gap:12px;
          font-size:15px;
          font-weight:500;
          color:var(--conspg-ink);
        }
        .conspg-check-icon{
          flex-shrink:0;
          width:24px;
          height:24px;
          border-radius:50%;
          background:rgba(169,121,63,0.14);
          color:var(--conspg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:1px;
        }
        .conspg-intro-image-frame{
          border-radius:10px;
          overflow:hidden;
          aspect-ratio:4/4.4;
          background:var(--conspg-gray-100);
        }
        .conspg-intro-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        /* STATS */
        .conspg-stats-section{ padding:0 0 72px; }
        @media (min-width:768px){ .conspg-stats-section{ padding:0 0 96px; } }
        .conspg-stats-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          border:1px solid var(--conspg-gray-200);
          border-radius:10px;
          overflow:hidden;
          background:#FFFFFF;
        }
        @media (min-width:900px){
          .conspg-stats-grid{ grid-template-columns:repeat(4,1fr); }
        }
        .conspg-stat-item{
          padding:34px 20px;
          text-align:center;
          border-right:1px solid var(--conspg-gray-200);
          border-bottom:1px solid var(--conspg-gray-200);
        }
        .conspg-stat-item:nth-child(2n){ border-right:none; }
        .conspg-stat-item:nth-child(n+3){ border-bottom:none; }
        @media (min-width:900px){
          .conspg-stat-item,
          .conspg-stat-item:nth-child(2n){
            border-right:1px solid var(--conspg-gray-200);
            border-bottom:none;
          }
          .conspg-stat-item:last-child{ border-right:none; }
        }
        .conspg-stat-value{
          font-size:38px;
          font-weight:800;
          line-height:1;
          color:var(--conspg-brass-deep);
        }
        @media (min-width:640px){ .conspg-stat-value{ font-size:46px; } }
        .conspg-stat-label{
          margin-top:12px;
          font-size:13px;
          font-weight:600;
          letter-spacing:0.08em;
          text-transform:uppercase;
          color:var(--conspg-gray-500);
        }

        /* SERVICES */
        .conspg-services-section{ background:var(--conspg-gray-50); }
        .conspg-service-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:40px;
        }
        @media (min-width:700px){ .conspg-service-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1000px){ .conspg-service-grid{ grid-template-columns:repeat(3,1fr); } }
        .conspg-service-card{
          background:#ffffff;
          border:1px solid var(--conspg-gray-200);
          backdrop-filter:blur(16px);
          border-radius:8px;
          padding:30px 26px;
          transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .conspg-service-card:hover{
          border-color:rgba(169,121,63,0.55);
          box-shadow:0 14px 30px -18px rgba(0,0,0,0.25);
          transform:translateY(-3px);
        }
        .conspg-service-icon{
          width:52px;
          height:52px;
          border-radius:50%;
          background:rgba(197,160,89,0.12);
          color:var(--conspg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .conspg-service-title{
          margin:20px 0 0;
          font-size:18px;
          font-weight:700;
        }
        .conspg-service-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--conspg-gray-500);
        }

        /* PROJECT TYPES */
        .conspg-types-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:14px;
          margin-top:36px;
        }
        @media (min-width:700px){ .conspg-types-grid{ grid-template-columns:repeat(3,1fr); } }
        .conspg-type-chip{
          display:flex;
          align-items:center;
          gap:12px;
          padding:18px 20px;
          border:1px solid var(--conspg-gray-200);
          border-left:4px solid var(--conspg-brass);
          border-radius:6px;
          font-size:15px;
          font-weight:600;
          background:#FFFFFF;
        }

        /* COMMITMENTS (dark band) */
        .conspg-commit-section{ background:var(--conspg-black); color:var(--conspg-ink); }
        .conspg-commit-section .conspg-section-heading{ color:var(--conspg-ink); }
        .conspg-commit-section .conspg-eyebrow{ color:#8a6a28; }
        .conspg-commit-section .conspg-section-intro{ color:var(--conspg-gray-500); }
        .conspg-commit-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:40px;
        }
        @media (min-width:800px){ .conspg-commit-grid{ grid-template-columns:repeat(3,1fr); } }
        .conspg-commit-card{
          border:1px solid var(--conspg-gray-200);
          border-radius:8px;
          padding:30px 26px;
          background:#ffffff;
        }
        .conspg-commit-icon{
          width:52px;
          height:52px;
          border-radius:50%;
          background:rgba(169,121,63,0.16);
          color:var(--conspg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .conspg-commit-title{
          margin:20px 0 0;
          font-size:18px;
          font-weight:700;
        }
        .conspg-commit-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--conspg-gray-500);
        }

        /* PROCESS */
        .conspg-process-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:18px;
          margin-top:40px;
        }
        @media (min-width:700px){ .conspg-process-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1100px){ .conspg-process-grid{ grid-template-columns:repeat(5,1fr); } }
        .conspg-process-step{
          border:1px solid var(--conspg-gray-200);
          border-radius:8px;
          padding:26px 22px;
          background:var(--conspg-gray-50);
        }
        .conspg-process-number{
          font-size:34px;
          font-weight:800;
          color:var(--conspg-brass);
          line-height:1;
        }
        .conspg-process-title{
          margin:16px 0 0;
          font-size:16.5px;
          font-weight:700;
          line-height:1.35;
        }
        .conspg-process-copy{
          margin:10px 0 0;
          font-size:14px;
          line-height:1.7;
          color:var(--conspg-gray-500);
        }

        /* VIDEO */
        .conspg-video-section{ background:var(--conspg-gray-50); }
        .conspg-video-header{ text-align:center; }
        .conspg-video-header .conspg-eyebrow{ justify-content:center; }
        .conspg-video-header .conspg-section-intro{ margin-left:auto; margin-right:auto; }
        .conspg-video-frame{
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
        .conspg-video-iframe{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          border:0;
          display:block;
        }

        /* PROJECTS */
        .conspg-project-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:22px;
          margin-top:40px;
        }
        @media (min-width:700px){ .conspg-project-grid{ grid-template-columns:repeat(3,1fr); } }
        .conspg-project-card{
          position:relative;
          border-radius:8px;
          overflow:hidden;
          aspect-ratio:4/4.6;
          background:var(--conspg-gray-100);
        }
        .conspg-project-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition:transform .6s ease;
        }
        .conspg-project-card:hover .conspg-project-image{ transform:scale(1.07); }
        .conspg-project-shade{
          position:absolute;
          inset:0;
          background:linear-gradient(180deg, rgba(10,10,10,0) 45%, rgba(10,10,10,0.85) 100%);
        }
        .conspg-project-meta{
          position:absolute;
          left:22px;
          right:22px;
          bottom:20px;
          color:#ffffff;
        }
        .conspg-project-tag{
          font-size:11px;
          font-weight:700;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:#E1B27A;
        }
        .conspg-project-title{
          margin:8px 0 0;
          font-size:18px;
          font-weight:700;
          line-height:1.3;
        }

        /* FAQ */
        .conspg-faq-section{ background:var(--conspg-gray-50); }
        .conspg-faq-list{
          margin-top:36px;
          max-width:820px;
          display:grid;
          gap:12px;
        }
        .conspg-faq-item{
          background:#FFFFFF;
          border:1px solid var(--conspg-gray-200);
          border-radius:8px;
          overflow:hidden;
        }
        .conspg-faq-question{
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
          color:var(--conspg-ink);
        }
        .conspg-faq-toggle-icon{ flex-shrink:0; color:var(--conspg-brass-deep); }
        .conspg-faq-answer{
          margin:0;
          padding:0 22px 22px;
          font-size:14.5px;
          line-height:1.75;
          color:var(--conspg-gray-500);
        }

        /* CTA */
        .conspg-cta-section{ padding:0 0 88px; background:var(--conspg-gray-50); }
        .conspg-cta-box{
          background:var(--conspg-black);
          border:1px solid var(--conspg-gray-200);
          border-radius:10px;
          padding:44px 28px;
          display:flex;
          flex-direction:column;
          gap:24px;
          align-items:flex-start;
        }
        @media (min-width:768px){
          .conspg-cta-box{
            flex-direction:row;
            align-items:center;
            justify-content:space-between;
            padding:52px 56px;
          }
        }
        .conspg-cta-heading{
          margin:0;
          color:var(--conspg-ink);
          font-size:26px;
          font-weight:700;
          line-height:1.3;
          max-width:560px;
        }
        @media (min-width:640px){ .conspg-cta-heading{ font-size:30px; } }
        .conspg-cta-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--conspg-gray-500);
        }
        .conspg-cta-link{
          display:flex;
          align-items:stretch;
          width:fit-content;
          flex-shrink:0;
        }
        .conspg-cta-link-label{
          display:flex;
          align-items:center;
          background:#1b1a17;
          color:#ffffff;
          padding:15px 26px;
          font-size:14.5px;
          font-weight:700;
          border-radius:6px 0 0 6px;
        }
        .conspg-cta-link-icon{
          display:flex;
          align-items:center;
          justify-content:center;
          width:52px;
          background:var(--conspg-brass);
          color:#FFFFFF;
          border-radius:0 6px 6px 0;
          transition:background-color .15s ease;
        }
        .conspg-cta-link:hover .conspg-cta-link-icon{ background:var(--conspg-brass-deep); }
        .conspg-faq-question:focus-visible,
        .conspg-cta-link:focus-visible{
          outline:2px solid var(--conspg-brass-deep);
          outline-offset:2px;
        }
      `}</style>

      {/* HERO BAND */}
      <section
        className="conspg-hero-section"
        style={{ backgroundImage: `url(${CONS_HERO_BG_IMAGE})` }}
      >
        <div className="conspg-hero-dark-overlay" />
        <div className="conspg-hero-inner-container">
          <h1 className="conspg-hero-heading">
            Construction - Yashmeen Future Building & Fit-Out Company
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="conspg-section">
        <div className="conspg-wrap">
          <div className="conspg-intro-grid">
            <div>
              <div className="conspg-eyebrow">
                <span className="conspg-eyebrow-bar" />
                {liveSrv?.title || "Construction"}
              </div>
              <h2 className="conspg-section-heading">
                {liveSrv?.shortDesc || "Built to last, delivered on schedule."}
              </h2>
              <p className="conspg-intro-copy">
                From groundwork to the final handover, our construction team
                builds villas, commercial buildings and renovations with
                careful planning, skilled site supervision and a firm focus on
                quality and safety. With construction and fit-out under one
                roof, your project stays coordinated at every stage.
              </p>
              <ul className="conspg-check-list">
                {livePoints.map((point) => (
                  <li key={point} className="conspg-check-item">
                    <span className="conspg-check-icon">
                      <FiCheck size={14} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="conspg-intro-image-frame">
              <img
                className="conspg-intro-image"
                src={CONS_INTRO_IMAGE}
                alt="Construction team on site"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="conspg-stats-section">
        <div className="conspg-wrap">
          <div className="conspg-stats-grid">
            {CONS_STATS.map((stat) => (
              <div key={stat.label} className="conspg-stat-item">
                <div className="conspg-stat-value">{stat.value}</div>
                <div className="conspg-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="conspg-section conspg-services-section">
        <div className="conspg-wrap">
          <div className="conspg-eyebrow">
            <span className="conspg-eyebrow-bar" />
            What We Build
          </div>
          <h2 className="conspg-section-heading">Construction services</h2>
          <p className="conspg-section-intro">
            A complete range of building services handled by one coordinated
            team.
          </p>
          <div className="conspg-service-grid">
            {CONS_SERVICES.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="conspg-service-card">
                <div className="conspg-service-icon">
                  <Icon size={22} />
                </div>
                <h3 className="conspg-service-title">{title}</h3>
                <p className="conspg-service-copy">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT TYPES */}
      <section className="conspg-section">
        <div className="conspg-wrap">
          <div className="conspg-eyebrow">
            <span className="conspg-eyebrow-bar" />
            Sectors
          </div>
          <h2 className="conspg-section-heading">Projects we deliver</h2>
          <div className="conspg-types-grid">
            {CONS_PROJECT_TYPES.map((type) => (
              <div key={type} className="conspg-type-chip">
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMITMENTS */}
      <section className="conspg-section conspg-commit-section">
        <div className="conspg-wrap">
          <div className="conspg-eyebrow">
            <span className="conspg-eyebrow-bar" />
            Our Commitment
          </div>
          <h2 className="conspg-section-heading">
            Quality, safety and reliability
          </h2>
          <p className="conspg-section-intro">
            The standards we hold ourselves to on every site, large or small.
          </p>
          <div className="conspg-commit-grid">
            {CONS_COMMITMENTS.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="conspg-commit-card">
                <div className="conspg-commit-icon">
                  <Icon size={22} />
                </div>
                <h3 className="conspg-commit-title">{title}</h3>
                <p className="conspg-commit-copy">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="conspg-section">
        <div className="conspg-wrap">
          <div className="conspg-eyebrow">
            <span className="conspg-eyebrow-bar" />
            Our Process
          </div>
          <h2 className="conspg-section-heading">
            From first meeting to handover
          </h2>
          <div className="conspg-process-grid">
            {CONS_PROCESS.map((step, i) => (
              <div key={step.title} className="conspg-process-step">
                <div className="conspg-process-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="conspg-process-title">{step.title}</h3>
                <p className="conspg-process-copy">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="conspg-section conspg-video-section">
        <div className="conspg-wrap">
          <div className="conspg-video-header">
            <div className="conspg-eyebrow">
              <span className="conspg-eyebrow-bar" />
              Watch
            </div>
            <h2 className="conspg-section-heading">See our sites in action</h2>
            <p className="conspg-section-intro">
              A look at how our team builds, from groundwork to completion.
            </p>
          </div>
          <div className="conspg-video-frame">
            <iframe
              className="conspg-video-iframe"
              src={CONS_VIDEO_URL}
              title="Construction project film"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="conspg-section">
        <div className="conspg-wrap">
          <div className="conspg-eyebrow">
            <span className="conspg-eyebrow-bar" />
            Selected Work
          </div>
          <h2 className="conspg-section-heading">Featured projects</h2>
          <div className="conspg-project-grid">
            {CONS_PROJECTS.map((project) => (
              <div key={project.title} className="conspg-project-card">
                <img
                  className="conspg-project-image"
                  src={project.img}
                  alt={project.title}
                  loading="lazy"
                />
                <div className="conspg-project-shade" />
                <div className="conspg-project-meta">
                  <div className="conspg-project-tag">{project.tag}</div>
                  <h3 className="conspg-project-title">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="conspg-section conspg-faq-section">
        <div className="conspg-wrap">
          <div className="conspg-eyebrow">
            <span className="conspg-eyebrow-bar" />
            FAQ
          </div>
          <h2 className="conspg-section-heading">Frequently asked questions</h2>
          <div className="conspg-faq-list">
            {CONS_FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q} className="conspg-faq-item">
                  <button
                    type="button"
                    className="conspg-faq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    {item.q}
                    <span className="conspg-faq-toggle-icon">
                      {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                    </span>
                  </button>
                  {isOpen && <p className="conspg-faq-answer">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="conspg-cta-section">
        <div className="conspg-wrap">
          <div className="conspg-cta-box">
            <div>
              <h2 className="conspg-cta-heading">
                Planning to build or renovate?
              </h2>
              <p className="conspg-cta-copy">
                Share your plans with us and we will arrange a site visit and
                quotation.
              </p>
            </div>
            <Link to="/contact" className="conspg-cta-link">
              <span className="conspg-cta-link-label">Get in Touch</span>
              <span className="conspg-cta-link-icon">
                <FiArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
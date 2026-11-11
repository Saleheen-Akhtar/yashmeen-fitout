import { useState } from "react";
import { Link } from "react-router-dom";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import {
  FiCheck,
  FiArrowRight,
  FiPlus,
  FiMinus,
  FiPhone,
  FiLayout,
  FiSun,
  FiVolume2,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";

// Hero: modern renovated office interior
const OFFREN_HERO_BG_IMAGE = "/static/Office-fit-out.jpg";

const OFFREN_VIDEO_URL = "https://www.youtube-nocookie.com/embed/i7efTJ5hcnM";

// Placeholder numbers - replace with your real figures
const OFFREN_STATS = [
  { value: "100+", label: "Offices Renovated" },
  { value: "10+", label: "Years of Experience" },
  { value: "50+", label: "Skilled Professionals" },
  { value: "100%", label: "In-House Joinery" },
];

const OFFREN_SIGNS = [
  {
    icon: FiUsers,
    title: "The layout no longer fits your team",
    copy: "Headcount has changed, but desks, rooms and walkways are still arranged for the old team.",
  },
  {
    icon: FiSun,
    title: "Lighting is dim, uneven or outdated",
    copy: "Old fittings raise energy bills and make screen work harder on the eyes.",
  },
  {
    icon: FiVolume2,
    title: "There is nowhere quiet to focus or talk",
    copy: "Open areas lack privacy for calls, meetings and concentrated work.",
  },
  {
    icon: FiAlertCircle,
    title: "Finishes and furniture look worn",
    copy: "Stained ceilings, tired flooring and damaged joinery weaken your image.",
  },
  {
    icon: FiLayout,
    title: "Reception does not reflect your brand",
    copy: "The first space a client sees should say something about how you work.",
  },
];

const OFFREN_PACKAGES = [
  {
    name: "Light Refresh",
    tagline: "A quick lift with little disruption",
    featured: false,
    items: [
      "Repainting and wall finishes",
      "Flooring repairs or replacement",
      "Lighting upgrades",
      "Furniture re-arrangement and soft furnishings",
    ],
  },
  {
    name: "Partial Renovation",
    tagline: "Rework the areas that matter most",
    featured: true,
    items: [
      "New partitions and ceilings",
      "Reception or meeting room makeover",
      "Electrical and data re-work",
      "Custom joinery and storage",
    ],
  },
  {
    name: "Full Transformation",
    tagline: "A complete rebuild of the workspace",
    featured: false,
    items: [
      "Strip-out and a brand-new layout",
      "HVAC, fire-safety and MEP modifications",
      "New floors, ceilings and lighting",
      "Fully branded interior with bespoke joinery",
    ],
  },
];

const OFFREN_TRENDS = [
  {
    title: "Collaborative zones",
    copy: "Flexible meeting nooks and shared tables that support hybrid teamwork.",
  },
  {
    title: "Acoustic comfort",
    copy: "Sound-absorbing ceilings, panels and glass partitions to control noise.",
  },
  {
    title: "Biophilic touches",
    copy: "Natural materials, daylight and greenery that make the office feel healthier.",
  },
  {
    title: "Branded environments",
    copy: "Colours, signage and joinery details that carry your identity through the space.",
  },
];

const OFFREN_BEFORE_AFTER = [
  {
    title: "Open-Plan Workspace",
    before: "/static/raw-space.jpg",
    after: "/static/work-oh-office.jpg",
  },
  {
    title: "Reception Area",
    before: "/static/atelier-render.jpg",
    after: "/static/studio.jpg",
  },
];

const OFFREN_COST_FACTORS = [
  {
    title: "Size of the office",
    copy: "The total area and number of rooms being renovated.",
  },
  {
    title: "Scope of works",
    copy: "Cosmetic updates cost far less than layout changes and strip-out.",
  },
  {
    title: "MEP changes",
    copy: "Moving AC, power, data or fire-safety systems adds work.",
  },
  {
    title: "Materials and finishes",
    copy: "Flooring, ceilings, glazing and lighting grades vary widely.",
  },
  {
    title: "Custom joinery",
    copy: "Bespoke reception desks, storage and meeting tables are priced to design.",
  },
  {
    title: "Programme and working hours",
    copy: "Night or weekend works to avoid disruption can affect the schedule and cost.",
  },
];

const OFFREN_FAQS = [
  {
    q: "Do I need landlord or building management approval?",
    a: "In most buildings, yes. We prepare the drawings and documents and coordinate with building management and the relevant authorities for you.",
  },
  {
    q: "What is the difference between a renovation and a fit-out?",
    a: "A fit-out finishes an empty shell, while a renovation upgrades an existing office, often while keeping parts of it, so planning around what is already there matters.",
  },
  {
    q: "Can the work be done outside our working hours?",
    a: "Yes. Noisy or disruptive tasks can be scheduled after hours or in phases so your team can keep working.",
  },
  {
    q: "Can you reuse our existing furniture?",
    a: "Where it suits the new design we can keep, refurbish or relocate existing pieces, and add new custom items from our joinery workshop.",
  },
  {
    q: "How is the cost estimated?",
    a: "We visit the site, review your requirements and prepare a detailed quotation. The factors above explain what influences the final figure.",
  },
];

export default function OfficeRenovation() {
  const [openFaq, setOpenFaq] = useState(0);
  const { content } = useWebsiteContent();
  const liveSrv = (content?.services || []).find((s) => s.slug === "office-renovation");

  return (
    <div className="offrenpg-page">
      <style>{`

        .offrenpg-page{
          --offrenpg-ink:#1b1a17;
          --offrenpg-black:#fbfaf7;
          --offrenpg-gray-50:#f4f1ea;
          --offrenpg-gray-100:rgba(27,26,23,0.04);
          --offrenpg-gray-200:#e6e1d6;
          --offrenpg-gray-500:#6b665c;
          --offrenpg-brass:#8a6a28;
          --offrenpg-brass-deep:#6f541d;
          --offrenpg-font:var(--font-sans);
          --offrenpg-max-w:1180px;

          min-height:100vh;
          width:100%;
          background:var(--offrenpg-black);
          color:var(--offrenpg-ink);
          font-family:var(--offrenpg-font);
        }
        .offrenpg-page *{ box-sizing:border-box; }
        .offrenpg-page a{ text-decoration:none; color:inherit; }
        .offrenpg-page button{ font-family:inherit; cursor:pointer; border:none; }

        .offrenpg-wrap{
          max-width:var(--offrenpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .offrenpg-wrap{ padding:0 40px; } }

        /* HERO */
        .offrenpg-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:var(--offrenpg-black);
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){ .offrenpg-hero-section{ padding:120px 0; } }
        .offrenpg-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(to bottom, rgba(10,10,10,0.72), rgba(10,10,10,0.60));
        }
        .offrenpg-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:var(--offrenpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .offrenpg-hero-inner-container{ padding:0 40px; } }
        .offrenpg-hero-heading{
          margin:0;
          text-align:center;
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .offrenpg-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .offrenpg-hero-heading{ font-size:56px; } }

        /* SHARED SECTION BITS */
        .offrenpg-section{ padding:72px 0; }
        @media (min-width:768px){ .offrenpg-section{ padding:96px 0; } }
        .offrenpg-eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--offrenpg-brass-deep);
        }
        .offrenpg-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--offrenpg-brass);
          border-radius:1px;
        }
        .offrenpg-section-heading{
          margin:16px 0 0;
          font-weight:600;
          font-size:30px;
          line-height:1.3;
          color:var(--offrenpg-ink);
        }
        @media (min-width:640px){ .offrenpg-section-heading{ font-size:38px; } }
        .offrenpg-section-intro{
          margin:14px 0 0;
          max-width:620px;
          font-size:15.5px;
          line-height:1.75;
          color:var(--offrenpg-gray-500);
        }

        /* SIGNS (intro) */
        .offrenpg-signs-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:40px;
          align-items:start;
        }
        @media (min-width:960px){
          .offrenpg-signs-grid{ grid-template-columns:0.9fr 1.1fr; gap:64px; }
        }
        .offrenpg-signs-copy{
          margin:18px 0 0;
          font-size:15.5px;
          line-height:1.8;
          color:var(--offrenpg-gray-500);
        }
        .offrenpg-sign-list{
          display:grid;
          gap:14px;
        }
        .offrenpg-sign-row{
          display:flex;
          gap:18px;
          align-items:flex-start;
          padding:22px 22px;
          border:1px solid var(--offrenpg-gray-200);
          border-radius:8px;
          background:#FFFFFF;
        }
        .offrenpg-sign-icon{
          flex-shrink:0;
          width:46px;
          height:46px;
          border-radius:50%;
          background:var(--offrenpg-gray-100);
          color:var(--offrenpg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .offrenpg-sign-title{
          margin:0;
          font-size:16px;
          font-weight:700;
          line-height:1.4;
        }
        .offrenpg-sign-copy{
          margin:6px 0 0;
          font-size:14px;
          line-height:1.65;
          color:var(--offrenpg-gray-500);
        }

        /* STATS */
        .offrenpg-stats-section{ padding:0 0 72px; }
        @media (min-width:768px){ .offrenpg-stats-section{ padding:0 0 96px; } }
        .offrenpg-stats-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          border:1px solid var(--offrenpg-gray-200);
          border-radius:10px;
          overflow:hidden;
          background:#FFFFFF;
        }
        @media (min-width:900px){
          .offrenpg-stats-grid{ grid-template-columns:repeat(4,1fr); }
        }
        .offrenpg-stat-item{
          padding:34px 20px;
          text-align:center;
          border-right:1px solid var(--offrenpg-gray-200);
          border-bottom:1px solid var(--offrenpg-gray-200);
        }
        .offrenpg-stat-item:nth-child(2n){ border-right:none; }
        .offrenpg-stat-item:nth-child(n+3){ border-bottom:none; }
        @media (min-width:900px){
          .offrenpg-stat-item,
          .offrenpg-stat-item:nth-child(2n){
            border-right:1px solid var(--offrenpg-gray-200);
            border-bottom:none;
          }
          .offrenpg-stat-item:last-child{ border-right:none; }
        }
        .offrenpg-stat-value{
          font-size:38px;
          font-weight:800;
          line-height:1;
          color:var(--offrenpg-brass-deep);
        }
        @media (min-width:640px){ .offrenpg-stat-value{ font-size:46px; } }
        .offrenpg-stat-label{
          margin-top:12px;
          font-size:13px;
          font-weight:600;
          letter-spacing:0.08em;
          text-transform:uppercase;
          color:var(--offrenpg-gray-500);
        }

        /* PACKAGES */
        .offrenpg-packages-section{ background:var(--offrenpg-gray-50); }
        .offrenpg-packages-header{ text-align:center; }
        .offrenpg-packages-header .offrenpg-eyebrow{ justify-content:center; }
        .offrenpg-packages-header .offrenpg-section-intro{ margin-left:auto; margin-right:auto; }
        .offrenpg-package-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:22px;
          margin-top:44px;
          align-items:stretch;
        }
        @media (min-width:900px){ .offrenpg-package-grid{ grid-template-columns:repeat(3,1fr); } }
        .offrenpg-package-card{
          position:relative;
          display:flex;
          flex-direction:column;
          background:#FFFFFF;
          border:1px solid var(--offrenpg-gray-200);
          border-radius:10px;
          padding:36px 30px;
        }
        .offrenpg-package-card-featured{
          background:#ffffff;
          color:var(--offrenpg-ink);
          border-color:var(--offrenpg-brass);
          box-shadow:0 18px 40px -16px rgba(27,26,23,0.18);
        }
        @media (min-width:900px){
          .offrenpg-package-card-featured{ transform:translateY(-12px); }
        }
        .offrenpg-package-badge{
          position:absolute;
          top:-13px;
          left:30px;
          background:var(--offrenpg-brass);
          color:#FFFFFF;
          font-size:11px;
          font-weight:700;
          letter-spacing:0.12em;
          text-transform:uppercase;
          padding:6px 12px;
          border-radius:100px;
        }
        .offrenpg-package-name{
          margin:0;
          font-size:22px;
          font-weight:800;
        }
        .offrenpg-package-tagline{
          margin:8px 0 0;
          font-size:14px;
          color:var(--offrenpg-gray-500);
        }
        .offrenpg-package-card-featured .offrenpg-package-tagline{ color:var(--offrenpg-gray-500); }
        .offrenpg-package-list{
          list-style:none;
          margin:26px 0 0;
          padding:26px 0 0;
          border-top:1px solid var(--offrenpg-gray-200);
          display:grid;
          gap:14px;
        }
        .offrenpg-package-card-featured .offrenpg-package-list{ border-top-color:var(--offrenpg-gray-200); }
        .offrenpg-package-item{
          display:flex;
          align-items:flex-start;
          gap:12px;
          font-size:14.5px;
          line-height:1.55;
        }
        .offrenpg-package-check{
          flex-shrink:0;
          width:22px;
          height:22px;
          border-radius:50%;
          background:rgba(169,121,63,0.16);
          color:var(--offrenpg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:1px;
        }
        .offrenpg-package-card-featured .offrenpg-package-check{
          background:rgba(169,121,63,0.16);
          color:var(--offrenpg-brass-deep);
        }

        /* TRENDS (dark band) */
        .offrenpg-trends-section{ background:var(--offrenpg-black); color:var(--offrenpg-ink); }
        .offrenpg-trends-section .offrenpg-section-heading{ color:var(--offrenpg-ink); }
        .offrenpg-trends-section .offrenpg-eyebrow{ color:#8a6a28; }
        .offrenpg-trends-section .offrenpg-section-intro{ color:var(--offrenpg-gray-500); }
        .offrenpg-trend-grid{
          display:grid;
          grid-template-columns:1fr;
          margin-top:44px;
          border-top:1px solid var(--offrenpg-gray-200);
        }
        @media (min-width:800px){
          .offrenpg-trend-grid{ grid-template-columns:repeat(2,1fr); column-gap:56px; }
        }
        .offrenpg-trend-row{
          display:flex;
          gap:22px;
          padding:30px 0;
          border-bottom:1px solid var(--offrenpg-gray-200);
        }
        .offrenpg-trend-number{
          flex-shrink:0;
          font-size:34px;
          font-weight:800;
          line-height:1;
          color:var(--offrenpg-brass);
          min-width:52px;
        }
        .offrenpg-trend-title{
          margin:0;
          font-size:19px;
          font-weight:700;
        }
        .offrenpg-trend-copy{
          margin:8px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--offrenpg-gray-500);
        }

        /* BEFORE / AFTER */
        .offrenpg-ba-list{
          display:grid;
          gap:40px;
          margin-top:44px;
        }
        .offrenpg-ba-title{
          margin:0 0 16px;
          font-size:20px;
          font-weight:700;
        }
        .offrenpg-ba-pair{
          display:grid;
          grid-template-columns:1fr;
          gap:16px;
        }
        @media (min-width:700px){ .offrenpg-ba-pair{ grid-template-columns:1fr 1fr; } }
        .offrenpg-ba-frame{
          position:relative;
          border-radius:8px;
          overflow:hidden;
          aspect-ratio:4/3;
          background:var(--offrenpg-gray-100);
        }
        .offrenpg-ba-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .offrenpg-ba-label{
          position:absolute;
          top:14px;
          left:14px;
          font-size:11px;
          font-weight:700;
          letter-spacing:0.14em;
          text-transform:uppercase;
          padding:7px 12px;
          border-radius:100px;
          background:rgba(10,10,10,0.78);
          color:#ffffff;
        }
        .offrenpg-ba-label-after{
          background:var(--offrenpg-brass);
        }

        /* COST FACTORS */
        .offrenpg-cost-section{ background:var(--offrenpg-gray-50); }
        .offrenpg-cost-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:48px;
          align-items:start;
        }
        @media (min-width:960px){
          .offrenpg-cost-grid{ grid-template-columns:0.8fr 1.2fr; gap:64px; }
        }
        .offrenpg-cost-note{
          margin-top:26px;
          padding:20px 22px;
          border-left:4px solid var(--offrenpg-brass);
          background:#FFFFFF;
          border-radius:0 6px 6px 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--offrenpg-gray-500);
        }
        .offrenpg-cost-list{
          display:grid;
          gap:0;
          border:1px solid var(--offrenpg-gray-200);
          border-radius:10px;
          overflow:hidden;
          background:#FFFFFF;
        }
        .offrenpg-cost-row{
          padding:22px 26px;
          border-bottom:1px solid var(--offrenpg-gray-200);
        }
        .offrenpg-cost-row:last-child{ border-bottom:none; }
        .offrenpg-cost-title{
          margin:0;
          font-size:16px;
          font-weight:700;
        }
        .offrenpg-cost-copy{
          margin:6px 0 0;
          font-size:14px;
          line-height:1.65;
          color:var(--offrenpg-gray-500);
        }

        /* VIDEO */
        .offrenpg-video-header{ text-align:center; }
        .offrenpg-video-header .offrenpg-eyebrow{ justify-content:center; }
        .offrenpg-video-header .offrenpg-section-intro{ margin-left:auto; margin-right:auto; }
        .offrenpg-video-frame{
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
        .offrenpg-video-iframe{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          border:0;
          display:block;
        }

        /* FAQ */
        .offrenpg-faq-section{ background:var(--offrenpg-gray-50); }
        .offrenpg-faq-list{
          margin-top:36px;
          max-width:820px;
          display:grid;
          gap:12px;
        }
        .offrenpg-faq-item{
          background:#FFFFFF;
          border:1px solid var(--offrenpg-gray-200);
          border-radius:8px;
          overflow:hidden;
        }
        .offrenpg-faq-question{
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
          color:var(--offrenpg-ink);
        }
        .offrenpg-faq-toggle-icon{ flex-shrink:0; color:var(--offrenpg-brass-deep); }
        .offrenpg-faq-answer{
          margin:0;
          padding:0 22px 22px;
          font-size:14.5px;
          line-height:1.75;
          color:var(--offrenpg-gray-500);
        }

        /* CTA */
        .offrenpg-cta-section{ padding:0 0 88px; background:var(--offrenpg-gray-50); }
        .offrenpg-cta-box{
          background:var(--offrenpg-black);
          border:1px solid var(--offrenpg-gray-200);
          border-radius:10px;
          padding:44px 28px;
          display:flex;
          flex-direction:column;
          gap:28px;
          align-items:flex-start;
        }
        @media (min-width:900px){
          .offrenpg-cta-box{
            flex-direction:row;
            align-items:center;
            justify-content:space-between;
            padding:52px 56px;
          }
        }
        .offrenpg-cta-heading{
          margin:0;
          color:var(--offrenpg-ink);
          font-size:26px;
          font-weight:700;
          line-height:1.3;
          max-width:560px;
        }
        @media (min-width:640px){ .offrenpg-cta-heading{ font-size:30px; } }
        .offrenpg-cta-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--offrenpg-gray-500);
        }
        .offrenpg-cta-actions{
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:18px;
        }
        .offrenpg-cta-phone{
          display:inline-flex;
          align-items:center;
          gap:10px;
          color:var(--offrenpg-ink);
          font-size:15px;
          font-weight:700;
        }
        .offrenpg-cta-phone-icon{
          width:44px;
          height:44px;
          border-radius:50%;
          border:1px solid var(--offrenpg-gray-200);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--offrenpg-brass-deep);
        }
        .offrenpg-cta-link{
          display:flex;
          align-items:stretch;
          width:fit-content;
        }
        .offrenpg-cta-link-label{
          display:flex;
          align-items:center;
          background:#1b1a17;
          color:#ffffff;
          padding:15px 26px;
          font-size:14.5px;
          font-weight:700;
          border-radius:6px 0 0 6px;
        }
        .offrenpg-cta-link-icon{
          display:flex;
          align-items:center;
          justify-content:center;
          width:52px;
          background:var(--offrenpg-brass);
          color:#FFFFFF;
          border-radius:0 6px 6px 0;
          transition:background-color .15s ease;
        }
        .offrenpg-cta-link:hover .offrenpg-cta-link-icon{ background:var(--offrenpg-brass-deep); }
        .offrenpg-faq-question:focus-visible,
        .offrenpg-cta-phone:focus-visible,
        .offrenpg-cta-link:focus-visible{
          outline:2px solid var(--offrenpg-brass-deep);
          outline-offset:2px;
        }
      `}</style>

      {/* HERO BAND */}
      <section
        className="offrenpg-hero-section"
        style={{ backgroundImage: `url(${OFFREN_HERO_BG_IMAGE})` }}
      >
        <div className="offrenpg-hero-dark-overlay" />
        <div className="offrenpg-hero-inner-container">
          <h1 className="offrenpg-hero-heading">
            Office Renovation - Yashmeen Future Building & Fit-Out Company
          </h1>
        </div>
      </section>

      {/* SIGNS IT'S TIME */}
      <section className="offrenpg-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-signs-grid">
            <div>
              <div className="offrenpg-eyebrow">
                <span className="offrenpg-eyebrow-bar" />
                {liveSrv?.title || "Office Renovation"}
              </div>
              <h2 className="offrenpg-section-heading">
                {liveSrv?.shortDesc || "Is it time to renovate your office?"}
              </h2>
              <p className="offrenpg-signs-copy">
                Offices rarely fail all at once. They slowly stop matching how
                the business works. If any of these sound familiar, a renovation
                can bring your workspace back in line with your team, your
                clients and your brand, without having to move.
              </p>
            </div>
            <div className="offrenpg-sign-list">
              {OFFREN_SIGNS.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="offrenpg-sign-row">
                  <div className="offrenpg-sign-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="offrenpg-sign-title">{title}</h3>
                    <p className="offrenpg-sign-copy">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="offrenpg-stats-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-stats-grid">
            {OFFREN_STATS.map((stat) => (
              <div key={stat.label} className="offrenpg-stat-item">
                <div className="offrenpg-stat-value">{stat.value}</div>
                <div className="offrenpg-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RENOVATION PACKAGES */}
      <section className="offrenpg-section offrenpg-packages-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-packages-header">
            <div className="offrenpg-eyebrow">
              <span className="offrenpg-eyebrow-bar" />
              Renovation Levels
            </div>
            <h2 className="offrenpg-section-heading">
              Choose the level of change you need
            </h2>
            <p className="offrenpg-section-intro">
              From a quick refresh to a complete transformation, we scope the
              work to your goals and budget.
            </p>
          </div>
          <div className="offrenpg-package-grid">
            {OFFREN_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`offrenpg-package-card${
                  pkg.featured ? " offrenpg-package-card-featured" : ""
                }`}
              >
                {pkg.featured && (
                  <span className="offrenpg-package-badge">Most Popular</span>
                )}
                <h3 className="offrenpg-package-name">{pkg.name}</h3>
                <p className="offrenpg-package-tagline">{pkg.tagline}</p>
                <ul className="offrenpg-package-list">
                  {pkg.items.map((item) => (
                    <li key={item} className="offrenpg-package-item">
                      <span className="offrenpg-package-check">
                        <FiCheck size={13} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKPLACE TRENDS */}
      <section className="offrenpg-section offrenpg-trends-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-eyebrow">
            <span className="offrenpg-eyebrow-bar" />
            Modern Workplace
          </div>
          <h2 className="offrenpg-section-heading">
            What today&apos;s offices are designed around
          </h2>
          <p className="offrenpg-section-intro">
            Ideas we bring into renovation projects to make workspaces more
            useful for the people in them.
          </p>
          <div className="offrenpg-trend-grid">
            {OFFREN_TRENDS.map((trend, i) => (
              <div key={trend.title} className="offrenpg-trend-row">
                <div className="offrenpg-trend-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="offrenpg-trend-title">{trend.title}</h3>
                  <p className="offrenpg-trend-copy">{trend.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="offrenpg-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-eyebrow">
            <span className="offrenpg-eyebrow-bar" />
            Before &amp; After
          </div>
          <h2 className="offrenpg-section-heading">
            The difference a renovation makes
          </h2>
          <div className="offrenpg-ba-list">
            {OFFREN_BEFORE_AFTER.map((item) => (
              <div key={item.title}>
                <h3 className="offrenpg-ba-title">{item.title}</h3>
                <div className="offrenpg-ba-pair">
                  <div className="offrenpg-ba-frame">
                    <img
                      className="offrenpg-ba-image"
                      src={item.before}
                      alt={`${item.title} before renovation`}
                      loading="lazy"
                    />
                    <span className="offrenpg-ba-label">Before</span>
                  </div>
                  <div className="offrenpg-ba-frame">
                    <img
                      className="offrenpg-ba-image"
                      src={item.after}
                      alt={`${item.title} after renovation`}
                      loading="lazy"
                    />
                    <span className="offrenpg-ba-label offrenpg-ba-label-after">
                      After
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COST FACTORS */}
      <section className="offrenpg-section offrenpg-cost-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-cost-grid">
            <div>
              <div className="offrenpg-eyebrow">
                <span className="offrenpg-eyebrow-bar" />
                Budgeting
              </div>
              <h2 className="offrenpg-section-heading">
                What affects the cost of an office renovation?
              </h2>
              <p className="offrenpg-section-intro">
                No two offices are the same, so we price each project after
                understanding its size, condition and goals.
              </p>
              <div className="offrenpg-cost-note">
                We provide a detailed quotation after a site visit, so you can
                compare scope and finishes line by line.
              </div>
            </div>
            <div className="offrenpg-cost-list">
              {OFFREN_COST_FACTORS.map((factor) => (
                <div key={factor.title} className="offrenpg-cost-row">
                  <h3 className="offrenpg-cost-title">{factor.title}</h3>
                  <p className="offrenpg-cost-copy">{factor.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="offrenpg-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-video-header">
            <div className="offrenpg-eyebrow">
              <span className="offrenpg-eyebrow-bar" />
              Watch
            </div>
            <h2 className="offrenpg-section-heading">
              See an office transformation
            </h2>
            <p className="offrenpg-section-intro">
              Watch how a tired workspace becomes a modern, efficient office.
            </p>
          </div>
          <div className="offrenpg-video-frame">
            <iframe
              className="offrenpg-video-iframe"
              src={OFFREN_VIDEO_URL}
              title="Office renovation project film"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="offrenpg-section offrenpg-faq-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-eyebrow">
            <span className="offrenpg-eyebrow-bar" />
            FAQ
          </div>
          <h2 className="offrenpg-section-heading">
            Office renovation questions
          </h2>
          <div className="offrenpg-faq-list">
            {OFFREN_FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q} className="offrenpg-faq-item">
                  <button
                    type="button"
                    className="offrenpg-faq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    {item.q}
                    <span className="offrenpg-faq-toggle-icon">
                      {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                    </span>
                  </button>
                  {isOpen && <p className="offrenpg-faq-answer">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="offrenpg-cta-section">
        <div className="offrenpg-wrap">
          <div className="offrenpg-cta-box">
            <div>
              <h2 className="offrenpg-cta-heading">
                Let&apos;s plan your office renovation.
              </h2>
              <p className="offrenpg-cta-copy">
                Call us or send a message and we will arrange a site visit.
              </p>
            </div>
            <div className="offrenpg-cta-actions">
              <a href="tel:+971543862870" className="offrenpg-cta-phone">
                <span className="offrenpg-cta-phone-icon">
                  <FiPhone size={18} />
                </span>
                +971 54 386 2870
              </a>
              <Link to="/contact" className="offrenpg-cta-link">
                <span className="offrenpg-cta-link-label">Get in Touch</span>
                <span className="offrenpg-cta-link-icon">
                  <FiArrowRight size={18} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { useState } from "react";
import {
  FiCheck,
  FiArrowRight,
  FiPlus,
  FiMinus,
  FiGrid,
  FiImage,
  FiBox,
  FiDroplet,
  FiHome,
  FiScissors,
} from "react-icons/fi";

// Helper to keep Unsplash URLs short
const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Replace these with your own project photos (best: local assets)
// Hero: elegant living room interior
const INT_HERO_BG_IMAGE = unsplash("photo-1618221195710-dd6b41faaea6", 1800);
// Intro: designed interior with furniture and décor
const INT_INTRO_IMAGE = unsplash("photo-1616486338812-3dadae4b4ace", 900);

// Replace with your real YouTube embed URL: https://www.youtube.com/embed/VIDEO_ID
const INT_VIDEO_URL = "https://www.youtube.com/embed/bt7_sYLWhZg";

// Placeholder numbers - replace with your real figures
const INT_STATS = [
  { value: "150+", label: "Interiors Delivered" },
  { value: "10+", label: "Years of Experience" },
  { value: "50+", label: "Designers & Craftsmen" },
  { value: "100%", label: "In-House Joinery" },
];

const INT_INTRO_POINTS = [
  "Designs tailored to your lifestyle, brand and budget",
  "Realistic 3D visuals before any work begins",
  "Premium materials and bespoke joinery made in-house",
  "Design and fit-out managed by one accountable team",
];

const INT_SERVICES = [
  {
    icon: FiGrid,
    title: "Space Planning",
    copy: "Smart layouts that improve flow, light and usability in every room.",
  },
  {
    icon: FiImage,
    title: "Concept & Mood Boards",
    copy: "Colour palettes, textures and references that define the look and feel of your space.",
  },
  {
    icon: FiBox,
    title: "3D Visualisation",
    copy: "Photo-realistic renders so you can see the finished interior before it is built.",
  },
  {
    icon: FiDroplet,
    title: "Materials & Finishes",
    copy: "Careful selection of flooring, wall finishes, lighting and fittings that suit your design and budget.",
  },
  {
    icon: FiHome,
    title: "Furniture & Décor",
    copy: "Furniture, curtains, artwork and accessories sourced or custom-made to complete the space.",
  },
  {
    icon: FiScissors,
    title: "Bespoke Joinery",
    copy: "Wardrobes, kitchens, wall panelling and feature pieces crafted to your exact measurements.",
  },
];

const INT_STYLES = [
  {
    title: "Modern",
    copy: "Clean lines, open layouts and a calm, neutral palette.",
    img: unsplash("photo-1600210492486-724fe5c67fb0", 800),
  },
  {
    title: "Contemporary",
    copy: "Current trends blended with warm textures and statement lighting.",
    img: unsplash("photo-1600607687939-ce8a6c25118c", 800),
  },
  {
    title: "Classic",
    copy: "Timeless detailing, rich materials and elegant proportions.",
    img: unsplash("photo-1618219908412-a29a1bb7b86e", 800),
  },
  {
    title: "Minimalist",
    copy: "Understated spaces where every element has a purpose.",
    img: unsplash("photo-1598928506311-c55ded91a20c", 800),
  },
];

const INT_PROCESS = [
  {
    title: "Consultation",
    copy: "We learn how you live or work, your taste and your budget.",
  },
  {
    title: "Concept & Layout",
    copy: "Mood boards and space plans are presented and refined together.",
  },
  {
    title: "3D & Detailing",
    copy: "Renders, drawings and material schedules are finalised for approval.",
  },
  {
    title: "Fit-Out & Styling",
    copy: "Our team builds, installs joinery, and styles the finished space.",
  },
  {
    title: "Handover",
    copy: "A final walkthrough and snagging so everything meets the design.",
  },
];

const INT_PROJECTS = [
  {
    title: "Luxury Villa Living Space",
    tag: "Residential",
    img: unsplash("photo-1600607687920-4e2a09cf159d"), // villa living room
  },
  {
    title: "Executive Office Interior",
    tag: "Commercial",
    img: unsplash("photo-1497366811353-6870744d04b2"), // executive office
  },
  {
    title: "Fine Dining Restaurant",
    tag: "F & B",
    img: unsplash("photo-1517248135467-4c7edcad34c4"), // restaurant interior
  },
];

const INT_FAQS = [
  {
    q: "What does an interior design service include?",
    a: "It covers space planning, concept development, 3D visuals, material selection, furniture and décor, and can extend to full fit-out and joinery.",
  },
  {
    q: "Can you design and also carry out the fit-out?",
    a: "Yes. Design and execution are handled by one team, so the finished space matches the approved design.",
  },
  {
    q: "Do you work on both homes and commercial spaces?",
    a: "Yes. We design villas and apartments as well as offices, retail outlets, restaurants and cafés.",
  },
  {
    q: "How long does an interior design project take?",
    a: "It depends on the size and scope. After the consultation we share a timeline covering design, approvals and fit-out.",
  },
  {
    q: "How do I get started?",
    a: "Contact us through the contact page or by phone. We will arrange a consultation and follow up with a proposal.",
  },
];

export default function InteriorDesign() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="intpg-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        .intpg-page{
          --intpg-ink:#faf7f0;
          --intpg-black:#0d0c0a;
          --intpg-gray-50:#141311;
          --intpg-gray-100:rgba(255,255,255,0.05);
          --intpg-gray-200:rgba(255,255,255,0.08);
          --intpg-gray-500:rgba(250,247,240,0.72);
          --intpg-brass:var(--brass, #c5a059);
          --intpg-brass-deep:var(--brass-light, #dfba73);
          --intpg-font:'Montserrat', sans-serif;
          --intpg-max-w:1180px;

          min-height:100vh;
          width:100%;
          background:#0d0c0a;
          color:var(--intpg-ink);
          font-family:var(--intpg-font);
        }
        .intpg-page *{ box-sizing:border-box; }
        .intpg-page a{ text-decoration:none; color:inherit; }
        .intpg-page button{ font-family:inherit; cursor:pointer; border:none; }

        .intpg-wrap{
          max-width:var(--intpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .intpg-wrap{ padding:0 40px; } }

        /* HERO */
        .intpg-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:var(--intpg-black);
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){ .intpg-hero-section{ padding:120px 0; } }
        .intpg-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(to bottom, rgba(10,10,10,0.72), rgba(10,10,10,0.60));
        }
        .intpg-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:var(--intpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){ .intpg-hero-inner-container{ padding:0 40px; } }
        .intpg-hero-heading{
          margin:0;
          text-align:center;
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .intpg-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .intpg-hero-heading{ font-size:56px; } }

        /* SHARED SECTION BITS */
        .intpg-section{ padding:72px 0; }
        @media (min-width:768px){ .intpg-section{ padding:96px 0; } }
        .intpg-eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--intpg-brass-deep);
        }
        .intpg-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--intpg-brass);
          border-radius:1px;
        }
        .intpg-section-heading{
          margin:16px 0 0;
          font-weight:600;
          font-size:30px;
          line-height:1.3;
          color:var(--intpg-ink);
        }
        @media (min-width:640px){ .intpg-section-heading{ font-size:38px; } }
        .intpg-section-intro{
          margin:14px 0 0;
          max-width:620px;
          font-size:15.5px;
          line-height:1.75;
          color:var(--intpg-gray-500);
        }

        /* INTRO */
        .intpg-intro-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:40px;
          align-items:center;
        }
        @media (min-width:960px){
          .intpg-intro-grid{ grid-template-columns:0.95fr 1.05fr; gap:64px; }
        }
        .intpg-intro-copy{
          margin:18px 0 0;
          font-size:15.5px;
          line-height:1.8;
          color:var(--intpg-gray-500);
        }
        .intpg-check-list{
          list-style:none;
          margin:26px 0 0;
          padding:0;
          display:grid;
          gap:14px;
        }
        .intpg-check-item{
          display:flex;
          align-items:flex-start;
          gap:12px;
          font-size:15px;
          font-weight:500;
          color:var(--intpg-ink);
        }
        .intpg-check-icon{
          flex-shrink:0;
          width:24px;
          height:24px;
          border-radius:50%;
          background:rgba(169,121,63,0.14);
          color:var(--intpg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:1px;
        }
        .intpg-intro-image-frame{
          border-radius:10px;
          overflow:hidden;
          aspect-ratio:4/4.4;
          background:var(--intpg-gray-100);
        }
        @media (min-width:960px){
          .intpg-intro-image-frame{ order:-1; }
        }
        .intpg-intro-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        /* STATS */
        .intpg-stats-section{ padding:0 0 72px; }
        @media (min-width:768px){ .intpg-stats-section{ padding:0 0 96px; } }
        .intpg-stats-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          border:1px solid var(--intpg-gray-200);
          border-radius:10px;
          overflow:hidden;
          background:#FFFFFF;
        }
        @media (min-width:900px){
          .intpg-stats-grid{ grid-template-columns:repeat(4,1fr); }
        }
        .intpg-stat-item{
          padding:34px 20px;
          text-align:center;
          border-right:1px solid var(--intpg-gray-200);
          border-bottom:1px solid var(--intpg-gray-200);
        }
        .intpg-stat-item:nth-child(2n){ border-right:none; }
        .intpg-stat-item:nth-child(n+3){ border-bottom:none; }
        @media (min-width:900px){
          .intpg-stat-item,
          .intpg-stat-item:nth-child(2n){
            border-right:1px solid var(--intpg-gray-200);
            border-bottom:none;
          }
          .intpg-stat-item:last-child{ border-right:none; }
        }
        .intpg-stat-value{
          font-size:38px;
          font-weight:800;
          line-height:1;
          color:var(--intpg-brass-deep);
        }
        @media (min-width:640px){ .intpg-stat-value{ font-size:46px; } }
        .intpg-stat-label{
          margin-top:12px;
          font-size:13px;
          font-weight:600;
          letter-spacing:0.08em;
          text-transform:uppercase;
          color:var(--intpg-gray-500);
        }

        /* SERVICES */
        .intpg-services-section{ background:var(--intpg-gray-50); }
        .intpg-service-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:40px;
        }
        @media (min-width:700px){ .intpg-service-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1000px){ .intpg-service-grid{ grid-template-columns:repeat(3,1fr); } }
        .intpg-service-card{
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(16px);
          border-radius:8px;
          padding:30px 26px;
          transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .intpg-service-card:hover{
          border-color:rgba(169,121,63,0.55);
          box-shadow:0 14px 30px -18px rgba(0,0,0,0.25);
          transform:translateY(-3px);
        }
        .intpg-service-icon{
          width:52px;
          height:52px;
          border-radius:50%;
          background:rgba(197,160,89,0.12);
          color:var(--intpg-brass-deep);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .intpg-service-title{
          margin:20px 0 0;
          font-size:18px;
          font-weight:700;
        }
        .intpg-service-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--intpg-gray-500);
        }

        /* STYLES */
        .intpg-style-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:40px;
        }
        @media (min-width:640px){ .intpg-style-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1000px){ .intpg-style-grid{ grid-template-columns:repeat(4,1fr); } }
        .intpg-style-card{
          position:relative;
          border-radius:8px;
          overflow:hidden;
          aspect-ratio:4/5;
          background:var(--intpg-gray-100);
        }
        .intpg-style-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition:transform .6s ease;
        }
        .intpg-style-card:hover .intpg-style-image{ transform:scale(1.07); }
        .intpg-style-shade{
          position:absolute;
          inset:0;
          background:linear-gradient(180deg, rgba(10,10,10,0) 40%, rgba(10,10,10,0.88) 100%);
        }
        .intpg-style-meta{
          position:absolute;
          left:20px;
          right:20px;
          bottom:20px;
          color:#FFFFFF;
        }
        .intpg-style-title{
          margin:0;
          font-size:20px;
          font-weight:700;
        }
        .intpg-style-copy{
          margin:8px 0 0;
          font-size:13.5px;
          line-height:1.6;
          color:rgba(255,255,255,0.78);
        }

        /* PROCESS (dark band) */
        .intpg-process-section{ background:var(--intpg-black); color:#FFFFFF; }
        .intpg-process-section .intpg-section-heading{ color:#FFFFFF; }
        .intpg-process-section .intpg-eyebrow{ color:#D3A36A; }
        .intpg-process-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:18px;
          margin-top:40px;
        }
        @media (min-width:700px){ .intpg-process-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1100px){ .intpg-process-grid{ grid-template-columns:repeat(5,1fr); } }
        .intpg-process-step{
          border:1px solid rgba(255,255,255,0.14);
          border-radius:8px;
          padding:26px 22px;
          background:rgba(255,255,255,0.03);
        }
        .intpg-process-number{
          font-size:34px;
          font-weight:800;
          color:var(--intpg-brass);
          line-height:1;
        }
        .intpg-process-title{
          margin:16px 0 0;
          font-size:16.5px;
          font-weight:700;
          line-height:1.35;
        }
        .intpg-process-copy{
          margin:10px 0 0;
          font-size:14px;
          line-height:1.7;
          color:rgba(255,255,255,0.7);
        }

        /* VIDEO */
        .intpg-video-header{ text-align:center; }
        .intpg-video-header .intpg-eyebrow{ justify-content:center; }
        .intpg-video-header .intpg-section-intro{ margin-left:auto; margin-right:auto; }
        .intpg-video-frame{
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
        .intpg-video-iframe{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          border:0;
          display:block;
        }

        /* PROJECTS */
        .intpg-projects-section{ background:var(--intpg-gray-50); }
        .intpg-project-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:22px;
          margin-top:40px;
        }
        @media (min-width:700px){ .intpg-project-grid{ grid-template-columns:repeat(3,1fr); } }
        .intpg-project-card{
          position:relative;
          border-radius:8px;
          overflow:hidden;
          aspect-ratio:4/4.6;
          background:var(--intpg-gray-100);
        }
        .intpg-project-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition:transform .6s ease;
        }
        .intpg-project-card:hover .intpg-project-image{ transform:scale(1.07); }
        .intpg-project-shade{
          position:absolute;
          inset:0;
          background:linear-gradient(180deg, rgba(10,10,10,0) 45%, rgba(10,10,10,0.85) 100%);
        }
        .intpg-project-meta{
          position:absolute;
          left:22px;
          right:22px;
          bottom:20px;
          color:#FFFFFF;
        }
        .intpg-project-tag{
          font-size:11px;
          font-weight:700;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:#E1B27A;
        }
        .intpg-project-title{
          margin:8px 0 0;
          font-size:18px;
          font-weight:700;
          line-height:1.3;
        }

        /* FAQ */
        .intpg-faq-list{
          margin-top:36px;
          max-width:820px;
          display:grid;
          gap:12px;
        }
        .intpg-faq-item{
          background:#FFFFFF;
          border:1px solid var(--intpg-gray-200);
          border-radius:8px;
          overflow:hidden;
        }
        .intpg-faq-question{
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
          color:var(--intpg-ink);
        }
        .intpg-faq-toggle-icon{ flex-shrink:0; color:var(--intpg-brass-deep); }
        .intpg-faq-answer{
          margin:0;
          padding:0 22px 22px;
          font-size:14.5px;
          line-height:1.75;
          color:var(--intpg-gray-500);
        }

        /* CTA */
        .intpg-cta-section{ padding:0 0 88px; }
        .intpg-cta-box{
          background:var(--intpg-black);
          border-radius:10px;
          padding:44px 28px;
          display:flex;
          flex-direction:column;
          gap:24px;
          align-items:flex-start;
        }
        @media (min-width:768px){
          .intpg-cta-box{
            flex-direction:row;
            align-items:center;
            justify-content:space-between;
            padding:52px 56px;
          }
        }
        .intpg-cta-heading{
          margin:0;
          color:#FFFFFF;
          font-size:26px;
          font-weight:700;
          line-height:1.3;
          max-width:560px;
        }
        @media (min-width:640px){ .intpg-cta-heading{ font-size:30px; } }
        .intpg-cta-copy{
          margin:10px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:rgba(255,255,255,0.7);
        }
        .intpg-cta-link{
          display:flex;
          align-items:stretch;
          width:fit-content;
          flex-shrink:0;
        }
        .intpg-cta-link-label{
          display:flex;
          align-items:center;
          background:#0d0c0a;
          color:var(--intpg-ink);
          padding:15px 26px;
          font-size:14.5px;
          font-weight:700;
          border-radius:6px 0 0 6px;
        }
        .intpg-cta-link-icon{
          display:flex;
          align-items:center;
          justify-content:center;
          width:52px;
          background:var(--intpg-brass);
          color:#FFFFFF;
          border-radius:0 6px 6px 0;
          transition:background-color .15s ease;
        }
        .intpg-cta-link:hover .intpg-cta-link-icon{ background:var(--intpg-brass-deep); }
      `}</style>

      {/* HERO BAND */}
      <section
        className="intpg-hero-section"
        style={{ backgroundImage: `url(${INT_HERO_BG_IMAGE})` }}
      >
        <div className="intpg-hero-dark-overlay" />
        <div className="intpg-hero-inner-container">
          <h1 className="intpg-hero-heading">
            Interior Design - Yashmeen Future Building & Fit-Out Company
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="intpg-section">
        <div className="intpg-wrap">
          <div className="intpg-intro-grid">
            <div>
              <div className="intpg-eyebrow">
                <span className="intpg-eyebrow-bar" />
                Interior Design
              </div>
              <h2 className="intpg-section-heading">
                Interiors that feel as good as they look.
              </h2>
              <p className="intpg-intro-copy">
                We design homes, offices and hospitality spaces around the way
                people actually use them. From the first concept to the final
                finishing touch, our designers and in-house craftsmen work
                together so your vision is built exactly as imagined.
              </p>
              <ul className="intpg-check-list">
                {INT_INTRO_POINTS.map((point) => (
                  <li key={point} className="intpg-check-item">
                    <span className="intpg-check-icon">
                      <FiCheck size={14} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="intpg-intro-image-frame">
              <img
                className="intpg-intro-image"
                src={INT_INTRO_IMAGE}
                alt="Designed living room interior"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="intpg-stats-section">
        <div className="intpg-wrap">
          <div className="intpg-stats-grid">
            {INT_STATS.map((stat) => (
              <div key={stat.label} className="intpg-stat-item">
                <div className="intpg-stat-value">{stat.value}</div>
                <div className="intpg-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="intpg-section intpg-services-section">
        <div className="intpg-wrap">
          <div className="intpg-eyebrow">
            <span className="intpg-eyebrow-bar" />
            What We Offer
          </div>
          <h2 className="intpg-section-heading">
            Interior design services
          </h2>
          <p className="intpg-section-intro">
            Everything needed to take a space from an idea to a finished,
            fully furnished interior.
          </p>
          <div className="intpg-service-grid">
            {INT_SERVICES.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="intpg-service-card">
                <div className="intpg-service-icon">
                  <Icon size={22} />
                </div>
                <h3 className="intpg-service-title">{title}</h3>
                <p className="intpg-service-copy">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STYLES */}
      <section className="intpg-section">
        <div className="intpg-wrap">
          <div className="intpg-eyebrow">
            <span className="intpg-eyebrow-bar" />
            Design Styles
          </div>
          <h2 className="intpg-section-heading">
            A style for every space
          </h2>
          <p className="intpg-section-intro">
            Whatever your taste, we shape it into a cohesive interior that
            suits the architecture and the way you live.
          </p>
          <div className="intpg-style-grid">
            {INT_STYLES.map((style) => (
              <div key={style.title} className="intpg-style-card">
                <img
                  className="intpg-style-image"
                  src={style.img}
                  alt={`${style.title} interior`}
                  loading="lazy"
                />
                <div className="intpg-style-shade" />
                <div className="intpg-style-meta">
                  <h3 className="intpg-style-title">{style.title}</h3>
                  <p className="intpg-style-copy">{style.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="intpg-section intpg-process-section">
        <div className="intpg-wrap">
          <div className="intpg-eyebrow">
            <span className="intpg-eyebrow-bar" />
            Our Process
          </div>
          <h2 className="intpg-section-heading">
            How we bring your interior to life
          </h2>
          <div className="intpg-process-grid">
            {INT_PROCESS.map((step, i) => (
              <div key={step.title} className="intpg-process-step">
                <div className="intpg-process-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="intpg-process-title">{step.title}</h3>
                <p className="intpg-process-copy">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="intpg-section">
        <div className="intpg-wrap">
          <div className="intpg-video-header">
            <div className="intpg-eyebrow">
              <span className="intpg-eyebrow-bar" />
              Watch
            </div>
            <h2 className="intpg-section-heading">
              Inside our interior projects
            </h2>
            <p className="intpg-section-intro">
              Take a walkthrough of our finished spaces and see the detail
              behind each design.
            </p>
          </div>
          <div className="intpg-video-frame">
            <iframe
              className="intpg-video-iframe"
              src={INT_VIDEO_URL}
              title="Interior design project film"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="intpg-section intpg-projects-section">
        <div className="intpg-wrap">
          <div className="intpg-eyebrow">
            <span className="intpg-eyebrow-bar" />
            Selected Work
          </div>
          <h2 className="intpg-section-heading">Featured interiors</h2>
          <div className="intpg-project-grid">
            {INT_PROJECTS.map((project) => (
              <div key={project.title} className="intpg-project-card">
                <img
                  className="intpg-project-image"
                  src={project.img}
                  alt={project.title}
                  loading="lazy"
                />
                <div className="intpg-project-shade" />
                <div className="intpg-project-meta">
                  <div className="intpg-project-tag">{project.tag}</div>
                  <h3 className="intpg-project-title">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="intpg-section">
        <div className="intpg-wrap">
          <div className="intpg-eyebrow">
            <span className="intpg-eyebrow-bar" />
            FAQ
          </div>
          <h2 className="intpg-section-heading">Frequently asked questions</h2>
          <div className="intpg-faq-list">
            {INT_FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q} className="intpg-faq-item">
                  <button
                    type="button"
                    className="intpg-faq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    {item.q}
                    <span className="intpg-faq-toggle-icon">
                      {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                    </span>
                  </button>
                  {isOpen && <p className="intpg-faq-answer">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="intpg-cta-section">
        <div className="intpg-wrap">
          <div className="intpg-cta-box">
            <div>
              <h2 className="intpg-cta-heading">
                Ready to transform your space?
              </h2>
              <p className="intpg-cta-copy">
                Share your ideas with us and we will arrange a design
                consultation.
              </p>
            </div>
            <a href="/contact" className="intpg-cta-link">
              <span className="intpg-cta-link-label">Get in Touch</span>
              <span className="intpg-cta-link-icon">
                <FiArrowRight size={18} />
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
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
    copy: "Every contract runs under ISO 9001, ISO 14001, and ISO 45001 standards — not just our headline projects.",
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
    copy: "Designers, engineers, and craftsmen under one roof — no subcontractor hand-offs diluting the brief along the way.",
  },
  {
    icon: "house",
    title: "True Turnkey Delivery",
    copy: "Partitions, ceilings, flooring, furnishings, and MEP — we manage every trade so you deal with a single point of contact.",
  },
  {
    icon: "support",
    title: "Support After Handover",
    copy: "Snagging, warranty callbacks, and maintenance support don't stop the day we finish — we stay reachable after handover.",
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
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        :root{
          --ink:#191919;
          --black:#0A0A0A;
          --gray-50:#F7F6F4;
          --gray-100:#F0EFEC;
          --gray-200:#E4E2DD;
          --gray-500:#6B6B6B;
          --brass:#A9793F;
          --brass-deep:#8C6431;
          --font-display:'Montserrat', sans-serif;
          --font-body:'Montserrat', sans-serif;
          --max-w:1180px;
        }

        *{ box-sizing:border-box; }

        .page{
          min-height:100vh;
          width:100%;
          background:#FFFFFF;
          color:var(--ink);
          font-family:var(--font-body);
        }

        a{ text-decoration:none; color:inherit; }
        button{ font-family:inherit; cursor:pointer; border:none; }

        .wrap{
          max-width:var(--max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .wrap{ padding:0 40px; }
        }

        .eyebrow{
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--brass-deep);
        }
        .eyebrow-light{ color:var(--brass); }
        .eyebrow-center{ justify-content:center; }
        .eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--brass);
          border-radius:1px;
        }

        /* HERO */
        .hero{
          position:relative;
          padding:88px 0 76px;
          text-align:center;
          background-image:url('${HERO_BG}');
          background-size:cover;
          background-position:center;
          isolation:isolate;
        }
        @media (min-width:768px){ .hero{ padding:120px 0 100px; } }
        .hero::before{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(
            180deg,
            rgba(10,10,10,0.78) 0%,
            rgba(10,10,10,0.68) 55%,
            rgba(10,10,10,0.82) 100%
          );
          z-index:0;
        }
        .hero > .wrap{
          position:relative;
          z-index:1;
        }
        .hero-title{
          margin:18px 0 0;
          font-family:var(--font-display);
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.18;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .hero-title{ font-size:46px; } }
        @media (min-width:1024px){ .hero-title{ font-size:56px; } }
        .hero-copy{
          margin:20px auto 0;
          max-width:620px;
          font-size:15.5px;
          line-height:1.75;
          color:rgba(255,255,255,0.78);
        }
        @media (min-width:640px){ .hero-copy{ font-size:16.5px; } }

        /* IMAGE + WHY INTRO */
        .intro-section{ padding:56px 0 8px; }
        @media (min-width:768px){ .intro-section{ padding:88px 0 16px; } }
        .intro-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:36px;
          align-items:center;
        }
        @media (min-width:860px){
          .intro-grid{ grid-template-columns:1fr 1fr; gap:56px; }
        }
        .intro-image-frame{
          width:100%;
          border-radius:10px;
          overflow:hidden;
          border:1px solid var(--gray-200);
        }
        .intro-image-frame img{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .why-heading{
          margin:0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:28px;
          color:var(--ink);
          line-height:1.25;
        }
        @media (min-width:640px){ .why-heading{ font-size:36px; } }
        .why-intro-copy{
          margin-top:18px;
          font-size:15px;
          line-height:1.85;
          color:var(--gray-500);
        }
        .why-list{
          margin-top:18px;
          display:flex;
          flex-direction:column;
          gap:14px;
        }
        .why-list-item{
          display:flex;
          gap:12px;
          font-size:15px;
          line-height:1.85;
          color:var(--gray-500);
        }
        .why-bullet{
          flex-shrink:0;
          width:8px;
          height:8px;
          border-radius:50%;
          background:var(--brass);
          margin-top:9px;
        }
        .why-label{ color:var(--ink); font-weight:700; }

        /* REASONS */
        .reasons-section{ padding:56px 0 16px; }
        @media (min-width:768px){ .reasons-section{ padding:80px 0 24px; } }
        .section-header{
          max-width:640px;
          margin:0 auto;
          text-align:center;
        }
        .section-heading{
          margin:10px 0 0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:26px;
          color:var(--ink);
          line-height:1.3;
        }
        @media (min-width:640px){ .section-heading{ font-size:34px; } }
        .section-copy{
          margin:14px 0 0;
          font-size:15px;
          line-height:1.75;
          color:var(--gray-500);
        }

        .reasons-grid{
          margin-top:44px;
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
        }
        @media (min-width:640px){
          .reasons-grid{ grid-template-columns:1fr 1fr; }
        }
        @media (min-width:1080px){
          .reasons-grid{ grid-template-columns:repeat(3,1fr); }
        }
        .reason-card{
          border:1px solid var(--gray-200);
          border-radius:10px;
          padding:28px 24px;
          background:#FFFFFF;
        }
        @media (min-width:768px){ .reason-card{ padding:30px 26px; } }
        .reason-icon-wrap{
          width:52px;
          height:52px;
          border-radius:50%;
          background:var(--gray-100);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .reason-title{
          margin-top:18px;
          font-family:var(--font-body);
          font-size:17px;
          font-weight:700;
          color:var(--ink);
        }
        .reason-copy{
          margin-top:8px;
          font-size:14px;
          line-height:1.7;
          color:var(--gray-500);
        }

        /* PROCESS */
        .process-section{
          background:var(--gray-50);
          padding:56px 0;
          margin-top:48px;
          border-top:1px solid var(--gray-200);
          border-bottom:1px solid var(--gray-200);
        }
        @media (min-width:768px){
          .process-section{ padding:88px 0; margin-top:72px; }
        }
        .process-grid{
          margin-top:44px;
          display:grid;
          grid-template-columns:1fr;
          gap:28px;
        }
        @media (min-width:768px){
          .process-grid{ grid-template-columns:repeat(4,1fr); gap:20px; }
        }
        .process-card{ position:relative; }
        .process-step{
          font-family:var(--font-display);
          font-size:32px;
          font-weight:800;
          color:rgba(25,25,25,0.12);
          line-height:1;
        }
        .process-title{
          margin-top:8px;
          font-family:var(--font-body);
          font-size:16.5px;
          font-weight:700;
          color:var(--ink);
        }
        .process-copy{
          margin-top:8px;
          font-size:13.8px;
          line-height:1.7;
          color:var(--gray-500);
        }
        .process-divider{
          position:absolute;
          top:16px;
          left:calc(100% + 10px);
          width:calc(100% - 20px);
          height:1px;
          background:var(--gray-200);
        }

        /* VIDEO SECTION */
        .video-section{ padding:56px 0; background:var(--gray-50); }
        @media (min-width:768px){ .video-section{ padding:88px 0; } }
        .video-section .section-header{ margin-bottom:36px; }
        .video-frame{
          position:relative;
          width:100%;
          max-width:920px;
          margin:0 auto;
          aspect-ratio:16/9;
          border-radius:12px;
          overflow:hidden;
          background:var(--black);
          border:1px solid var(--gray-200);
        }
        .video-frame iframe{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          border:0;
        }

        /* CTA */
        .cta-section{
          background:var(--black);
          padding:48px 0;
          text-align:center;
        }
        @media (min-width:768px){ .cta-section{ padding:64px 0; } }
        .cta-heading{
          margin:0;
          font-family:var(--font-display);
          font-size:24px;
          font-weight:800;
          color:#FFFFFF;
        }
        @media (min-width:640px){ .cta-heading{ font-size:30px; } }
        .cta-copy{
          margin:12px auto 0;
          max-width:480px;
          font-size:14.5px;
          line-height:1.7;
          color:rgba(255,255,255,0.65);
        }
        .cta-btn{
          margin-top:26px;
          display:inline-flex;
          align-items:center;
          background:linear-gradient(180deg, var(--brass), var(--brass-deep));
          color:#FFFFFF;
          padding:15px 30px;
          border-radius:6px;
          font-size:13px;
          font-weight:700;
          letter-spacing:0.08em;
          transition:opacity .15s ease;
        }
        .cta-btn:hover{ opacity:0.9; }
      `}</style>

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
            Building & Fit-Out Company exactly where projects go wrong — so
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
              We Work Together, We Learn Together — a short introduction to the
              team and process behind every Yashmeen Future Building & Fit-Out
              Company project.
            </p>
          </div>

          {INTRO_VIDEO_ID && INTRO_VIDEO_ID !== "VIDEO_ID_HERE" && (
            <div className="video-frame">
              <iframe
                src={`https://www.youtube.com/embed/${INTRO_VIDEO_ID}`}
                title="Yashmeen Future Building & Fit-Out Company — We Work Together, We Learn Together"
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
              We&rsquo;re not the only fit-out contractor in Dubai — but
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

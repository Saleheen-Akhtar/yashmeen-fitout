import { FiCheck, FiTarget, FiEye } from "react-icons/fi";

const STATS = [
  { value: "150+", label: "Projects Completed" },
  { value: "12+", label: "Years of Experience" },
  { value: "40+", label: "Team Members" },
  { value: "98%", label: "Client Satisfaction" },
];

const SERVICES = [
  "Turnkey fit-out solutions of all ranges.",
  "Customised joinery and furniture.",
  "Villas extensions and renovations",
  "Kitchen enhancements and refurbishments.",
  "Living room and dining experiences.",
  "Swimming pools and landscape design.",
  "Luxury bathroom modifications.",
  "Exhibition stand and Kiosks.",
  "MEP Services; Electrical, AC and Plumbing.",
  "Home & Office automations",
];

const HERO_BG = "/static/pages-bg.webp";

export default function AboutPage() {
  return (
    <div className="page">
      <style>{`

        :root{
          --ink:#1b1a17;
          --black:#fbfaf7;
          --gray-50:#f4f1ea;
          --gray-100:rgba(27,26,23,0.04);
          --gray-200:#e6e1d6;
          --gray-500:#6b665c;
          --brass:#8a6a28;
          --brass-deep:#6f541d;
          --font-display:var(--font-sans);
          --font-body:var(--font-sans);
          --max-w:1180px;
        }

        *{ box-sizing:border-box; }

        .page{
          min-height:100vh;
          width:100%;
          background:var(--black);
          color:var(--ink);
          font-family:var(--font-body);
        }

        a{ text-decoration:none; color:inherit; }

        .wrap{
          max-width:var(--max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .wrap{ padding:0 40px; }
        }

        .eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--brass-deep);
        }
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
        .hero-eyebrow{
          justify-content:center;
          color:var(--brass);
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
          max-width:640px;
          font-size:15.5px;
          line-height:1.75;
          color:rgba(255,255,255,0.78);
        }
        @media (min-width:640px){ .hero-copy{ font-size:16.5px; } }

        /* ABOUT SECTION */
        .about-section{ padding:72px 0; }
        @media (min-width:768px){ .about-section{ padding:96px 0; } }
        .about-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:48px;
          align-items:center;
        }
        @media (min-width:960px){
          .about-grid{ grid-template-columns:0.85fr 1.15fr; gap:64px; }
        }
        .about-image-frame{
          width:100%;
        }

        .about-image-frame img {
        border-radius:10px;
        width:100%;
        }

        .about-heading{
          margin:16px 0 0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:30px;
          line-height:1.25;
          color:var(--ink);
        }
        @media (min-width:640px){ .about-heading{ font-size:36px; } }
        .about-copy{
          margin:20px 0 0;
          font-size:15px;
          line-height:1.85;
          color:var(--gray-500);
        }
        .about-copy + .about-copy{ margin-top:16px; }

        .about-highlights{
          margin:28px 0 0;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        }
        .about-highlight{
          display:flex;
          align-items:center;
          gap:10px;
          font-size:14px;
          font-weight:500;
          color:var(--ink);
        }
        .about-highlight svg{ color:var(--brass-deep); flex-shrink:0; }

        /* STATS */
        .stats-section{
          background:var(--gray-50);
          border-top:1px solid var(--gray-200);
          border-bottom:1px solid var(--gray-200);
          padding:52px 0;
        }
        .stats-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:32px 16px;
        }
        @media (min-width:768px){
          .stats-grid{ grid-template-columns:repeat(4,1fr); }
        }
        .stat{
          text-align:center;
          padding:0 8px;
          position:relative;
        }
        @media (min-width:768px){
          .stat:not(:first-child)::before{
            content:"";
            position:absolute;
            left:0;
            top:8px;
            bottom:8px;
            width:1px;
            background:var(--gray-200);
          }
        }
        .stat-value{
          font-family:var(--font-display);
          font-weight:800;
          font-size:34px;
          color:var(--brass-deep);
        }
        @media (min-width:640px){ .stat-value{ font-size:42px; } }
        .stat-label{
          margin-top:6px;
          font-size:13px;
          font-weight:500;
          text-transform:uppercase;
          letter-spacing:0.06em;
          color:var(--gray-500);
        }

        /* MISSION / VISION */
        .mv-section{ padding:72px 0; }
        @media (min-width:768px){ .mv-section{ padding:96px 0; } }
        .mv-header{ max-width:620px; }
        .mv-heading{
          margin:16px 0 0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:30px;
          line-height:1.25;
        }
        @media (min-width:640px){ .mv-heading{ font-size:36px; } }

        .mv-grid{
          margin-top:40px;
          display:grid;
          grid-template-columns:1fr;
          gap:24px;
        }
        @media (min-width:768px){
          .mv-grid{ grid-template-columns:1fr 1fr; }
        }
        .mv-card{
          background:#ffffff;
          border:1px solid var(--gray-200);
          backdrop-filter:blur(16px);
          border-radius:10px;
          padding:32px;
        }
        .mv-icon-circle{
          width:52px;
          height:52px;
          border-radius:50%;
          background:var(--gray-100);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--brass-deep);
        }
        .mv-card-title{
          margin:20px 0 0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:20px;
        }
        .mv-card-copy{
          margin:12px 0 0;
          font-size:14.5px;
          line-height:1.75;
          color:var(--gray-500);
        }

        /* SERVICES / CLOSING SECTION */
        .services-section{
          background:var(--gray-50);
          padding:72px 0 88px;
        }
        @media (min-width:768px){ .services-section{ padding:96px 0 112px; } }
        .services-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:48px;
        }
        @media (min-width:960px){
          .services-grid{ grid-template-columns:0.95fr 1.05fr; gap:64px; }
        }
        .services-heading{
          margin:16px 0 0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:30px;
          line-height:1.25;
        }
        @media (min-width:640px){ .services-heading{ font-size:36px; } }
        .services-copy{
          margin:20px 0 0;
          font-size:14.5px;
          line-height:1.85;
          color:var(--gray-500);
        }
        .services-copy + .services-copy{ margin-top:16px; }

        .services-list{
          display:grid;
          grid-template-columns:1fr;
          gap:14px;
          align-content:start;
        }
        @media (min-width:640px){
          .services-list{ grid-template-columns:1fr 1fr; }
        }
        .service-item{
          display:flex;
          align-items:flex-start;
          gap:12px;
          background:#ffffff;
          border:1px solid var(--gray-200);
          border-radius:8px;
          padding:16px 18px;
          font-size:14px;
          line-height:1.5;
        }
        .service-check{
          flex-shrink:0;
          width:22px;
          height:22px;
          border-radius:50%;
          background:var(--brass);
          color:#FFFFFF;
          display:flex;
          align-items:center;
          justify-content:center;
          margin-top:1px;
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <h1 className="hero-title">
            Interiors Built Around How You Live and Work
          </h1>
          <p className="hero-copy">
            Yashmeen Future Building & Fit-Out Company is a Dubai-based interior
            fit-out contractor turning residential, commercial, and hospitality
            spaces across the UAE into places people genuinely want to be in.
          </p>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="about-section">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-image-frame">
              <img src="/static/about-us.webp" alt="" />
            </div>

            <div>
              <div className="eyebrow">
                <span className="eyebrow-bar" />
                About Us
              </div>
              <h2 className="about-heading">
                A Dubai fit-out company built on craft, not shortcuts.
              </h2>
              <p className="about-copy">
                Based in Business Bay, Dubai, Yashmeen Future Building & Fit-Out
                Company has partnered with homeowners, developers, and
                businesses across Dubai and Abu Dhabi to deliver interior
                fit-outs that hold up long after the final walkthrough. From
                first sketch to final handover, our in-house team of designers,
                engineers, and craftsmen manage every stage under one roof.
              </p>
              <p className="about-copy">
                We believe good interiors are equal parts imagination and
                precision - a balance we bring to every partition, finish, and
                fixture we install.
              </p>

              <div className="about-highlights">
                <div className="about-highlight">
                  <FiCheck size={16} /> ISO Certified Delivery
                </div>
                <div className="about-highlight">
                  <FiCheck size={16} /> In-House Craftsmen
                </div>
                <div className="about-highlight">
                  <FiCheck size={16} /> On-Time Handover
                </div>
                <div className="about-highlight">
                  <FiCheck size={16} /> Transparent Pricing
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
            <div className="eyebrow">
              <span className="eyebrow-bar" />
              What Drives Us
            </div>
            <h2 className="mv-heading">Mission &amp; Vision</h2>
          </div>

          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon-circle">
                <FiTarget size={22} strokeWidth={1.75} />
              </div>
              <h3 className="mv-card-title">Our Mission</h3>
              <p className="mv-card-copy">
                To deliver turnkey interior fit-outs that combine
                internationally recognised quality standards with honest pricing
                and dependable timelines - so every client, regardless of
                project size, gets a space finished the way it was promised.
              </p>
            </div>

            <div className="mv-card">
              <div className="mv-icon-circle">
                <FiEye size={22} strokeWidth={1.75} />
              </div>
              <h3 className="mv-card-title">Our Vision</h3>
              <p className="mv-card-copy">
                To be the UAE&rsquo;s most trusted interior fit-out partner -
                known not just for the spaces we build, but for how consistently
                we deliver on what we say we&rsquo;ll do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING / SERVICES */}
      <section className="services-section">
        <div className="wrap">
          <div className="services-grid">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-bar" />
                What We Offer
              </div>
              <h2 className="services-heading">
                Turning your imagination into reality.
              </h2>
              <p className="services-copy">
                Looking for a professional interior fit-out contractor in Dubai
                that can transform your dream into reality? Yashmeen Future
                Building & Fit-Out Company is here to address your imaginations.
              </p>
              <p className="services-copy">
                We are happy to offer interior fit-out services to Dubai, Abu
                Dhabi, and the surrounding region as expert interior fit-out
                contractors in the UAE. Our expert team provides exceptional
                service and focuses on delivering excellent quality with
                long-term results. Partitions, ceilings, flooring, furnishings,
                and MEP are often installed as part of our turnkey interior
                fit-out contracts, which are completed in accordance with
                internationally recognized ISO systems: ISO 9001:2015, ISO
                14001:2015, and ISO 45001:2015. Our staff can handle a wide
                range of projects of all sizes and specifications, and we can
                secure contracts for a variety of budgets by offering affordable
                costs and flexible payment plans. Whether you have an office, a
                retail store, a restaurant, a hotel, or a residence.
              </p>
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
    </div>
  );
}

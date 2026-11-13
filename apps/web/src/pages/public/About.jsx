import { FiCheck, FiTarget, FiEye } from "react-icons/fi";
import "../../styles/about.css";

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

export default function AboutPage() {
  return (
    <div className="page aboutpg-page">

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

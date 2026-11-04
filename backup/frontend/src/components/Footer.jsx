import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InteractiveBrandLettering from "./footer/InteractiveBrandLettering";
import "../styles/shell.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/projects" },
  { label: "Studio", href: "/about" },
  { label: "Process", href: "/#process" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const [dubaiTime, setDubaiTime] = useState("");
  const [isOpenOffice, setIsOpenOffice] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const hourFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          hour: "numeric",
          hour12: false,
        });
        const dayFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          weekday: "short",
        });

        const timeStr = timeFormatter.format(now);
        const hourNum = parseInt(hourFormatter.format(now), 10);
        const dayStr = dayFormatter.format(now);

        const open = dayStr !== "Sun" && hourNum >= 8 && hourNum < 18;
        setDubaiTime(timeStr);
        setIsOpenOffice(open);
      } catch {
        setDubaiTime("Dubai, UAE");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const openEnquiryModal = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="wrap">
        {/* Top 4-Column Index */}
        <div className="footer-top-grid">
          {/* Column 1: Navigation */}
          <div>
            <div className="footer-col-title">(NAVIGATION)</div>
            <nav className="footer-nav-list" aria-label="Footer Navigation">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} to={item.href} className="footer-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 2: Accreditations */}
          <div>
            <div className="footer-col-title">(ACCREDITATIONS)</div>
            <div className="footer-text-block">
              <p style={{ marginBottom: 10 }}>Dubai Municipality Approved Contractor</p>
              <p style={{ marginBottom: 10 }}>Dubai Civil Defence (DCD) Certified</p>
              <p style={{ marginBottom: 10 }}>Tecom, DCCA & DDA Approved Fit-Out</p>
              <p style={{ marginBottom: 10 }}>Nakheel & EMAAR Certified Delivery Partner</p>
              <p>ISO 9001:2015 Quality Management Certified</p>
            </div>
          </div>

          {/* Column 3: Info */}
          <div>
            <div className="footer-col-title">(INFO)</div>
            <div className="footer-info-item">
              <strong>A:</strong> Bay Square, Building 12, Office G01, Business Bay, Dubai, UAE
            </div>
            <div className="footer-info-item">
              <strong>E:</strong>{" "}
              <a href="mailto:info@yfbfitoutcontracting.com">info@yfbfitoutcontracting.com</a>
            </div>
            <div className="footer-info-item">
              <strong>P:</strong> <a href="tel:+971543862870">+971 54 386 2870</a>
            </div>
            <div className="footer-info-item" style={{ marginTop: 10, color: "var(--muted)" }}>
              <strong>H:</strong> Monday to Friday, 8:30am - 6:00pm
            </div>
          </div>

          {/* Column 4: Atelier Philosophy & CTA */}
          <div>
            <div className="footer-col-title">(OUR ATELIER)</div>
            <p className="footer-text-block" style={{ marginBottom: 20 }}>
              Operating an in-house 35,000 sq.ft Al Quoz manufacturing facility. One accountable
              contractor delivering turnkey architectural fit-out across Dubai and the UAE.
            </p>
            <button
              type="button"
              onClick={openEnquiryModal}
              className="btn-pill btn-pill-dark"
              style={{ padding: "0 20px" }}
            >
              <span>Tell us about your project</span>
              <span className="g-circle" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Cole Derochie Inspired Soft-Body Interactive Inflatable Brand Monument */}
        <InteractiveBrandLettering word="YASHMEEN" color="#080807" haloColor="#fcfcfc" />

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>© 2026 YASHMEEN FUTURE BUILDING &amp; FIT-OUT CONTRACTING L.L.C</div>

          <div className="footer-telemetry-clock">
            <span
              className={`footer-clock-dot ${isOpenOffice ? "is-open" : ""}`}
              aria-hidden="true"
            />
            <span>
              {dubaiTime} GST DUBAI, {isOpenOffice ? "ATELIER IS OPEN" : "ATELIER IS CLOSED"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/about" style={{ color: "var(--muted)" }}>
              Privacy Policy
            </Link>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)" }}
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)" }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InteractiveBrandLettering from "./InteractiveBrandLettering";
import MotionToggle from "./MotionToggle";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import { getDubaiAtelierStatus } from "../../lib/helpers";
import "../../styles/shell.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/projects" },
  { label: "Studio", href: "/about" },
  { label: "Process", href: "/#process" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Contact", href: "/contact" },
];
const INITIAL_ATELIER_STATUS = { dubaiTime: "Dubai time", isOpen: false };

export default function Footer() {
  const { content } = useWebsiteContent();
  const [atelierStatus, setAtelierStatus] = useState(INITIAL_ATELIER_STATUS);

  const addr = content?.address || {};
  const formattedAddress =
    [addr.street, addr.city, addr.country].filter(Boolean).join(", ") ||
    "Bay Square, Building 12, Office G01, Business Bay, Dubai, UAE";
  const email = content?.email || "info@yfbfitoutcontracting.com";
  const mobile = content?.mobile || "+971 54 386 2870";
  const workingHours = content?.workingHours || "Monday to Friday, 8:30am - 6:00pm";

  const socialLinks = content.socialLinks;

  useEffect(() => {
    const update = () => setAtelierStatus(getDubaiAtelierStatus(new Date(), content.openingHours));
    const raf = window.requestAnimationFrame(update);
    const interval = setInterval(update, 30000);
    return () => {
      window.cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [content.openingHours]);

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
{content.certifications.map((text, index) => <p key={index} style={{ marginBottom: index < content.certifications.length - 1 ? 10 : 0 }}>{text}</p>)}
            </div>
          </div>

          {/* Column 3: Info */}
          <div>
            <div className="footer-col-title">(INFO)</div>
            <div className="footer-info-item">
              <strong>A:</strong> {formattedAddress}
            </div>
            <div className="footer-info-item">
              <strong>E:</strong> <a href={`mailto:${email}`}>{email}</a>
            </div>
            <div className="footer-info-item">
              <strong>P:</strong> <a href={`tel:${mobile.replace(/\s+/g, "")}`}>{mobile}</a>
            </div>
            <div className="footer-info-item" style={{ marginTop: 10, color: "var(--muted)" }}>
              <strong>H:</strong> {workingHours}
            </div>
          </div>

          {/* Column 4: Atelier Philosophy & CTA */}
          <div>
            <div className="footer-col-title">(OUR ATELIER)</div>
            <p className="footer-text-block" style={{ marginBottom: 20 }}>
              {content.footer.atelierCopy}
            </p>
            <button
              type="button"
              onClick={openEnquiryModal}
              className="btn-pill btn-pill-dark"
              style={{ padding: "0 20px" }}
            >
              <span>{content.footer.ctaText}</span>
              <span className="g-circle" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Interactive Brand Monument */}
        <InteractiveBrandLettering word={content.footer.lettering} color="#080807" haloColor="#fcfcfc" />

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>{content.footer.copyright}</div>

          <div className="footer-telemetry-clock">
            <span
              className={`footer-clock-dot ${atelierStatus.isOpen ? "is-open" : ""}`}
              aria-hidden="true"
            />
            <span>
              {atelierStatus.dubaiTime} GST DUBAI,{" "}
              {atelierStatus.isOpen ? "ATELIER IS OPEN" : "ATELIER IS CLOSED"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <MotionToggle />
            <Link to="/privacy-policy" style={{ color: "var(--muted)" }}>
              Privacy Policy
            </Link>
            <button
              type="button"
              className="footer-cookie-preferences"
              onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-preferences"))}
            >
              Cookie Preferences
            </button>
            {socialLinks.map((soc, i) => (
              <a
                key={i}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--muted)", textTransform: "capitalize" }}
              >
                {soc.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

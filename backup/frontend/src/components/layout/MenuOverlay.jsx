import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import { getDubaiAtelierStatus } from "../../libs/helpers";

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Contact", href: "/contact" },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MenuOverlay({ open, onClose }) {
  const { content } = useWebsiteContent();
  const [status, setStatus] = useState(() => getDubaiAtelierStatus());
  const curtainRef = useRef(null);
  const closeBtnRef = useRef(null);

  const addr = content?.address || {};
  const streetLine = addr.street || "Bay Square, Building 12, Office G01";
  const cityCountry = [addr.city || "Dubai", addr.country || "UAE"].filter(Boolean).join(", ");
  const email = content?.email || "info@yfbfitoutcontracting.com";
  const mobile = content?.mobile || "+971 54 386 2870";
  const socialLinks =
    Array.isArray(content?.socialLinks) && content.socialLinks.length > 0
      ? content.socialLinks
      : [
          { platform: "Instagram", url: "https://www.instagram.com/yashmeenfuture" },
          { platform: "Facebook", url: "https://www.facebook.com/profile.php?id=61595342604561" },
          { platform: "YouTube", url: "https://www.youtube.com/@YashmeenFuture" },
        ];

  useEffect(() => {
    const update = () => setStatus(getDubaiAtelierStatus());
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";
    let rafId2 = 0;
    const rafId = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        closeBtnRef.current?.focus({ preventScroll: true });
      });
    });

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(true);
        return;
      }

      if (e.key === "Tab" && curtainRef.current) {
        const focusables = Array.from(
          curtainRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || getComputedStyle(el).position === "fixed");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      if (rafId2) cancelAnimationFrame(rafId2);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleOpenEnquiry = () => {
    onClose(false);
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("open-questionnaire"));
    });
  };

  return (
    <div
      id="site-menu-curtain"
      ref={curtainRef}
      className={`menu-curtain ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      aria-hidden={!open}
      inert={!open}
    >
      {/* Top Header */}
      <div className="menu-curtain-top">
        <Link to="/" className="menu-curtain-brand" onClick={() => onClose(false)}>
          YASHMEEN
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="menu-curtain-close"
            style={{ background: "#ffffff", color: "#080807", borderColor: "#ffffff" }}
            onClick={handleOpenEnquiry}
          >
            GET IN TOUCH
          </button>
          <button
            ref={closeBtnRef}
            type="button"
            className="menu-curtain-close"
            onClick={() => onClose(true)}
            aria-label="Close Navigation Menu"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Center Links */}
      <div className="menu-curtain-body wrap">
        <nav className="menu-curtain-nav" aria-label="Curtain Menu Links">
          {MENU_ITEMS.map((item, idx) => (
            <div key={item.href} className="menu-curtain-item">
              <Link
                to={item.href}
                className="menu-curtain-link"
                onClick={() => onClose(false)}
                style={{
                  transitionDelay: open ? `${0.2 + idx * 0.06}s` : "0s",
                }}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Telemetry & Socials */}
      <div className="menu-curtain-bottom wrap">
        <div>
          <div className="menu-curtain-title">TELEMETRY</div>
          <div>{status.dubaiTime} GST</div>
          <div style={{ color: status.isOpen ? "#4caf50" : "rgba(255,255,255,0.65)", marginTop: 4 }}>
            {status.isOpen ? "Atelier is Open" : "Atelier is Closed"}
          </div>
        </div>

        <div>
          <div className="menu-curtain-title">DIRECT ENQUIRY</div>
          <div>
            <a href={`tel:${mobile.replace(/\s+/g, "")}`}>{mobile}</a>
          </div>
          <div>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        </div>

        <div>
          <div className="menu-curtain-title">ATELIER &amp; FACILITY</div>
          <div>{streetLine}</div>
          <div>{cityCountry}</div>
        </div>

        <div>
          <div className="menu-curtain-title">INDEX</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {socialLinks.map((soc, i) => (
              <a
                key={i}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textTransform: "capitalize" }}
              >
                {soc.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

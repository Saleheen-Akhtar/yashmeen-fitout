import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/projects" },
  { label: "Studio", href: "/about" },
  { label: "Process", href: "/#process" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Contact", href: "/contact" },
];

export default function MenuOverlay({ open, onClose }) {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={`menu-curtain ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Top Header */}
      <div className="menu-curtain-top">
        <Link to="/" className="menu-curtain-brand" onClick={onClose}>
          YASHMEEN
        </Link>
        <button
          type="button"
          className="menu-curtain-close"
          onClick={onClose}
          aria-label="Close Navigation Menu"
        >
          CLOSE
        </button>
      </div>

      {/* Center Links */}
      <div className="menu-curtain-body wrap">
        <nav className="menu-curtain-nav">
          {MENU_ITEMS.map((item, idx) => (
            <Link
              key={item.href}
              to={item.href}
              className="menu-curtain-link"
              onClick={onClose}
              style={{ transitionDelay: `${idx * 0.04}s` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Telemetry & Socials */}
      <div className="menu-curtain-bottom wrap">
        <div>
          <div className="menu-curtain-title">TELEMETRY</div>
          <div>{dubaiTime} GST</div>
          <div style={{ color: isOpenOffice ? "#4caf50" : "rgba(255,255,255,0.5)", marginTop: 4 }}>
            {isOpenOffice ? "Atelier is Open" : "Atelier is Closed"}
          </div>
        </div>

        <div>
          <div className="menu-curtain-title">DIRECT ENQUIRY</div>
          <div>
            <a href="tel:+971543862870">+971 54 386 2870</a>
          </div>
          <div>
            <a href="mailto:info@yfbfitoutcontracting.com">info@yfbfitoutcontracting.com</a>
          </div>
        </div>

        <div>
          <div className="menu-curtain-title">ATELIER & FACILITY</div>
          <div>Bay Square, Building 12, Office G01</div>
          <div>Business Bay, Dubai, UAE</div>
        </div>

        <div>
          <div className="menu-curtain-title">INDEX</div>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

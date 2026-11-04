import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useWebDetails from "../hooks/cacheStore";
import "../styles/shell.css";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  {
    label: "About",
    path: "/about",
    dropdown: [
      { label: "About Us", path: "/about" },
      { label: "Founders Message", path: "/founders-message" },
      { label: "Why Us", path: "/why-us" },
      { label: "FAQ", path: "/faq" },
      { label: "Careers", path: "/careers" },
    ],
  },
  {
    label: "Services",
    path: "/services",
    dropdown: [
      { label: "Architecture", path: "/services/architecture" },
      { label: "Interior Design", path: "/services/interior-design" },
      { label: "Construction", path: "/services/construction" },
      { label: "Office Renovation", path: "/services/office-renovation" },
    ],
  },
  {
    label: "Gallery",
    path: "/gallery",
    dropdown: [
      { label: "Photo Gallery", path: "/photo-gallery" },
      { label: "Video Gallery", path: "/video-gallery" },
    ],
  },
  { label: "Projects", path: "/projects" },
  { label: "Contact", path: "/contact" },
];

const FALLBACK_MOBILE = "+971 54 386 2870";
const WHATSAPP_NUMBER = "971543862870";
const WHATSAPP_MESSAGE =
  "Hello, I would like to enquire about your fit-out and interior services.";

function formatPhone(num) {
  if (!num) return FALLBACK_MOBILE;
  const c = String(num).trim();
  return c === "+971543862870" || c === "971543862870" ? FALLBACK_MOBILE : c;
}

function Chevron({ open }) {
  return (
    <svg className={`hd-chev${open ? " is-open" : ""}`} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1 3.5 5 7l4-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const details = useWebDetails();
  const rawMobile = details?.mobile || FALLBACK_MOBILE;
  const phone = formatPhone(rawMobile);
  const tel = `tel:${rawMobile.replace(/\s+/g, "")}`;

  const [menuOpen, setMenuOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ref = useRef(null);
  const { pathname } = useLocation();

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setOpenKey(null);
  }

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenKey(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenKey(null);
        setMenuOpen(false);
      }
    };
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > 240 && y > lastY.current + 2);
      if (y < lastY.current - 2) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggle = (label) => setOpenKey((k) => (k === label ? null : label));

  return (
    <>
      <header ref={ref} className={`hd${scrolled ? " is-scrolled" : ""}${hidden && !menuOpen && !openKey ? " is-hidden" : ""}`}>
        <div className="hd-inner">
          <Link to="/" className="hd-logo" aria-label="Yashmeen Future Building, home">
            <img src="/static/logo.jpg" alt="Yashmeen Future Building" />
          </Link>

          <nav className="hd-nav" aria-label="Main">
            {NAV_ITEMS.map((item) =>
              item.dropdown ? (
                <div className="hd-item" key={item.label}>
                  <button
                    type="button"
                    className="hd-link"
                    aria-expanded={openKey === item.label}
                    aria-haspopup="true"
                    onClick={() => toggle(item.label)}
                  >
                    {item.label}
                    <Chevron open={openKey === item.label} />
                  </button>
                  {openKey === item.label && (
                    <ul className="hd-drop">
                      {item.dropdown.map((d) => (
                        <li key={d.path}>
                          <NavLink to={d.path} end className="hd-drop-link">
                            {d.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink key={item.path} to={item.path} end className="hd-link">
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="hd-actions">
            <a href={tel} className="hd-phone" aria-label={`Call ${phone}`}>
              {phone}
            </a>
            <Link to="/quote" className="btn btn-primary hd-cta">
              Get a quote
            </Link>
            <button
              type="button"
              className="hd-burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className={`hd-burger-bars${menuOpen ? " is-open" : ""}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="hd-mobile" data-lenis-prevent>
            <nav aria-label="Mobile">
              {NAV_ITEMS.map((item) =>
                item.dropdown ? (
                  <div key={item.label} className="hd-m-group">
                    <button
                      type="button"
                      className="hd-m-link"
                      aria-expanded={openKey === item.label}
                      onClick={() => toggle(item.label)}
                    >
                      {item.label}
                      <Chevron open={openKey === item.label} />
                    </button>
                    {openKey === item.label && (
                      <ul className="hd-m-sub">
                        {item.dropdown.map((d) => (
                          <li key={d.path}>
                            <NavLink to={d.path} end className="hd-m-sublink">
                              {d.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink key={item.path} to={item.path} end className="hd-m-link">
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>
            <div className="hd-m-foot">
              <Link to="/quote" className="btn btn-primary">Get a quote</Link>
              <a href={tel} className="btn btn-outline">Call {phone}</a>
            </div>
          </div>
        )}
      </header>

      <a
        className="wa-fab"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <path fill="#25D366" d="M16 3C9.1 3 3.5 8.6 3.5 15.5c0 2.4.65 4.6 1.78 6.46L3 29l7.2-2.25A12.4 12.4 0 0 0 16 28c6.9 0 12.5-5.6 12.5-12.5S22.9 3 16 3Z" />
          <path fill="#fff" d="M21.6 18.15c-.31-.16-1.83-.9-2.12-1-.28-.1-.49-.16-.7.16-.2.3-.8 1-.98 1.2-.18.2-.36.23-.67.08-.31-.16-1.31-.48-2.5-1.54-.92-.82-1.54-1.84-1.73-2.15-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.16-.18.2-.31.31-.52.1-.2.05-.39-.03-.54-.08-.16-.7-1.68-.95-2.3-.25-.6-.5-.52-.7-.53h-.6c-.2 0-.54.08-.83.39-.28.31-1.08 1.06-1.08 2.58 0 1.53 1.1 3 1.27 3.2.15.2 2.19 3.34 5.3 4.69.74.32 1.32.5 1.77.66.75.24 1.42.2 1.96.12.6-.09 1.83-.75 2.09-1.47.26-.73.26-1.35.18-1.48-.08-.13-.28-.2-.6-.36Z" />
        </svg>
      </a>
    </>
  );
}

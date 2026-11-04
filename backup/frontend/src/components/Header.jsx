import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import MenuOverlay from "./layout/MenuOverlay";
import QuestionnaireModal from "./layout/QuestionnaireModal";
import "../styles/shell.css";

const NAV_LINKS = [
  { label: "Works", href: "/projects" },
  { label: "Studio", href: "/about" },
  { label: "Process", href: "/#process" },
  { label: "Gallery", href: "/photo-gallery" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { pathname } = useLocation();

  // Reset overlay on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Listen for global open-questionnaire events from CTAs across the site
  useEffect(() => {
    const handleOpenEnquiry = () => setQuestionnaireOpen(true);
    window.addEventListener("open-questionnaire", handleOpenEnquiry);
    return () => window.removeEventListener("open-questionnaire", handleOpenEnquiry);
  }, []);

  // Scroll detection for floating bar
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y > 200 && y > lastY.current + 6) {
        setHidden(true);
      } else if (y < lastY.current - 4) {
        setHidden(false);
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}
      >
        <div className="site-header-inner">
          {/* Brand Left */}
          <Link to="/" className="site-brand" aria-label="Yashmeen Future Building Homepage">
            <span className="site-brand-text">YASHMEEN</span>
            <span className="site-brand-city">DUBAI</span>
          </Link>

          {/* Center Links with comma separation */}
          <nav className="site-nav-center" aria-label="Primary Navigation">
            {NAV_LINKS.map((item, idx) => (
              <span key={item.href} style={{ display: "inline-flex", alignItems: "center" }}>
                <Link
                  to={item.href}
                  className={`site-nav-link ${pathname === item.href ? "active" : ""}`}
                >
                  {item.label}
                </Link>
                {idx < NAV_LINKS.length - 1 && <span className="site-nav-sep">,</span>}
              </span>
            ))}
          </nav>

          {/* Right Action Pills */}
          <div className="site-header-actions">
            <button
              type="button"
              className="header-btn-enquire"
              onClick={() => setQuestionnaireOpen(true)}
              aria-label="Open Project Enquiry Questionnaire"
            >
              <span>Get in touch</span>
              <span className="g-circle" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="header-btn-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Curtain Menu Overlay */}
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* 8-Step Project Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={questionnaireOpen}
        onClose={() => setQuestionnaireOpen(false)}
      />
    </>
  );
}

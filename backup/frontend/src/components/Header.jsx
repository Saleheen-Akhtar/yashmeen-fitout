import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import MenuOverlay from "./layout/MenuOverlay";
import QuestionnaireModal from "./layout/QuestionnaireModal";
import useWebsiteContent from "../hooks/useWebsiteContent";
import "../styles/shell.css";

const NAV_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { content } = useWebsiteContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { pathname } = useLocation();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  // Listen for global open-questionnaire and open-menu events
  useEffect(() => {
    const handleOpenEnquiry = () => setQuestionnaireOpen(true);
    const handleOpenMenu = () => setMenuOpen(true);
    window.addEventListener("open-questionnaire", handleOpenEnquiry);
    window.addEventListener("open-menu", handleOpenMenu);
    return () => {
      window.removeEventListener("open-questionnaire", handleOpenEnquiry);
      window.removeEventListener("open-menu", handleOpenMenu);
    };
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

  const isHomePage = pathname === "/";
  const isLightHeaderPage = pathname === "/photo-gallery" || pathname === "/gallery";

  return (
    <>
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""} ${isHomePage ? "is-homepage" : ""} ${isHomePage && !scrolled ? "is-homepage-top" : ""} ${isLightHeaderPage ? "is-light-page" : ""}`}
      >
        <div className="site-header-inner">
          {/* Brand Left */}
          <Link to="/" className="site-brand" aria-label="Yashmeen Future Building Homepage">
            <span className="site-brand-text">{content?.brandName || "YASHMEEN FIT-OUT"}</span>
            <span className="site-brand-city">{content?.cityLabel || "DUBAI"}</span>
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

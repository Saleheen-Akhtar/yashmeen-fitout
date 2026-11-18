import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MenuOverlay from "./MenuOverlay";
import QuestionnaireModal from "./QuestionnaireModal";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import "../../styles/shell.css";

const NAV_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { content } = useWebsiteContent();
  const servicesMenu = content.services.filter(service => service.active !== false).map(service => ({ label: service.menuLabel || service.title, href: service.route }));
  const { pathname } = useLocation();
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const lastFocusRef = useRef(null);
  const servicesTriggerRef = useRef(null);

  const menuOpen = menuState.open && menuState.path === pathname;

  const captureFocus = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      lastFocusRef.current = active;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const target = lastFocusRef.current;
    lastFocusRef.current = null;
    if (target && target.isConnected) {
      requestAnimationFrame(() => target.focus());
    }
  }, []);

  const openMenu = useCallback(() => {
    captureFocus();
    setMenuState({ open: true, path: pathname });
  }, [captureFocus, pathname]);

  const closeMenu = useCallback(
    (shouldRestoreFocus = true) => {
      setMenuState((prev) => ({ ...prev, open: false }));
      if (shouldRestoreFocus) restoreFocus();
    },
    [restoreFocus]
  );

  const openQuestionnaire = useCallback(() => {
    captureFocus();
    setQuestionnaireOpen(true);
  }, [captureFocus]);

  const closeQuestionnaire = useCallback(() => {
    setQuestionnaireOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  // Listen for global open-questionnaire and open-menu events
  useEffect(() => {
    const handleOpenEnquiry = () => openQuestionnaire();
    const handleOpenMenu = () => openMenu();
    window.addEventListener("open-questionnaire", handleOpenEnquiry);
    window.addEventListener("open-menu", handleOpenMenu);
    return () => {
      window.removeEventListener("open-questionnaire", handleOpenEnquiry);
      window.removeEventListener("open-menu", handleOpenMenu);
    };
  }, [openMenu, openQuestionnaire]);

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
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${hidden && !menuOpen && !questionnaireOpen ? "is-hidden" : ""}`}
      >
        <div className="site-header-inner">
          {/* Brand Left */}
          <Link
            to="/"
            className="site-brand"
            aria-label={`${content?.brandName || "YASHMEEN FIT-OUT"} ${content?.cityLabel || "DUBAI"} Homepage`}
          >
            <span className="site-brand-text">{content?.brandName || "YASHMEEN FIT-OUT"}</span>
            <span className="site-brand-city">{content?.cityLabel || "DUBAI"}</span>
          </Link>

          {/* Center Links with comma separation & Services dropdown */}
          <nav className="site-nav-center" aria-label="Primary Navigation">
            {NAV_LINKS.filter(item => item.label !== 'Services' || servicesMenu.length).map((item, idx) => {
              const isServices = item.label === "Services";
              const isActive = isServices
                ? pathname.startsWith("/services")
                : pathname === item.href || (item.href === "/projects" && pathname.startsWith("/project/"));

              return (
                <span key={item.href} className="site-nav-item">
                  {isServices ? (
                    <div
                      className="nav-dropdown-wrapper"
                      onMouseEnter={() => setServicesOpen(true)}
                      onMouseLeave={() => setServicesOpen(false)}
                      onFocusCapture={() => setServicesOpen(true)}
                      onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setServicesOpen(false);
                          servicesTriggerRef.current?.focus();
                        }
                      }}
                    >
                      <Link
                        ref={servicesTriggerRef}
                        to={item.href}
                        className={`site-nav-link ${isActive ? "active" : ""}`}
                        aria-expanded={servicesOpen}
                        aria-haspopup="true"
                        aria-controls="services-navigation-menu"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setServicesOpen(false)}
                      >
                        {item.label}
                      </Link>
                      <div
                        id="services-navigation-menu"
                        className={`nav-dropdown-menu ${servicesOpen ? "is-open" : ""}`}
                        role="menu"
                        aria-label="Services Submenu"
                      >
                        {servicesMenu.map((srv) => (
                          <Link
                            key={srv.href}
                            to={srv.href}
                            className="nav-dropdown-item"
                            role="menuitem"
                            onClick={() => setServicesOpen(false)}
                          >
                            {srv.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`site-nav-link ${isActive ? "active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  )}
                  {idx < NAV_LINKS.length - 1 && <span className="site-nav-sep">,</span>}
                </span>
              );
            })}
          </nav>

          {/* Right Action Pills */}
          <div className="site-header-actions">
            <button
              type="button"
              className="header-btn-enquire"
              onClick={openQuestionnaire}
              aria-label="Get in touch - Open Project Enquiry Questionnaire"
            >
              <span>Get in touch</span>
            </button>

            <button
              type="button"
              className="header-btn-menu"
              onClick={openMenu}
              aria-expanded={menuOpen}
              aria-controls="site-menu-curtain"
              aria-label="Menu - Open Navigation Menu"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Curtain Menu Overlay */}
      <MenuOverlay open={menuOpen} onClose={closeMenu} />

      {/* 8-Step Project Questionnaire Modal */}
      <QuestionnaireModal isOpen={questionnaireOpen} onClose={closeQuestionnaire} />
    </>
  );
}

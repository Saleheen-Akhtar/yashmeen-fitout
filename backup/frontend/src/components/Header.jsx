import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useWebDetails from "../hooks/cacheStore";

const COLORS = {
  navy: "#131b2a",
  navyDark: "#0c121d",
  gold: "#c5a059",
  goldLight: "#dfba73",
  goldDim: "#9e7d38",
  text: "#17140f",
  textMuted: "#5e584f",
  white: "#ffffff",
  border: "rgba(23, 20, 15, 0.08)",
  whatsapp: "#25D366",
};

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

const ENQUIRE_PATH = "/quote";
const WHATSAPP_NUMBER = "+971543862870";
const WHATSAPP_MESSAGE = "Hello, I would like to enquire about your luxury fit-out and interior architecture services.";
const FALLBACK_MOBILE = "+971 54 386 2870";

function formatPhoneNumber(num) {
  if (!num) return "+971 54 386 2870";
  const cleaned = String(num).trim();
  if (cleaned === "+971543862870" || cleaned === "971543862870") {
    return "+971 54 386 2870";
  }
  return cleaned;
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      style={{
        marginLeft: 6,
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        flexShrink: 0,
        opacity: 0.7,
      }}
    >
      <path
        d="M1 3.5 L5 7 L9 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScrollTopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 19V5M12 5L5 12M12 5L19 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path
        d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.36.65 4.566 1.782 6.455L3 29l7.207-2.25A12.44 12.44 0 0 0 16.001 28C22.905 28 28.5 22.404 28.5 15.5S22.905 3 16.001 3Z"
        fill={COLORS.whatsapp}
      />
      <path
        d="M21.6 18.15c-.31-.156-1.833-.905-2.117-1.008-.284-.104-.49-.156-.697.156-.207.311-.8 1.008-.982 1.215-.181.207-.362.233-.673.078-.31-.156-1.31-.483-2.496-1.54-.923-.823-1.546-1.84-1.728-2.151-.181-.311-.02-.48.136-.635.14-.14.31-.362.465-.544.155-.181.207-.311.31-.518.104-.207.052-.389-.026-.545-.078-.156-.697-1.68-.955-2.302-.252-.605-.507-.523-.697-.533l-.593-.01c-.207 0-.544.078-.828.389-.284.311-1.086 1.06-1.086 2.585 0 1.526 1.112 3 1.267 3.207.155.207 2.19 3.343 5.306 4.688.741.32 1.319.512 1.77.655.744.237 1.42.203 1.955.123.596-.089 1.833-.75 2.092-1.474.259-.724.259-1.345.181-1.474-.077-.13-.284-.207-.594-.363Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function Header() {
  const details = useWebDetails();
  const rawMobile = details?.mobile || FALLBACK_MOBILE;
  const mobileDisplay = formatPhoneNumber(rawMobile);
  const mobileTel = `tel:${rawMobile.replace(/\s+/g, "")}`;

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 980);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
      setOpenMobileDropdown(null);
    }
  }, [isMobile]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 320);
      setScrolled(window.scrollY > 15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const styles = {
    wrapper: {
      width: "100%",
      background: scrolled ? "rgba(255, 255, 255, 0.96)" : "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${scrolled ? "rgba(23, 20, 15, 0.08)" : "rgba(23, 20, 15, 0.05)"}`,
      boxSizing: "border-box",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: scrolled ? "0 10px 30px -10px rgba(17, 24, 39, 0.08)" : "none",
      transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    },
    inner: {
      maxWidth: 1360,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "10px 20px" : "12px 32px",
      boxSizing: "border-box",
    },
    logoBlock: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      cursor: "pointer",
      flexShrink: 0,
      textDecoration: "none",
    },
    logoImg: {
      height: 48,
      width: "auto",
      display: "block",
    },
    nav: {
      display: "flex",
      alignItems: "center",
      gap: 30,
    },
    navItemWrap: {
      position: "relative",
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 14.5,
      fontWeight: 500,
      color: COLORS.text,
      padding: "8px 0",
      whiteSpace: "nowrap",
      transition: "color 0.2s ease",
    },
    navLinkAnchor: {
      color: "inherit",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
    },
    navChevronBtn: {
      display: "flex",
      alignItems: "center",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "inherit",
      padding: "8px 0 8px 4px",
    },
    dropdownPanel: {
      position: "absolute",
      top: "100%",
      left: -8,
      minWidth: 210,
      background: "#ffffff",
      boxShadow: "0 20px 40px -10px rgba(17, 24, 39, 0.14), 0 0 0 1px rgba(23, 20, 15, 0.06)",
      borderRadius: 8,
      padding: "8px 0",
      marginTop: 8,
      zIndex: 1010,
      animation: "dropdownFadeIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
    },
    dropdownItem: {
      display: "block",
      width: "100%",
      textAlign: "left",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "10px 20px",
      fontSize: 13.5,
      fontWeight: 500,
      color: COLORS.textMuted,
      textDecoration: "none",
      boxSizing: "border-box",
      transition: "all 0.15s ease",
    },
    rightBlock: {
      display: "flex",
      alignItems: "center",
      gap: 24,
      flexShrink: 0,
    },
    callBlock: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.25,
      textDecoration: "none",
    },
    callLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: COLORS.goldDim,
    },
    callNumber: {
      fontSize: 14.5,
      fontWeight: 700,
      color: COLORS.navy,
      letterSpacing: 0.2,
      marginTop: 2,
    },
    enquireBtn: {
      background: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold})`,
      color: COLORS.white,
      border: "none",
      borderRadius: 6,
      padding: "12px 22px",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "pointer",
      whiteSpace: "nowrap",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      boxShadow: "0 6px 18px rgba(197, 160, 89, 0.3)",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
    },
    hamburger: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 5,
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 8,
    },
    hamburgerBar: {
      width: 24,
      height: 2,
      background: COLORS.navy,
      transition: "all 0.25s ease",
      transformOrigin: "center",
    },
    mobilePanel: {
      maxHeight: menuOpen ? "calc(100vh - 70px)" : 0,
      overflowY: menuOpen ? "auto" : "hidden",
      overflowX: "hidden",
      transition: "max-height 0.3s ease",
      background: COLORS.white,
      borderTop: menuOpen ? `1px solid ${COLORS.border}` : "none",
    },
    mobileNavLink: {
      width: "100%",
      textAlign: "left",
      background: "none",
      border: "none",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "15px 20px",
      fontSize: 15,
      fontWeight: 500,
      color: COLORS.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      textDecoration: "none",
      boxSizing: "border-box",
    },
    mobileDropdownPanel: {
      background: "#faf8f4",
    },
    mobileDropdownItem: {
      display: "block",
      width: "100%",
      textAlign: "left",
      background: "none",
      border: "none",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "12px 34px",
      fontSize: 14,
      color: COLORS.textMuted,
      cursor: "pointer",
      textDecoration: "none",
      boxSizing: "border-box",
    },
    mobileCallRow: {
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
      borderBottom: `1px solid ${COLORS.border}`,
      textDecoration: "none",
    },
    mobileEnquireBtn: {
      display: "block",
      width: "calc(100% - 40px)",
      margin: "16px 20px",
      background: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold})`,
      color: COLORS.white,
      border: "none",
      borderRadius: 6,
      padding: "14px 0",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "pointer",
      textAlign: "center",
      textDecoration: "none",
      boxSizing: "border-box",
      boxShadow: "0 6px 18px rgba(197, 160, 89, 0.3)",
    },
    scrollTopBtn: {
      position: "fixed",
      right: 24,
      bottom: 24,
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: COLORS.navy,
      color: COLORS.white,
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 8px 22px rgba(16,26,48,0.35)",
      zIndex: 1200,
      opacity: showScrollTop ? 1 : 0,
      visibility: showScrollTop ? "visible" : "hidden",
      transform: showScrollTop ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.25s ease, transform 0.25s ease, visibility 0.25s",
    },
    whatsappBtn: {
      position: "fixed",
      left: 24,
      bottom: 24,
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: COLORS.whatsapp,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 24px rgba(37,211,102,0.45)",
      zIndex: 1200,
      textDecoration: "none",
      transition: "transform 0.25s ease",
    },
  };

  return (
    <>
      <header style={styles.wrapper} ref={headerRef}>
        <div style={styles.inner}>
          {/* Logo */}
          <Link to="/" style={styles.logoBlock} aria-label="Yashmeen Future Building Home">
            <img src="/static/logo.jpg" alt="Yashmeen Future Building" style={styles.logoImg} />
          </Link>

          {/* Desktop Nav */}
          {!isMobile && (
            <nav style={styles.nav} aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => {
                const hasChildren = !!item.dropdown;
                const isOpen = openDropdown === item.label;

                return (
                  <div
                    key={item.label}
                    style={styles.navItemWrap}
                    onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    <div style={styles.navLink}>
                      <Link
                        to={item.path}
                        style={{
                          ...styles.navLinkAnchor,
                          color: isOpen ? COLORS.gold : COLORS.text,
                        }}
                      >
                        {item.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          style={{
                            ...styles.navChevronBtn,
                            color: isOpen ? COLORS.gold : COLORS.text,
                          }}
                          onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                          aria-expanded={isOpen}
                          aria-label={`Toggle ${item.label} sub-menu`}
                        >
                          <ChevronIcon open={isOpen} />
                        </button>
                      )}
                    </div>

                    {hasChildren && isOpen && (
                      <div style={styles.dropdownPanel} role="menu">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            style={styles.dropdownItem}
                            role="menuitem"
                            onClick={() => setOpenDropdown(null)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = COLORS.navy;
                              e.currentTarget.style.background = "#faf8f4";
                              e.currentTarget.style.paddingLeft = "24px";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = COLORS.textMuted;
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.paddingLeft = "20px";
                            }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {/* Right: Phone & CTA */}
          <div style={styles.rightBlock}>
            {!isMobile && (
              <a href={mobileTel} style={styles.callBlock} aria-label="Call studio direct">
                <span style={styles.callLabel}>Call the Studio</span>
                <span style={styles.callNumber}>{mobileDisplay}</span>
              </a>
            )}

            <Link
              to={ENQUIRE_PATH}
              style={styles.enquireBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(197, 160, 89, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(197, 160, 89, 0.3)";
              }}
            >
              Get a Quote
            </Link>

            {isMobile && (
              <button
                type="button"
                style={styles.hamburger}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                <span
                  style={{
                    ...styles.hamburgerBar,
                    transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                  }}
                />
                <span
                  style={{
                    ...styles.hamburgerBar,
                    opacity: menuOpen ? 0 : 1,
                  }}
                />
                <span
                  style={{
                    ...styles.hamburgerBar,
                    transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                  }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobile && (
          <div style={styles.mobilePanel}>
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.dropdown;
              const isOpen = openMobileDropdown === item.label;

              return (
                <div key={item.label}>
                  <div style={styles.mobileNavLink}>
                    <Link
                      to={item.path}
                      style={{ color: "inherit", textDecoration: "none", flexGrow: 1 }}
                      onClick={() => !hasChildren && setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        style={{ background: "none", border: "none", padding: "6px" }}
                        onClick={() => setOpenMobileDropdown(isOpen ? null : item.label)}
                        aria-label={`Toggle ${item.label}`}
                      >
                        <ChevronIcon open={isOpen} />
                      </button>
                    )}
                  </div>
                  {hasChildren && isOpen && (
                    <div style={styles.mobileDropdownPanel}>
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          style={styles.mobileDropdownItem}
                          onClick={() => {
                            setMenuOpen(false);
                            setOpenMobileDropdown(null);
                          }}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <a href={mobileTel} style={styles.mobileCallRow}>
              <span style={styles.callLabel}>Call the Studio</span>
              <span style={styles.callNumber}>{mobileDisplay}</span>
            </a>

            <Link
              to={ENQUIRE_PATH}
              style={styles.mobileEnquireBtn}
              onClick={() => setMenuOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        )}
      </header>

      {/* Floating Action Buttons */}
      <button
        type="button"
        style={styles.scrollTopBtn}
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
      >
        <ScrollTopIcon />
      </button>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
          WHATSAPP_MESSAGE
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.whatsappBtn}
        aria-label="Chat on WhatsApp with Yashmeen Future Building"
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <WhatsAppIcon />
      </a>
    </>
  );
}

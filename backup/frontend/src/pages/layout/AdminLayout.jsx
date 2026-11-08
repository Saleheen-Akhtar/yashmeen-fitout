import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import useCreateStore from "../../store";
import { getInitials } from "../../libs/helpers";
import { FiExternalLink, FiLogOut, FiMenu, FiX, FiCheck } from "react-icons/fi";
import "../../styles/admin-architectural.css";

const NAV_TABS = [
  { label: "01 · ATELIER COMMAND", path: "/dashboard" },
  { label: "02 · QUOTES", path: "/dashboard/quotes" },
  { label: "03 · INQUIRIES", path: "/dashboard/enquiry" },
  { label: "04 · PROJECTS", path: "/dashboard/project-manager" },
  { label: "05 · JOURNAL", path: "/dashboard/blog-manager" },
  { label: "06 · GALLERY", path: "/dashboard/gallery-manager" },
  { label: "07 · VIDEO", path: "/dashboard/video-manager" },
  { label: "08 · POPUP & BANNER", path: "/dashboard/popup-manager" },
  { label: "09 · CATEGORIES", path: "/dashboard/categories" },
];

export default function AdminLayout() {
  const [dubaiTime, setDubaiTime] = useState("");
  const [isOpenOffice, setIsOpenOffice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useCreateStore();

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
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveTab = (tabPath) => {
    if (tabPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <div className="admin-shell-container" style={styles.shell}>
      {/* ====================================================================
          TOP ARCHITECTURAL COMMAND BAR (Matches Website Vibe - No Generic Sidebar!)
          ==================================================================== */}
      <header
        style={{
          ...styles.header,
          boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.06)" : "none",
        }}
      >
        <div style={styles.headerInner}>
          {/* Brand Left */}
          <div style={styles.brandGroup}>
            <Link to="/" style={styles.brandLink}>
              <span style={styles.brandText}>YASHMEEN FIT-OUT</span>
              <span style={styles.brandCity}>DUBAI</span>
            </Link>
            <div style={styles.verticalSep}></div>
            <span style={styles.consoleTag}>(ADMIN ATELIER · 01)</span>
          </div>

          {/* Center Telemetry & Proof (Desktop) */}
          <div style={styles.telemetryGroup}>
            <div style={styles.telemetryPill}>
              <span
                style={{
                  ...styles.telemetryDot,
                  background: isOpenOffice ? "#000000" : "#777777",
                }}
              />
              <span>DUBAI {dubaiTime} GST</span>
              <span style={styles.telemetrySep}>·</span>
              <span style={{ fontWeight: 800 }}>
                {isOpenOffice ? "ATELIER OPEN" : "STUDIO MODE"}
              </span>
            </div>
          </div>

          {/* Actions Right */}
          <div style={styles.actionsRight}>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnPublicSite}
            >
              <span>VIEW PUBLIC SITE</span>
              <FiExternalLink size={12} />
            </Link>

            <div style={styles.userBadge}>
              <div style={styles.userAvatar}>
                {getInitials(user?.name || "Admin")}
              </div>
              <span style={styles.userName}>{user?.name || "Director"}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.btnLogout}
              title="Sign Out"
            >
              <FiLogOut size={14} />
              <span style={styles.logoutText}>SIGN OUT</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={styles.mobileToggle}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Second Row: Architectural Command Navigation Tabs Strip */}
        <div style={styles.navStrip}>
          <div style={styles.navStripInner}>
            <nav style={styles.navTrack} aria-label="Atelier Navigation">
              {NAV_TABS.map((tab) => {
                const active = isActiveTab(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    style={{
                      ...styles.navPill,
                      ...(active ? styles.navPillActive : {}),
                    }}
                  >
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={styles.mobileNavOverlay}>
            <div style={styles.mobileNavContent}>
              <div style={styles.mobileNavHeader}>
                <span style={styles.mobileNavTitle}>ATELIER NAVIGATION</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={styles.mobileNavClose}
                >
                  <FiX size={18} />
                </button>
              </div>
              <div style={styles.mobileNavLinks}>
                {NAV_TABS.map((tab) => {
                  const active = isActiveTab(tab.path);
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        ...styles.mobileNavLink,
                        ...(active ? styles.mobileNavLinkActive : {}),
                      }}
                    >
                      <span>{tab.label}</span>
                      {active && <FiCheck size={14} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          EXPANSIVE 12-COLUMN CAD GRID WORKSPACE (NO COMMON SIDEBAR!)
          ==================================================================== */}
      <main style={styles.mainWorkspace}>
        <Outlet />
      </main>

      {/* ====================================================================
          ARCHITECTURAL MONOLITHIC FOOTER (Exact Website Vibe)
          ==================================================================== */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrandCol}>
            <div style={styles.footerBrandTitle}>YASHMEEN FIT-OUT</div>
            <div style={styles.footerBrandSub}>DUBAI · DESIGN · ENGINEERING · ATELIER</div>
          </div>
          <div style={styles.footerMetaCol}>
            <div>AL QUOZ INDUSTRIAL AREA 4, DUBAI, UAE</div>
            <div style={{ color: "#777777", marginTop: "4px" }}>
              35,000 SQ. FT. JOINERY & MEP ATELIER · INTERNAL CONTROL SYSTEM
            </div>
          </div>
          <div style={styles.footerRightCol}>
            <Link to="/" style={styles.footerSiteLink}>
              <span>YASHMEEN.AE ↗</span>
            </Link>
            <div style={{ color: "#888888", fontSize: "11px", marginTop: "6px" }}>
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  shell: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    background: "#f7f7f6",
    color: "#000000",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #000000",
    position: "sticky",
    top: 0,
    zIndex: 100,
    transition: "box-shadow 0.2s ease",
  },
  headerInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "16px clamp(18px, 3.5vw, 48px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
  },
  brandText: {
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#000000",
  },
  brandCity: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#000000",
    border: "1px solid #000000",
    padding: "2px 7px",
    borderRadius: "9999px",
  },
  verticalSep: {
    width: "1px",
    height: "18px",
    background: "rgba(0, 0, 0, 0.2)",
    display: window.innerWidth > 900 ? "block" : "none",
  },
  consoleTag: {
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#666666",
    display: window.innerWidth > 900 ? "inline-block" : "none",
  },
  telemetryGroup: {
    display: window.innerWidth > 1024 ? "flex" : "none",
    alignItems: "center",
  },
  telemetryPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    border: "1px solid #000000",
    padding: "6px 16px",
    borderRadius: "9999px",
    fontSize: "11px",
    letterSpacing: "0.06em",
  },
  telemetryDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },
  telemetrySep: {
    color: "#aaaaaa",
  },
  actionsRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  btnPublicSite: {
    display: window.innerWidth > 640 ? "inline-flex" : "none",
    alignItems: "center",
    gap: "6px",
    background: "#ffffff",
    border: "1px solid #000000",
    color: "#000000",
    borderRadius: "9999px",
    padding: "7px 16px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textDecoration: "none",
    transition: "all 0.15s ease",
  },
  userBadge: {
    display: window.innerWidth > 768 ? "flex" : "none",
    alignItems: "center",
    gap: "8px",
    background: "#f0f0f0",
    border: "1px solid #e0e0e0",
    borderRadius: "9999px",
    padding: "3px 12px 3px 4px",
  },
  userAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#000000",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: "11.5px",
    fontWeight: 700,
    color: "#000000",
  },
  btnLogout: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#000000",
    border: "1px solid #000000",
    color: "#ffffff",
    borderRadius: "9999px",
    padding: "7px 14px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  logoutText: {
    display: window.innerWidth > 640 ? "inline" : "none",
  },
  mobileToggle: {
    display: window.innerWidth <= 768 ? "flex" : "none",
    background: "#ffffff",
    border: "1px solid #000000",
    borderRadius: "6px",
    padding: "6px",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Second Row Navigation Strip */
  navStrip: {
    borderTop: "1px solid #e5e5e5",
    background: "#fafafa",
    overflowX: "auto",
  },
  navStripInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "10px clamp(18px, 3.5vw, 48px)",
  },
  navTrack: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  },
  navPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 14px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textDecoration: "none",
    border: "1px solid transparent",
    color: "#555555",
    transition: "all 0.15s ease",
  },
  navPillActive: {
    background: "#000000",
    color: "#ffffff",
    border: "1px solid #000000",
  },

  /* Mobile Nav Drawer */
  mobileNavOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    zIndex: 999,
    display: "flex",
    justifyContent: "flex-end",
  },
  mobileNavContent: {
    width: "300px",
    height: "100%",
    background: "#ffffff",
    borderLeft: "1px solid #000000",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  mobileNavHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "14px",
    borderBottom: "1px solid #000000",
  },
  mobileNavTitle: {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },
  mobileNavClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  mobileNavLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#333333",
    textDecoration: "none",
    borderRadius: "6px",
  },
  mobileNavLinkActive: {
    background: "#000000",
    color: "#ffffff",
    fontWeight: 700,
  },

  /* Expansive Main Workspace */
  mainWorkspace: {
    flex: 1,
    maxWidth: "1440px",
    margin: "0 auto",
    width: "100%",
    padding: "clamp(24px, 4vw, 56px) clamp(18px, 3.5vw, 48px) 80px",
    boxSizing: "border-box",
  },

  /* Monolithic Footer */
  footer: {
    background: "#ffffff",
    borderTop: "1px solid #000000",
    padding: "36px clamp(18px, 3.5vw, 48px)",
  },
  footerInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    alignItems: "center",
  },
  footerBrandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  footerBrandTitle: {
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#000000",
  },
  footerBrandSub: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#666666",
  },
  footerMetaCol: {
    fontSize: "11px",
    lineHeight: 1.6,
    color: "#444444",
  },
  footerRightCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  footerSiteLink: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#000000",
    textDecoration: "none",
    letterSpacing: "0.05em",
  },
};
